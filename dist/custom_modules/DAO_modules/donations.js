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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var sqlString = require('sqlstring');
var distributions = require('./distributions.js');
/**
 * @type {import('mysql2/promise').Pool}
 */
var pool;
var DAO;
/** @typedef Donation
 * @prop {number} id
 * @prop {string} donor Donor full name
 * @prop {string} email
 * @prop {number} sum
 * @prop {number} transactionCost
 * @prop {Date} timestamp Timestamp of when the donation was recieved
 * @prop {string} method The name of the payment method used for the donation
 * @prop {number} KID
 */
/** @typedef DonationSummary
 * @prop {string} organization Name of organization
 * @prop {number} sum
 */
/** @typedef DonationSummary
* @prop {string} year Year
* @prop {number} yearSum Sum of donations per year
*/
/** @typedef DonationDistributions
 * @prop {number} donationID
 * @prop {Date} date
 * @prop {Array} distributions
*/
//region Get
/**
 * Gets all donations, ordered by the specified column, limited by the limit, and starting at the specified cursor
 * @param {id: string, desc: boolean | null} sort If null, don't sort
 * @param {string | number | Date} cursor Used for pagination
 * @param {number=10} limit Defaults to 10
 * @param {object} filter Filtering object
 * @returns {[Array<IDonation & donorName: string>, nextcursor]} An array of donations pluss the donorname
 */
function getAll(sort, page, limit, filter) {
    if (limit === void 0) { limit = 10; }
    if (filter === void 0) { filter = null; }
    return __awaiter(this, void 0, void 0, function () {
        var con, sortColumn, where, donations, counter, pages, ex_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    if (!sort) return [3 /*break*/, 4];
                    sortColumn = jsDBmapping.find(function (map) { return map[0] === sort.id; })[1];
                    where = [];
                    if (filter) {
                        if (filter.sum) {
                            if (filter.sum.from)
                                where.push("sum_confirmed >= " + sqlString.escape(filter.sum.from) + " ");
                            if (filter.sum.to)
                                where.push("sum_confirmed <= " + sqlString.escape(filter.sum.to) + " ");
                        }
                        if (filter.date) {
                            if (filter.date.from)
                                where.push("timestamp_confirmed >= " + sqlString.escape(filter.date.from) + " ");
                            if (filter.date.to)
                                where.push("timestamp_confirmed <= " + sqlString.escape(filter.date.to) + " ");
                        }
                        if (filter.KID)
                            where.push(" CAST(KID_fordeling as CHAR) LIKE " + sqlString.escape("%" + filter.KID + "%") + " ");
                        if (filter.paymentMethodIDs)
                            where.push(" Payment_ID IN (" + filter.paymentMethodIDs.map(function (ID) { return sqlString.escape(ID); }).join(',') + ") ");
                        if (filter.donor)
                            where.push(" (Donors.full_name LIKE " + sqlString.escape("%" + filter.donor + "%") + " OR Donors.email LIKE " + sqlString.escape("%" + filter.donor + "%") + ") ");
                    }
                    return [4 /*yield*/, con.query("SELECT \n                    Donations.ID,\n                    Donors.full_name,\n                    Payment.payment_name,\n                    Donations.sum_confirmed,\n                    Donations.transaction_cost,\n                    Donations.KID_fordeling,\n                    Donations.timestamp_confirmed\n                FROM Donations\n                INNER JOIN Donors\n                    ON Donations.Donor_ID = Donors.ID\n                INNER JOIN Payment\n                    ON Donations.Payment_ID = Payment.ID\n\n                WHERE \n                    " + (where.length !== 0 ? where.join(" AND ") : '1') + "\n\n                ORDER BY " + sortColumn + "\n                " + (sort.desc ? 'DESC' : '') + " \n                LIMIT ? OFFSET ?", [limit, page * limit])];
                case 2:
                    donations = (_a.sent())[0];
                    return [4 /*yield*/, con.query("\n                SELECT COUNT(*) as count FROM Donations\n\n                INNER JOIN Donors\n                    ON Donations.Donor_ID = Donors.ID\n                \n                WHERE \n                    " + (where.length !== 0 ? where.join(" AND ") : ' 1'))];
                case 3:
                    counter = (_a.sent())[0];
                    pages = Math.ceil(counter[0].count / limit);
                    con.release();
                    return [2 /*return*/, {
                            rows: mapToJS(donations),
                            pages: pages
                        }];
                case 4: throw new Error("No sort provided");
                case 5: return [3 /*break*/, 7];
                case 6:
                    ex_1 = _a.sent();
                    con.release();
                    throw ex_1;
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Gets a histogram of all donations by donation sum
 * Creates buckets with 100 NOK spacing
 * Skips empty buckets
 * @returns {Array<Object>} Returns an array of buckets with items in bucket, bucket start value (ends at value +100), and bar height (logarithmic scale, ln)
 */
function getHistogramBySum() {
    return __awaiter(this, void 0, void 0, function () {
        var con, results, ex_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("\n            SELECT \n                floor(sum_confirmed/500)*500 \tAS bucket, \n                count(*) \t\t\t\t\t\tAS items,\n                ROUND(100*LN(COUNT(*)))         AS bar\n            FROM Donations\n            GROUP BY 1\n            ORDER BY 1;\n        ")];
                case 2:
                    results = (_a.sent())[0];
                    con.release();
                    return [2 /*return*/, results];
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
 * Gets aggregate donations from a spesific time period
 * @param {Date} startTime
 * @param {Date} endTime
 * @returns {Array} Returns an array of organizations names and their aggregate donations
 */
function getAggregateByTime(startTime, endTime) {
    return __awaiter(this, void 0, void 0, function () {
        var con, getAggregateQuery, ex_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("CALL `get_aggregate_donations_by_period`(?, ?)", [startTime, endTime])];
                case 2:
                    getAggregateQuery = (_a.sent())[0];
                    con.release();
                    return [2 /*return*/, getAggregateQuery[0]];
                case 3:
                    ex_3 = _a.sent();
                    con.release();
                    throw ex_3;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function ExternalPaymentIDExists(externalPaymentID, paymentID) {
    return __awaiter(this, void 0, void 0, function () {
        var con, res, ex_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("SELECT * FROM Donations WHERE PaymentExternal_ID = ? AND Payment_ID = ? LIMIT 1", [externalPaymentID, paymentID])];
                case 2:
                    res = (_a.sent())[0];
                    return [3 /*break*/, 4];
                case 3:
                    ex_4 = _a.sent();
                    con.release();
                    throw ex_4;
                case 4:
                    con.release();
                    if (res.length > 0)
                        return [2 /*return*/, true];
                    else
                        return [2 /*return*/, false];
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Gets donation by ID
 * @param {numer} donationID
 * @returns {Donation} A donation object
 */
function getByID(donationID) {
    return __awaiter(this, void 0, void 0, function () {
        var con, getDonationFromIDquery, dbDonation, donation, split, ex_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("\n            SELECT \n                Donation.ID,\n                Donation.sum_confirmed, \n                Donation.KID_fordeling,\n                Donation.transaction_cost,\n                Donation.timestamp_confirmed,\n                Donor.full_name,\n                Donor.email,\n                Payment.payment_name\n            \n            FROM Donations as Donation\n                INNER JOIN Donors as Donor\n                    ON Donation.Donor_ID = Donor.ID\n\n                INNER JOIN Payment\n                    ON Donation.Payment_ID = Payment.ID\n            \n            WHERE \n                Donation.ID = ?", [donationID])];
                case 2:
                    getDonationFromIDquery = (_a.sent())[0];
                    if (getDonationFromIDquery.length != 1) {
                        throw new Error("Could not find donation with ID " + donationID);
                    }
                    dbDonation = getDonationFromIDquery[0];
                    donation = {
                        id: dbDonation.ID,
                        donor: dbDonation.full_name,
                        email: dbDonation.email,
                        sum: dbDonation.sum_confirmed,
                        transactionCost: dbDonation.transaction_cost,
                        timestamp: dbDonation.timestamp_confirmed,
                        method: dbDonation.payment_name,
                        KID: dbDonation.KID_fordeling
                    };
                    return [4 /*yield*/, distributions.getSplitByKID(donation.KID)];
                case 3:
                    split = _a.sent();
                    donation.distribution = split.map(function (split) { return ({
                        abbriv: split.abbriv,
                        share: split.percentage_share
                    }); });
                    con.release();
                    return [2 /*return*/, donation];
                case 4:
                    ex_5 = _a.sent();
                    con.release();
                    throw ex_5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Gets whether or not a donation has replaced inactive organizations
 * @param {number} donationID
 * @returns {number} zero or one
 */
function getHasReplacedOrgs(donationID) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var con, result, ex_6;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 7]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _b.sent();
                    if (!donationID) return [3 /*break*/, 4];
                    return [4 /*yield*/, con.query("\n                select Replaced_old_organizations from Donations as D\n                inner join Combining_table as CT on CT.KID = D.KID_fordeling\n                where Replaced_old_organizations = 1\n                and iD = ?\n            ", [donationID])];
                case 2:
                    result = (_b.sent())[0];
                    return [4 /*yield*/, con.release()];
                case 3:
                    _b.sent();
                    return [2 /*return*/, ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.Replaced_old_organizations) || 0];
                case 4: return [3 /*break*/, 7];
                case 5:
                    ex_6 = _b.sent();
                    return [4 /*yield*/, con.release()];
                case 6:
                    _b.sent();
                    throw ex_6;
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetches all the donations in the database for a given inclusive range. If passed two equal dates, returns given day.
 * @param {Date} [fromDate=1. Of January 2000] The date in which to start the selection, inclusive interval.
 * @param {Date} [toDate=Today] The date in which to end the selection, inclusive interval.
 * @param {Array<Integer>} [paymentMethodIDs=null] Provide optional PaymentMethodID to filter to a payment method
 */
function getFromRange(fromDate, toDate, paymentMethodIDs) {
    if (paymentMethodIDs === void 0) { paymentMethodIDs = null; }
    return __awaiter(this, void 0, void 0, function () {
        var con, getFromRangeQuery, donations_1, ex_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    if (!fromDate)
                        fromDate = new Date(2000, 0, 1);
                    if (!toDate)
                        toDate = new Date();
                    return [4 /*yield*/, con.query("\n                SELECT \n                    Donations.ID as Donation_ID,\n                    Donations.timestamp_confirmed,  \n                    Donations.Donor_ID, \n                    Donations.transaction_cost,\n                    Donors.full_name as donor_name, \n                    Donations.sum_confirmed, \n                    Payment.payment_name,\n                    Distribution.OrgID as Org_ID, \n                    Organizations.full_name as org_name, \n                    Distribution.percentage_share, \n                    (Donations.sum_confirmed*Distribution.percentage_share)/100 as actual_share \n\n                FROM Donations\n                    INNER JOIN Distribution\n                        ON Donations.KID_fordeling = Distribution.KID\n                    INNER JOIN Donors \n                        ON Donors.ID = Donations.Donor_ID\n                    INNER JOIN Organizations \n                        ON Organizations.ID = Distribution.OrgID\n                    INNER JOIN Payment\n                        ON Payment.ID = Donations.Payment_ID\n                \n                WHERE \n                    Donations.timestamp_confirmed >= Date(?)  \n                    AND \n                    Donations.timestamp_confirmed < Date(Date_add(Date(?), interval 1 day))\n                " + (paymentMethodIDs != null ? "\n                    AND\n                    Donations.Payment_ID IN (?)\n                " : '') + "\n                ", [fromDate, toDate, paymentMethodIDs])];
                case 2:
                    getFromRangeQuery = (_a.sent())[0];
                    donations_1 = new Map();
                    getFromRangeQuery.forEach(function (row) {
                        if (!donations_1.get(row.Donation_ID))
                            donations_1.set(row.Donation_ID, {
                                ID: null,
                                time: null,
                                name: null,
                                donorID: null,
                                sum: null,
                                paymentMethod: null,
                                transactionCost: null,
                                split: []
                            });
                        donations_1.get(row.Donation_ID).ID = row.Donation_ID;
                        donations_1.get(row.Donation_ID).time = row.timestamp_confirmed;
                        donations_1.get(row.Donation_ID).name = row.donor_name;
                        donations_1.get(row.Donation_ID).donorID = row.Donor_ID;
                        donations_1.get(row.Donation_ID).sum = row.sum_confirmed;
                        donations_1.get(row.Donation_ID).paymentMethod = row.payment_name;
                        donations_1.get(row.Donation_ID).transactionCost = row.transaction_cost;
                        donations_1.get(row.Donation_ID).split.push({
                            id: row.Org_ID,
                            name: row.org_name,
                            percentage: row.percentage_share,
                            amount: row.actual_share
                        });
                    });
                    donations_1 = __spreadArray([], donations_1.values()).sort(function (a, b) { return a.time - b.time; });
                    con.release();
                    return [2 /*return*/, donations_1];
                case 3:
                    ex_7 = _a.sent();
                    con.release();
                    throw ex_7;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetches median donation in the database for a given inclusive range. If passed two equal dates, returns given day.
 * @param {Date} [fromDate=1. Of January 2000] The date in which to start the selection, inclusive interval.
 * @param {Date} [toDate=Today] The date in which to end the selection, inclusive interval.
 * @returns {Number|null} The median donation sum if donations exist in range, null else
 */
function getMedianFromRange(fromDate, toDate) {
    return __awaiter(this, void 0, void 0, function () {
        var con, donations, medianIndex, ex_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    if (!fromDate)
                        fromDate = new Date(2000, 0, 1);
                    if (!toDate)
                        toDate = new Date();
                    return [4 /*yield*/, con.query("\n            SELECT \n                Donations.sum_confirmed\n            \n            FROM Donations \n            \n            WHERE \n                Donations.timestamp_confirmed >= Date(?)  \n                AND \n                Donations.timestamp_confirmed < Date(Date_add(Date(?), interval 1 day))\n\n            ORDER BY\n                Donations.sum_confirmed\n            ", [fromDate, toDate])];
                case 2:
                    donations = (_a.sent())[0];
                    if (donations.length === 0) {
                        con.release();
                        return [2 /*return*/, null];
                    }
                    medianIndex = Math.floor(donations.length / 2);
                    con.release();
                    return [2 /*return*/, parseFloat(donations[medianIndex].sum_confirmed)];
                case 3:
                    ex_8 = _a.sent();
                    con.release();
                    throw ex_8;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetches the total amount of money donated to each organization by a specific donor
 * @param {Number} donorID
 * @returns {Array<DonationSummary>} Array of DonationSummary objects
 */
function getSummary(donorID) {
    return __awaiter(this, void 0, void 0, function () {
        var con, res, summary_1, map, _i, res_1, item, ex_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("SELECT\n            Organizations.full_name, \n            (Donations.sum_confirmed * percentage_share / 100) as sum_distribution, \n            transaction_cost, \n            Donations.Donor_ID\n        \n        FROM Donations\n            INNER JOIN Distribution \n                ON Distribution.KID = Donations.KID_fordeling\n            INNER JOIN Organizations \n                ON Organizations.ID = Distribution.OrgID\n        WHERE \n            Donations.Donor_ID = ? \n            \n        ORDER BY timestamp_confirmed DESC\n         \n        LIMIT 10000", [donorID])
                        // SELECT
                        //     Organizations.full_name, 
                        //     (Donations.sum_confirmed * percentage_share / 100) as sum_distribution, 
                        //     Donations.transaction_cost, 
                        //     Donations.Donor_ID
                        // FROM EffektDonasjonDB_Dev.Donations
                        //     INNER JOIN EffektDonasjonDB_Dev.Distribution 
                        //         ON Distribution.KID = Donations.KID_fordeling
                        //     INNER JOIN EffektDonasjonDB_Dev.Organizations 
                        //         ON Organizations.ID = Distribution.OrgID
                        // WHERE 
                        //     Donations.Donor_ID = 341;
                    ];
                case 2:
                    res = (_a.sent())[0];
                    summary_1 = [];
                    map = new Map();
                    for (_i = 0, res_1 = res; _i < res_1.length; _i++) {
                        item = res_1[_i];
                        if (!map.has(item.full_name)) {
                            map.set(item.full_name, true);
                            summary_1.push({
                                organization: item.full_name,
                                sum: 0
                            });
                        }
                    }
                    res.forEach(function (row) {
                        summary_1.forEach(function (obj) {
                            if (row.full_name == obj.organization) {
                                obj.sum += parseFloat(row.sum_distribution);
                            }
                        });
                    });
                    summary_1.push({ donorID: donorID });
                    con.release();
                    return [2 /*return*/, summary_1];
                case 3:
                    ex_9 = _a.sent();
                    con.release();
                    throw ex_9;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetches the total amount of money donated per year by a specific donor
 * @param {Number} donorID
 * @returns {Array<YearlyDonationSummary>} Array of YearlyDonationSummary objects
 */
function getSummaryByYear(donorID) {
    return __awaiter(this, void 0, void 0, function () {
        var con, res, ex_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("\n            SELECT SUM(sum_confirmed) AS yearSum, YEAR(timestamp_confirmed) as year\n            FROM Donations \n            WHERE Donor_ID = ? \n            GROUP BY year\n            ORDER BY year DESC", [donorID])];
                case 2:
                    res = (_a.sent())[0];
                    summary = res;
                    con.release();
                    return [2 /*return*/, summary];
                case 3:
                    ex_10 = _a.sent();
                    con.release();
                    throw ex_10;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetches all donations recieved by a specific donor
 * @param {Number} donorID
 * @returns {Array<DonationDistributions>}
 */
function getHistory(donorID) {
    return __awaiter(this, void 0, void 0, function () {
        var con, res, history_1, map, _i, res_2, item, ex_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("\n            SELECT\n                Organizations.full_name,\n                Donations.timestamp_confirmed,\n                Donations.ID as donation_id,\n                Distribution.ID as distribution_id,\n                (Donations.sum_confirmed * percentage_share / 100) as sum_distribution\n            \n            FROM Donations\n                INNER JOIN Distribution ON Distribution.KID = Donations.KID_fordeling\n                INNER JOIN Organizations ON Organizations.ID = Distribution.OrgID\n\n            WHERE Donations.Donor_ID = ?\n            \n            ORDER BY timestamp_confirmed DESC\n             \n            LIMIT 10000", [donorID])];
                case 2:
                    res = (_a.sent())[0];
                    history_1 = [];
                    map = new Map();
                    for (_i = 0, res_2 = res; _i < res_2.length; _i++) {
                        item = res_2[_i];
                        if (!map.has(item.donation_id)) {
                            map.set(item.donation_id, true);
                            history_1.push({
                                donationID: item.donation_id,
                                date: item.timestamp_confirmed,
                                distributions: []
                            });
                        }
                    }
                    res.forEach(function (row) {
                        history_1.forEach(function (obj) {
                            if (obj.donationID == row.donation_id) {
                                obj.distributions.push({ organization: row.full_name, sum: row.sum_distribution });
                            }
                        });
                    });
                    con.release();
                    return [2 /*return*/, history_1];
                case 3:
                    ex_11 = _a.sent();
                    con.release();
                    throw ex_11;
                case 4: return [2 /*return*/];
            }
        });
    });
}
//endregion
//region Add
/**
 * Adds a donation to the database
 *
 * @param {Number} KID
 * @param {Number} paymentMethodID
 * @param {Number} sum The gross amount of the donation (net amount is calculated in the database)
 * @param {Date} [registeredDate=null] Date the transaction was confirmed
 * @param {String} [externalPaymentID=null] Used to track payments in external payment systems (paypal and vipps ex.)
 * @param {Number} [metaOwnerID=null] Specifies an owner that the data belongs to (e.g. The Effekt Foundation). Defaults to selection default from DB if none is provided.
 * @return {Number} The donations ID
 */
function add(KID, paymentMethodID, sum, registeredDate, externalPaymentID, metaOwnerID) {
    if (registeredDate === void 0) { registeredDate = null; }
    if (externalPaymentID === void 0) { externalPaymentID = null; }
    if (metaOwnerID === void 0) { metaOwnerID = null; }
    return __awaiter(this, void 0, void 0, function () {
        var con, donorIDQuery, donorID, addDonationQuery, ex_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, pool.getConnection()
                        //should maybe be from dsit?
                    ];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("SELECT Donor_ID FROM Distributions WHERE KID_fordeling = ? LIMIT 1", [KID])
                        // SELECT ID FROM Donations WHERE KID_fordeling = 16391823
                    ];
                case 2:
                    donorIDQuery = (_a.sent())[0];
                    // SELECT ID FROM Donations WHERE KID_fordeling = 16391823
                    if (donorIDQuery.length != 1) {
                        throw new Error("NO_KID | KID " + KID + " does not exist");
                    }
                    if (!(metaOwnerID == null)) return [3 /*break*/, 4];
                    return [4 /*yield*/, DAO.meta.getDefaultOwnerID()];
                case 3:
                    metaOwnerID = _a.sent();
                    _a.label = 4;
                case 4:
                    if (!(externalPaymentID != null)) return [3 /*break*/, 6];
                    return [4 /*yield*/, ExternalPaymentIDExists(externalPaymentID, paymentMethodID)];
                case 5:
                    if (_a.sent()) {
                        throw new Error("EXISTING_DONATION | Already a donation with ExternalPaymentID " + externalPaymentID + " and PaymentID " + paymentMethodID);
                    }
                    _a.label = 6;
                case 6:
                    if (typeof registeredDate === "string")
                        registeredDate = new Date(registeredDate);
                    donorID = donorIDQuery[0].Donor_ID;
                    return [4 /*yield*/, con.query("INSERT INTO Donations (Donor_ID, Payment_ID, PaymentExternal_ID, sum_confirmed, timestamp_confirmed, KID_fordeling, Meta_owner_ID) VALUES (?,?,?,?,?,?,?)", [donorID, paymentMethodID, externalPaymentID, sum, registeredDate, KID, metaOwnerID])];
                case 7:
                    addDonationQuery = (_a.sent())[0];
                    con.release();
                    return [2 /*return*/, addDonationQuery.insertId];
                case 8:
                    ex_12 = _a.sent();
                    con.release();
                    throw ex_12;
                case 9: return [2 /*return*/];
            }
        });
    });
}
//endregion
//region Modify
function registerConfirmedByIDs(IDs) {
    return __awaiter(this, void 0, void 0, function () {
        var con, donations, ex_13;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.execute("UPDATE EffektDonasjonDB.Donations \n            SET date_confirmed = NOW()\n            WHERE \n            ID IN (" + ("?,").repeat(IDs.length).slice(0, -1) + ")", IDs)];
                case 2:
                    donations = (_a.sent())[0];
                    con.release();
                    return [2 /*return*/, true];
                case 3:
                    ex_13 = _a.sent();
                    con.release();
                    throw ex_13;
                case 4: return [2 /*return*/];
            }
        });
    });
}
//endregion
//region Delete
/**
 * Deletes a donation from the database
 * @param {number} donationId
 * @returns {boolean} Returns true if a donation was deleted, false else
 */
function remove(donationId) {
    return __awaiter(this, void 0, void 0, function () {
        var con, result, ex_14;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("DELETE FROM Donations WHERE ID = ?", [donationId])];
                case 2:
                    result = _a.sent();
                    con.release();
                    if (result[0].affectedRows > 0)
                        return [2 /*return*/, true];
                    else
                        return [2 /*return*/, false];
                    return [3 /*break*/, 4];
                case 3:
                    ex_14 = _a.sent();
                    con.release();
                    throw ex_14;
                case 4: return [2 /*return*/];
            }
        });
    });
}
//endregion
//region Helpers
var jsDBmapping = [
    ["id", "ID"],
    ["donor", "full_name"],
    ["paymentMethod", "payment_name"],
    ["sum", "sum_confirmed"],
    ["transactionCost", "transaction_cost"],
    ["kid", "KID_fordeling"],
    ["timestamp", "timestamp_confirmed"]
];
var mapToJS = function (obj) { return obj.map(function (donation) {
    var returnObj = {};
    jsDBmapping.forEach(function (map) {
        returnObj[map[0]] = donation[map[1]];
    });
    return returnObj;
}); };
//endregion
module.exports = {
    getAll: getAll,
    getByID: getByID,
    getAggregateByTime: getAggregateByTime,
    getFromRange: getFromRange,
    getMedianFromRange: getMedianFromRange,
    getHasReplacedOrgs: getHasReplacedOrgs,
    getSummary: getSummary,
    getSummaryByYear: getSummaryByYear,
    getHistory: getHistory,
    ExternalPaymentIDExists: ExternalPaymentIDExists,
    add: add,
    registerConfirmedByIDs: registerConfirmedByIDs,
    getHistogramBySum: getHistogramBySum,
    remove: remove,
    setup: function (dbPool, DAOObject) { pool = dbPool, DAO = DAOObject; }
};
