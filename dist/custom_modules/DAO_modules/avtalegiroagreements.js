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
var pool;
//region Get
//endregion
//region Add
/**
 * Adds a new avtalegiroagreement to the database
 * @param {number} KID
 * @param {number} amount
 * @param {Date} drawdate
 * @param {boolean} notice
 */
function add(KID, amount, paymentDate, notice) {
    return __awaiter(this, void 0, void 0, function () {
        var con, res, ex_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.execute("INSERT INTO Avtalegiro_agreements (\n            KID,\n            amount,\n            payment_date, \n            notice\n            ) VALUES (?,?,?,?)", [
                            KID,
                            amount,
                            paymentDate,
                            notice
                        ])];
                case 2:
                    res = _a.sent();
                    con.release();
                    return [2 /*return*/, (res.insertId)];
                case 3:
                    ex_1 = _a.sent();
                    con.release();
                    throw ex_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function update(KID, notice) {
    return __awaiter(this, void 0, void 0, function () {
        var con, res, ex_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("UPDATE avtalegiro_agreement SET notice = ? where KID = ?", [notice, KID])];
                case 2:
                    res = _a.sent();
                    con.release();
                    return [2 /*return*/, true];
                case 3:
                    ex_2 = _a.sent();
                    con.release();
                    throw ex_2;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function remove(KID) {
    return __awaiter(this, void 0, void 0, function () {
        var con, result, ex_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, pool.getConnection()];
                case 1:
                    con = _a.sent();
                    return [4 /*yield*/, con.query("DELETE FROM Avtalegiro_agreements WHERE KID = ?", [KID])];
                case 2:
                    result = _a.sent();
                    con.release();
                    if (result[0].affectedRows > 0)
                        return [2 /*return*/, true];
                    else
                        return [2 /*return*/, false];
                    return [3 /*break*/, 4];
                case 3:
                    ex_3 = _a.sent();
                    con.release();
                    throw ex_3;
                case 4: return [2 /*return*/];
            }
        });
    });
}
//endregion
//region Modify
//endregion
//region Delete
//endregion
module.exports = {
    add: add,
    update: update,
    remove: remove,
    setup: function (dbPool) { pool = dbPool; }
};