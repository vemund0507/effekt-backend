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
 * @typedef VippsToken
 * @property {number} ID
 * @property {Date} expires
 * @property {string} type
 * @property {string} token
 */
/**
 * @typedef VippsOrder
 * @property {number} ID
 * @property {string} orderID
 * @property {number} donorID
 * @property {number} donationID
 * @property {string} KID
 * @property {string} token
 * @property {Date} registered
 */
/**
 * @typedef VippsTransactionLogItem
 * @property {number} amount In øre
 * @property {string} transactionText
 * @property {number} transactionId
 * @property {string} timestamp JSON timestamp
 * @property {string} operation
 * @property {number} requestId
 * @property {boolean} operationSuccess
 */
/**
 * Fetches the latest token, if available
 * @returns {VippsToken | boolean} The most recent vipps token, false if expiration is within 10 minutes
 */
function getLatestToken() {
    return __awaiter(this, void 0, void 0, function () {
        var con, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("\n        SELECT * FROM Vipps_tokens\n            ORDER BY expires DESC\n            LIMIT 1")];
                case 2:
                    res = (_a.sent())[0];
                    con.release();
                    if (res.length === 0)
                        return [2 /*return*/, false];
                    if (res[0].expires - Date.now() < 10 * 60 * 1000)
                        return [2 /*return*/, false];
                    return [2 /*return*/, ({
                            ID: res[0].ID,
                            expires: res[0].expires,
                            type: res[0].type,
                            token: res[0].token
                        })];
            }
        });
    });
}
/**
 * Fetches a vipps order
 * @property {string} orderID
 * @return {VippsOrder | false}
 */
function getOrder(orderID) {
    return __awaiter(this, void 0, void 0, function () {
        var con, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("\n        SELECT * FROM Vipps_orders\n            WHERE\n                orderID = ?\n            LIMIT 1", [orderID])];
                case 2:
                    res = (_a.sent())[0];
                    con.release();
                    if (res.length === 0)
                        return [2 /*return*/, false];
                    else
                        return [2 /*return*/, res[0]];
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetches the most recent vipps order
 * @return {VippsOrder | false}
 */
function getRecentOrder() {
    return __awaiter(this, void 0, void 0, function () {
        var con, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("\n        SELECT * FROM Vipps_orders\n            ORDER BY \n                registered DESC\n            LIMIT 1")];
                case 2:
                    res = (_a.sent())[0];
                    con.release();
                    if (res.length === 0)
                        return [2 /*return*/, false];
                    else
                        return [2 /*return*/, res[0]];
                    return [2 /*return*/];
            }
        });
    });
}
//endregion
//region Add
/**
 * Adds a Vipps access token
 * @param {VippsToken} token Does not need to have ID specified
 * @return {number} token ID in database
 */
function addToken(token) {
    return __awaiter(this, void 0, void 0, function () {
        var con, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("\n        INSERT INTO Vipps_tokens\n            (expires, type, token)\n            VALUES\n            (?,?,?)\n    ", [token.expires, token.type, token.token])];
                case 2:
                    result = (_a.sent())[0];
                    con.release();
                    return [2 /*return*/, result.insertId];
            }
        });
    });
}
/**
 * Adds a Vipps order
 * @param {VippsOrder} order
 * @return {number} ID of inserted order
 */
function addOrder(order) {
    return __awaiter(this, void 0, void 0, function () {
        var con, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("\n            INSERT INTO Vipps_orders\n                    (orderID, donorID, KID, token)\n                    VALUES\n                    (?,?,?,?)\n        ", [order.orderID, order.donorID, order.KID, order.token])];
                case 2:
                    result = (_a.sent())[0];
                    con.release();
                    return [2 /*return*/, result.insertId];
            }
        });
    });
}
//endregion
//region Modify
/**
 * Adds a Vipps order transaction status
 * @param {string} orderId
 * @param {Array<VippsTransactionLogItem>} transactionHistory
 * @return {boolean} Success
 */
function updateOrderTransactionStatusHistory(orderId, transactionHistory) {
    return __awaiter(this, void 0, void 0, function () {
        var transaction, mappedInsertValues, ex_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.startTransaction()];
                case 1:
                    transaction = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 6, , 8]);
                    return [4 /*yield*/, transaction.query("DELETE FROM Vipps_order_transaction_statuses WHERE orderID = ?", [orderId])];
                case 3:
                    _a.sent();
                    mappedInsertValues = transactionHistory.map(function (logItem) { return ([orderId, logItem.transactionId, logItem.amount, logItem.operation, logItem.timeStamp, logItem.operationSuccess]); });
                    return [4 /*yield*/, transaction.query("\n            INSERT INTO Vipps_order_transaction_statuses\n                    (orderID, transactionID, amount, operation, timestamp, success)\n                    VALUES\n                    ?\n        ", [mappedInsertValues])];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, pool.commitTransaction(transaction)];
                case 5:
                    _a.sent();
                    return [2 /*return*/, true];
                case 6:
                    ex_1 = _a.sent();
                    return [4 /*yield*/, pool.rollbackTransaction(transaction)];
                case 7:
                    _a.sent();
                    console.error("Failed to update order transaction history for orderId " + orderId, ex_1);
                    return [2 /*return*/, false];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Updates the donationID associated with a vipps order
 * @param {string} orderID
 * @param {number} donationID
 * @return {boolean} Success or failure
 */
function updateVippsOrderDonation(orderID, donationID) {
    return __awaiter(this, void 0, void 0, function () {
        var con, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("\n            UPDATE Vipps_orders\n                SET donationID = ?\n                WHERE orderID = ?\n        ", [donationID, orderID])];
                case 2:
                    result = (_a.sent())[0];
                    con.release();
                    return [2 /*return*/, (result.affectedRows != 0 ? true : false)];
            }
        });
    });
}
//endregion
//region Delete
//endregion
//Helpers
module.exports = {
    getLatestToken: getLatestToken,
    getOrder: getOrder,
    getRecentOrder: getRecentOrder,
    addToken: addToken,
    addOrder: addOrder,
    updateOrderTransactionStatusHistory: updateOrderTransactionStatusHistory,
    updateVippsOrderDonation: updateVippsOrderDonation,
    setup: function (dbPool) { pool = dbPool; }
};
