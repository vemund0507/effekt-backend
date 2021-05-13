export type Donor = {
    id: number;
    email: string;
    name: string;
    /**
     * Social security number
     */
    ssn: string;
    registered: Date;
    newsletter: boolean;
};
/**
 * Selects a Donor object from the database with the given ID
 * @param {Number} ID The ID in the database for the donor
 * @returns {Donor} A donor object
 */
export function getByID(ID: number): Donor;
/**
 * @typedef Donor
 * @prop {number} id
 * @prop {string} email
 * @prop {string} name
 * @prop {string} ssn Social security number
 * @prop {Date} registered
 * @prop {boolean} newsletter
 */
/**
 * Gets the ID of a Donor based on their email
 * @param {String} email An email
 * @returns {Number} An ID
 */
export function getIDbyEmail(email: string): number;
/**
 * Gets a donor based on KID
 * @param {Number} KID
 * @returns {Donor} A donor Object
 */
export function getByKID(KID: number): Donor;
/**
 * Searches for a user with either email or name matching the query
 * @param {string} query A query string trying to match agains full name and email
 * @returns {Array<Donor>} An array of donor objects
 */
export function search(query: string): Array<Donor>;
/**
 * Adds a new Donor to the database
 * @param {Donor} donor A donorObject with two properties, email (string) and name(string)
 * @returns {Number} The ID of the new Donor if successfull
 */
export function add(email: string, name: any, ssn?: string, newsletter?: any): number;
/**
 * Updates donor and sets new SSN
 * @param {number} donorID
 * @param {string} ssn Social security number
 * @returns {boolean}
 */
export function updateSsn(donorID: number, ssn: string): boolean;
/**
 * Updates donor and sets new newsletter value
 * @param {number} donorID
 * @param {boolean} newsletter
 * @returns {boolean}
 */
export function updateNewsletter(donorID: number, newsletter: boolean): boolean;
export declare function setup(dbPool: any): void;
