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
var DAO = require('../custom_modules/DAO.js');
var crypto = require('../custom_modules/authorization/crypto.js');
var bodyParser = require('body-parser');
var urlEncodeParser = bodyParser.urlencoded({ extended: false });
router.get("/login", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var application, callback, ex_1, permissions, applicationHasPermissions, ex_2, ex_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                //Check that all query parameters are present
                if (!req.query.response_type || !req.query.client_id || !req.query.scope || !req.query.state || !req.query.redirect_uri) {
                    res.status(400).send("Some parameters in the URL is missing");
                    return [2 /*return*/];
                }
                //Check if response type is code
                if (req.query.response_type != "code") {
                    res.status(400).send("Only response type code is supported");
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, DAO.auth.getApplicationByClientID(req.query.client_id)];
            case 2:
                application = _a.sent();
                if (!application) {
                    res.status(400).send("No application with given clientID");
                    return [2 /*return*/];
                }
                callback = req.query.redirect_uri;
                if (!application.callbacks.includes(callback)) {
                    res.status(401).send("Application has not specified given callback as a valid callback");
                    return [2 /*return*/];
                }
                return [3 /*break*/, 4];
            case 3:
                ex_1 = _a.sent();
                next(ex_1);
                return [2 /*return*/];
            case 4:
                permissions = req.query.scope.split(" ");
                _a.label = 5;
            case 5:
                _a.trys.push([5, 7, , 8]);
                return [4 /*yield*/, DAO.auth.checkApplicationPermissions(application.ID, permissions)];
            case 6:
                applicationHasPermissions = _a.sent();
                if (!applicationHasPermissions) {
                    res.status(400).send("Application does not have access to requested permissions");
                    return [2 /*return*/];
                }
                return [3 /*break*/, 8];
            case 7:
                ex_2 = _a.sent();
                next(ex_2);
                return [2 /*return*/];
            case 8:
                _a.trys.push([8, 10, , 11]);
                return [4 /*yield*/, DAO.auth.getPermissionsFromShortnames(permissions)];
            case 9:
                permissions = _a.sent();
                return [3 /*break*/, 11];
            case 10:
                ex_3 = _a.sent();
                next(ex_3);
                return [2 /*return*/];
            case 11:
                res.render(global.appRoot + '/views/auth/dialog', {
                    title: "GiEffektivt.no - Logg inn",
                    applicationName: application.name,
                    permissions: permissions,
                    callback: callback,
                    //Pass on to POST request
                    state: req.query.state,
                    clientid: req.query.client_id,
                    scope: req.query.scope
                });
                return [2 /*return*/];
        }
    });
}); });
router.post("/login", urlEncodeParser, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var donor, ex_4, application, callback, ex_5, scope, applicationHasPermissions, ex_6, donorHasPermissions, ex_7, permissions, ex_8, ex_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, DAO.auth.getDonorByCredentials(req.body.email, req.body.password)];
            case 1:
                donor = _a.sent();
                if (!donor) {
                    res.status(400).send("Invalid credentials");
                    return [2 /*return*/];
                }
                return [3 /*break*/, 3];
            case 2:
                ex_4 = _a.sent();
                next(ex_4);
                return [2 /*return*/];
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, DAO.auth.getApplicationByClientID(req.body.clientid)];
            case 4:
                application = _a.sent();
                if (!application) {
                    res.status(400).send("No application with given clientID");
                    return [2 /*return*/];
                }
                callback = req.body.callback;
                if (!application.callbacks.includes(req.body.callback)) {
                    res.status(401).send("Application has not specified given callback as a valid callback");
                    return [2 /*return*/];
                }
                return [3 /*break*/, 6];
            case 5:
                ex_5 = _a.sent();
                next(ex_5);
                return [2 /*return*/];
            case 6:
                scope = req.body.scope.split(" ");
                _a.label = 7;
            case 7:
                _a.trys.push([7, 9, , 10]);
                return [4 /*yield*/, DAO.auth.checkApplicationPermissions(application.ID, scope)];
            case 8:
                applicationHasPermissions = _a.sent();
                if (!applicationHasPermissions) {
                    res.status(401).send("Application does not have access to requested scopes");
                    return [2 /*return*/];
                }
                return [3 /*break*/, 10];
            case 9:
                ex_6 = _a.sent();
                next(ex_6);
                return [2 /*return*/];
            case 10:
                _a.trys.push([10, 12, , 13]);
                return [4 /*yield*/, DAO.auth.checkDonorPermissions(donor.id, scope)];
            case 11:
                donorHasPermissions = _a.sent();
                if (!donorHasPermissions) {
                    res.status(401).send("Donor does not have access to requested scope");
                    return [2 /*return*/];
                }
                return [3 /*break*/, 13];
            case 12:
                ex_7 = _a.sent();
                next(ex_7);
                return [2 /*return*/];
            case 13:
                _a.trys.push([13, 15, , 16]);
                return [4 /*yield*/, DAO.auth.getPermissionsFromShortnames(scope)];
            case 14:
                permissions = _a.sent();
                return [3 /*break*/, 16];
            case 15:
                ex_8 = _a.sent();
                next(ex_8);
                return [2 /*return*/];
            case 16:
                _a.trys.push([16, 18, , 19]);
                return [4 /*yield*/, DAO.auth.addAccessKey(donor.id, application.ID, permissions)];
            case 17:
                accessKey = _a.sent();
                return [3 /*break*/, 19];
            case 18:
                ex_9 = _a.sent();
                next(ex_9);
                return [2 /*return*/];
            case 19:
                res.redirect(callback + "?key=" + accessKey.key + "&expires=" + encodeURIComponent(accessKey.expires.toString()) + "&state=" + req.body.state);
                return [2 /*return*/];
        }
    });
}); });
router.get("/token", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var key, token, ex_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                key = req.query.key;
                if (!key) {
                    return [2 /*return*/, res.status(401).json({
                            status: 401,
                            content: "Access Key parameter missing"
                        })];
                }
                return [4 /*yield*/, DAO.auth.addAccessTokenByAccessKey(key)];
            case 1:
                token = _a.sent();
                res.json({
                    status: 200,
                    content: token
                });
                return [3 /*break*/, 3];
            case 2:
                ex_10 = _a.sent();
                if (ex_10.message === "Invalid access key") {
                    res.status(401).json({
                        status: 401,
                        content: "Invalid access key"
                    });
                }
                else {
                    next(ex_10);
                }
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.post("/logout", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var success, ex_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (req.body.key == null)
                    return [2 /*return*/, res.status(400).json({
                            status: 400,
                            content: "Missing field key in post body"
                        })];
                return [4 /*yield*/, DAO.auth.deleteAccessKey(req.body.key)];
            case 1:
                success = _a.sent();
                if (success)
                    return [2 /*return*/, res.json({ status: 200, content: "OK" })];
                else
                    return [2 /*return*/, res.json({ status: 401, content: "Key does not exist" })];
                return [3 /*break*/, 3];
            case 2:
                ex_11 = _a.sent();
                return [2 /*return*/, next(ex_11)];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.get("/password/change/:token", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var donor, ex_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, DAO.auth.getDonorByChangePassToken(req.params.token)];
            case 1:
                donor = _a.sent();
                return [3 /*break*/, 3];
            case 2:
                ex_12 = _a.sent();
                next(ex_12);
                return [3 /*break*/, 3];
            case 3:
                if (donor) {
                    res.render(global.appRoot + '/views/auth/changePassword', {
                        title: "GiEffektivt.no - Endre passord",
                        firstName: donor.fullName.split(' ')[0]
                    });
                }
                else {
                    res.render(global.appRoot + '/views/auth/error', {
                        title: "GiEffektivt.no - Feilmelding",
                        errorCode: "INVALID_TOKEN",
                        errorMessage: "Det ser ut som linken du har fått tilsendt for å endre passord ikke er gyldig.",
                        "nextStep?": {
                            directions: "Du kan få tilsendt en ny link",
                            link: "#"
                        }
                    });
                }
                return [2 /*return*/];
        }
    });
}); });
router.post("/password/change/:token", urlEncodeParser, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var donor, ex_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                return [4 /*yield*/, DAO.auth.getDonorByChangePassToken(req.params.token)];
            case 1:
                donor = _a.sent();
                if (!donor) return [3 /*break*/, 4];
                return [4 /*yield*/, DAO.auth.updateDonorPassword(donor.id, req.body.password)];
            case 2:
                _a.sent();
                return [4 /*yield*/, DAO.auth.deletePasswordResetToken(req.params.token)];
            case 3:
                _a.sent();
                res.render(global.appRoot + '/views/auth/changedPassword', {
                    title: "GiEffektivt.no - Passord oppdatert"
                });
                return [3 /*break*/, 5];
            case 4:
                res.render(global.appRoot + '/views/auth/error', {
                    title: "GiEffektivt.no - Feilmelding",
                    errorCode: "INVALID_LINK",
                    errorMessage: "Det ser ut som linken du har fått tilsendt for å endre passord ikke er gyldig.",
                    "nextStep?": {
                        directions: "Du kan få tilsendt en ny link",
                        link: "#"
                    }
                });
                _a.label = 5;
            case 5: return [3 /*break*/, 7];
            case 6:
                ex_13 = _a.sent();
                next(ex_13);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
module.exports = router;
