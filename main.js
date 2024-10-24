/*
 * Obsidian Favicon Display Plugin
 * 
 * @description This plugin for Obsidian extracts a URL from the note's frontmatter and displays an associated image (favicon) next to the note title in the file tree.
 * @author mdklab
 * @license MIT
 */

const { Plugin } = require('obsidian');

module.exports = class ShowImageFromMetadataPlugin extends Plugin {
  /**
   * Removes the image from the tree element if it exists.
   * @param {HTMLElement} element - The tree element from which the image is to be removed.
   */
  removeImageFromTreeElement(element) {
    try {
      const img = element.querySelector('.tree-image');
      if (img) {
        element.removeChild(img);
      }
    } catch (error) {
      console.error('Error removing image from tree element:', error);
    }
  }

  /**
   * Adds a delay for a given amount of milliseconds.
   * @param {number} ms - The number of milliseconds to delay.
   * @returns {Promise} - A promise that resolves after the given time.
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  constructor() {
    super(...arguments);
    this.loaded = false;
  }

  /**
   * Lifecycle method called when the plugin is loaded.
   */
  async onload() {
    try {
      console.log('Loading ShowImageFromMetadataPlugin...');
      this.loaded = true;
      // Ensure required elements are initialized before using them
      if (!this.app || !this.app.vault || !this.app.workspace) {
        throw new Error('App, Vault, or Workspace is not available for initialization.');
      }
      // Observe file changes to dynamically update the images
      this.registerEvent(this.app.vault.on('modify', (file) => this.updateImageForNoteInTree(file)));
      this.registerEvent(this.app.metadataCache.on('changed', (file) => this.updateImageForNoteInTree(file)));
      this.app.workspace.onLayoutReady(async () => {
        await this.delay(500);
        this.updateTree();
      });
    } catch (error) {
      console.error('Failed to load ShowImageFromMetadataPlugin:', error);
    }
  }

  /**
   * Lifecycle method called when the plugin is unloaded.
   */
  onunload() {
    console.log('Unloading ShowImageFromMetadataPlugin...');
    this.loaded = false;
  }

  /**
   * Updates the entire file tree, adding or removing favicons as necessary.
   */
  async updateTree() {
    try {
      const files = this.app.vault.getMarkdownFiles();
      for (const file of files) {
        await this.updateImageForNoteInTree(file);
      }
    } catch (error) {
      console.error('Error updating tree:', error);
    }
  }

  /**
   * Updates the favicon for a specific note in the file tree.
   * @param {TFile} file - The file for which the image should be updated.
   */
  async updateImageForNoteInTree(file) {
    try {
      if (!file || !file.path.endsWith('.md')) {
        return;
      }

      const metadata = await this.getMetadata(file);
      if (!metadata) {
        return;
      }

      let baseUrl = metadata['favicon']; // Use 'favicon' field from frontmatter
      if (!baseUrl) {
        // If no favicon URL is found, remove the existing image
        const fileTreeElement = this.findTreeElementForFile(file.path);
        if (fileTreeElement) {
          this.removeImageFromTreeElement(fileTreeElement);
        }
        return;
      }

      // Determine if the URL is a data URL or a standard URL
      let imageUrl;
      if (baseUrl.startsWith('data:image')) {
        imageUrl = baseUrl; // Use data URL directly
      } else {
        // Construct the favicon URL using the base URL provided in metadata
        imageUrl = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(baseUrl)}&size=24`;
      }

      // Find the element representing the note in the file tree
      const fileTreeElement = this.findTreeElementForFile(file.path);
      if (fileTreeElement) {
        this.updateImageInTreeElement(fileTreeElement, imageUrl);
      }
    } catch (error) {
      console.error('Error updating image for note in tree:', error);
    }
  }

  /**
   * Gets the metadata for the given file.
   * @param {TFile} file - The file whose metadata is to be retrieved.
   * @returns {object|null} - The frontmatter metadata if available, otherwise null.
   */
  async getMetadata(file) {
    try {
      const fileCache = this.app.metadataCache.getFileCache(file);
      if (fileCache && fileCache.frontmatter) {
        return fileCache.frontmatter;
      }
    } catch (error) {
      console.error('Error getting metadata:', error);
    }
    return null;
  }

  /**
   * Finds the HTML element in the file tree representing the given file.
   * @param {string} path - The path of the file for which the element should be found.
   * @returns {HTMLElement|null} - The HTML element representing the file in the tree, if found.
   */
  findTreeElementForFile(path) {
    try {
      const fileExplorerLeaf = this.app.workspace.getLeavesOfType('file-explorer')[0];
      if (!fileExplorerLeaf) {
        return null;
      }

      const fileExplorerView = fileExplorerLeaf.view;
      if (!fileExplorerView || !fileExplorerView.fileItems) {
        return null;
      }

      const fileItems = fileExplorerView.fileItems;

      for (const fileItem of Object.values(fileItems)) {
        if (fileItem.file && fileItem.file.path === path) {
          // If titleEl is undefined, fall back to the displayed title element
          if (fileItem.titleEl) {
            return fileItem.titleEl;
          } else if (fileItem.selfEl) { // Attempt to use selfEl as a fallback
            return fileItem.selfEl.querySelector('.tree-item-inner.nav-file-title-content');
          }
        }
      }
    } catch (error) {
      console.error('Error finding tree element for file:', error);
    }
    return null;
  }

  /**
   * Adds or updates the favicon image in the tree element.
   * @param {HTMLElement} element - The tree element to which the image should be added or updated.
   * @param {string} url - The URL of the image to be added.
   */
  updateImageInTreeElement(element, url) {
    try {
      // Check if the image is already added
      let img = element.querySelector('.tree-image');
      if (img) {
        // Update the existing image URL if it's already present
        img.src = url;
      } else {
        // Create a new image element if none exists
        img = document.createElement('img');
        img.classList.add('tree-image');
        img.src = url;
        img.style.width = '20px'; // Adjust the size as required
        img.style.height = '20px';
        img.style.marginRight = '5px';
        img.style.marginBottom = '2px';
        img.style.verticalAlign = 'middle';

        // Insert the image before the text node of the file title
        element.insertBefore(img, element.firstChild);
      }
    } catch (error) {
      console.error('Error adding or updating image in tree element:', error);
    }
  }
};
