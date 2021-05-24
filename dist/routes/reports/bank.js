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
var bankParser = require('../../custom_modules/parsers/bank.js');
var DAO = require('../../custom_modules/DAO.js');
var config = require('../../config');
var mail = require('../../custom_modules/mail');
var BANK_NO_KID_ID = 5;
module.exports = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var metaOwnerID, data, transactions, valid, invalid, invalidTransactions, i, transaction, donationID, ex_1, ex_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                metaOwnerID = parseInt(req.body.metaOwnerID);
                data = req.files.report.data.toString('UTF-8');
                try {
                    transactions = bankParser.parseReport(data);
                }
                catch (ex) {
                    return [2 /*return*/, next(ex)];
                }
                valid = 0;
                invalid = 0;
                invalidTransactions = [];
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < transactions.length)) return [3 /*break*/, 14];
                transaction = transactions[i];
                transaction.paymentID = BANK_NO_KID_ID;
                if (!(transaction.KID != null)) return [3 /*break*/, 12];
                donationID = void 0;
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, DAO.donations.add(transaction.KID, BANK_NO_KID_ID, transaction.amount, transaction.date.toDate(), transaction.transactionID, metaOwnerID)];
            case 3:
                donationID = _a.sent();
                valid++;
                return [3 /*break*/, 5];
            case 4:
                ex_1 = _a.sent();
                //If the donation already existed, ignore and keep moving
                if (ex_1.message.indexOf("EXISTING_DONATION") !== -1) {
                    invalid++;
                }
                else {
                    console.error("Failed to update DB for bank_custom donation with KID: " + transaction.KID);
                    console.error(ex_1);
                    invalidTransactions.push({
                        reason: ex_1.message,
                        transaction: transaction
                    });
                    invalid++;
                }
                return [3 /*break*/, 5];
            case 5:
                _a.trys.push([5, 10, , 11]);
                if (!(config.env === 'production')) return [3 /*break*/, 9];
                if (!(metaOwnerID === 1)) return [3 /*break*/, 7];
                //Send special reciept if the donation is for the old effekt system
                return [4 /*yield*/, mail.sendEffektDonationReciept(donationID)];
            case 6:
                //Send special reciept if the donation is for the old effekt system
                _a.sent();
                return [3 /*break*/, 9];
            case 7: return [4 /*yield*/, mail.sendDonationReciept(donationID)];
            case 8:
                _a.sent();
                _a.label = 9;
            case 9: return [3 /*break*/, 11];
            case 10:
                ex_2 = _a.sent();
                console.error("Failed to send donation reciept");
                console.error(ex_2);
                return [3 /*break*/, 11];
            case 11: return [3 /*break*/, 13];
            case 12:
                if (false) {
                    /**
                     * Transaction matched against a parsing rule
                     * An example could be the rule that "if the message says vipps, we automaticly assume standard split"
                     * The rules are defined in the database
                     */
                }
                else {
                    invalidTransactions.push({
                        reason: "Could not find valid KID or matching parsing rule",
                        transaction: transaction
                    });
                    invalid++;
                }
                _a.label = 13;
            case 13:
                i++;
                return [3 /*break*/, 1];
            case 14:
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
