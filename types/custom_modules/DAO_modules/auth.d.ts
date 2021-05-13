/**
 * Returns a Donor object if a valid change password token is found in Database
 * @param {string} token A 40 hcaracter long random token
 * @returns {?object} A Donor object
 */
export function getDonorByChangePassToken(token: string): object | null;
/**
 * Checks whether access token grants a given permission
 * @param {String} token Access token
 * @param {String} permission A specific permission
 * @returns {Number} The userID of the authorized user, returns null if no found
 *
 * @throws {Error} Error with string message 'invalid_token'
 * @throws {Error} Error with string message 'insufficient_scope'
 */
export function getCheckPermissionByToken(token: string, permission: string): number;
/**
 * Get application data from clientID
 * @param {String} clientID The clientID
 * @return {Object} An object with the applications name, id, secret and an array of allowed redirect uris
 */
export function getApplicationByClientID(clientID: string): any;
/**
 * Gets permission data from an array of permission shortnames
 * @param {Array} shortnames an array of string shortnames
 * @returns {Array} an array of permissions
 */
export function getPermissionsFromShortnames(shortnames: any[]): any[];
/**
 * Checks email password combination, returns donor
 * @param {String} email
 * @param {String} password
 * @returns {Object} A Donor object, with id, name etc.
 */
export function getDonorByCredentials(email: string, password: string): any;
/**
 * Checks whether application has access to given permissions
 * @param {Array} permissions An array of string permissions
 * @param {Number} applicationID The ID of the application in the database
 * @returns {Boolean}
 */
export function checkApplicationPermissions(applicationID: number, permissions: any[]): boolean;
/**
 * Checks whether donor has access to given permissions
 * @param {Array} permissions An array of string permissions
 * @param {Number} donorID The ID of the donor in the database
 * @returns {Boolean}
 */
export function checkDonorPermissions(donorID: number, permissions: any[]): boolean;
/**
 * Updates a Donors password in the database
 * Does all the cryptographic work, salting and hashing
 * @param {number} userId Donors ID
 * @param {string} password Donors chosen password in plaintext
 * @returns {boolean} To indicate success or failiure
 */
export function updateDonorPassword(donorID: any, password: string): boolean;
/**
 * Adds a access key with given permissions. Presumes user and application is authenticated!
 * @param {Number} donorID
 * @param {Number} applicationID
 * @param {Array} permissions an array of Permission objects from database
 * @returns {Object} an access key object, with key and expires as properties
 */
export function addAccessKey(donorID: number, applicationID: number, permissions: any[]): any;
/**
 * Creates an access token for a given access key
 * @param {String} accessKey The access key
 * @returns {String} Inserted access token
 */
export function addAccessTokenByAccessKey(accessKey: string): string;
/**
 * Deletes an access key and associated tokens
 * Essentially a logout function
 * @param {string} accessKey The access key to be the basis of deletion
 * @returns {boolean} To indicate success or failure
 */
export function deleteAccessKey(accessKey: string): boolean;
/**
 * Deletes a password resett token
 * @param {string} token The password reset token
 * @returns {boolean} To indicate success or failure
 * */
export function deletePasswordResetToken(token: string): boolean;
export declare function setup(dbPool: any): void;
