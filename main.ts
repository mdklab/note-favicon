/*
 * Obsidian Note Favicon Plugin
 *
 * @description This plugin for Obsidian extracts a URL from the note's frontmatter and displays an associated image (favicon) next to the note title in the file tree.
 * @author mdklab
 * @license MIT
 */

import {App, Plugin, PluginSettingTab, Setting, TFile} from "obsidian";

/**
 * Interface for plugin settings.
 */
interface NoteFaviconSettings {
  enabled: boolean;
}

/**
 * Default plugin settings.
 */
const DEFAULT_SETTINGS: NoteFaviconSettings = {
  enabled: true
};

/**
 * Plugin class for displaying favicons in the file tree.
 */
export default class NoteFaviconPlugin extends Plugin {
  settings: NoteFaviconSettings = DEFAULT_SETTINGS;

  /**
   * Lifecycle method called when the plugin is loaded.
   */
  async onload() {
    await this.loadSettings();
    console.log('Loading NoteFaviconPlugin...');

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
        await this.delay(500);
        this.updateTree();
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
      this.updateTree();
    } else {
      this.removeAllFavicons();
    }
  }

  /**
   * Utility function to introduce a delay.
   * @param ms Number of milliseconds to delay.
   */
  async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    if (!this.settings.enabled || !file || !file.path.endsWith('.md')) return;

    const metadata = await this.getMetadata(file);
    if (!metadata || !metadata.favicon) {
      this.removeImageFromTreeElement(file.path);
      return;
    }

    let imageUrl = metadata.favicon.startsWith('data:image')
        ? metadata.favicon
        : `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(metadata.favicon)}&size=24`;

    const fileTreeElement = this.findTreeElementForFile(file.path);
    if (fileTreeElement) {
      this.updateImageInTreeElement(fileTreeElement, imageUrl);
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
    const fileExplorerLeaf = this.app.workspace.getLeavesOfType('file-explorer')[0];
    if (!fileExplorerLeaf) return null;

    const fileExplorerView = fileExplorerLeaf.view as any;
    if (!fileExplorerView || !fileExplorerView.fileItems) return null;

    for (const fileItem of Object.values(fileExplorerView.fileItems)) {
      const typedItem = fileItem as any;
      if (typedItem.file?.path === path) {
        return typedItem.titleEl || typedItem.selfEl?.querySelector('.tree-item-inner.nav-file-title-content') || null;
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
      const img = fileTreeElement.querySelector('.tree-image');
      if (img) fileTreeElement.removeChild(img);
    }
  }

  /**
   * Adds or updates the favicon image in the file tree element.
   * @param element The tree element where the image should be added or updated.
   * @param url The URL of the image to be displayed.
   */
  updateImageInTreeElement(element: HTMLElement, url: string) {
    let img = element.querySelector('.tree-image') as HTMLImageElement | null;
    if (img) {
      img.src = url;
    } else {
      img = document.createElement('img');
      img.classList.add('tree-image');
      img.src = url;
      img.style.width = '20px';
      img.style.height = '20px';
      img.style.marginRight = '5px';
      img.style.marginBottom = '2px';
      img.style.verticalAlign = 'middle';
      element.insertBefore(img, element.firstChild);
    }
  }
}

/**
 * Settings tab for the plugin.
 */
class NoteFaviconSettingTab extends PluginSettingTab {
  plugin: NoteFaviconPlugin;

  constructor(app: App, plugin: NoteFaviconPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
        .setName("Enable Favicons")
        .setDesc("Toggle favicon display in the file tree")
        .addToggle(toggle => toggle
            .setValue(this.plugin.settings.enabled)
            .onChange(async (value) => {
              this.plugin.settings.enabled = value;
              await this.plugin.saveSettings();
            }));
  }
}
