/**
 * Returns all organizations found with given IDs
 * @param {Array<number>} IDs
 * @returns {Array<Organization>}
 */
export function getByIDs(IDs: Array<number>): Array<any>;
/**
 * Returns an organization with given ID
 * @param {number} ID
 * @returns {Organization}
 */
export function getByID(ID: number): any;
/**
 * Returns current active organiztions
 * Active meaning we accept donations for them
 * Inactive organizations are organizations which we no longer support
 * @returns {Array<Organization>}
 */
export function getActive(): Array<any>;
/**
 * Returns all organizations in the database
 * @returns {Array<Organization>} All organizations in DB
 */
export function getAll(): Array<any>;
export function getStandardSplit(): Promise<any>;
export declare function setup(dbPool: any): void;
