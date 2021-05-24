var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var crypto = require('../authorization/crypto.js');
var con;
//region Get
/**
 * Returns a Donor object if a valid change password token is found in Database
 * @param {string} token A 40 hcaracter long random token
 * @returns {?object} A Donor object
 */
function getDonorByChangePassToken(token) {
    return __awaiter(this, void 0, void 0, function () {
        var result, ex_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, con.query("\n        SELECT \n            D.ID, \n            D.full_name \n        \n        FROM ChangePass as C \n            INNER JOIN Donors as D\n                ON C.userID = D.ID\n        \n        WHERE C.token = ? AND expires > NOW()\n        \n        LIMIT 1", [token])];
                case 1:
                    result = (_a.sent())[0];
                    return [3 /*break*/, 3];
                case 2:
                    ex_1 = _a.sent();
                    throw ex_1;
                case 3:
                    if (result.length > 0)
                        return [2 /*return*/, ({
                                id: result[0].ID,
                                fullName: result[0].full_name
                            })];
                    return [2 /*return*/, null];
            }
        });
    });
}
/**
 * Gets permission data from an array of permission shortnames
 * @param {Array} shortnames an array of string shortnames
 * @returns {Array} an array of permissions
 */
function getPermissionsFromShortnames(shortnames) {
    return __awaiter(this, void 0, void 0, function () {
        var result, ex_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, con.query("\n                SELECT ID, shortname, description FROM Access_permissions\n\n                WHERE shortname IN (?)\n            ", [shortnames])];
                case 1:
                    result = (_a.sent())[0];
                    return [3 /*break*/, 3];
                case 2:
                    ex_2 = _a.sent();
                    throw ex_2;
                case 3: return [2 /*return*/, result];
            }
        });
    });
}
/**
 * Checks whether access token grants a given permission
 * @param {String} token Access token
 * @param {String} permission A specific permission
 * @returns {Number} The userID of the authorized user, returns null if no found
 *
 * @throws {Error} Error with string message 'invalid_token'
 * @throws {Error} Error with string message 'insufficient_scope'
 */
function getCheckPermissionByToken(token, permission) {
    return __awaiter(this, void 0, void 0, function () {
        var user, result, ex_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, con.query("\n            SELECT  \n                K.Donor_ID\n                \n                FROM Access_tokens as T\n\n                INNER JOIN Access_keys as K\n                    ON T.Key_ID = K.ID\n\n                WHERE \n                    T.token = ?\n                    AND\n                    T.expires > now()\n                LIMIT 1\n        ", [token])];
                case 1:
                    user = (_a.sent())[0];
                    if (user.length == 0)
                        return [2 /*return*/, new Error("invalid_token")];
                    return [4 /*yield*/, con.query("\n            SELECT 1\n                FROM Access_tokens as T\n                \n                INNER JOIN Access_keys_permissions as Combine\n                    ON T.Key_ID = Combine.Key_ID\n                \n                INNER JOIN Access_permissions as P\n                    ON P.ID = Combine.Permission_ID\n\n                WHERE \n                    T.token = ?\n                    AND\n                    P.shortName = ?\n                ", [token, permission])];
                case 2:
                    result = (_a.sent())[0];
                    if (result.length > 0)
                        return [2 /*return*/, user[0].Donor_ID];
                    else
                        return [2 /*return*/, new Error("insufficient_scope")];
                    return [3 /*break*/, 4];
                case 3:
                    ex_3 = _a.sent();
                    throw ex_3;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Checks whether application has access to given permissions
 * @param {Array} permissions An array of string permissions
 * @param {Number} applicationID The ID of the application in the database
 * @returns {Boolean}
 */
function checkApplicationPermissions(applicationID, permissions) {
    return __awaiter(this, void 0, void 0, function () {
        var result, ex_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, con.query("\n            SELECT P.shortname FROM Access_applications_permissions as AP\n                INNER JOIN Access_permissions as P\n                    ON AP.Permission_ID = P.ID\n                    \n            WHERE \n                AP.Application_ID = ?\n                AND\n                P.shortname IN(?)", [applicationID, permissions])];
                case 1:
                    result = (_a.sent())[0];
                    return [3 /*break*/, 3];
                case 2:
                    ex_4 = _a.sent();
                    throw ex_4;
                case 3:
                    if (result.length == permissions.length)
                        return [2 /*return*/, true];
                    else
                        return [2 /*return*/, false];
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Checks whether donor has access to given permissions
 * @param {Array} permissions An array of string permissions
 * @param {Number} donorID The ID of the donor in the database
 * @returns {Boolean}
 */
function checkDonorPermissions(donorID, permissions) {
    return __awaiter(this, void 0, void 0, function () {
        var restrictedQuery, restrictedPermissionsFound, defaultQuery, openPermissionsFound, ex_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, con.query("\n            SELECT P.shortname FROM Access_restricted_permissions as RP\n                INNER JOIN Access_permissions as P\n                    ON RP.Permission_ID = P.ID\n                    \n            WHERE\n                RP.Donor_ID = ?\n                AND\n                P.shortname IN(?)\n                AND\n                P.restricted = 1", [donorID, permissions])];
                case 1:
                    restrictedQuery = (_a.sent())[0];
                    restrictedPermissionsFound = restrictedQuery.length;
                    return [4 /*yield*/, con.query("\n            SELECT shortname FROM Access_permissions\n            \n            WHERE \n                shortname IN(?)\n                AND\n                restricted = 0", [permissions])];
                case 2:
                    defaultQuery = (_a.sent())[0];
                    openPermissionsFound = defaultQuery.length;
                    if (restrictedPermissionsFound + openPermissionsFound == permissions.length) {
                        return [2 /*return*/, true];
                    }
                    else {
                        return [2 /*return*/, false];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    ex_5 = _a.sent();
                    throw ex_5;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get application data from clientID
 * @param {String} clientID The clientID
 * @return {Object} An object with the applications name, id, secret and an array of allowed redirect uris
 */
function getApplicationByClientID(clientID) {
    return __awaiter(this, void 0, void 0, function () {
        var result, application, callbacks, ex_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, con.query("\n            SELECT * FROM Access_applications\n                    \n            WHERE clientID = ?", [clientID])];
                case 1:
                    result = (_a.sent())[0];
                    if (result.length == 0)
                        return [2 /*return*/, (null)];
                    application = result[0];
                    return [4 /*yield*/, con.query("\n            SELECT callback FROM Access_applications_callbacks\n\n            WHERE ApplicationID = ?", [application.ID])];
                case 2:
                    callbacks = (_a.sent())[0];
                    application.callbacks = callbacks.map(function (row) { return row.callback; });
                    return [2 /*return*/, application];
                case 3:
                    ex_6 = _a.sent();
                    throw ex_6;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Checks email password combination, returns donor
 * @param {String} email
 * @param {String} password
 * @returns {Object} A Donor object, with id, name etc.
 */
function getDonorByCredentials(email, password) {
    return __awaiter(this, void 0, void 0, function () {
        var saltQuery, salt, passwordHash, donorQuery, ex_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, con.query("\n            SELECT password_salt from Donors\n\n            WHERE email = ?\n        ", [email])];
                case 1:
                    saltQuery = (_a.sent())[0];
                    if (!(saltQuery.length == 0)) return [3 /*break*/, 2];
                    return [2 /*return*/, (null)];
                case 2:
                    salt = saltQuery[0].password_salt;
                    passwordHash = crypto.hashPassword(password, salt);
                    return [4 /*yield*/, con.query("\n                SELECT ID, full_name, email, date_registered FROM Donors\n\n                WHERE \n                    email = ?\n                    AND\n                    password_hash = ?\n            ", [email, passwordHash])];
                case 3:
                    donorQuery = (_a.sent())[0];
                    if (donorQuery.length > 0) {
                        return [2 /*return*/, (donorQuery.map(function (line) {
                                return {
                                    id: line.ID,
                                    fullname: line.full_name,
                                    email: line.email,
                                    registered: line.date_registered
                                };
                            })[0])];
                    }
                    else {
                        return [2 /*return*/, null];
                    }
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    ex_7 = _a.sent();
                    throw ex_7;
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Checks whether a given access key has expired
 * @param {String} accessKey
 * @returns {Object} an access key object from DB
 */
function getValidAccessKey(accessKey) {
    return __awaiter(this, void 0, void 0, function () {
        var res, ex_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, con.query("\n            SELECT * FROM Access_keys\n                WHERE `key` = ? \n                AND \n                expires > NOW()\n        ", [accessKey])];
                case 1:
                    res = (_a.sent())[0];
                    return [3 /*break*/, 3];
                case 2:
                    ex_8 = _a.sent();
                    throw ex_8;
                case 3:
                    if (res.length > 0)
                        return [2 /*return*/, (res[0])];
                    else
                        return [2 /*return*/, null];
                    return [2 /*return*/];
            }
        });
    });
}
//endregion
//region Add
/**
 * Adds a access key with given permissions. Presumes user and application is authenticated!
 * @param {Number} donorID
 * @param {Number} applicationID
 * @param {Array} permissions an array of Permission objects from database
 * @returns {Object} an access key object, with key and expires as properties
 */
function addAccessKey(donorID, applicationID, permissions) {
    return __awaiter(this, void 0, void 0, function () {
        var transaction, accessKey, res, accessKeyID_1, res, accessKeyQuery, ex_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 11, , 13]);
                    return [4 /*yield*/, con.startTransaction()
                        //Create and insert access new key
                    ];
                case 1:
                    transaction = _a.sent();
                    accessKey = crypto.getAccessKey();
                    return [4 /*yield*/, transaction.query("\n            INSERT INTO Access_keys\n                SET\n                ?\n        ", {
                            key: accessKey,
                            Donor_ID: donorID,
                            Application_ID: applicationID
                        })];
                case 2:
                    res = _a.sent();
                    accessKeyID_1 = res[0].insertId;
                    if (!!accessKeyID_1) return [3 /*break*/, 4];
                    return [4 /*yield*/, con.rollbackTransaction(transaction)];
                case 3:
                    _a.sent();
                    return [2 /*return*/, (new Error("Access key insert failed"))
                        //return false
                    ];
                case 4: return [4 /*yield*/, transaction.query("\n            INSERT INTO Access_keys_permissions\n                (Key_ID, Permission_ID) VALUES ?", [
                        permissions.map(function (permission) {
                            return [accessKeyID_1, permission.ID];
                        })
                    ])
                    //Get access key
                ];
                case 5:
                    res = _a.sent();
                    return [4 /*yield*/, transaction.query("\n            SELECT * FROM Access_keys\n            WHERE ID = ?\n            LIMIT 1\n        ", [accessKeyID_1])];
                case 6:
                    accessKeyQuery = (_a.sent())[0];
                    if (!(accessKeyQuery.length > 0)) return [3 /*break*/, 8];
                    return [4 /*yield*/, con.commitTransaction(transaction)];
                case 7:
                    _a.sent();
                    return [2 /*return*/, ({
                            key: accessKeyQuery[0].key,
                            expires: new Date(accessKeyQuery[0].expires)
                        })
                        // return true
                    ];
                case 8: return [4 /*yield*/, con.rollbackTransaction(transaction)];
                case 9:
                    _a.sent();
                    return [2 /*return*/, (new Error("Recently inserted AccessKey not found in DB"))
                        //return false
                    ];
                case 10: return [3 /*break*/, 13];
                case 11:
                    ex_9 = _a.sent();
                    return [4 /*yield*/, con.rollbackTransaction(transaction)];
                case 12:
                    _a.sent();
                    throw ex_9;
                case 13: return [2 /*return*/];
            }
        });
    });
}
/**
 * Creates an access token for a given access key
 * @param {String} accessKey The access key
 * @returns {String} Inserted access token
 */
function addAccessTokenByAccessKey(accessKey) {
    return __awaiter(this, void 0, void 0, function () {
        var accesKey, token, res, expires, ex_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, getValidAccessKey(accessKey)];
                case 1:
                    accesKey = _a.sent();
                    if (!accesKey) {
                        throw new Error("Invalid access key");
                    }
                    token = crypto.getAccessToken();
                    return [4 /*yield*/, con.query("\n            INSERT INTO Access_tokens\n                SET ?\n        ", {
                            Key_ID: accesKey.ID,
                            token: token
                        })];
                case 2:
                    res = (_a.sent())[0];
                    return [4 /*yield*/, con.query("SELECT \n            expires\n            FROM Access_tokens\n            WHERE token = ?", [token])];
                case 3:
                    expires = (_a.sent())[0];
                    if (!res.insertId) {
                        throw new Error("Failed to insert access token");
                    }
                    else {
                        return [2 /*return*/, ({
                                token: token,
                                expires: new Date(expires[0].expires)
                            })];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    ex_10 = _a.sent();
                    throw ex_10;
                case 5: return [2 /*return*/];
            }
        });
    });
}
//endregion
//region Modify
/**
 * Updates a Donors password in the database
 * Does all the cryptographic work, salting and hashing
 * @param {number} userId Donors ID
 * @param {string} password Donors chosen password in plaintext
 * @returns {boolean} To indicate success or failiure
 */
function updateDonorPassword(donorID, password) {
    return __awaiter(this, void 0, void 0, function () {
        var salt, hashedPassword, result, ex_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    salt = crypto.getPasswordSalt();
                    hashedPassword = crypto.hashPassword(password, salt);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, con.query("UPDATE Donors SET password_hash = ?, password_salt = ? WHERE ID = ?", [hashedPassword, salt, donorID])];
                case 2:
                    result = (_a.sent())[0];
                    return [3 /*break*/, 4];
                case 3:
                    ex_11 = _a.sent();
                    throw ex_11;
                case 4:
                    if (result.length > 0)
                        return [2 /*return*/, true];
                    else
                        return [2 /*return*/, false];
                    return [2 /*return*/];
            }
        });
    });
}
//endregion
//region Delete
/**
 * Deletes an access key and associated tokens
 * Essentially a logout function
 * @param {string} accessKey The access key to be the basis of deletion
 * @returns {boolean} To indicate success or failure
 */
function deleteAccessKey(accessKey) {
    return __awaiter(this, void 0, void 0, function () {
        var result, ex_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, con.query("\n            DELETE FROM Access_keys\n            WHERE \n                `key` = ?", [accessKey])];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, (result[0].affectedRows == 1)];
                case 2:
                    ex_12 = _a.sent();
                    throw ex_12;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Deletes a password resett token
 * @param {string} token The password reset token
 * @returns {boolean} To indicate success or failure
 * */
function deletePasswordResetToken(token) {
    return __awaiter(this, void 0, void 0, function () {
        var result, ex_13;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, con.query("\n            DELETE FROM ChangePass\n            WHERE\n                token = ?", [token])];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, (result[0].affectedRows > 0)
                        // return true
                    ];
                case 2:
                    ex_13 = _a.sent();
                    throw ex_13;
                case 3: return [2 /*return*/];
            }
        });
    });
}
//endregion
module.exports = {
    getDonorByChangePassToken: getDonorByChangePassToken,
    getCheckPermissionByToken: getCheckPermissionByToken,
    getApplicationByClientID: getApplicationByClientID,
    getPermissionsFromShortnames: getPermissionsFromShortnames,
    getDonorByCredentials: getDonorByCredentials,
    checkApplicationPermissions: checkApplicationPermissions,
    checkDonorPermissions: checkDonorPermissions,
    updateDonorPassword: updateDonorPassword,
    addAccessKey: addAccessKey,
    addAccessTokenByAccessKey: addAccessTokenByAccessKey,
    deleteAccessKey: deleteAccessKey,
    deletePasswordResetToken: deletePasswordResetToken,
    setup: function (dbPool) { con = dbPool; }
};
