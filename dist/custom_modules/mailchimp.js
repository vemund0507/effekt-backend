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
var request = require('request-promise-native');
var donorHelper = require('./donorHelper');
/**
 * Adds a donor to the mailinglist
 * @param {number} donorID
 */
function subscribeDonor(donorID) {
    return __awaiter(this, void 0, void 0, function () {
        var donor, ex_1, firstname, lastname, res, ex_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, DAO.donors.getByID(donorID)];
                case 1:
                    donor = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    ex_1 = _a.sent();
                    console.error("Could not fetch donor with id " + donorID);
                    console.error(ex_1);
                    return [2 /*return*/, false];
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    firstname = donorHelper.getFirstname(donor);
                    lastname = donorHelper.getLastname(donor);
                    return [4 /*yield*/, request.post({
                            url: "/3.0/lists/" + config.mailchimp_audience_id + "/members/",
                            data: {
                                email_address: "urist.mcvankab@freddiesjokes.com",
                                status: "subscribed",
                                merge_fields: {
                                    "FNAME": firstname,
                                    "LNAME": lastname
                                }
                            },
                            auth: {
                                user: 'gieffektivt_api',
                                pass: config.mailchimp_api_key
                            }
                        })];
                case 4:
                    res = _a.sent();
                    if (res.data && res.data.subscribed == true)
                        return [2 /*return*/, true];
                    else {
                        console.error(res);
                        return [2 /*return*/, false];
                    }
                    return [3 /*break*/, 6];
                case 5:
                    ex_2 = _a.sent();
                    console.error("Error communicating with the mailchimp API for donor " + donorID);
                    console.error(ex_2);
                    return [2 /*return*/, false];
                case 6: return [2 /*return*/];
            }
        });
    });
}
module.exports = {
    subscribeDonor: subscribeDonor
};
