export type MailOptions = {
    reciever: string;
    subject: string;
    /**
     * Name of html template, found in views folder
     */
    templateName: string;
    /**
     * Object with template data on the form {key: value, key2: value2 ...}
     */
    templateData: object;
};
/**
 * Sends a donation reciept
 * @param {number} donationID
 * @param {string} reciever Reciever email
*/
export function sendDonationReciept(donationID: number, reciever?: string): Promise<any>;
/**
 * Sends a donation reciept with notice of old system
 * @param {number} donationID
 * @param {string} reciever Reciever email
*/
export function sendEffektDonationReciept(donationID: number, reciever?: string): Promise<any>;
/**
 * @param {number} KID
*/
export function sendDonationRegistered(KID: number): Promise<any>;
/**
 * @param {number} donorID
*/
export function sendDonationHistory(donorID: number): Promise<any>;
/**
 * Sends donors confirmation of their tax deductible donation for a given year
 * @param {TaxDeductionRecord} taxDeductionRecord
 * @param {number} year The year the tax deductions are counted for
 */
export function sendTaxDeductions(taxDeductionRecord: any, year: number): Promise<any>;
/**
 * Sends OCR file for backup
 * @param {Buffer} fileContents
 */
export function sendOcrBackup(fileContents: Buffer): Promise<boolean>;
