export default class Utils {

    // Convert a Uint8Array to a data URL
    static uint8ArrayToDataURL(uint8Array: Uint8Array, mimeType: string = "image/png"): string {
        // Convert Uint8Array to a binary string
        const binaryString = uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), "");

        // Convert binary string to Base64
        const base64String = btoa(binaryString);

        // Create the data URL
        return `data:${mimeType};base64,${base64String}`;
    }
}
