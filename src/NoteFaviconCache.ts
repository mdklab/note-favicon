import {App, PluginManifest, requestUrl} from "obsidian";
import {NoteFaviconSettings} from "./NoteFaviconSettingTab";
import Utils from "./Utils";

export class LocalCache {
    image: string;
    timestamp: number

    constructor(image: string, timestamp: number) {
        this.image = image;
        this.timestamp = timestamp;
    }
}

export default class NoteFaviconCache {
    cacheFileName: string = "cache.json";
    defaultIcon: string = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAJOgAACToAYJjBRwAAAGHaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49J++7vycgaWQ9J1c1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCc/Pg0KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyI+PHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj48cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0idXVpZDpmYWY1YmRkNS1iYTNkLTExZGEtYWQzMS1kMzNkNzUxODJmMWIiIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIj48dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPjwvcmRmOkRlc2NyaXB0aW9uPjwvcmRmOlJERj48L3g6eG1wbWV0YT4NCjw/eHBhY2tldCBlbmQ9J3cnPz4slJgLAAADS0lEQVRYR+2XPUjrfBjFT94ItSIVC4KDVBwVxNHFQUHoGm1FCoooKAiCg1QnEcHBQXDpVKi4+AGKoIiLCn6gVBGV+k0FCwYjikrRJkjSPO9ylZv/TXpzffW+d7i/qZxzEg7P04T8OSIi/I9wVgUuLi5wf3/Pyj+F53lUVFQgJyeHtUwxLTAxMYFIJAKXy4V0Os3alvA8j7u7O7y+vmJ8fBzl5eVs5EfIBEEQaGVlhZVtMT8/Tx6PhyorK+n4+Ji1f+AfthAAOBwO5Ofns7Itnp+f4ff7EQwG0dDQgFgsxkYMmBYAAFVVWckWuq4jkUjA5/NhYGAALS0tODo6YmPvWBb4KDU1NXh4eIAgCFhdXYUoimhubkYqlWKjwFcUKCoqwszMDDo7O+Hz+TA1NQWO43B1dcVGga8oAAAFBQXwer3wer2ora2F2+2GrutsDPiqAt8jyzJ0XQfHcawF/I4CP+NvAVsFLi8vEY1GAQBnZ2fY2dkx+Dc3N1hfXwcAXF9fY3Nz0+BnwlaBl5cX9Pb2IhwOo6OjA/F43OBrmob+/n6Mjo6ira0N+/v7Bj8j7LuZiKixsZGi0ahBm56eJgDU3d1t0N9YW1sjAFRXV2fQU6kUVVdXUywWM+hv2JrA+fk5QqEQgsEgDg4OsLi4aPBFUcTg4CC6urrw+PiISCRi8DORxQpmqKqKnp4eCIKAra0tyLJs8NPpNNrb2xEIBBCLxZBIJAx+RtiRkMUKPsqnrIAlmUxib28PS0tL2NjYgCiKbMQ2tlbwxsnJCUKhEA4PD5Gbmwu32w1FUXB7e4vi4mIEAgHU19ezl2WGHQmZrEBVVRoZGaGysjLq6+uj09NTUhSFiIg0TSNJkmhsbIyqqqqoqamJJEl6v/ZTVrC9vY2FhQVMTk5ieHgYpaWlyM7OBr59BxYWFqK1tRXLy8vgeR7hcJi9hTVsIzKZgCzLpKqqIZOJZDL5/vtTJuB0OpGVZf/v4nK5WMkSWwW+kj+3gNUXzK/CcVzGe5kW0DTtl3aeCafTCUVRYHIAA6yOZkNDQ9jd3UVJScmHzwf49og+PT1BkiTMzc0hLy+PjZgX0HUds7OziMfj/2kSuq7D4XDA7/fD4/GwNmBV4HfyL2+NS0q9hHyrAAAAAElFTkSuQmCC";
    private app: App;
    private manifest: PluginManifest;
    private settings: NoteFaviconSettings
    private localCache: { [url: string]: LocalCache } | null = null;

    constructor(app: App, manifest: PluginManifest, settings: NoteFaviconSettings) {
        this.app = app;
        this.manifest = manifest;
        this.settings = settings;
    }

    async loadCache(): Promise<{ [url: string]: LocalCache }> {
        if (this.localCache) {
            return this.localCache;
        }
        try {
            const data = await this.app.vault.adapter.read(this.getCacheFilePath());
            this.localCache = (data ? JSON.parse(data) as { [url: string]: LocalCache } : {});
            return this.localCache;
        } catch (error) {
            return {};
        }
    }

    async updateCache(url: string, image: string) {
        this.localCache = null;
        const cache = await this.loadCache();
        const domain = this.getHostname(url);
        if (!domain) return "";
        cache[domain] = new LocalCache(image, Date.now());
        await this.app.vault.adapter.write(this.getCacheFilePath(), JSON.stringify(cache));
        return image;
    }

    async getCachedFavicon(url: string): Promise<string | null> {
        const cache = await this.loadCache();
        const domain = this.getHostname(url);
        if (domain && cache[domain]) {
            return cache[domain].image;
        }
        return "";
    }

    async fetchAndCacheFavicon(url: string): Promise<string> {
        const domain = this.getHostname(url);
        let image = "";
        if (domain) {
            // const faviconUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
            // const faviconUrl = `https://api.faviconkit.com/${domain}/64`;
            const faviconUrl = `https://www.google.com/s2/favicons?sz=32&domain=${domain}`;
            try {
                const response = await requestUrl({url: faviconUrl, method: "GET"});
                image = Utils.uint8ArrayToDataURL(new Uint8Array(response.arrayBuffer));
            } catch (error) {
                console.error("Favicon fetch error:", error);
            }
        }
        return this.updateCache(url, image);
    }

    private getHostname(url: string) {
        try {
            return new URL(url).origin;
        } catch (error) {
            return null;
        }
    }

    public async clearCache() {
        this.localCache = null;
        try {
            await this.app.vault.adapter.remove(this.getCacheFilePath());
        } catch (error) {
        }
        await this.loadCache();
    }

    private getCacheFilePath(): string {
        return this.app.vault.configDir + "/plugins/" + this.manifest.id + "/" + this.cacheFileName;
    }

}
