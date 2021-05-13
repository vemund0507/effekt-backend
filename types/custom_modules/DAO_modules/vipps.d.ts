export type VippsToken = {
    ID: number;
    expires: Date;
    type: string;
    token: string;
};
export type VippsOrder = {
    ID: number;
    orderID: string;
    donorID: number;
    donationID: number;
    KID: string;
    token: string;
    registered: Date;
};
export type VippsTransactionLogItem = {
    /**
     * In øre
     */
    amount: number;
    transactionText: string;
    transactionId: number;
    /**
     * JSON timestamp
     */
    timestamp: string;
    operation: string;
    requestId: number;
    operationSuccess: boolean;
};
/**
 * @typedef VippsToken
 * @property {number} ID
 * @property {Date} expires
 * @property {string} type
 * @property {string} token
 */
/**
 * @typedef VippsOrder
 * @property {number} ID
 * @property {string} orderID
 * @property {number} donorID
 * @property {number} donationID
 * @property {string} KID
 * @property {string} token
 * @property {Date} registered
 */
/**
 * @typedef VippsTransactionLogItem
 * @property {number} amount In øre
 * @property {string} transactionText
 * @property {number} transactionId
 * @property {string} timestamp JSON timestamp
 * @property {string} operation
 * @property {number} requestId
 * @property {boolean} operationSuccess
 */
/**
 * Fetches the latest token, if available
 * @returns {VippsToken | boolean} The most recent vipps token, false if expiration is within 10 minutes
 */
export function getLatestToken(): VippsToken | boolean;
/**
 * Fetches a vipps order
 * @property {string} orderID
 * @return {VippsOrder | false}
 */
export function getOrder(orderID: any): VippsOrder | false;
/**
 * Fetches the most recent vipps order
 * @return {VippsOrder | false}
 */
export function getRecentOrder(): VippsOrder | false;
/**
 * Adds a Vipps access token
 * @param {VippsToken} token Does not need to have ID specified
 * @return {number} token ID in database
 */
export function addToken(token: VippsToken): number;
/**
 * Adds a Vipps order
 * @param {VippsOrder} order
 * @return {number} ID of inserted order
 */
export function addOrder(order: VippsOrder): number;
/**
 * Adds a Vipps order transaction status
 * @param {string} orderId
 * @param {Array<VippsTransactionLogItem>} transactionHistory
 * @return {boolean} Success
 */
export function updateOrderTransactionStatusHistory(orderId: string, transactionHistory: Array<VippsTransactionLogItem>): boolean;
/**
 * Updates the donationID associated with a vipps order
 * @param {string} orderID
 * @param {number} donationID
 * @return {boolean} Success or failure
 */
export function updateVippsOrderDonation(orderID: string, donationID: number): boolean;
export declare function setup(dbPool: any): void;
