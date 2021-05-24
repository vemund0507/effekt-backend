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
var KID = require('./KID');
var Distnr = require('./distnr');
var DAO = require('./DAO');
module.exports = {
    createDonationSplitArray: function (passedOrganizations) { return __awaiter(_this, void 0, void 0, function () {
        var filteredOrganizations, organizationIDs, orgs, donationSplits, i, j;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    filteredOrganizations = passedOrganizations.filter(function (org) { return org.split > 0; });
                    organizationIDs = filteredOrganizations.map(function (org) { return org.id; });
                    return [4 /*yield*/, DAO.organizations.getByIDs(organizationIDs)];
                case 1:
                    orgs = _a.sent();
                    if (orgs.length != filteredOrganizations.length)
                        throw new Error("Could not find all organizations in DB");
                    donationSplits = [];
                    for (i = 0; i < orgs.length; i++) {
                        for (j = 0; j < filteredOrganizations.length; j++) {
                            if (filteredOrganizations[j].id == orgs[i].ID) {
                                donationSplits.push({
                                    organizationID: orgs[i].ID,
                                    share: filteredOrganizations[j].split,
                                    name: orgs[i].full_name
                                });
                                filteredOrganizations.splice(j, 1);
                                orgs.splice(i, 1);
                                i--;
                                break;
                            }
                        }
                    }
                    return [2 /*return*/, donationSplits];
            }
        });
    }); },
    getStandardSplit: function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, DAO.organizations.getStandardSplit()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); },
    createKID: function (donorId, distributionNumber) { return __awaiter(_this, void 0, void 0, function () {
        var newKID;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    newKID = KID.generate(donorId, distributionNumber);
                    return [4 /*yield*/, DAO.distributions.KIDexists(newKID)];
                case 1:
                    if (!_a.sent()) return [3 /*break*/, 3];
                    return [4 /*yield*/, this.createKID()];
                case 2:
                    newKID = _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/, newKID];
            }
        });
    }); },
    createDistributionNumber: function () { return __awaiter(_this, void 0, void 0, function () {
        var distNr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    distNr = distNr.generate();
                    return [4 /*yield*/, DAO.distributions.distnrExists(newKID)];
                case 1:
                    if (!_a.sent()) return [3 /*break*/, 3];
                    return [4 /*yield*/, this.createDistributionNumber()];
                case 2:
                    newKID = _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/, newKID];
            }
        });
    }); }
};
