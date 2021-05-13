/**
 * Fetches a list of all the OCR files
 */
export function getOCRFiles(): Promise<any>;
/**
 * Fetches a file with a given name
 * @returns {Buffer} A buffer of the file contents
 */
export function getOCRFile(name: any): Buffer;
/**
 * Fetches the latest OCR file as a buffer
 * @returns {Buffer} A buffer of the file contents
 */
export function getLatestOCRFile(): Buffer;
