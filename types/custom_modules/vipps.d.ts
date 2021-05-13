export type InitiateVippsPaymentResponse = {
    orderId: string;
    externalPaymentUrl: string;
};
export type TransactionLogItem = {
    /**
     * In øre
     */
    amount: number;
    transactionText: string;
    transactionId: number;
    /**
     * JSON timestamp
     */
    timeStamp: string;
    operation: string;
    requestId: number;
    operationSuccess: boolean;
};
export type TransactionSummary = {
    capturedAmount: number;
    remainingAmountToCapture: number;
    refundedAmount: number;
    remainingAmountToRefund: number;
    bankIdentificationNumber: number;
};
export type OrderDetails = {
    orderId: string;
    transactionSummary: TransactionSummary;
    transactionLogHistory: Array<TransactionLogItem>;
};
/**
 * Fetches a fresh access token from the vipps API
 * @return {VippsToken | false} A fresh vipps token or false if failed to fetch
 */
declare function fetchToken(): any;
/**
 * Fetches a fresh access token from the vipps API
 * @return {VippsToken | false} A fresh vipps token or false if failed to fetch
 */
declare function fetchToken(): any;
/**
 * @typedef InitiateVippsPaymentResponse
 * @property {string} orderId
 * @property {string} externalPaymentUrl
 */
/**
 * Initiates a vipps order
 * @param {number} donorPhoneNumber The phone number of the donor
 * @param {VippsToken} token
 * @param {number} sum The chosen donation in NOK
 * @returns {InitiateVippsPaymentResponse} Returns a URL for which to redirect the user to when finishing the payment and the orderId
 */
declare function initiateOrder(KID: any, sum: number): InitiateVippsPaymentResponse;
/**
 * @typedef InitiateVippsPaymentResponse
 * @property {string} orderId
 * @property {string} externalPaymentUrl
 */
/**
 * Initiates a vipps order
 * @param {number} donorPhoneNumber The phone number of the donor
 * @param {VippsToken} token
 * @param {number} sum The chosen donation in NOK
 * @returns {InitiateVippsPaymentResponse} Returns a URL for which to redirect the user to when finishing the payment and the orderId
 */
declare function initiateOrder(KID: any, sum: number): InitiateVippsPaymentResponse;
/**
 * Poll order details
 * @param {string} orderId
 */
declare function pollOrder(orderId: string): Promise<void>;
/**
 * Poll order details
 * @param {string} orderId
 */
declare function pollOrder(orderId: string): Promise<void>;
declare function pollLoop(orderId: any, count?: number): Promise<void>;
declare function pollLoop(orderId: any, count?: number): Promise<void>;
/**
 * Checks for updates in the order
 * This is run multiple times from a interval in pollOrder function
 * We keep track of how many attempts we've made, to know whether to cancel the interval
 * @param {string} orderId
 * @param {number} polls How many times have we polled the detail endpoint
 * @returns {boolean} True if we should cancel the polling, false otherwise
 */
declare function checkOrderDetails(orderId: string, polls: number): boolean;
/**
 * Checks for updates in the order
 * This is run multiple times from a interval in pollOrder function
 * We keep track of how many attempts we've made, to know whether to cancel the interval
 * @param {string} orderId
 * @param {number} polls How many times have we polled the detail endpoint
 * @returns {boolean} True if we should cancel the polling, false otherwise
 */
declare function checkOrderDetails(orderId: string, polls: number): boolean;
/**
 * Finds a transaction log item for a given operation, or returns null if none found
 * @param {Array<TransactionLogItem>} transactionLogHistory
 * @param {string} operation
 * @returns {TransactionLogItem | null}
 */
declare function findTransactionLogItem(transactionLogHistory: TransactionLogItem[], operation: string): TransactionLogItem;
/**
 * Finds a transaction log item for a given operation, or returns null if none found
 * @param {Array<TransactionLogItem>} transactionLogHistory
 * @param {string} operation
 * @returns {TransactionLogItem | null}
 */
declare function findTransactionLogItem(transactionLogHistory: TransactionLogItem[], operation: string): TransactionLogItem;
/**
 * Checks wether an item is in a final state (i.e. no actions are longer pending)
 * @param {TransactionLogItem} transactionLogItem
 * @returns
 */
declare function transactionLogItemFinalIsFinalState(transactionLogItem: TransactionLogItem): boolean;
/**
 * Checks wether an item is in a final state (i.e. no actions are longer pending)
 * @param {TransactionLogItem} transactionLogItem
 * @returns
 */
declare function transactionLogItemFinalIsFinalState(transactionLogItem: TransactionLogItem): boolean;
/**
 * Updates the transaction log history of an order
 * @param {string} orderId
 * @param {Array<TransactionLogItem>} transactionLogHistory
 */
declare function updateOrderTransactionLogHistory(orderId: string, transactionLogHistory: TransactionLogItem[]): Promise<void>;
/**
 * Updates the transaction log history of an order
 * @param {string} orderId
 * @param {Array<TransactionLogItem>} transactionLogHistory
 */
declare function updateOrderTransactionLogHistory(orderId: string, transactionLogHistory: TransactionLogItem[]): Promise<void>;
/**
 * Fetches order details
 * @param {string} orderId
 * @returns {OrderDetails}
 */
declare function getOrderDetails(orderId: string): OrderDetails;
/**
 * Fetches order details
 * @param {string} orderId
 * @returns {OrderDetails}
 */
declare function getOrderDetails(orderId: string): OrderDetails;
/**
 * Captures a order with a reserved amount
 * @param {string} orderId
 * @param {TransactionLogItem} transactionInfo The reserved transaction info
 * @return {boolean} Captured or not
 */
declare function captureOrder(orderId: string, transactionInfo: TransactionLogItem): boolean;
/**
 * Captures a order with a reserved amount
 * @param {string} orderId
 * @param {TransactionLogItem} transactionInfo The reserved transaction info
 * @return {boolean} Captured or not
 */
declare function captureOrder(orderId: string, transactionInfo: TransactionLogItem): boolean;
/**
 * Refunds an order and deletes the associated donation
 * @param {string} orderId
 * @return {boolean} Refunded or not
 */
declare function refundOrder(orderId: string): boolean;
/**
 * Refunds an order and deletes the associated donation
 * @param {string} orderId
 * @return {boolean} Refunded or not
 */
declare function refundOrder(orderId: string): boolean;
/**
 * Cancels order
 * @param {string} orderId
 * @return {boolean} Cancelled or not
 */
declare function cancelOrder(orderId: string): boolean;
/**
 * Cancels order
 * @param {string} orderId
 * @return {boolean} Cancelled or not
 */
declare function cancelOrder(orderId: string): boolean;
/**
 * Approves an order manually (without using the vipps app)
 * Used for integration testing
 * @param {string} orderId
 * @param {string} linkToken Token returned from the vipps api when initating an order
 * @return {boolean} Approved or not
 */
declare function approveOrder(orderId: string, linkToken: string): boolean;
/**
 * Approves an order manually (without using the vipps app)
 * Used for integration testing
 * @param {string} orderId
 * @param {string} linkToken Token returned from the vipps api when initating an order
 * @return {boolean} Approved or not
 */
declare function approveOrder(orderId: string, linkToken: string): boolean;
/**
 * Gets vipps authorization headers
 * @param {VippsToken} token
 */
declare function getVippsHeaders(token: any): {
    'content-type': string;
    merchant_serial_number: any;
    'Ocp-Apim-Subscription-Key': any;
    Authorization: string;
};
/**
 * Gets vipps authorization headers
 * @param {VippsToken} token
 */
declare function getVippsHeaders(token: any): {
    'content-type': string;
    merchant_serial_number: any;
    'Ocp-Apim-Subscription-Key': any;
    Authorization: string;
};
export {};
