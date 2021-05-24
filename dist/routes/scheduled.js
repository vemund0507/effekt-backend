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
var authRoles = require('../enums/authorizationRoles');
var authMiddleware = require("../custom_modules/authorization/authMiddleware.js");
var nets = require('../custom_modules/nets');
var ocrParser = require('../custom_modules/parsers/OCR');
var ocr = require('../custom_modules/ocr');
var META_OWNER_ID = 3;
router.post("/nets", authMiddleware(authRoles.write_all_donations), function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var latestOcrFile, parsed, result, ex_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, nets.getLatestOCRFile()];
            case 1:
                latestOcrFile = _a.sent();
                parsed = ocrParser.parse(latestOcrFile.toString());
                return [4 /*yield*/, ocr.addDonations(parsed, META_OWNER_ID)];
            case 2:
                result = _a.sent();
                res.json(result);
                return [3 /*break*/, 4];
            case 3:
                ex_1 = _a.sent();
                next({ ex: ex_1 });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.post("/nets/complete", authMiddleware(authRoles.write_all_donations), function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
    var files, results, i, file, fileBuffer, parsed, result, ex_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 7, , 8]);
                return [4 /*yield*/, nets.getOCRFiles()
                    /**
                     * This function is very suboptimal, as each file get creates a new SFTP connection
                     * and disposes of it after fetching the file
                     */
                ];
            case 1:
                files = _a.sent();
                results = [];
                i = 0;
                _a.label = 2;
            case 2:
                if (!(i < files.length)) return [3 /*break*/, 6];
                file = files[i];
                return [4 /*yield*/, nets.getOCRFile(file.name)];
            case 3:
                fileBuffer = _a.sent();
                parsed = ocrParser.parse(fileBuffer.toString());
                return [4 /*yield*/, ocr.addDonations(parsed, META_OWNER_ID)];
            case 4:
                result = _a.sent();
                results.push(result);
                _a.label = 5;
            case 5:
                i++;
                return [3 /*break*/, 2];
            case 6:
                res.json(results);
                return [3 /*break*/, 8];
            case 7:
                ex_2 = _a.sent();
                next({ ex: ex_2 });
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
module.exports = router;
