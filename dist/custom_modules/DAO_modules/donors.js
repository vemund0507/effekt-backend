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
var pool;
/**
 * @typedef Donor
 * @prop {number} id
 * @prop {string} email
 * @prop {string} name
 * @prop {string} ssn Social security number
 * @prop {Date} registered
 * @prop {boolean} newsletter
 */
//region Get
/**
 * Gets the ID of a Donor based on their email
 * @param {String} email An email
 * @returns {Number} An ID
 */
function getIDbyEmail(email) {
    return __awaiter(this, void 0, void 0, function () {
        var con, result, ex_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.execute("SELECT ID FROM Donors where email = ?", [email])];
                case 2:
                    result = (_a.sent())[0];
                    con.release();
                    if (result.length > 0)
                        return [2 /*return*/, (result[0].ID)];
                    else
                        return [2 /*return*/, (null)];
                    return [3 /*break*/, 4];
                case 3:
                    ex_1 = _a.sent();
                    con.release();
                    throw (ex_1);
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Selects a Donor object from the database with the given ID
 * @param {Number} ID The ID in the database for the donor
 * @returns {Donor} A donor object
 */
function getByID(ID) {
    return __awaiter(this, void 0, void 0, function () {
        var con, result, ex_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.execute("SELECT * FROM Donors where ID = ? LIMIT 1", [ID])];
                case 2:
                    result = (_a.sent())[0];
                    con.release();
                    if (result.length > 0)
                        return [2 /*return*/, (result[0])];
                    else
                        return [2 /*return*/, (null)];
                    return [3 /*break*/, 4];
                case 3:
                    ex_2 = _a.sent();
                    con.release();
                    throw ex_2;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Gets a donor based on KID
 * @param {Number} KID
 * @returns {Donor} A donor Object
 */
function getByKID(KID) {
    return __awaiter(this, void 0, void 0, function () {
        var con, dbDonor, ex_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("SELECT    \n            ID,\n            email, \n            full_name,\n            ssn,\n            date_registered\n            \n            FROM Donors \n            \n            INNER JOIN Donations \n                ON ID = Donors_ID \n                \n            WHERE KID_fordeling = ? \n            GROUP BY Donors.ID LIMIT 1", [KID])
                        // //TODO: might aswell join on distributions?
                        // SELECT Donors.ID, email, full_name, ssn, date_registered 
                        // FROM EffektDonasjonDB_Dev.Donors 
                        // INNER JOIN EffektDonasjonDB_Dev.Donations 
                        // ON Donors.ID = Donations.Donor_ID
                        // WHERE KID_fordeling = 16391823
                    ];
                case 2:
                    dbDonor = (_a.sent())[0];
                    // //TODO: might aswell join on distributions?
                    // SELECT Donors.ID, email, full_name, ssn, date_registered 
                    // FROM EffektDonasjonDB_Dev.Donors 
                    // INNER JOIN EffektDonasjonDB_Dev.Donations 
                    // ON Donors.ID = Donations.Donor_ID
                    // WHERE KID_fordeling = 16391823
                    con.release();
                    if (dbDonor.length > 0) {
                        return [2 /*return*/, {
                                id: dbDonor[0].ID,
                                email: dbDonor[0].email,
                                name: dbDonor[0].full_name,
                                ssn: dbDonor[0].ssn,
                                registered: dbDonor[0].date_registered
                            }];
                    }
                    else {
                        return [2 /*return*/, null];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    ex_3 = _a.sent();
                    con.release();
                    throw ex_3;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Searches for a user with either email or name matching the query
 * @param {string} query A query string trying to match agains full name and email
 * @returns {Array<Donor>} An array of donor objects
 */
function search(query) {
    return __awaiter(this, void 0, void 0, function () {
        var con, result, result, ex_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    if (!(query === "" || query.length < 3)) return [3 /*break*/, 3];
                    return [4 /*yield*/, con.execute("SELECT * FROM Donors LIMIT 100", [query])];
                case 2:
                    result = (_a.sent())[0];
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, con.execute("SELECT * FROM Donors \n            WHERE \n                MATCH (full_name, email) AGAINST (?)\n                OR full_name LIKE ?\n                OR email LIKE ?\n                \n            LIMIT 100", [query, "%" + query + "%", "%" + query + "%"])];
                case 4:
                    result = (_a.sent())[0];
                    _a.label = 5;
                case 5:
                    con.release();
                    if (result.length > 0) {
                        return [2 /*return*/, (result.map(function (donor) {
                                return {
                                    id: donor.ID,
                                    name: donor.full_name,
                                    email: donor.email,
                                    ssn: donor.ssn,
                                    registered: donor.date_registered
                                };
                            }))];
                    }
                    else {
                        return [2 /*return*/, null];
                    }
                    return [3 /*break*/, 7];
                case 6:
                    ex_4 = _a.sent();
                    con.release();
                    throw ex_4;
                case 7: return [2 /*return*/];
            }
        });
    });
}
//endregion
//region Add
/**
 * Adds a new Donor to the database
 * @param {Donor} donor A donorObject with two properties, email (string) and name(string)
 * @returns {Number} The ID of the new Donor if successfull
 */
function add(email, name, ssn, newsletter) {
    if (email === void 0) { email = ""; }
    if (ssn === void 0) { ssn = ""; }
    if (newsletter === void 0) { newsletter = null; }
    return __awaiter(this, void 0, void 0, function () {
        var con, res, ex_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.execute("INSERT INTO Donors (\n            email,\n            full_name, \n            ssn,\n            newsletter\n        ) VALUES (?,?,?,?)", [
                            email,
                            name,
                            ssn,
                            newsletter
                        ])];
                case 2:
                    res = _a.sent();
                    con.release();
                    return [2 /*return*/, (res[0].insertId)];
                case 3:
                    ex_5 = _a.sent();
                    con.release();
                    throw ex_5;
                case 4: return [2 /*return*/];
            }
        });
    });
}
//endregion
//region Modify
/**
 * Updates donor and sets new SSN
 * @param {number} donorID
 * @param {string} ssn Social security number
 * @returns {boolean}
 */
function updateSsn(donorID, ssn) {
    return __awaiter(this, void 0, void 0, function () {
        var con, res, ex_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("UPDATE Donors SET ssn = ? where ID = ?", [ssn, donorID])];
                case 2:
                    res = _a.sent();
                    con.release();
                    return [2 /*return*/, true];
                case 3:
                    ex_6 = _a.sent();
                    con.release();
                    throw ex_6;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Updates donor and sets new newsletter value
 * @param {number} donorID
 * @param {boolean} newsletter
 * @returns {boolean}
 */
function updateNewsletter(donorID, newsletter) {
    return __awaiter(this, void 0, void 0, function () {
        var con, res, ex_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("UPDATE Donors SET newsletter = ? where ID = ?", [newsletter, donorID])];
                case 2:
                    res = _a.sent();
                    con.release();
                    return [2 /*return*/, true];
                case 3:
                    ex_7 = _a.sent();
                    con.release();
                    throw ex_7;
                case 4: return [2 /*return*/];
            }
        });
    });
}
//endregion
//region Delete
//endregion
module.exports = {
    getByID: getByID,
    getIDbyEmail: getIDbyEmail,
    getByKID: getByKID,
    search: search,
    add: add,
    updateSsn: updateSsn,
    updateNewsletter: updateNewsletter,
    setup: function (dbPool) { pool = dbPool; }
};
