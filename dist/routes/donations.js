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
var _this = this;
var config = require('../config');
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var urlEncodeParser = bodyParser.urlencoded({ extended: true });
var apicache = require('apicache');
var cache = apicache.middleware;
var authMiddleware = require('../custom_modules/authorization/authMiddleware');
var authRoles = require('../enums/authorizationRoles');
var methods = require('../enums/methods');
var DAO = require('../custom_modules/DAO.js');
var mail = require('../custom_modules/mail');
var vipps = require('../custom_modules/vipps');
var dateRangeHelper = require('../custom_modules/dateRangeHelper');
var donationHelpers = require('../custom_modules/donationHelpers');
router.post("/register", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var parsedData, donationOrganizations, donor, initiatedOrder, donationObject, _a, _b, _c, _d, _e, _f, _g, error_1, ex_1, hasAnsweredReferral, ex_2, hasAnsweredReferral;
    return __generator(this, function (_h) {
        switch (_h.label) {
            case 0:
                if (!req.body)
                    return [2 /*return*/, res.sendStatus(400)];
                parsedData = req.body;
                donationOrganizations = parsedData.organizations;
                donor = parsedData.donor;
                initiatedOrder = null;
                _h.label = 1;
            case 1:
                _h.trys.push([1, 28, , 29]);
                donationObject = {
                    KID: null,
                    distributionNumber: null,
                    method: parsedData.method,
                    donorID: null,
                    amount: parsedData.amount,
                    standardSplit: undefined,
                    split: [],
                    paymentDate: parsedData.paymentDate,
                    notice: parsedData.notice
                };
                if (!donationOrganizations) return [3 /*break*/, 3];
                _a = donationObject;
                return [4 /*yield*/, donationHelpers.createDonationSplitArray(donationOrganizations)];
            case 2:
                _a.split = _h.sent();
                donationObject.standardSplit = false;
                return [3 /*break*/, 5];
            case 3:
                _b = donationObject;
                return [4 /*yield*/, donationHelpers.getStandardSplit()];
            case 4:
                _b.split = _h.sent();
                donationObject.standardSplit = true;
                _h.label = 5;
            case 5:
                //Check if existing donor
                _c = donationObject;
                return [4 /*yield*/, DAO.donors.getIDbyEmail(donor.email)];
            case 6:
                //Check if existing donor
                _c.donorID = _h.sent();
                if (!(donationObject.donorID == null)) return [3 /*break*/, 8];
                //Donor does not exist, create donor
                _d = donationObject;
                return [4 /*yield*/, DAO.donors.add(donor.email, donor.name, donor.ssn, donor.newsletter)];
            case 7:
                //Donor does not exist, create donor
                _d.donorID = _h.sent();
                return [3 /*break*/, 14];
            case 8:
                if (!(typeof donor.ssn !== "undefined" && donor.ssn != null)) return [3 /*break*/, 11];
                return [4 /*yield*/, DAO.donors.getByID(donationObject.donorID)];
            case 9:
                dbDonor = _h.sent();
                if (!(dbDonor.ssn == null)) return [3 /*break*/, 11];
                //No existing ssn found, updating donor
                return [4 /*yield*/, DAO.donors.updateSsn(donationObject.donorID, donor.ssn)];
            case 10:
                //No existing ssn found, updating donor
                _h.sent();
                _h.label = 11;
            case 11:
                if (!(typeof donor.newsletter !== "undefined" && donor.newsletter != null)) return [3 /*break*/, 14];
                return [4 /*yield*/, DAO.donors.getByID(donationObject.donorID)];
            case 12:
                dbDonor = _h.sent();
                if (!(dbDonor.newsletter == null || dbDonor.newsletter == 0)) return [3 /*break*/, 14];
                //Not registered for newsletter, updating donor
                return [4 /*yield*/, DAO.donors.updateNewsletter(donationObject.donorID, donor.newsletter)];
            case 13:
                //Not registered for newsletter, updating donor
                _h.sent();
                _h.label = 14;
            case 14:
                //Try to get existing KID
                _e = donationObject;
                return [4 /*yield*/, DAO.distributions.getKIDbySplit(donationObject.split, donationObject.donorID)
                    //Split does not exist create new KID and split
                ];
            case 15:
                //Try to get existing KID
                _e.KID = _h.sent();
                if (!(donationObject.KID == null)) return [3 /*break*/, 19];
                _f = donationObject;
                return [4 /*yield*/, donationHelpers.createDistributionNumber()];
            case 16:
                _f.distributionNumber = _h.sent();
                _g = donationObject;
                return [4 /*yield*/, donationHelpers.createKID(donationObject.donorID, donationObject.distributionNumber)];
            case 17:
                _g.KID = _h.sent();
                return [4 /*yield*/, DAO.distributions.add(donationObject.split, donationObject.distributionNumber, donationObject.KID)];
            case 18:
                _h.sent();
                _h.label = 19;
            case 19:
                if (!(donationObject.method == methods.VIPPS)) return [3 /*break*/, 22];
                return [4 /*yield*/, vipps.initiateOrder(donationObject.KID, donationObject.amount)
                    //Start polling for updates
                ];
            case 20:
                initiatedOrder = _h.sent();
                //Start polling for updates
                return [4 /*yield*/, vipps.pollOrder(initiatedOrder.orderId)];
            case 21:
                //Start polling for updates
                _h.sent();
                _h.label = 22;
            case 22:
                if (!(donationObject.method == methods.AVTALEGIRO)) return [3 /*break*/, 24];
                return [4 /*yield*/, DAO.avtalegiroagreements.add(donationObject.KID, donationObject.amount, donationObject.paymentDate, donationObject.notice)];
            case 23:
                _h.sent();
                _h.label = 24;
            case 24:
                _h.trys.push([24, 26, , 27]);
                return [4 /*yield*/, DAO.initialpaymentmethod.addPaymentIntent(donationObject.KID, donationObject.method)];
            case 25:
                _h.sent();
                return [3 /*break*/, 27];
            case 26:
                error_1 = _h.sent();
                console.error(error_1);
                return [3 /*break*/, 27];
            case 27: return [3 /*break*/, 29];
            case 28:
                ex_1 = _h.sent();
                return [2 /*return*/, next(ex_1)];
            case 29:
                _h.trys.push([29, 31, , 32]);
                return [4 /*yield*/, DAO.referrals.getDonorAnswered(donationObject.donorID)];
            case 30:
                hasAnsweredReferral = _h.sent();
                return [3 /*break*/, 32];
            case 31:
                ex_2 = _h.sent();
                console.error("Could not get whether donor answered referral for donorID " + donationObject.donorID);
                hasAnsweredReferral = false;
                return [3 /*break*/, 32];
            case 32:
                res.json({
                    status: 200,
                    content: {
                        KID: donationObject.KID,
                        donorID: donationObject.donorID,
                        hasAnsweredReferral: hasAnsweredReferral,
                        paymentProviderUrl: (initiatedOrder !== null ? initiatedOrder.externalPaymentUrl : "")
                    }
                });
                return [2 /*return*/];
        }
    });
}); });
router.post("/bank/pending", urlEncodeParser, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var parsedData, success, success;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                parsedData = JSON.parse(req.body.data);
                if (!(config.env === "production")) return [3 /*break*/, 2];
                return [4 /*yield*/, mail.sendDonationRegistered(parsedData.KID)];
            case 1:
                success = _a.sent();
                return [3 /*break*/, 3];
            case 2:
                success = true;
                _a.label = 3;
            case 3:
                if (success)
                    res.json({ status: 200, content: "OK" });
                else
                    res.status(500).json({ status: 500, content: "Could not send bank donation pending email" });
                return [2 /*return*/];
        }
    });
}); });
router.post("/confirm", authMiddleware(authRoles.write_all_donations), urlEncodeParser, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var sum, timestamp, KID, methodId, externalRef, metaOwnerID, donationID, ex_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                sum = Number(req.body.sum);
                timestamp = new Date(req.body.timestamp);
                KID = Number(req.body.KID);
                methodId = Number(req.body.paymentId);
                externalRef = req.body.paymentExternalRef;
                metaOwnerID = req.body.metaOwnerID;
                return [4 /*yield*/, DAO.donations.add(KID, methodId, sum, timestamp, externalRef, metaOwnerID)];
            case 1:
                donationID = _a.sent();
                if (!(config.env === "production" && req.body.reciept === true)) return [3 /*break*/, 3];
                return [4 /*yield*/, mail.sendDonationReciept(donationID)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                res.json({
                    status: 200,
                    content: "OK"
                });
                return [3 /*break*/, 5];
            case 4:
                ex_3 = _a.sent();
                next(ex_3);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
router.get("/total", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var dates, aggregate, ex_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                dates = dateRangeHelper.createDateObjectsFromExpressRequest(req);
                return [4 /*yield*/, DAO.donations.getAggregateByTime(dates.fromDate, dates.toDate)];
            case 1:
                aggregate = _a.sent();
                res.json({
                    status: 200,
                    content: aggregate
                });
                return [3 /*break*/, 3];
            case 2:
                ex_4 = _a.sent();
                next(ex_4);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.get("/median", cache("5 minutes"), function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var dates, median, ex_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                dates = dateRangeHelper.createDateObjectsFromExpressRequest(req);
                return [4 /*yield*/, DAO.donations.getMedianFromRange(dates.fromDate, dates.toDate)];
            case 1:
                median = _a.sent();
                if (median == null) {
                    return [2 /*return*/, res.json({
                            status: 404,
                            content: "No donations found in range"
                        })];
                }
                res.json({
                    status: 200,
                    content: median
                });
                return [3 /*break*/, 3];
            case 2:
                ex_5 = _a.sent();
                next(ex_5);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.post("/", authMiddleware(authRoles.read_all_donations), function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var results, ex_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, DAO.donations.getAll(req.body.sort, req.body.page, req.body.limit, req.body.filter)];
            case 1:
                results = _a.sent();
                return [2 /*return*/, res.json({
                        status: 200,
                        content: {
                            rows: results.rows,
                            pages: results.pages
                        }
                    })];
            case 2:
                ex_6 = _a.sent();
                next(ex_6);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.get("/histogram", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var buckets, ex_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, DAO.donations.getHistogramBySum()];
            case 1:
                buckets = _a.sent();
                res.json({
                    status: 200,
                    content: buckets
                });
                return [3 /*break*/, 3];
            case 2:
                ex_7 = _a.sent();
                next(ex_7);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.get("/:id", authMiddleware(authRoles.read_all_donations), function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var donation, ex_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, DAO.donations.getByID(req.params.id)];
            case 1:
                donation = _a.sent();
                return [2 /*return*/, res.json({
                        status: 200,
                        content: donation
                    })];
            case 2:
                ex_8 = _a.sent();
                next(ex_8);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.delete("/:id", authMiddleware(authRoles.write_all_donations), function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var removed, ex_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, DAO.donations.remove(req.params.id)];
            case 1:
                removed = _a.sent();
                if (removed) {
                    return [2 /*return*/, res.json({
                            status: 200,
                            content: removed
                        })];
                }
                else {
                    throw new Error("Could not remove donation");
                }
                return [3 /*break*/, 3];
            case 2:
                ex_9 = _a.sent();
                next(ex_9);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.post("/receipt", authMiddleware(authRoles.write_all_donations), function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var donationID, mailStatus, mailStatus;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                donationID = req.body.donationID;
                if (!(req.body.email && req.body.email.indexOf("@") > -1)) return [3 /*break*/, 2];
                return [4 /*yield*/, mail.sendDonationReciept(donationID, req.body.email)];
            case 1:
                mailStatus = _a.sent();
                return [3 /*break*/, 4];
            case 2: return [4 /*yield*/, mail.sendDonationReciept(donationID)];
            case 3:
                mailStatus = _a.sent();
                _a.label = 4;
            case 4:
                if (mailStatus === true) {
                    res.json({
                        status: 200,
                        content: "Receipt sent for donation id " + donationID
                    });
                }
                else {
                    res.json({
                        status: 500,
                        content: "Receipt failed with error code " + mailStatus
                    });
                }
                return [2 /*return*/];
        }
    });
}); });
router.post("/reciepts", authMiddleware(authRoles.write_all_donations), function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var donationIDs, i, donationID, mailStatus, ex_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                donationIDs = req.body.donationIDs;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                i = 0;
                _a.label = 2;
            case 2:
                if (!(i < donationIDs.length)) return [3 /*break*/, 5];
                donationID = donationIDs[i];
                return [4 /*yield*/, mail.sendDonationReciept(donationID)];
            case 3:
                mailStatus = _a.sent();
                if (mailStatus == false)
                    console.error("Failed to send donation for donationID " + donationID);
                _a.label = 4;
            case 4:
                i++;
                return [3 /*break*/, 2];
            case 5:
                res.json({
                    status: 200,
                    content: "OK"
                });
                return [3 /*break*/, 7];
            case 6:
                ex_10 = _a.sent();
                next(ex_10);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
router.get("/summary/:donorID", authMiddleware(authRoles.read_all_donations), function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var summary, ex_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, DAO.donations.getSummary(req.params.donorID)];
            case 1:
                summary = _a.sent();
                res.json({
                    status: 200,
                    content: summary
                });
                return [3 /*break*/, 3];
            case 2:
                ex_11 = _a.sent();
                next(ex_11);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.get("/history/:donorID", authMiddleware(authRoles.read_all_donations), function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var history, ex_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, DAO.donations.getHistory(req.params.donorID)];
            case 1:
                history = _a.sent();
                res.json({
                    status: 200,
                    content: history
                });
                return [3 /*break*/, 3];
            case 2:
                ex_12 = _a.sent();
                next(ex_12);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.post("/history/email", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var email, id, mailsent, ex_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                email = req.body.email;
                return [4 /*yield*/, DAO.donors.getIDbyEmail(email)];
            case 1:
                id = _a.sent();
                if (!(id != null)) return [3 /*break*/, 3];
                return [4 /*yield*/, mail.sendDonationHistory(id)];
            case 2:
                mailsent = _a.sent();
                if (mailsent) {
                    res.json({
                        status: 200,
                        content: "ok"
                    });
                }
                return [3 /*break*/, 4];
            case 3:
                res.json({
                    status: 200,
                    content: "ok"
                });
                _a.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                ex_13 = _a.sent();
                next(ex_13);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
module.exports = router;
