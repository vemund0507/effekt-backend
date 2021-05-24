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
var sinon = require('sinon');
var chai = require('chai');
var DAO = require('../custom_modules/DAO');
var expect = (chai.expect);
var mail = require('../custom_modules/mail');
var fs = require('fs');
var config = require('../config');
var paypalroute = require('../routes/reports/paypal');
var vippsRoute = require('../routes/reports/vipps');
var ocrRoute = require('../routes/reports/ocr');
var addStub = sinon
    .stub(DAO.donations, 'add')
    //Returns donation ID
    .resolves(10);
var mailStub = sinon
    .stub(mail, 'sendDonationReciept');
var historicSub = sinon
    .stub(DAO.distributions, 'getHistoricPaypalSubscriptionKIDS');
var parsingRulesStub = sinon
    .stub(DAO.parsing, 'getVippsParsingRules')
    .resolves([]);
beforeEach(function () {
    historicSub.reset();
    addStub.reset();
    mailStub.reset();
});
describe('PayPal report route handles correctly', function () {
    it('adds donations to DB when historic matching exists', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    historicSub.resolves({
                        'I-YE66CY1W4DPU': 23
                    });
                    return [4 /*yield*/, runPaypal('Paypal April 2019')];
                case 1:
                    _a.sent();
                    expect(addStub.callCount).to.be.equal(1);
                    return [2 /*return*/];
            }
        });
    }); });
    it('does not fail on 0 historic paypal matches', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    historicSub.resolves([]);
                    return [4 /*yield*/, runPaypal('Paypal Special')];
                case 1:
                    _a.sent();
                    expect(addStub.callCount).to.be.equal(0);
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('Vipps route handles report correctly', function () {
    it('Adds donations to DB', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, runVipps('Vipps April 2019')];
                case 1:
                    _a.sent();
                    expect(addStub.callCount).to.be.equal(10);
                    return [2 /*return*/];
            }
        });
    }); });
    it('Attempts to send mail when in production', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config.env = "production";
                    return [4 /*yield*/, runVipps('Vipps April 2019')];
                case 1:
                    _a.sent();
                    config.env = "development";
                    expect(mailStub.callCount).to.be.equal(10);
                    return [2 /*return*/];
            }
        });
    }); });
    it('Adds default donations', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parsingRulesStub.resolves([{
                            salesLocation: 'Stiftelsen Effekt',
                            message: 'Vipps',
                            resolveKID: 12345678
                        }]);
                    return [4 /*yield*/, runVipps('Vipps April 2019')];
                case 1:
                    _a.sent();
                    expect(addStub.callCount).to.be.equal(13);
                    return [2 /*return*/];
            }
        });
    }); });
});
/*
describe('OCR route handles correctly', () => {
    it('Adds donations to DB', async () => {
        await runOCR('TBOC2072')

        expect(addStub.callCount).to.be.equal(2)
    })

    it('Sends donation reciept', async () => {
        config.env = "production"
        await runOCR('TBOC2072')
        config.env = "development"

        expect(mailStub.callCount).to.be.equal(2)
    })
})
*/
function runPaypal(filename) {
    return __awaiter(this, void 0, void 0, function () {
        var res, jsonStub, query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    res = {
                        json: function () { }
                    };
                    jsonStub = sinon.stub(res, 'json');
                    query = {
                        body: {
                            metaOwnerID: 3
                        },
                        files: {
                            report: {
                                data: readReport('paypal', filename)
                            }
                        }
                    };
                    return [4 /*yield*/, paypalroute(query, res, function (ex) { throw ex; })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function runVipps(filename) {
    return __awaiter(this, void 0, void 0, function () {
        var res, jsonStub, query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    res = {
                        json: function () { }
                    };
                    jsonStub = sinon
                        .stub(res, 'json');
                    query = {
                        body: {
                            metaOwnerID: 3
                        },
                        files: {
                            report: {
                                data: readReport('vipps', filename)
                            }
                        }
                    };
                    return [4 /*yield*/, vippsRoute(query, res, function (ex) { throw ex; })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function runOCR(filename) {
    return __awaiter(this, void 0, void 0, function () {
        var res, jsonStub, query;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    res = {
                        json: function () { }
                    };
                    jsonStub = sinon
                        .stub(res, 'json');
                    query = {
                        body: {
                            metaOwnerID: 3
                        },
                        files: {
                            report: {
                                data: readReport('ocr', filename, 'DAT')
                            }
                        }
                    };
                    return [4 /*yield*/, ocrRoute(query, res, function (ex) { throw ex; })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function readReport(type, filename, extension) {
    if (extension === void 0) { extension = "CSV"; }
    return fs.readFileSync("__test__/data/" + type + "/" + filename + "." + extension);
}
