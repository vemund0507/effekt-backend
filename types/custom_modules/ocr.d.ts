export type Transaction = {
    transactionCode: number;
    recordType: number;
    serviceCode: number;
    amount: number;
    transactionID: string;
    date: Date;
    KID: number;
};
/**
 * @typedef Transaction
 * @property {number} transactionCode
 * @property {number} recordType
 * @property {number} serviceCode
 * @property {number} amount
 * @property {string} transactionID
 * @property {Date} date
 * @property {number} KID
 */
/**
 * Adds transactions parced from OCR to the database
 * @param {Transaction} transactions
 * @param {number} metaOwnerID
 * @returns {{ valid: number, invalid: number: invalidTransactions: Array<{ reason: string, transaction: Transaction }> }}
 */
declare function addDonations(transactions: Transaction, metaOwnerID: number): {
    valid: number;
    invalid: number;
    invalidTransactions: {
        reason: string;
        transaction: Transaction;
    }[];
};
/**
 * @typedef Transaction
 * @property {number} transactionCode
 * @property {number} recordType
 * @property {number} serviceCode
 * @property {number} amount
 * @property {string} transactionID
 * @property {Date} date
 * @property {number} KID
 */
/**
 * Adds transactions parced from OCR to the database
 * @param {Transaction} transactions
 * @param {number} metaOwnerID
 * @returns {{ valid: number, invalid: number: invalidTransactions: Array<{ reason: string, transaction: Transaction }> }}
 */
declare function addDonations(transactions: Transaction, metaOwnerID: number): {
    valid: number;
    invalid: number;
    invalidTransactions: {
        reason: string;
        transaction: Transaction;
    }[];
};
export {};
