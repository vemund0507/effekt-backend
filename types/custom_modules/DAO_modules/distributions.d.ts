/**
 * Checks whether given KID exists in DB
 * @param {number} KID
 * @returns {boolean}
 */
export function KIDexists(KID: number): boolean;
/**
 * Takes in a distribution array and a Donor ID, and returns the KID if the specified distribution exists for the given donor.
 * @param {array<object>} split
 * @param {number} donorID
 * @returns {number | null} KID or null if no KID found
 */
export function getKIDbySplit(split: any, donorID: number): number | null;
/**
 * Gets organizaitons and distribution share from a KID
 * @param {number} KID
 * @returns {[{
 *  ID: number,
 *  full_name: string,
 *  abbriv: string,
 *  percentage_share: Decimal
 * }]}
 */
export function getSplitByKID(KID: number): [
    {
        ID: number;
        full_name: string;
        abbriv: string;
        percentage_share: Decimal;
    }
];
/**
 * Gets KIDs from historic paypal donors, matching them against a ReferenceTransactionId
 * @param {Array} transactions A list of transactions that must have a ReferenceTransactionId
 * @returns {Object} Returns an object with referenceTransactionId's as keys and KIDs as values
 */
export function getHistoricPaypalSubscriptionKIDS(referenceIDs: any): any;
export function getAll(page: number, limit: number, sort: any, filter?: any): Promise<{
    rows: any;
    pages: number;
}>;
/**
 * Fetches all distributions belonging to a specific donor
 * @param {Number} donorID
 * @returns {{
 *  donorID: number,
 *  distributions: [{
 *      KID: number,
 *      organizations: [{
 *          name: string,
 *          share: number
 *      }]}]}}
 */
export function getAllByDonor(donorID: number): {
    donorID: number;
    distributions: [
        {
            KID: number;
            organizations: [
                {
                    name: string;
                    share: number;
                }
            ];
        }
    ];
};
/**
 * Adds a given distribution to the databse, connected to the supplied DonorID and the given KID
 * @param {Array<object>} split
 * @param {number} KID
 * @param {number} donorID
 * @param {number} [metaOwnerID=null] Specifies an owner that the data belongs to (e.g. The Effekt Foundation). Defaults to selection default from DB if none is provided.
 */
export function add(split: Array<object>, KID: number, donorID: number, metaOwnerID?: number): Promise<boolean>;
export declare function setup(dbPool: any, DAOObject: any): void;
