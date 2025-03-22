import {Plugin, TFile} from "obsidian";
import NoteFaviconSettingTab, {DEFAULT_SETTINGS, NoteFaviconSettings} from "./NoteFaviconSettingTab";
import NoteFaviconCache from "./NoteFaviconCache";
import {FileExplorerView, FileExplorerWorkspaceLeaf} from "./file-explorer";


const ICON_TYPE_BASE64 = 'base64';
const ICON_TYPE_URL = 'url';

/**
 * Plugin class for displaying favicons in the file tree.
 */
export default class NoteFaviconPlugin extends Plugin {
    public settings: NoteFaviconSettings = DEFAULT_SETTINGS;
    private cache: NoteFaviconCache | null = null;

    /**
     * Lifecycle method called when the plugin is loaded.
     */
    async onload() {
        await this.loadSettings();
        console.log('Loading NoteFaviconPlugin...');
        this.cache = new NoteFaviconCache(this.app, this.manifest, this.settings);

        // Register event listeners for file modifications
        this.registerEvent(this.app.vault.on('modify', (file) => {
            if (this.settings.enabled && file instanceof TFile) {
                this.updateImageForNoteInTree(file);
            }
        }));
        this.registerEvent(this.app.metadataCache.on('changed', (file) => {
            if (this.settings.enabled) {
                this.updateImageForNoteInTree(file);
            }
        }));

        // Ensure file tree updates after the layout is ready
        this.app.workspace.onLayoutReady(async () => {
            if (this.settings.enabled) {
                await sleep(500);
                await this.updateTree();
            }
        });

        this.addSettingTab(new NoteFaviconSettingTab(this.app, this));
    }

    /**
     * Lifecycle method called when the plugin is unloaded.
     */
    onunload() {
        console.log('Unloading NoteFaviconPlugin...');
        this.removeAllFavicons();
    }

    /**
     * Loads plugin settings from storage.
     */
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    /**
     * Saves plugin settings to storage.
     */
    async saveSettings() {
        await this.saveData(this.settings);

        // Apply settings change immediately
        if (this.settings.enabled) {
            await this.updateTree();
        } else {
            this.removeAllFavicons();
        }
    }

    /**
     * Updates favicons for all markdown files in the vault.
     */
    async updateTree() {
        if (!this.settings.enabled) return;

        const files = this.app.vault.getMarkdownFiles();
        for (const file of files) {
            await this.updateImageForNoteInTree(file);
        }
    }

    /**
     * Updates the favicon for a specific note in the file tree.
     * @param file The markdown file to update.
     */
    async updateImageForNoteInTree(file: TFile) {
        if (!this.settings.enabled || !file || !file.path.endsWith('.md') || !this.cache) return;
        // Skip if the file is currently being saved
        if ('saving' in file && (file as unknown as { saving: boolean }).saving) return;

        const metadata = await this.getMetadata(file);
        if (!metadata || !metadata.favicon) {
            this.removeImageFromTreeElement(file.path);
            return;
        }

        let faviconImage;
        let iconType = this.getIconType(metadata.favicon);
        if (iconType === ICON_TYPE_BASE64) {
            faviconImage = metadata.favicon;
        } else {
            faviconImage = await this.cache.getCachedFavicon(metadata.favicon);
            if (!faviconImage) {
                faviconImage = await this.cache.fetchAndCacheFavicon(metadata.favicon);
            }
        }
        if (!faviconImage) {
            this.removeImageFromTreeElement(file.path);
            return;
        }

        const fileTreeElement = this.findTreeElementForFile(file.path);
        if (fileTreeElement) {
            this.updateImageInTreeElement(fileTreeElement, faviconImage);
        }
    }

    /**
     * Removes all favicons from the file tree when the setting is disabled.
     */
    removeAllFavicons() {
        const files = this.app.vault.getMarkdownFiles();
        for (const file of files) {
            this.removeImageFromTreeElement(file.path);
        }
    }

    /**
     * Retrieves metadata from a file's frontmatter.
     * @param file The markdown file to extract metadata from.
     */
    async getMetadata(file: TFile): Promise<Record<string, any> | null> {
        const fileCache = this.app.metadataCache.getFileCache(file);
        return fileCache?.frontmatter || null;
    }

    /**
     * Finds the file tree element associated with a given file.
     * @param path The path of the file to locate in the file tree.
     */
    findTreeElementForFile(path: string): HTMLElement | null {
        const fileExplorerLeaf = this.app.workspace.getLeavesOfType('file-explorer')[0] as FileExplorerWorkspaceLeaf;
        if (!fileExplorerLeaf) return null;

        const fileExplorerView = fileExplorerLeaf.view as FileExplorerView;
        if (!fileExplorerView || !fileExplorerView.fileItems) return null;

        for (const fileItem of Object.values(fileExplorerView.fileItems)) {
            const typedItem = fileItem;
            if (typedItem.file?.path === path) {
                return typedItem.selfEl?.querySelector('.tree-item-inner.nav-file-title-content') || null;
            }
        }
        return null;
    }

    /**
     * Removes a favicon image from the file tree element.
     * @param path The file path whose image should be removed.
     */
    removeImageFromTreeElement(path: string) {
        const fileTreeElement = this.findTreeElementForFile(path);
        if (fileTreeElement) {
            const img = fileTreeElement.querySelector('.tree-favicon');
            if (img) fileTreeElement.removeChild(img);
        }
    }

    /**
     * Adds or updates the favicon image in the file tree element.
     * @param element The tree element where the image should be added or updated.
     * @param url The URL of the image to be displayed.
     */
    updateImageInTreeElement(element: HTMLElement, url: string) {
        if (!url) return;
        let img = element.querySelector('.tree-favicon') as HTMLImageElement | null;
        if (img) {
            img.src = url;
        } else {
            img = document.createElement('img');
            img.classList.add('tree-favicon');
            img.src = url;
            element.insertBefore(img, element.firstChild);
        }
    }

    clearCache() {
        if (this.cache) {
            this.cache.clearCache()
                .then(() => {
                    this.updateTree();
                })
        }
    }

    /**
     * Returns the type of the favicon image.
     * @param favicon
     */
    getIconType(favicon: String): string {
        if (favicon && favicon.trim().toLowerCase().startsWith('data:image')) {
            return ICON_TYPE_BASE64;
        } else {
            return ICON_TYPE_URL;
        }
    }
}
