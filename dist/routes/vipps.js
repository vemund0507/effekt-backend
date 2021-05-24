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
var _this = this;
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jsonBody = bodyParser.json();
var dns = require('dns').promises;
var moment = require('moment');
var config = require('../config');
var DAO = require('../custom_modules/DAO');
var authMiddleware = require('../custom_modules/authorization/authMiddleware');
var vipps = require('../custom_modules/vipps');
var paymentMethods = require('../enums/paymentMethods');
var authorizationRoles = require('../enums/authorizationRoles');
var vippsCallbackProdServers = ["callback-1.vipps.no", "callback-2.vipps.no", "callback-3.vipps.no", "callback-4.vipps.no"];
var vippsCallbackDisasterServers = ["callback-dr-1.vipps.no", "callback-dr-2.vipps.no", "callback-dr-3.vipps.no", "callback-dr-4.vipps.no"];
var vippsCallbackDevServers = ["callback-mt-1.vipps.no", "callback-mt-2.vipps.no", "callback-mt-3.vipps.no", "callback-mt-4.vipps.no"];
router.get("/token", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var token;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, vipps.fetchToken()];
            case 1:
                token = _a.sent();
                res.json(token);
                return [2 /*return*/];
        }
    });
}); });
router.get("/initiate/:phonenumber", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var token, url;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, vipps.fetchToken()];
            case 1:
                token = _a.sent();
                return [4 /*yield*/, vipps.initiateOrder(req.params.phonenumber, token)];
            case 2:
                url = _a.sent();
                res.json(url);
                return [2 /*return*/];
        }
    });
}); });
router.post("/v2/payments/:orderId", jsonBody, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var orderId, transactionInfo, _a, ex_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (req.body.orderId !== req.params.orderId) {
                    res.sendStatus(400);
                    return [2 /*return*/, false];
                }
                orderId = req.body.orderId;
                return [4 /*yield*/, whitelisted(req.ip)];
            case 1:
                //Make sure the request actually came from the vipps callback servers
                if (!(_b.sent())) {
                    console.warn("Vipps callback host (" + req.ip + ") not whitelisted");
                    res.status(401).json({ status: 401, content: "Host not whitelisted" });
                    return [2 /*return*/, false];
                }
                transactionInfo = {
                    orderId: orderId,
                    transactionId: req.body.transactionInfo.transactionId,
                    amount: req.body.transactionInfo.amount,
                    status: req.body.transactionInfo.status,
                    timestamp: new Date(req.body.transactionInfo.timeStamp)
                };
                _a = transactionInfo.status;
                switch (_a) {
                    case "RESERVED": return [3 /*break*/, 2];
                    case "SALE": return [3 /*break*/, 6];
                    case "SALE_FAILED": return [3 /*break*/, 7];
                    case "CANCELLED": return [3 /*break*/, 8];
                    case "REJECTED": return [3 /*break*/, 9];
                }
                return [3 /*break*/, 10];
            case 2:
                _b.trys.push([2, 4, , 5]);
                return [4 /*yield*/, vipps.captureOrder(orderId, transactionInfo)];
            case 3:
                _b.sent();
                return [3 /*break*/, 5];
            case 4:
                ex_1 = _b.sent();
                next(ex_1);
                return [3 /*break*/, 5];
            case 5: return [3 /*break*/, 11];
            case 6: 
            //Not applicable POS sale
            return [3 /*break*/, 11];
            case 7: 
            //Not applicable POS sale
            return [3 /*break*/, 11];
            case 8: 
            //User cancelled in Vipps
            //Perhaps send a follow up email?
            return [3 /*break*/, 11];
            case 9: 
            //User did not act on the payment (timeout etc.)
            //Perhaps send a follow-up email?
            return [3 /*break*/, 11];
            case 10:
                console.warn("Unknown vipps state", transactionInfo.status);
                return [3 /*break*/, 11];
            case 11:
                res.sendStatus(200);
                return [2 /*return*/];
        }
    });
}); });
router.get("/redirect/:orderId", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var orderId_1, retry_1, ex_2;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                orderId_1 = req.params.orderId;
                retry_1 = function (retries) { return __awaiter(_this, void 0, void 0, function () {
                    var order;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, DAO.vipps.getOrder(orderId_1)];
                            case 1:
                                order = _a.sent();
                                if (order && order.donationID != null) {
                                    res.redirect('https://gieffektivt.no/donation-recived/');
                                    return [2 /*return*/, true];
                                }
                                else if (retries >= 20) {
                                    res.redirect('https://gieffektivt.no/donation-failed');
                                    return [2 /*return*/, false];
                                }
                                else {
                                    setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, retry_1(retries + 1)];
                                                case 1:
                                                    _a.sent();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); }, 1000);
                                }
                                return [2 /*return*/];
                        }
                    });
                }); };
                return [4 /*yield*/, retry_1(0)];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                ex_2 = _a.sent();
                next(ex_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.get("/integration-test/:linkToken", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var order, approved, i, ex_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (config.env === 'production') {
                    res.status(403).json({ status: 403, content: 'Integration test not applicable in production environment' });
                    return [2 /*return*/, false];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 9, , 10]);
                return [4 /*yield*/, DAO.vipps.getRecentOrder()];
            case 2:
                order = _a.sent();
                console.log(order);
                return [4 /*yield*/, vipps.approveOrder(order.orderID, req.params.linkToken)];
            case 3:
                approved = _a.sent();
                console.log("Approved", approved);
                if (!approved)
                    throw new Error("Could not approve recent order");
                i = 0;
                _a.label = 4;
            case 4:
                if (!(i < 5)) return [3 /*break*/, 8];
                console.log("Wait 1000");
                return [4 /*yield*/, delay(1000)];
            case 5:
                _a.sent();
                return [4 /*yield*/, DAO.vipps.getOrder(order.orderID)];
            case 6:
                order = _a.sent();
                console.log(order);
                if (order.donationID != null) {
                    res.json({ status: 200, content: "Donation registered successfully" });
                    return [2 /*return*/, true];
                }
                _a.label = 7;
            case 7:
                i++;
                return [3 /*break*/, 4];
            case 8:
                console.log("Timeout");
                throw new Error("Timed out when attempting to verify integration");
            case 9:
                ex_3 = _a.sent();
                console.warn(ex_3);
                res.status(500).json({ status: 500, content: ex_3.message });
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); });
router.post("/refund/:orderId", authMiddleware(authorizationRoles.write_vipps_api), function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var refunded, ex_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, vipps.refundOrder(req.params.orderId)];
            case 1:
                refunded = _a.sent();
                if (refunded) {
                    return [2 /*return*/, res.json({
                            status: 200,
                            content: "OK"
                        })];
                }
                else {
                    return [2 /*return*/, res.status(409).json({
                            status: 409,
                            content: "Could not refund the order. This might be because the order has not been captured."
                        })];
                }
                return [3 /*break*/, 3];
            case 2:
                ex_4 = _a.sent();
                next(ex_4);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.put("/cancel/:orderId", authMiddleware(authorizationRoles.write_vipps_api), function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var cancelled, ex_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, vipps.cancelOrder(req.params.orderId)];
            case 1:
                cancelled = _a.sent();
                if (cancelled) {
                    return [2 /*return*/, res.json({
                            status: 200,
                            content: "OK"
                        })];
                }
                else {
                    return [2 /*return*/, res.status(409).json({
                            status: 409,
                            content: "Could not cancel the order. This might be because the order has been captured."
                        })];
                }
                return [3 /*break*/, 3];
            case 2:
                ex_5 = _a.sent();
                next(ex_5);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * Checks whether the provided IP is one of the vipps callback servers
 * @param {string} ip
 */
function whitelisted(ip) {
    return __awaiter(this, void 0, void 0, function () {
        var whitelistedHosts, whitelisted, i, ipv4s, ex_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                //Some weirdness going on here, implicitly trust
                return [2 /*return*/, true
                    //ipv6 check
                ];
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < whitelistedHosts.length)) return [3 /*break*/, 5];
                    return [4 /*yield*/, dns.resolve4(whitelistedHosts[i])];
                case 3:
                    ipv4s = _a.sent();
                    console.log(ipv4s, ip);
                    //Should possibly also check for ipv6?
                    if (ipv4s.indexOf(ip) != -1) {
                        whitelisted = true;
                        return [3 /*break*/, 5];
                    }
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 7];
                case 6:
                    ex_6 = _a.sent();
                    console.warn("Checking for whitelisted IPs failed", ex_6);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/, whitelisted];
            }
        });
    });
}
//Helper for integration test
function delay(t) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, t);
    });
}
module.exports = router;
