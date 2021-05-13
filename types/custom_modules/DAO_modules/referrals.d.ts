export type ReferralType = {
    ID: number;
    name: string;
};
export type ReferralTypeAggregateAugmentation = {
    count: number;
};
export type ReferralTypeAggregate = ReferralType & ReferralTypeAggregateAugmentation;
/**
 * @typedef ReferralType
 * @property {number} ID
 * @property {string} name
 */
/**
 * @typedef ReferralTypeAggregateAugmentation
 * @property {number} count
 *
 * @typedef {ReferralType & ReferralTypeAggregateAugmentation} ReferralTypeAggregate
 */
/**
 * Gets all referral types
 * @returns {Array<ReferralType>} An array of payment method objects
 */
export function getTypes(): Array<ReferralType>;
/**
 * Counts up all the referrals from the referral records
 * @returns {Array<ReferralTypeAggregate>}
 */
export function getAggregate(): Array<ReferralTypeAggregate>;
/**
 * Checks if the donor has answered referral question before
 * @param {number} donorID
 */
export function getDonorAnswered(donorID: number): Promise<boolean>;
/**
 * Adds a referral record
 * @param {number} referralTypeID
 * @param {number} donorID
 * @param {string} otherComment
 */
export function addRecord(referralTypeID: number, donorID: number, otherComment: string): Promise<boolean>;
export declare function setup(dbPool: any): void;
