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
//region Get
/**
 * Returns all organizations found with given IDs
 * @param {Array<number>} IDs
 * @returns {Array<Organization>}
 */
function getByIDs(IDs) {
    return __awaiter(this, void 0, void 0, function () {
        var con, organizations, ex_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.execute("SELECT * FROM Organizations WHERE ID in (" + ("?,").repeat(IDs.length).slice(0, -1) + ")", IDs)];
                case 2:
                    organizations = (_a.sent())[0];
                    con.release();
                    return [2 /*return*/, organizations];
                case 3:
                    ex_1 = _a.sent();
                    con.release();
                    throw ex_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Returns an organization with given ID
 * @param {number} ID
 * @returns {Organization}
 */
function getByID(ID) {
    return __awaiter(this, void 0, void 0, function () {
        var con, organization, ex_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.execute("SELECT * FROM Organizations WHERE ID = ? LIMIT 1", [ID])];
                case 2:
                    organization = (_a.sent())[0];
                    con.release();
                    if (organization.length > 0)
                        return [2 /*return*/, (organization[0])];
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
 * Returns current active organiztions
 * Active meaning we accept donations for them
 * Inactive organizations are organizations which we no longer support
 * @returns {Array<Organization>}
 */
function getActive() {
    return __awaiter(this, void 0, void 0, function () {
        var con, organizations, ex_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.execute("\n            SELECT * FROM Organizations \n                WHERE is_active = 1\n                ORDER BY ordering ASC")];
                case 2:
                    organizations = (_a.sent())[0];
                    con.release();
                    return [2 /*return*/, organizations.map(mapOrganization)];
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
 * Returns all organizations in the database
 * @returns {Array<Organization>} All organizations in DB
 */
function getAll() {
    return __awaiter(this, void 0, void 0, function () {
        var con, organizations, ex_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.execute("SELECT * FROM Organizations")];
                case 2:
                    organizations = (_a.sent())[0];
                    con.release();
                    return [2 /*return*/, organizations.map(mapOrganization)];
                case 3:
                    ex_4 = _a.sent();
                    con.release();
                    throw ex_4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getStandardSplit() {
    return __awaiter(this, void 0, void 0, function () {
        var con, standardSplit, ex_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.execute("SELECT * FROM Organizations WHERE std_percentage_share > 0 AND is_active = 1")];
                case 2:
                    standardSplit = (_a.sent())[0];
                    con.release();
                    return [3 /*break*/, 4];
                case 3:
                    ex_5 = _a.sent();
                    con.release();
                    throw ex_5;
                case 4:
                    if (standardSplit.reduce(function (acc, org) { return acc += org.std_percentage_share; }, 0) != 100)
                        return [2 /*return*/, (Error("Standard split does not sum to 100 percent"))];
                    return [2 /*return*/, (standardSplit.map(function (org) {
                            return {
                                organizationID: org.ID,
                                name: org.full_name,
                                share: org.std_percentage_share
                            };
                        }))];
            }
        });
    });
}
//endregion
//region Add
//endregion
//region Modify
//endregion
//region Delete
//endregion
//region Helpers
/**
 * Used in array.map, used to map database rows to JS like naming
 * @param {Object} org A line from a database query representing an organization
 * @returns {Object} A mapping with JS like syntax instead of the db fields, camel case instead of underscore and so on
 */
function mapOrganization(org) {
    return {
        id: org.ID,
        name: org.full_name,
        abbriv: org.abbriv,
        shortDesc: org.short_desc,
        standardShare: org.std_percentage_share,
        infoUrl: org.info_url
    };
}
module.exports = {
    getByIDs: getByIDs,
    getByID: getByID,
    getActive: getActive,
    getAll: getAll,
    getStandardSplit: getStandardSplit,
    setup: function (dbPool) { pool = dbPool; }
};
