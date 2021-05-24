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
var config = require('../config');
var mysql = require('mysql2/promise');
module.exports = {
    //Submodules
    donors: require('./DAO_modules/donors'),
    organizations: require('./DAO_modules/organizations'),
    donations: require('./DAO_modules/donations'),
    distributions: require('./DAO_modules/distributions'),
    payment: require('./DAO_modules/payment'),
    vipps: require('./DAO_modules/vipps'),
    csr: require('./DAO_modules/csr'),
    parsing: require('./DAO_modules/parsing'),
    referrals: require('./DAO_modules/referrals'),
    auth: require('./DAO_modules/auth'),
    meta: require('./DAO_modules/meta'),
    initialpaymentmethod: require('./DAO_modules/initialpaymentmethod'),
    avtalegiroagreements: require('./DAO_modules/avtalegiroagreements'),
    facebook: require('./DAO_modules/facebook'),
    /**
     * Sets up a connection to the database, uses config.js file for parameters
     * @param {function} cb Callback for when DAO has been sucessfully set up
     */
    connect: function (cb) {
        return __awaiter(this, void 0, void 0, function () {
            var dbPool, ex_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, mysql.createPool({
                            host: config.db_host,
                            user: config.db_username,
                            password: config.db_password,
                            database: config.db_name,
                            enableKeepAlive: true
                        })
                        //Check whether connection was successfull
                        //Weirdly, this is the proposed way to do it
                    ];
                    case 1:
                        dbPool = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, dbPool.query("SELECT 1 + 1 AS Solution")];
                    case 3:
                        _a.sent();
                        console.log("Connected to database | Using database " + config.db_name);
                        return [3 /*break*/, 5];
                    case 4:
                        ex_1 = _a.sent();
                        console.error("Connection to database failed! | Using database " + config.db_name);
                        console.log(ex_1);
                        process.exit();
                        return [3 /*break*/, 5];
                    case 5:
                        //Setup submodules
                        this.donors.setup(dbPool);
                        this.organizations.setup(dbPool);
                        this.donations.setup(dbPool, this);
                        this.distributions.setup(dbPool, this);
                        this.payment.setup(dbPool);
                        this.vipps.setup(dbPool);
                        this.csr.setup(dbPool);
                        this.parsing.setup(dbPool);
                        this.referrals.setup(dbPool);
                        this.auth.setup(dbPool);
                        this.meta.setup(dbPool);
                        this.initialpaymentmethod.setup(dbPool);
                        this.avtalegiroagreements.setup(dbPool);
                        this.facebook.setup(dbPool);
                        //Convenience functions for transactions
                        //Use the returned transaction object for queries in the transaction
                        dbPool.startTransaction = function () {
                            return __awaiter(this, void 0, void 0, function () {
                                var transaction, ex_2;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 3, , 4]);
                                            return [4 /*yield*/, dbPool.getConnection()];
                                        case 1:
                                            transaction = _a.sent();
                                            return [4 /*yield*/, transaction.query("START TRANSACTION")];
                                        case 2:
                                            _a.sent();
                                            return [2 /*return*/, transaction];
                                        case 3:
                                            ex_2 = _a.sent();
                                            console.log(ex_2);
                                            throw new Error("Fatal error, failed to start transaction");
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            });
                        };
                        dbPool.rollbackTransaction = function (transaction) {
                            return __awaiter(this, void 0, void 0, function () {
                                var ex_3;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, , 3]);
                                            return [4 /*yield*/, transaction.query("ROLLBACK")];
                                        case 1:
                                            _a.sent();
                                            transaction.release();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            ex_3 = _a.sent();
                                            console.log(ex_3);
                                            throw new Error("Fatal error, failed to rollback transaction");
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            });
                        };
                        dbPool.commitTransaction = function (transaction) {
                            return __awaiter(this, void 0, void 0, function () {
                                var ex_4;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, , 3]);
                                            return [4 /*yield*/, transaction.query("COMMIT")];
                                        case 1:
                                            _a.sent();
                                            transaction.release();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            ex_4 = _a.sent();
                                            console.log(ex_4);
                                            throw new Error("Fatal error, failed to commit transaction");
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            });
                        };
                        cb();
                        return [2 /*return*/];
                }
            });
        });
    }
};
