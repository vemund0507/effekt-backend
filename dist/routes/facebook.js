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
var e = require('express');
var express = require('express');
var router = express.Router();
var DAO = require('../custom_modules/DAO.js');
function throwError(message) {
    var error = new Error(message);
    error.status = 400;
    throw error;
}
router.post("/register/payment", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var paymentID, email, full_name, ssn, newsletter, ID, donorID, donorID, donor, ex_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 8, , 9]);
                paymentID = req.body.paymentID;
                email = req.body.email;
                full_name = req.body.full_name;
                ssn = req.body.ssn;
                newsletter = req.body.newsletter;
                if (!paymentID) {
                    throwError("Missing param paymentID");
                }
                else if (!email) {
                    throwError("Missing param paymentID");
                }
                else if (!full_name) {
                    throwError("Missing param full_name");
                }
                else if (!ssn) {
                    throwError("Missing param ssn");
                }
                else if (!newsletter) {
                    throwError("Missing param newsletter");
                }
                return [4 /*yield*/, DAO.donors.getIDbyEmail(email)
                    // If donor does not exist, create new donor
                ];
            case 1:
                ID = _a.sent();
                if (!!ID) return [3 /*break*/, 3];
                return [4 /*yield*/, DAO.donors.add(email, full_name, ssn, newsletter)];
            case 2:
                donorID = _a.sent();
                DAO.facebook.registerPaymentFB(donorID, paymentID);
                return [3 /*break*/, 7];
            case 3:
                if (!ID) return [3 /*break*/, 7];
                donorID = ID;
                return [4 /*yield*/, DAO.donors.getByID(ID)];
            case 4:
                donor = _a.sent();
                if (!!donor.ssn) return [3 /*break*/, 6];
                return [4 /*yield*/, DAO.donors.updateSsn(donorID, ssn)];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6:
                DAO.donors.updateNewsletter(donorID, newsletter);
                DAO.facebook.registerPaymentFB(donorID, paymentID);
                _a.label = 7;
            case 7:
                res.json({
                    status: 200,
                    content: "OK"
                });
                return [3 /*break*/, 9];
            case 8:
                ex_1 = _a.sent();
                next(ex_1);
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); });
module.exports = router;
