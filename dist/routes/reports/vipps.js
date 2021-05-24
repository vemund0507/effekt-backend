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
var vippsParser = require('../../custom_modules/parsers/vipps.js');
var DAO = require('../../custom_modules/DAO.js');
var mail = require('../../custom_modules/mail');
var config = require('../../config');
var payment = require('../../enums/paymentMethods');
module.exports = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var metaOwnerID, ex_1, transactions, invalidTransactions, valid, invalid, i, transaction, donationID, ex_2, ex_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.files || !req.files.report)
                    return [2 /*return*/, res.sendStatus(400)];
                metaOwnerID = parseInt(req.body.metaOwnerID);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                parsedReport = vippsParser.parseReport(req.files.report.data);
                return [4 /*yield*/, DAO.parsing.getVippsParsingRules(parsedReport.minDate, parsedReport.maxDate)];
            case 2:
                parsingRules = _a.sent();
                return [3 /*break*/, 4];
            case 3:
                ex_1 = _a.sent();
                next(ex_1);
                return [2 /*return*/, false];
            case 4:
                transactions = parsedReport.transactions;
                invalidTransactions = [];
                valid = 0;
                invalid = 0;
                i = 0;
                _a.label = 5;
            case 5:
                if (!(i < transactions.length)) return [3 /*break*/, 17];
                transaction = transactions[i];
                transaction.paymentID = payment.vipps_KID;
                if (!(transaction.KID != null)) return [3 /*break*/, 10];
                donationID = void 0;
                _a.label = 6;
            case 6:
                _a.trys.push([6, 8, , 9]);
                return [4 /*yield*/, DAO.donations.add(transaction.KID, payment.vipps_KID, transaction.amount, transaction.date.toDate(), transaction.transactionID, metaOwnerID)];
            case 7:
                donationID = _a.sent();
                valid++;
                return [3 /*break*/, 9];
            case 8:
                ex_2 = _a.sent();
                console.error("Failed to update DB for vipps donation with KID: " + transaction.KID);
                console.error(ex_2);
                if (ex_2.message.indexOf("EXISTING_DONATION") !== -1) {
                    invalid++;
                }
                else {
                    invalidTransactions.push({
                        reason: ex_2.message,
                        transaction: transaction
                    });
                    invalid++;
                }
                return [3 /*break*/, 9];
            case 9:
                try {
                    if (config.env === 'production')
                        mail.sendDonationReciept(donationID);
                }
                catch (ex) {
                    console.error("Failed to send donation reciept");
                    console.error(ex);
                }
                return [3 /*break*/, 16];
            case 10:
                if (!((matchingRuleKID = checkForMatchingParsingRule(transaction, parsingRules)) != false)) return [3 /*break*/, 15];
                _a.label = 11;
            case 11:
                _a.trys.push([11, 13, , 14]);
                return [4 /*yield*/, DAO.donations.add(matchingRuleKID, payment.vipps_KID, transaction.amount, transaction.date.toDate(), transaction.transactionID, metaOwnerID)];
            case 12:
                _a.sent();
                valid++;
                return [3 /*break*/, 14];
            case 13:
                ex_3 = _a.sent();
                console.error("Failed to update DB for vipps donation that matched against a parsing rule with KID: " + transaction.KID);
                console.error(ex_3);
                if (ex_3.message.indexOf("EXISTING_DONATION") !== -1) {
                    invalid++;
                }
                else {
                    invalidTransactions.push({
                        reason: ex_3.message,
                        transaction: transaction
                    });
                    invalid++;
                }
                return [3 /*break*/, 14];
            case 14: return [3 /*break*/, 16];
            case 15:
                invalid++;
                invalidTransactions.push({
                    reason: "Could not find valid KID or matching parsing rule",
                    transaction: transaction
                });
                _a.label = 16;
            case 16:
                i++;
                return [3 /*break*/, 5];
            case 17:
                res.json({
                    status: 200,
                    content: {
                        valid: valid,
                        invalid: invalid,
                        invalidTransactions: invalidTransactions
                    }
                });
                return [2 /*return*/];
        }
    });
}); };
function checkForMatchingParsingRule(transaction, rules) {
    for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        if (rule.salesLocation == transaction.location && (rule.message == transaction.message || rule.message == null || transaction.message == ''))
            return rule.resolveKID;
    }
    return false;
}
