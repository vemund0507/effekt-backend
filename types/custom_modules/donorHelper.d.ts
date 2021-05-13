/**
 * Gets firstname from donor object
 * @param {Donor} donor
 * @return {string} The firstname
 */
export function getFirstname(donor: any): string;
/**
 * Gets last name of donor
 * @param {Donor} donor
 * @param {boolean} full Whether to include all names after firstname, or only last name
 */
export function getLastname(donor: any, full?: boolean): any;
