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
var express = require('express');
var router = express.Router();
var authMiddleware = require('../custom_modules/authorization/authMiddleware');
var authRoles = require('../enums/authorizationRoles');
var DAO = require('../custom_modules/DAO.js');
var rounding = require("../custom_modules/rounding");
var donationHelpers = require("../custom_modules/donationHelpers");
var distributions = require('../custom_modules/DAO_modules/distributions');
router.post("/", authMiddleware(authRoles.write_all_donations), function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var split, donorId, metaOwnerID, err, err, KID, ex_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                split = req.body.distribution.map(function (distribution) { return { organizationID: distribution.organizationId, share: distribution.share }; }), donorId = req.body.donor.id, metaOwnerID = req.body.metaOwnerID;
                if (split.length === 0) {
                    err = new Error("Empty distribution array provided");
                    err.status = 400;
                    return [2 /*return*/, next(err)];
                }
                if (rounding.sumWithPrecision(split.map(function (split) { return split.share; })) !== "100") {
                    err = new Error("Distribution does not sum to 100");
                    err.status = 400;
                    return [2 /*return*/, next(err)];
                }
                return [4 /*yield*/, DAO.distributions.getKIDbySplit(split, donorId)];
            case 1:
                KID = _a.sent();
                if (!!KID) return [3 /*break*/, 4];
                return [4 /*yield*/, donationHelpers.createKID()];
            case 2:
                KID = _a.sent();
                return [4 /*yield*/, DAO.distributions.add(split, KID, donorId, metaOwnerID)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                res.json({
                    status: 200,
                    content: KID
                });
                return [3 /*break*/, 6];
            case 5:
                ex_1 = _a.sent();
                next(ex_1);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
router.post("/search", authMiddleware(authRoles.read_all_donations), function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var limit, page, filter, sort, distributions_1, ex_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                limit = req.body.limit, page = req.body.page, filter = req.body.filter, sort = req.body.sort;
                return [4 /*yield*/, DAO.distributions.getAll(page, limit, sort, filter)];
            case 1:
                distributions_1 = _a.sent();
                res.json({
                    status: 200,
                    content: distributions_1
                });
                return [3 /*break*/, 3];
            case 2:
                ex_2 = _a.sent();
                next(ex_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.get("/:KID", authMiddleware(authRoles.read_all_donations), function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var distribution, donor, ex_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                if (!req.params.KID)
                    res.status(400).json({ status: 400, content: "No KID provided" });
                return [4 /*yield*/, DAO.distributions.getSplitByKID(req.params.KID)];
            case 1:
                distribution = _a.sent();
                return [4 /*yield*/, DAO.donors.getByKID(req.params.KID)];
            case 2:
                donor = _a.sent();
                return [2 /*return*/, res.json({
                        status: 200,
                        content: {
                            donor: donor,
                            distribution: distribution
                        }
                    })];
            case 3:
                ex_3 = _a.sent();
                if (ex_3.message.indexOf("NOT FOUND") !== -1)
                    res.status(404).send({
                        status: 404,
                        content: ex_3.message
                    });
                else {
                    next(ex_3);
                }
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.get("/all/:donorID", authMiddleware(authRoles.read_all_donations), function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var distributions_2, ex_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!req.params.donorID)
                    res.status(400).json({ status: 400, content: "No KID provided" });
                return [4 /*yield*/, DAO.distributions.getAllByDonor(req.params.donorID)];
            case 1:
                distributions_2 = _a.sent();
                return [2 /*return*/, res.json({
                        status: 200,
                        content: distributions_2
                    })];
            case 2:
                ex_4 = _a.sent();
                if (ex_4.message.indexOf("NOT FOUND") !== -1)
                    res.status(404).send({
                        status: 404,
                        content: ex_4.message
                    });
                else {
                    next(ex_4);
                }
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
module.exports = router;
