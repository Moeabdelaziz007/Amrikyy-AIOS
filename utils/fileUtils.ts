/**
 * Converts a File object into a base64 encoded string.
 * This is useful for uploading images or audio to AI models that expect base64 data.
 * @param {File} file - The File object to convert.
 * @returns {Promise<string>} A promise that resolves with the base64 encoded string (including data URI prefix).
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};