/**
 * Adds a new payment intent to the database
 * @param {number} KID
 * @param {string} paymentMethod
 */
export function addPaymentIntent(KID: number, paymentMethod: string): Promise<any>;
export declare function setup(dbPool: any): void;
