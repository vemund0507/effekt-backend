/**
 * Get payment methods from database
 * @returns {Array} An array of payment method objects
 */
export function getMethods(): any[];
/**
 * Gets payment methods filtered by provided ID's
 * @param paymentMethodIDs The payment method ID's to filter on
 * @returns {Array} An array of payment method objects
 */
export function getPaymentMethodsByIDs(paymentMethodIDs: any): any[];
export declare function setup(dbPool: any): void;
