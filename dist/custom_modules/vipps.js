var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var config = require('./../config');
var DAO = require('./DAO');
var crypto = require('../custom_modules/authorization/crypto');
var paymentMethods = require('../enums/paymentMethods');
var request = require('request-promise-native');
var mail = require('../custom_modules/mail');
//Timings selected based on the vipps guidelines
//https://www.vipps.no/developers-documentation/ecom/documentation/#polling-guidelines
//Polling start was increased from 5s to 30s, since we support callbacks
var POLLING_START_DELAY = 30000;
var POLLING_INTERVAL = 2000;
var VIPPS_TEXT = "Donasjon til GiEffektivt.no";
/**
 * @typedef TransactionLogItem
 * @property {number} amount In øre
 * @property {string} transactionText
 * @property {number} transactionId
 * @property {string} timeStamp JSON timestamp
 * @property {string} operation
 * @property {number} requestId
 * @property {boolean} operationSuccess
 */
/**
 * @typedef TransactionSummary
 * @property {number} capturedAmount
 * @property {number} remainingAmountToCapture
 * @property {number} refundedAmount
 * @property {number} remainingAmountToRefund
 * @property {number} bankIdentificationNumber
 */
/**
 *
 * @typedef OrderDetails
 * @property {string} orderId
 * @property {TransactionSummary} transactionSummary
 * @property {Array<TransactionLogItem>} transactionLogHistory
 */
module.exports = {
    /**
     * Fetches a fresh access token from the vipps API
     * @return {VippsToken | false} A fresh vipps token or false if failed to fetch
     */
    fetchToken: function () {
        return __awaiter(this, void 0, void 0, function () {
            var token, tokenResponse, _a, ex_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, DAO.vipps.getLatestToken()];
                    case 1:
                        token = _b.sent();
                        if (!!token) return [3 /*break*/, 4];
                        return [4 /*yield*/, request.post({
                                uri: "https://" + config.vipps_api_url + "/accesstoken/get",
                                headers: {
                                    'client_id': config.vipps_client_id,
                                    'client_secret': config.vipps_client_secret,
                                    'Ocp-Apim-Subscription-Key': config.vipps_ocp_apim_subscription_key
                                }
                            })];
                    case 2:
                        tokenResponse = _b.sent();
                        tokenResponse = JSON.parse(tokenResponse);
                        token = {
                            expires: new Date(parseInt(tokenResponse.expires_on) * 1000),
                            type: tokenResponse.token_type,
                            token: tokenResponse.access_token
                        };
                        _a = token;
                        return [4 /*yield*/, DAO.vipps.addToken(token)];
                    case 3:
                        _a.ID = _b.sent();
                        _b.label = 4;
                    case 4: return [2 /*return*/, token];
                    case 5:
                        ex_1 = _b.sent();
                        console.error("Failed to fetch vipps token", ex_1);
                        throw ex_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * @typedef InitiateVippsPaymentResponse
     * @property {string} orderId
     * @property {string} externalPaymentUrl
     */
    /**
     * Initiates a vipps order
     * @param {number} donorPhoneNumber The phone number of the donor
     * @param {VippsToken} token
     * @param {number} sum The chosen donation in NOK
     * @returns {InitiateVippsPaymentResponse} Returns a URL for which to redirect the user to when finishing the payment and the orderId
     */
    initiateOrder: function (KID, sum) {
        return __awaiter(this, void 0, void 0, function () {
            var token, donor, orderId, order, data, initiateRequest;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchToken()];
                    case 1:
                        token = _a.sent();
                        if (token === false)
                            return [2 /*return*/, false];
                        return [4 /*yield*/, DAO.donors.getByKID(KID)];
                    case 2:
                        donor = _a.sent();
                        orderId = KID + "-" + +new Date();
                        order = {
                            orderID: orderId,
                            donorID: donor.id,
                            KID: KID,
                            token: crypto.getPasswordSalt()
                        };
                        data = {
                            "customerInfo": {},
                            "merchantInfo": {
                                "authToken": order.token,
                                "callbackPrefix": config.api_url + "/vipps/",
                                "fallBack": config.api_url + "/vipps/redirect/" + orderId,
                                "isApp": false,
                                "merchantSerialNumber": config.vipps_merchant_serial_number,
                                "paymentType": "eComm Regular Payment"
                            },
                            "transaction": {
                                "amount": sum * 100,
                                "orderId": order.orderID,
                                "timeStamp": new Date(),
                                "transactionText": VIPPS_TEXT,
                                "skipLandingPage": false
                            }
                        };
                        return [4 /*yield*/, request.post({
                                uri: "https://" + config.vipps_api_url + "/ecomm/v2/payments",
                                headers: this.getVippsHeaders(token),
                                json: data
                            })];
                    case 3:
                        initiateRequest = _a.sent();
                        return [4 /*yield*/, DAO.vipps.addOrder(order)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, {
                                orderId: order.orderID,
                                externalPaymentUrl: initiateRequest.url
                            }];
                }
            });
        });
    },
    /**
     * Poll order details
     * @param {string} orderId
     */
    pollOrder: function (orderId) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                setTimeout(function () { _this.pollLoop(orderId); }, POLLING_START_DELAY);
                return [2 /*return*/];
            });
        });
    },
    pollLoop: function (orderId, count) {
        if (count === void 0) { count = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var shouldCancel;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Polling");
                        return [4 /*yield*/, this.checkOrderDetails(orderId, count)];
                    case 1:
                        shouldCancel = _a.sent();
                        if (!shouldCancel)
                            setTimeout(function () { _this.pollLoop(orderId, count + 1); }, POLLING_INTERVAL);
                        return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Checks for updates in the order
     * This is run multiple times from a interval in pollOrder function
     * We keep track of how many attempts we've made, to know whether to cancel the interval
     * @param {string} orderId
     * @param {number} polls How many times have we polled the detail endpoint
     * @returns {boolean} True if we should cancel the polling, false otherwise
     */
    checkOrderDetails: function (orderId, polls) {
        return __awaiter(this, void 0, void 0, function () {
            var orderDetails, captureLogItem, reserveLogItem, KID, donationID, ex_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Polling " + orderId + ", " + polls + "th poll");
                        return [4 /*yield*/, this.getOrderDetails(orderId)
                            //If we've been polling for more than eleven minutes, stop polling for updates
                        ];
                    case 1:
                        orderDetails = _a.sent();
                        if (!((polls * POLLING_INTERVAL) + POLLING_START_DELAY > 1000 * 60 * 10)) return [3 /*break*/, 3];
                        //Update transaction log history with all information we have
                        return [4 /*yield*/, this.updateOrderTransactionLogHistory(orderId, orderDetails.transactionLogHistory)];
                    case 2:
                        //Update transaction log history with all information we have
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        captureLogItem = this.findTransactionLogItem(orderDetails.transactionLogHistory, "CAPTURE");
                        reserveLogItem = this.findTransactionLogItem(orderDetails.transactionLogHistory, "RESERVE");
                        if (!orderDetails.transactionLogHistory.some(function (logItem) { return _this.transactionLogItemFinalIsFinalState(logItem); })) return [3 /*break*/, 11];
                        if (!(captureLogItem !== null)) return [3 /*break*/, 9];
                        KID = orderId.split("-")[0];
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 8, , 9]);
                        return [4 /*yield*/, DAO.donations.add(KID, paymentMethods.vipps, (captureLogItem.amount / 100), captureLogItem.timeStamp, captureLogItem.transactionId)];
                    case 5:
                        donationID = _a.sent();
                        return [4 /*yield*/, DAO.vipps.updateVippsOrderDonation(orderId, donationID)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, mail.sendDonationReciept(donationID)];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        ex_2 = _a.sent();
                        if (ex_2.message.indexOf("EXISTING_DONATION") === -1) {
                            console.info("Vipps donation for orderid " + orderId + " already exists", ex_2);
                        }
                        return [3 /*break*/, 9];
                    case 9: return [4 /*yield*/, this.updateOrderTransactionLogHistory(orderId, orderDetails.transactionLogHistory)
                        //We are in a final state, cancel further polling
                    ];
                    case 10:
                        _a.sent();
                        //We are in a final state, cancel further polling
                        return [2 /*return*/, true];
                    case 11:
                        if (!(reserveLogItem !== null)) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.captureOrder(orderId, reserveLogItem)];
                    case 12:
                        _a.sent();
                        _a.label = 13;
                    case 13: 
                    //No final state is reached, keep polling vipps
                    return [2 /*return*/, false];
                }
            });
        });
    },
    /**
     * Finds a transaction log item for a given operation, or returns null if none found
     * @param {Array<TransactionLogItem>} transactionLogHistory
     * @param {string} operation
     * @returns {TransactionLogItem | null}
     */
    findTransactionLogItem: function (transactionLogHistory, operation) {
        var items = transactionLogHistory.filter(function (logItem) { return logItem.operation === operation && logItem.operationSuccess === true; });
        if (items.length > 0)
            return items[0];
        else
            return null;
    },
    /**
     * Checks wether an item is in a final state (i.e. no actions are longer pending)
     * @param {TransactionLogItem} transactionLogItem
     * @returns
     */
    transactionLogItemFinalIsFinalState: function (transactionLogItem) {
        if (transactionLogItem.operation === "CAPTURE" && transactionLogItem.operationSuccess === true)
            return true;
        else if (transactionLogItem.operation === "CANCEL" && transactionLogItem.operationSuccess === true)
            return true;
        else if (transactionLogItem.operation === "FAILED" && transactionLogItem.operationSuccess === true)
            return true;
        else if (transactionLogItem.operation === "REJECTED" && transactionLogItem.operationSuccess === true)
            return true;
        else if (transactionLogItem.operation === "SALE" && transactionLogItem.operationSuccess === true)
            return true;
        return false;
    },
    /**
     * Updates the transaction log history of an order
     * @param {string} orderId
     * @param {Array<TransactionLogItem>} transactionLogHistory
     */
    updateOrderTransactionLogHistory: function (orderId, transactionLogHistory) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DAO.vipps.updateOrderTransactionStatusHistory(orderId, transactionLogHistory)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Fetches order details
     * @param {string} orderId
     * @returns {OrderDetails}
     */
    getOrderDetails: function (orderId) {
        return __awaiter(this, void 0, void 0, function () {
            var token, orderDetails;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchToken()];
                    case 1:
                        token = _a.sent();
                        return [4 /*yield*/, request.get({
                                uri: "https://" + config.vipps_api_url + "/ecomm/v2/payments/" + orderId + "/details",
                                headers: this.getVippsHeaders(token)
                            })];
                    case 2:
                        orderDetails = _a.sent();
                        orderDetails = JSON.parse(orderDetails);
                        //convert string timestamp to JS Date in transaction log history
                        orderDetails = __assign(__assign({}, orderDetails), { transactionLogHistory: orderDetails.transactionLogHistory.map(function (logItem) { return (__assign(__assign({}, logItem), { timeStamp: new Date(logItem.timeStamp) })); }) });
                        return [2 /*return*/, orderDetails];
                }
            });
        });
    },
    /**
     * Captures a order with a reserved amount
     * @param {string} orderId
     * @param {TransactionLogItem} transactionInfo The reserved transaction info
     * @return {boolean} Captured or not
     */
    captureOrder: function (orderId, transactionInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var token, data, captureRequest, ex_3, KID, donationID, ex_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchToken()];
                    case 1:
                        token = _a.sent();
                        data = {
                            merchantInfo: {
                                merchantSerialNumber: config.vipps_merchant_serial_number
                            },
                            transaction: {
                                amount: transactionInfo.amount,
                                transactionText: VIPPS_TEXT
                            }
                        };
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, request.post({
                                uri: "https://" + config.vipps_api_url + "/ecomm/v2/payments/" + orderId + "/capture",
                                headers: this.getVippsHeaders(token),
                                json: data
                            })];
                    case 3:
                        captureRequest = _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        ex_3 = _a.sent();
                        if (ex_3.statusCode === 423 || ex_3.statusCode === 402) {
                            //This is most likely a case of the polling trying to capture an order already captured by the callback, simply return true
                            return [2 /*return*/, true];
                        }
                        else {
                            console.error("Failed to capture order with id " + orderId, ex_3);
                            throw ex_3;
                        }
                        return [3 /*break*/, 5];
                    case 5:
                        KID = orderId.split("-")[0];
                        if (!(captureRequest.transactionInfo.status == "Captured")) return [3 /*break*/, 12];
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 10, , 11]);
                        return [4 /*yield*/, DAO.donations.add(KID, paymentMethods.vipps, (captureRequest.transactionInfo.amount / 100), captureRequest.transactionInfo.timeStamp, captureRequest.transactionInfo.transactionId)];
                    case 7:
                        donationID = _a.sent();
                        return [4 /*yield*/, DAO.vipps.updateVippsOrderDonation(orderId, donationID)];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, mail.sendDonationReciept(donationID)];
                    case 9:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 10:
                        ex_4 = _a.sent();
                        if (ex_4.message.indexOf("EXISTING_DONATION") === -1) {
                            console.info("Vipps donation for orderid " + orderId + " already exists", ex_4);
                        }
                        return [3 /*break*/, 11];
                    case 11: return [3 /*break*/, 13];
                    case 12: 
                    //Handle?
                    return [2 /*return*/, false];
                    case 13: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Refunds an order and deletes the associated donation
     * @param {string} orderId
     * @return {boolean} Refunded or not
     */
    refundOrder: function (orderId) {
        return __awaiter(this, void 0, void 0, function () {
            var token, order, donation, data, refundRequest, orderDetails, ex_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchToken()];
                    case 1:
                        token = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 9, , 10]);
                        return [4 /*yield*/, DAO.vipps.getOrder(orderId)];
                    case 3:
                        order = _a.sent();
                        if (order.donationID == null) {
                            console.error("Could not refund order with id " + orderId + ", order has not been captured");
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, DAO.donations.getByID(order.donationID)];
                    case 4:
                        donation = _a.sent();
                        data = {
                            merchantInfo: {
                                merchantSerialNumber: config.vipps_merchant_serial_number
                            },
                            transaction: {
                                amount: donation.sum * 100,
                                transactionText: VIPPS_TEXT
                            }
                        };
                        return [4 /*yield*/, request.post({
                                uri: "https://" + config.vipps_api_url + "/ecomm/v2/payments/" + orderId + "/refund",
                                headers: this.getVippsHeaders(token),
                                json: data
                            })];
                    case 5:
                        refundRequest = _a.sent();
                        return [4 /*yield*/, DAO.donations.remove(order.donationID)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.getOrderDetails(orderId)];
                    case 7:
                        orderDetails = _a.sent();
                        return [4 /*yield*/, this.updateOrderTransactionLogHistory(orderId, orderDetails.transactionLogHistory)];
                    case 8:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 9:
                        ex_5 = _a.sent();
                        console.error("Failed to refund vipps order with id " + orderId, ex_5);
                        return [2 /*return*/, false];
                    case 10: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Cancels order
     * @param {string} orderId
     * @return {boolean} Cancelled or not
     */
    cancelOrder: function (orderId) {
        return __awaiter(this, void 0, void 0, function () {
            var token, data, cancelRequest, orderDetails, ex_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetchToken()];
                    case 1:
                        token = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 7]);
                        data = {
                            merchantInfo: {
                                merchantSerialNumber: config.vipps_merchant_serial_number
                            },
                            transaction: {
                                transactionText: VIPPS_TEXT
                            }
                        };
                        return [4 /*yield*/, request.put({
                                uri: "https://" + config.vipps_api_url + "/ecomm/v2/payments/" + orderId + "/cancel",
                                headers: this.getVippsHeaders(token),
                                json: data
                            })];
                    case 3:
                        cancelRequest = _a.sent();
                        return [4 /*yield*/, this.getOrderDetails(orderId)];
                    case 4:
                        orderDetails = _a.sent();
                        return [4 /*yield*/, this.updateOrderTransactionLogHistory(orderId, orderDetails.transactionLogHistory)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 6:
                        ex_6 = _a.sent();
                        console.error("Failed to cancel vipps order with id " + orderId, ex_6);
                        return [2 /*return*/, false];
                    case 7: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Approves an order manually (without using the vipps app)
     * Used for integration testing
     * @param {string} orderId
     * @param {string} linkToken Token returned from the vipps api when initating an order
     * @return {boolean} Approved or not
     */
    approveOrder: function (orderId, linkToken) {
        return __awaiter(this, void 0, void 0, function () {
            var token, data, approveRequest, ex_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (config.env === 'production')
                            return [2 /*return*/, false];
                        return [4 /*yield*/, this.fetchToken()];
                    case 1:
                        token = _a.sent();
                        data = {
                            customerPhoneNumber: 93279221,
                            token: linkToken
                        };
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, request.post({
                                uri: "https://" + config.vipps_api_url + "/ecomm/v2/integration-test/payments/" + orderId + "/approve",
                                headers: this.getVippsHeaders(token),
                                json: data
                            })];
                    case 3:
                        approveRequest = _a.sent();
                        return [2 /*return*/, true];
                    case 4:
                        ex_7 = _a.sent();
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Gets vipps authorization headers
     * @param {VippsToken} token
     */
    getVippsHeaders: function (token) {
        return {
            'content-type': 'application/json',
            'merchant_serial_number': config.vipps_merchant_serial_number,
            'Ocp-Apim-Subscription-Key': config.vipps_ocp_apim_subscription_key,
            'Authorization': token.type + " " + token.token
        };
    }
};
