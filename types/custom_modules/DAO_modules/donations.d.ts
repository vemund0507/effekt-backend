export type Donation = {
    id: number;
    /**
     * Donor full name
     */
    donor: string;
    email: string;
    sum: number;
    transactionCost: number;
    /**
     * Timestamp of when the donation was recieved
     */
    timestamp: Date;
    /**
     * The name of the payment method used for the donation
     */
    method: string;
    KID: number;
};
export type DonationSummary = {
    /**
     * Name of organization
     */
    organization: string;
    sum: number;
};
export type DonationDistributions = {
    donationID: number;
    date: Date;
    distributions: any[];
};
/** @typedef Donation
 * @prop {number} id
 * @prop {string} donor Donor full name
 * @prop {string} email
 * @prop {number} sum
 * @prop {number} transactionCost
 * @prop {Date} timestamp Timestamp of when the donation was recieved
 * @prop {string} method The name of the payment method used for the donation
 * @prop {number} KID
 */
/** @typedef DonationSummary
 * @prop {string} organization Name of organization
 * @prop {number} sum
 */
/** @typedef DonationSummary
* @prop {string} year Year
* @prop {number} yearSum Sum of donations per year
*/
/** @typedef DonationDistributions
 * @prop {number} donationID
 * @prop {Date} date
 * @prop {Array} distributions
*/
/**
 * Gets all donations, ordered by the specified column, limited by the limit, and starting at the specified cursor
 * @param {id: string, desc: boolean | null} sort If null, don't sort
 * @param {string | number | Date} cursor Used for pagination
 * @param {number=10} limit Defaults to 10
 * @param {object} filter Filtering object
 * @returns {[Array<IDonation & donorName: string>, nextcursor]} An array of donations pluss the donorname
 */
export function getAll(sort: any, page: any, limit?: number, filter?: object): [Array<any & any>, string];
/**
 * Gets donation by ID
 * @param {numer} donationID
 * @returns {Donation} A donation object
 */
export function getByID(donationID: any): Donation;
/**
 * Gets aggregate donations from a spesific time period
 * @param {Date} startTime
 * @param {Date} endTime
 * @returns {Array} Returns an array of organizations names and their aggregate donations
 */
export function getAggregateByTime(startTime: Date, endTime: Date): any[];
/**
 * Fetches all the donations in the database for a given inclusive range. If passed two equal dates, returns given day.
 * @param {Date} [fromDate=1. Of January 2000] The date in which to start the selection, inclusive interval.
 * @param {Date} [toDate=Today] The date in which to end the selection, inclusive interval.
 * @param {Array<Integer>} [paymentMethodIDs=null] Provide optional PaymentMethodID to filter to a payment method
 */
export function getFromRange(fromDate?: Date, toDate?: Date, paymentMethodIDs?: Array<any>): Promise<Map<any, any>>;
/**
 * Fetches median donation in the database for a given inclusive range. If passed two equal dates, returns given day.
 * @param {Date} [fromDate=1. Of January 2000] The date in which to start the selection, inclusive interval.
 * @param {Date} [toDate=Today] The date in which to end the selection, inclusive interval.
 * @returns {Number|null} The median donation sum if donations exist in range, null else
 */
export function getMedianFromRange(fromDate?: Date, toDate?: Date): number | null;
/**
 * Gets whether or not a donation has replaced inactive organizations
 * @param {number} donationID
 * @returns {number} zero or one
 */
export function getHasReplacedOrgs(donationID: number): number;
/**
 * Fetches the total amount of money donated to each organization by a specific donor
 * @param {Number} donorID
 * @returns {Array<DonationSummary>} Array of DonationSummary objects
 */
export function getSummary(donorID: number): Array<DonationSummary>;
/**
 * Fetches the total amount of money donated per year by a specific donor
 * @param {Number} donorID
 * @returns {Array<YearlyDonationSummary>} Array of YearlyDonationSummary objects
 */
export function getSummaryByYear(donorID: number): Array<any>;
/**
 * Fetches all donations recieved by a specific donor
 * @param {Number} donorID
 * @returns {Array<DonationDistributions>}
 */
export function getHistory(donorID: number): Array<DonationDistributions>;
export function ExternalPaymentIDExists(externalPaymentID: any, paymentID: any): Promise<boolean>;
/**
 * Adds a donation to the database
 *
 * @param {Number} KID
 * @param {Number} paymentMethodID
 * @param {Number} sum The gross amount of the donation (net amount is calculated in the database)
 * @param {Date} [registeredDate=null] Date the transaction was confirmed
 * @param {String} [externalPaymentID=null] Used to track payments in external payment systems (paypal and vipps ex.)
 * @param {Number} [metaOwnerID=null] Specifies an owner that the data belongs to (e.g. The Effekt Foundation). Defaults to selection default from DB if none is provided.
 * @return {Number} The donations ID
 */
export function add(KID: number, paymentMethodID: number, sum: number, registeredDate?: Date, externalPaymentID?: string, metaOwnerID?: number): number;
export function registerConfirmedByIDs(IDs: any): Promise<boolean>;
/**
 * Gets a histogram of all donations by donation sum
 * Creates buckets with 100 NOK spacing
 * Skips empty buckets
 * @returns {Array<Object>} Returns an array of buckets with items in bucket, bucket start value (ends at value +100), and bar height (logarithmic scale, ln)
 */
export function getHistogramBySum(): Array<any>;
/**
 * Deletes a donation from the database
 * @param {number} donationId
 * @returns {boolean} Returns true if a donation was deleted, false else
 */
export function remove(donationId: number): boolean;
export declare function setup(dbPool: any, DAOObject: any): void;
