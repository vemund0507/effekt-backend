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
var DAO = require('../../custom_modules/DAO.js');
var paypal = require('../../custom_modules/parsers/paypal.js');
var mail = require('../../custom_modules/mail');
var config = require('../../config');
var PAYPAL_ID = 3;
module.exports = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var metaOwnerID, transactions, referenceIDs, referenceTransactionID_To_KID, ex_1, valid, i, transaction, donationID, ex_2, ex_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.files || !req.files.report)
                    return [2 /*return*/, res.sendStatus(400)];
                metaOwnerID = parseInt(req.body.metaOwnerID);
                try {
                    transactions = paypal.parse(req.files.report.data);
                }
                catch (ex) {
                    console.error(ex);
                    next(new Error("Error in parsing report"));
                    return [2 /*return*/, false];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                referenceIDs = transactions.map(function (transaction) { return transaction.referenceTransactionID; });
                return [4 /*yield*/, DAO.distributions.getHistoricPaypalSubscriptionKIDS(referenceIDs)];
            case 2:
                referenceTransactionID_To_KID = _a.sent();
                return [3 /*break*/, 4];
            case 3:
                ex_1 = _a.sent();
                next(ex_1);
                return [2 /*return*/, false];
            case 4:
                //Add KID to transactions, drop those that are not found in DB
                transactions = transactions.reduce(function (acc, transaction) {
                    if (referenceTransactionID_To_KID[transaction.referenceTransactionID] != null) {
                        var newTransaction = transaction;
                        newTransaction.KID = referenceTransactionID_To_KID[transaction.referenceTransactionID];
                        acc.push(newTransaction);
                    }
                    return acc;
                }, []);
                valid = 0;
                _a.label = 5;
            case 5:
                _a.trys.push([5, 14, , 15]);
                i = 0;
                _a.label = 6;
            case 6:
                if (!(i < transactions.length)) return [3 /*break*/, 13];
                transaction = transactions[i];
                _a.label = 7;
            case 7:
                _a.trys.push([7, 11, , 12]);
                return [4 /*yield*/, DAO.donations.add(transaction.KID, PAYPAL_ID, transaction.amount, transaction.date.toDate(), transaction.transactionID, metaOwnerID)];
            case 8:
                donationID = _a.sent();
                valid++;
                if (!(config.env === 'production')) return [3 /*break*/, 10];
                return [4 /*yield*/, mail.sendDonationReciept(donationID)];
            case 9:
                _a.sent();
                _a.label = 10;
            case 10: return [3 /*break*/, 12];
            case 11:
                ex_2 = _a.sent();
                //If the donation already existed, ignore and keep moving
                if (ex_2.message.indexOf("EXISTING_DONATION") === -1)
                    throw ex_2;
                return [3 /*break*/, 12];
            case 12:
                i++;
                return [3 /*break*/, 6];
            case 13: return [3 /*break*/, 15];
            case 14:
                ex_3 = _a.sent();
                next(ex_3);
                return [2 /*return*/, false];
            case 15:
                res.json({
                    status: 200,
                    content: {
                        valid: valid,
                        invalid: 0,
                        invalidTransactions: []
                    }
                });
                return [2 /*return*/];
        }
    });
}); };
