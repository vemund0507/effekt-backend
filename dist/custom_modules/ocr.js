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
var DAO = require('./DAO.js');
var config = require('../config');
var mail = require('./mail.js');
var BANK_ID = 2;
module.exports = {
    /**
     * @typedef Transaction
     * @property {number} transactionCode
     * @property {number} recordType
     * @property {number} serviceCode
     * @property {number} amount
     * @property {string} transactionID
     * @property {Date} date
     * @property {number} KID
     */
    /**
     * Adds transactions parced from OCR to the database
     * @param {Transaction} transactions
     * @param {number} metaOwnerID
     * @returns {{ valid: number, invalid: number: invalidTransactions: Array<{ reason: string, transaction: Transaction }> }}
     */
    addDonations: function (transactions, metaOwnerID) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, invalid, invalidTransactions, i, transaction, donationID, ex_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = 0;
                        invalid = 0;
                        invalidTransactions = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < transactions.length)) return [3 /*break*/, 8];
                        transaction = transactions[i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, DAO.donations.add(transaction.KID, BANK_ID, transaction.amount, transaction.date, transaction.transactionID, metaOwnerID)];
                    case 3:
                        donationID = _a.sent();
                        valid++;
                        if (!(config.env === 'production')) return [3 /*break*/, 5];
                        return [4 /*yield*/, mail.sendDonationReciept(donationID)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        ex_1 = _a.sent();
                        //If the donation already existed, ignore and keep moving
                        if (ex_1.message.indexOf("EXISTING_DONATION") !== -1) {
                            invalid++;
                        }
                        else {
                            invalidTransactions.push({
                                reason: ex_1.message,
                                transaction: transaction
                            });
                            invalid++;
                        }
                        return [3 /*break*/, 7];
                    case 7:
                        i++;
                        return [3 /*break*/, 1];
                    case 8: return [2 /*return*/, {
                            valid: valid,
                            invalid: invalid,
                            invalidTransactions: invalidTransactions
                        }];
                }
            });
        });
    }
};
