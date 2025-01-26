import {App, PluginSettingTab, Setting} from "obsidian";
import NoteFaviconPlugin from "./NoteFaviconPlugin";

/**
 * Interface for plugin settings.
 */
export interface NoteFaviconSettings {
    enabled: boolean;
}

/**
 * Default plugin settings.
 */
export const DEFAULT_SETTINGS: NoteFaviconSettings = {
    enabled: true,
};

/**
 * Settings tab for the plugin.
 */
export default class NoteFaviconSettingTab extends PluginSettingTab {
    plugin: NoteFaviconPlugin;

    constructor(app: App, plugin: NoteFaviconPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;
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

        new Setting(containerEl)
            .setName("Reset cache")
            .setDesc("Clear favicons local cache")
            .addButton(button => button
                .setButtonText("Reset")
                .onClick(async () => {
                    this.plugin.clearCache();
                }));
    }
}
