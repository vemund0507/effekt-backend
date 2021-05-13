export type DataOwner = {
    id: number;
    name: string;
    default: boolean;
};
/**
 * @typedef DataOwner
 * @prop {Number} id
 * @prop {String} name
 * @prop {Boolean} default
 */
/**
 * Gets the diferent data owner actors from the DB
 * @returns {Array<DataOwner>} An array of DataOwner objects
 */
export function getDataOwners(): Array<DataOwner>;
/**
 * Gets the default owner ID from the DB
 * @returns {Number} The default owner ID
 */
export function getDefaultOwnerID(): number;
export declare function setup(dbPool: any): void;
