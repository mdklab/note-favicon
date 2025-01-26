export default class Utils {
    /**
     * Utility function to introduce a delay.
     * @param ms Number of milliseconds to delay.
     */
    static async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static uint8ArrayToDataURL(uint8Array: Uint8Array, mimeType: string = "image/png"): string {
        // Convert Uint8Array to a binary string
        const binaryString = uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), "");

        // Convert binary string to Base64
        const base64String = btoa(binaryString);

        // Create the data URL
        return `data:${mimeType};base64,${base64String}`;
    }
}
