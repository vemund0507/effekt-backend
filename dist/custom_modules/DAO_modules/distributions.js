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
var sqlString = require('sqlstring');
var pool;
var DAO;
//region GET
function getAll(page, limit, sort, filter) {
    if (page === void 0) { page = 0; }
    if (limit === void 0) { limit = 10; }
    if (filter === void 0) { filter = null; }
    return __awaiter(this, void 0, void 0, function () {
        var con, where, queryString, rows, counter, pages;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    where = [];
                    if (filter) {
                        if (filter.KID)
                            where.push(" CAST(KID as CHAR) LIKE " + sqlString.escape("%" + filter.KID + "%") + " ");
                        if (filter.donor)
                            where.push(" (full_name LIKE " + sqlString.escape("%" + filter.donor + "%") + " or email LIKE " + sqlString.escape("%" + filter.donor + "%") + ") ");
                    }
                    queryString = "\n        SELECT\n            Distribution.KID,\n            Donations.sum,\n            Donations.count,\n            Donors.full_name,\n            Donors.email\n\n            FROM Distribution\n\n            LEFT JOIN (SELECT sum(sum_confirmed) as sum, count(*) as count, KID_fordeling FROM Donations GROUP BY KID_fordeling) as Donations\n                ON Donations.KID_fordeling = Distribution.KID\n\n            INNER JOIN Donors\n                ON Distribution.DonorID = Donors.ID\n\n            " + (where.length > 0 ? "WHERE " + where.join(" AND ") : "") + "\n\n            GROUP BY Distribution.KID, Donors.full_name, Donors.email\n\n            ORDER BY " + sort.id + " " + (sort.desc ? ' DESC' : '') + "\n\n            LIMIT " + sqlString.escape(limit) + " OFFSET " + sqlString.escape(limit * page);
                    return [4 /*yield*/, con.query(queryString)];
                case 2:
                    rows = (_a.sent())[0];
                    return [4 /*yield*/, con.query("\n        SELECT COUNT(*) as count \n            FROM Distribution\n\n            LEFT JOIN (SELECT sum(sum_confirmed) as sum, count(*) as count, KID_fordeling FROM Donations GROUP BY KID_fordeling) as Donations\n                ON Donations.KID_fordeling = Distribution.KID\n\n            INNER JOIN Donors\n                ON Distribution.DonorID = Donors.ID\n\n            " + (where.length > 0 ? "WHERE " + where.join(" AND ") : ""))];
                case 3:
                    counter = (_a.sent())[0];
                    pages = Math.ceil(counter[0].count / limit);
                    con.release();
                    return [2 /*return*/, {
                            rows: rows,
                            pages: pages
                        }];
            }
        });
    });
}
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
function getAllByDonor(donorID) {
    return __awaiter(this, void 0, void 0, function () {
        var con, res, distObj, map, _i, res_1, item;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("select Donors.ID as donID, Distribution.KID as KID, Distribution.ID, Organizations.full_name, Distribution.percentage_share \n    from Donors\n    inner join Distribution on Distribution.DonorID = Donors.ID\n    inner join Organizations on Organizations.ID = Distribution.OrgID\n    where Donors.ID = " + donorID)];
                case 2:
                    res = (_a.sent())[0];
                    distObj = {
                        donorID: res[0].donID,
                        distributions: []
                    };
                    map = new Map();
                    for (_i = 0, res_1 = res; _i < res_1.length; _i++) {
                        item = res_1[_i];
                        if (!map.has(item.KID)) {
                            map.set(item.KID, true);
                            distObj.distributions.push({
                                kid: item.KID,
                                organizations: []
                            });
                        }
                    }
                    // Adds organization and shares to each KID number
                    res.forEach(function (row) {
                        distObj.distributions.forEach(function (obj) {
                            if (row.KID == obj.kid) {
                                obj.organizations.push({ name: row.full_name, share: row.percentage_share });
                            }
                        });
                    });
                    con.release();
                    return [2 /*return*/, distObj];
            }
        });
    });
}
/**
 * Checks whether given KID exists in DB
 * @param {number} KID
 * @returns {boolean}
 */
function KIDexists(KID) {
    return __awaiter(this, void 0, void 0, function () {
        var con, res, ex_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("SELECT * FROM Distribution WHERE KID = ? LIMIT 1", [KID])];
                case 2:
                    res = (_a.sent())[0];
                    con.release();
                    if (res.length > 0)
                        return [2 /*return*/, true];
                    else
                        return [2 /*return*/, false];
                    return [3 /*break*/, 4];
                case 3:
                    ex_1 = _a.sent();
                    con.release();
                    throw ex_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function distnrExists(Distnr) {
    return __awaiter(this, void 0, void 0, function () {
        var con, res, ex_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("SELECT * FROM Distributions WHERE distribution_nr = ? LIMIT 1", [Distnr])];
                case 2:
                    res = (_a.sent())[0];
                    con.release();
                    if (res.length > 0)
                        return [2 /*return*/, true];
                    else
                        return [2 /*return*/, false];
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
 * Takes in a distribution array and a Donor ID, and returns the KID if the specified distribution exists for the given donor.
 * @param {array<object>} split
 * @param {number} donorID
 * @returns {number | null} KID or null if no KID found
 */
function getKIDbySplit(split, donorID) {
    return __awaiter(this, void 0, void 0, function () {
        var con, query, i, res, ex_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    query = "\n        SELECT \n            KID, \n            Count(KID) as KID_count \n            \n        FROM Distribution as D\n        \n        WHERE\n        ";
                    for (i = 0; i < split.length; i++) {
                        query += "(OrgID = " + sqlString.escape(split[i].organizationID) + " AND percentage_share = " + sqlString.escape(split[i].share) + " AND Donor_ID = " + sqlString.escape(donorID) + ")";
                        if (i < split.length - 1)
                            query += " OR ";
                    }
                    query += " GROUP BY D.KID\n        \n        HAVING \n            KID_count = " + split.length;
                    return [4 /*yield*/, con.execute(query)];
                case 2:
                    res = (_a.sent())[0];
                    con.release();
                    if (res.length > 0)
                        return [2 /*return*/, res[0].KID];
                    else
                        return [2 /*return*/, null];
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
 * Gets organizaitons and distribution share from a KID
 * @param {number} KID
 * @returns {[{
 *  ID: number,
 *  full_name: string,
 *  abbriv: string,
 *  percentage_share: Decimal
 * }]}
 */
function getSplitByKID(KID) {
    return __awaiter(this, void 0, void 0, function () {
        var con, result, ex_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("\n            SELECT \n                Organizations.ID,\n                Organizations.full_name,\n                Organizations.abbriv, \n                Distribution.percentage_share\n            \n            FROM Distribution\n                INNER JOIN Organizations as Organizations\n                    ON Organizations.ID = Distribution.OrgID\n            \n            WHERE \n                KID = ?", [KID])];
                case 2:
                    result = (_a.sent())[0];
                    con.release();
                    if (result.length == 0)
                        return [2 /*return*/, new Error("NOT FOUND | No distribution with the KID " + KID)];
                    return [2 /*return*/, result];
                case 3:
                    ex_4 = _a.sent();
                    con.release();
                    throw ex_4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Gets KIDs from historic paypal donors, matching them against a ReferenceTransactionId
 * @param {Array} transactions A list of transactions that must have a ReferenceTransactionId
 * @returns {Object} Returns an object with referenceTransactionId's as keys and KIDs as values
 */
function getHistoricPaypalSubscriptionKIDS(referenceIDs) {
    return __awaiter(this, void 0, void 0, function () {
        var con, res, mapping, ex_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("SELECT \n            ReferenceTransactionNumber,\n            KID \n            \n            FROM Paypal_historic_distributions \n\n            WHERE \n                ReferenceTransactionNumber IN (?);", [referenceIDs])];
                case 2:
                    res = (_a.sent())[0];
                    mapping = res.reduce(function (acc, row) {
                        acc[row.ReferenceTransactionNumber] = row.KID;
                        return acc;
                    }, {});
                    con.release();
                    return [2 /*return*/, mapping];
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
//region add
/**
 * Adds a given distribution to the databse, connected to the supplied DonorID and the given KID
 * @param {Array<object>} split
 * @param {number} KID
 * @param {number} donorID
 * @param {number} [metaOwnerID=null] Specifies an owner that the data belongs to (e.g. The Effekt Foundation). Defaults to selection default from DB if none is provided.
 */
function add(split, distributionNumber, KID, metaOwnerID) {
    if (metaOwnerID === void 0) { metaOwnerID = null; }
    return __awaiter(this, void 0, void 0, function () {
        var transaction, distribution_table_values, res, ex_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, pool.startTransaction()];
                case 1:
                    transaction = _a.sent();
                    if (!(metaOwnerID == null)) return [3 /*break*/, 3];
                    return [4 /*yield*/, DAO.meta.getDefaultOwnerID()];
                case 2:
                    metaOwnerID = _a.sent();
                    _a.label = 3;
                case 3:
                    distribution_table_values = split.map(function (item) { return [item.organizationID, item.share, distributionNumber, KID]; });
                    return [4 /*yield*/, transaction.query("INSERT INTO Distribution (OrgID, percentage_share, distribution_number, KID) VALUES ?", [distribution_table_values])];
                case 4:
                    res = _a.sent();
                    pool.commitTransaction(transaction);
                    return [2 /*return*/, true];
                case 5:
                    ex_6 = _a.sent();
                    pool.rollbackTransaction(transaction);
                    throw ex_6;
                case 6: return [2 /*return*/];
            }
        });
    });
}
//endregion
module.exports = {
    KIDexists: KIDexists,
    getKIDbySplit: getKIDbySplit,
    getSplitByKID: getSplitByKID,
    getHistoricPaypalSubscriptionKIDS: getHistoricPaypalSubscriptionKIDS,
    getAll: getAll,
    getAllByDonor: getAllByDonor,
    add: add,
    distnrExists: distnrExists,
    setup: function (dbPool, DAOObject) { pool = dbPool, DAO = DAOObject; }
};
