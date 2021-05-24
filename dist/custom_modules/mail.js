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
var config = require('../config.js');
var DAO = require('./DAO.js');
var moment = require('moment');
var template = require('./template.js');
var request = require('request-promise-native');
var fs = require('fs-extra');
/**
 * Sends a donation reciept
 * @param {number} donationID
 * @param {string} reciever Reciever email
*/
function sendDonationReciept(donationID, reciever) {
    if (reciever === void 0) { reciever = null; }
    return __awaiter(this, void 0, void 0, function () {
        var donation, ex_1, split, ex_2, hasReplacedOrgs, ex_3, organizations, ex_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, DAO.donations.getByID(donationID)];
                case 1:
                    donation = _a.sent();
                    if (!donation.email) {
                        console.error("No email provided for donation ID " + donationID);
                        return [2 /*return*/, false];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    ex_1 = _a.sent();
                    console.error("Failed to send mail donation reciept, could not get donation by ID");
                    console.error(ex_1);
                    return [2 /*return*/, false];
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, DAO.distributions.getSplitByKID(donation.KID)];
                case 4:
                    split = _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    ex_2 = _a.sent();
                    console.error("Failed to send mail donation reciept, could not get donation split by KID");
                    console.error(ex_2);
                    return [2 /*return*/, false];
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, DAO.donations.getHasReplacedOrgs(donationID)];
                case 7:
                    hasReplacedOrgs = _a.sent();
                    return [3 /*break*/, 9];
                case 8:
                    ex_3 = _a.sent();
                    console.log(ex_3);
                    return [2 /*return*/, false];
                case 9:
                    organizations = formatOrganizationsFromSplit(split, donation.sum);
                    _a.label = 10;
                case 10:
                    _a.trys.push([10, 12, , 13]);
                    return [4 /*yield*/, send({
                            reciever: (reciever ? reciever : donation.email),
                            subject: "gieffektivt.no - Din donasjon er mottatt",
                            templateName: "reciept",
                            templateData: {
                                header: "Hei " + donation.donor + ",",
                                //Add thousand seperator regex at end of amount
                                donationSum: donation.sum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "&#8201;"),
                                organizations: organizations,
                                donationDate: moment(donation.timestamp).format("DD.MM YYYY"),
                                paymentMethod: decideUIPaymentMethod(donation.method),
                                //Adds a message to donations with inactive organizations
                                hasReplacedOrgs: hasReplacedOrgs
                            }
                        })];
                case 11:
                    _a.sent();
                    return [2 /*return*/, true];
                case 12:
                    ex_4 = _a.sent();
                    console.error("Failed to send donation reciept");
                    console.error(ex_4);
                    return [2 /*return*/, ex_4.statusCode];
                case 13: return [2 /*return*/];
            }
        });
    });
}
/**
 * Sends a donation reciept with notice of old system
 * @param {number} donationID
 * @param {string} reciever Reciever email
*/
function sendEffektDonationReciept(donationID, reciever) {
    if (reciever === void 0) { reciever = null; }
    return __awaiter(this, void 0, void 0, function () {
        var donation, ex_5, split, ex_6, hasReplacedOrgs, ex_7, organizations, ex_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, DAO.donations.getByID(donationID)];
                case 1:
                    donation = _a.sent();
                    if (!donation.email) {
                        console.error("No email provided for donation ID " + donationID);
                        return [2 /*return*/, false];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    ex_5 = _a.sent();
                    console.error("Failed to send mail donation reciept, could not get donation by ID");
                    console.error(ex_5);
                    return [2 /*return*/, false];
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, DAO.distributions.getSplitByKID(donation.KID)];
                case 4:
                    split = _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    ex_6 = _a.sent();
                    console.error("Failed to send mail donation reciept, could not get donation split by KID");
                    console.error(ex_6);
                    return [2 /*return*/, false];
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, DAO.donations.getHasReplacedOrgs(donationID)];
                case 7:
                    hasReplacedOrgs = _a.sent();
                    return [3 /*break*/, 9];
                case 8:
                    ex_7 = _a.sent();
                    console.log(ex_7);
                    return [2 /*return*/, false];
                case 9:
                    organizations = formatOrganizationsFromSplit(split, donation.sum);
                    _a.label = 10;
                case 10:
                    _a.trys.push([10, 12, , 13]);
                    return [4 /*yield*/, send({
                            reciever: (reciever ? reciever : donation.email),
                            subject: "gieffektivt.no - Din donasjon er mottatt",
                            templateName: "recieptEffekt",
                            templateData: {
                                header: "Hei " + donation.donor + ",",
                                //Add thousand seperator regex at end of amount
                                donationSum: donation.sum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "&#8201;"),
                                organizations: organizations,
                                donationDate: moment(donation.timestamp).format("DD.MM YYYY"),
                                paymentMethod: decideUIPaymentMethod(donation.method),
                                //Adds a message to donations with inactive organizations
                                hasReplacedOrgs: hasReplacedOrgs
                            }
                        })];
                case 11:
                    _a.sent();
                    return [2 /*return*/, true];
                case 12:
                    ex_8 = _a.sent();
                    console.error("Failed to send donation reciept");
                    console.error(ex_8);
                    return [2 /*return*/, ex_8.statusCode];
                case 13: return [2 /*return*/];
            }
        });
    });
}
function decideUIPaymentMethod(donationMethod) {
    if (donationMethod.toUpperCase() == 'BANK U/KID') {
        donationMethod = 'Bank';
    }
    return donationMethod;
}
function formatOrganizationsFromSplit(split, sum) {
    return split.map(function (org) {
        var amount = sum * parseFloat(org.percentage_share) * 0.01;
        var roundedAmount = (amount > 1 ? Math.round(amount) : 1);
        return {
            name: org.full_name,
            //Add thousand seperator regex at end of amount
            amount: (roundedAmount != amount ? "~ " : "") + roundedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "&#8201;"),
            percentage: parseFloat(org.percentage_share)
        };
    });
}
/**
 * @param {number} KID
*/
function sendDonationRegistered(KID) {
    return __awaiter(this, void 0, void 0, function () {
        var donor, ex_9, split, ex_10, organizations, KIDstring, ex_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 10, , 11]);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, DAO.donors.getByKID(KID)];
                case 2:
                    donor = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    ex_9 = _a.sent();
                    console.error("Failed to send mail donation reciept, could not get donor by KID");
                    console.error(ex_9);
                    return [2 /*return*/, false];
                case 4:
                    if (!donor) {
                        console.error("Failed to send mail donation reciept, no donors attached to KID " + KID);
                        return [2 /*return*/, false];
                    }
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, DAO.distributions.getSplitByKID(KID)];
                case 6:
                    split = _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    ex_10 = _a.sent();
                    console.error("Failed to send mail donation reciept, could not get donation split by KID");
                    console.error(ex_10);
                    return [2 /*return*/, false];
                case 8:
                    organizations = split.map(function (split) { return ({ name: split.full_name, percentage: parseFloat(split.percentage_share) }); });
                    KIDstring = KID.toString();
                    //Add seperators for KID, makes it easier to read
                    KIDstring = KIDstring.substr(0, 3) + " " + KIDstring.substr(3, 2) + " " + KIDstring.substr(5, 3);
                    return [4 /*yield*/, send({
                            subject: 'gieffektivt.no - Donasjon klar for innbetaling',
                            reciever: donor.email,
                            templateName: 'registered',
                            templateData: {
                                header: "Hei, " + (donor.name.length > 0 ? donor.name : ""),
                                name: donor.name,
                                //Add thousand seperator regex at end of amount
                                kid: KIDstring,
                                accountNumber: config.bankAccount,
                                organizations: organizations
                            }
                        })];
                case 9:
                    _a.sent();
                    return [2 /*return*/, true];
                case 10:
                    ex_11 = _a.sent();
                    console.error("Failed to send mail donation registered");
                    console.error(ex_11);
                    return [2 /*return*/, ex_11.statusCode];
                case 11: return [2 /*return*/];
            }
        });
    });
}
function formatCurrency(currencyString) {
    return Number.parseFloat(currencyString).toFixed(2)
        .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
        .replace(",", " ")
        .replace(".", ",");
}
/**
 * @param {number} donorID
*/
function sendDonationHistory(donorID) {
    return __awaiter(this, void 0, void 0, function () {
        var total, donationSummary, yearlyDonationSummary, donationHistory, donor, email, dates, templateName, i, month, dateFormat, i, ex_12, ex_13;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    total = 0;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, DAO.donations.getSummary(donorID)];
                case 2:
                    donationSummary = _a.sent();
                    return [4 /*yield*/, DAO.donations.getSummaryByYear(donorID)];
                case 3:
                    yearlyDonationSummary = _a.sent();
                    return [4 /*yield*/, DAO.donations.getHistory(donorID)];
                case 4:
                    donationHistory = _a.sent();
                    return [4 /*yield*/, DAO.donors.getByID(donationSummary[donationSummary.length - 1].donorID)];
                case 5:
                    donor = _a.sent();
                    email = donor.email;
                    dates = [];
                    if (!email) {
                        console.error("No email provided for donor ID " + donorID);
                        return [2 /*return*/, false];
                    }
                    if (donationHistory.length == 0) {
                        templateName = "noDonationHistory";
                    }
                    else {
                        templateName = "donationHistory";
                        for (i = 0; i < donationHistory.length; i++) {
                            month = donationHistory[i].date.getMonth() + 1;
                            dateFormat = donationHistory[i].date.getDate().toString() + "/" + month.toString() + "/" + donationHistory[i].date.getFullYear().toString();
                            dates.push(dateFormat);
                        }
                        for (i = 0; i < donationSummary.length - 1; i++) {
                            total += donationSummary[i].sum;
                        }
                    }
                    // Formatting all currencies
                    yearlyDonationSummary.forEach(function (obj) {
                        obj.yearSum = formatCurrency(obj.yearSum);
                    });
                    donationSummary.forEach(function (obj) {
                        obj.sum = formatCurrency(obj.sum);
                    });
                    donationHistory.forEach(function (obj) {
                        obj.distributions.forEach(function (distribution) {
                            distribution.sum = formatCurrency(distribution.sum);
                        });
                    });
                    total = formatCurrency(total);
                    return [3 /*break*/, 7];
                case 6:
                    ex_12 = _a.sent();
                    console.error("Failed to send donation history, could not get donation by ID");
                    console.error(ex_12);
                    return [2 /*return*/, false];
                case 7:
                    _a.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, send({
                            reciever: email,
                            subject: "gieffektivt.no - Din donasjonshistorikk",
                            templateName: templateName,
                            templateData: {
                                header: "Hei " + donor.full_name + ",",
                                total: total,
                                donationSummary: donationSummary,
                                yearlyDonationSummary: yearlyDonationSummary,
                                donationHistory: donationHistory,
                                dates: dates
                            }
                        })];
                case 8:
                    _a.sent();
                    return [2 /*return*/, true];
                case 9:
                    ex_13 = _a.sent();
                    console.error("Failed to send donation history");
                    console.error(ex_13);
                    return [2 /*return*/, ex_13.statusCode];
                case 10: return [2 /*return*/];
            }
        });
    });
}
/**
 * Sends donors confirmation of their tax deductible donation for a given year
 * @param {TaxDeductionRecord} taxDeductionRecord
 * @param {number} year The year the tax deductions are counted for
 */
function sendTaxDeductions(taxDeductionRecord, year) {
    return __awaiter(this, void 0, void 0, function () {
        var ex_14;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, send({
                            reciever: taxDeductionRecord.email,
                            subject: "gieffektivt.no - \u00C5rsoppgave, skattefradrag donasjoner " + year,
                            templateName: "taxDeduction",
                            templateData: {
                                header: "Hei " + taxDeductionRecord.firstname + ",",
                                donationSum: taxDeductionRecord.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "&#8201;"),
                                fullname: taxDeductionRecord.fullname,
                                ssn: taxDeductionRecord.ssn,
                                year: year.toString(),
                                nextYear: (year + 1).toString()
                            }
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, true];
                case 2:
                    ex_14 = _a.sent();
                    console.error("Failed to tax deduction mail");
                    console.error(ex_14);
                    return [2 /*return*/, ex_14.statusCode];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Sends OCR file for backup
 * @param {Buffer} fileContents
 */
function sendOcrBackup(fileContents) {
    return __awaiter(this, void 0, void 0, function () {
        var data, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    data = {
                        from: 'gieffektivt.no <donasjon@gieffektivt.no>',
                        to: 'hakon.harnes@effektivaltruisme.no',
                        bcc: "donasjon@gieffektivt.no",
                        subject: 'OCR backup',
                        text: fileContents.toString(),
                        inline: []
                    };
                    return [4 /*yield*/, request.post({
                            url: 'https://api.mailgun.net/v3/mg.stiftelseneffekt.no/messages',
                            auth: {
                                user: 'api',
                                password: config.mailgun_api_key
                            },
                            formData: data,
                            resolveWithFullResponse: true
                        })];
                case 1:
                    result = _a.sent();
                    if (result.statusCode === 200) {
                        return [2 /*return*/, true];
                    }
                    else {
                        return [2 /*return*/, false];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * @typedef MailOptions
 * @prop {string} reciever
 * @prop {string} subject
 * @prop {string} templateName Name of html template, found in views folder
 * @prop {object} templateData Object with template data on the form {key: value, key2: value2 ...}
*/
/**
 * Sends a mail to
 * @param {MailOptions} options
 * @returns {boolean | number} True if success, status code else
 */
function send(options) {
    return __awaiter(this, void 0, void 0, function () {
        var templateRoot, templateRawHTML, templateHTML, data, filesInDir, i, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    templateRoot = appRoot + '/views/mail/' + options.templateName;
                    return [4 /*yield*/, fs.readFile(templateRoot + "/index.html", 'utf8')];
                case 1:
                    templateRawHTML = _a.sent();
                    templateHTML = template(templateRawHTML, options.templateData);
                    data = {
                        from: 'gieffektivt.no <donasjon@gieffektivt.no>',
                        to: options.reciever,
                        bcc: "donasjon@gieffektivt.no",
                        subject: options.subject,
                        text: 'Your mail client does not support HTML email',
                        html: templateHTML,
                        inline: []
                    };
                    return [4 /*yield*/, fs.readdir(templateRoot + "/images/")];
                case 2:
                    filesInDir = _a.sent();
                    for (i = 0; i < filesInDir.length; i++) {
                        data.inline.push(fs.createReadStream(templateRoot + "/images/" + filesInDir[i]));
                    }
                    return [4 /*yield*/, request.post({
                            url: 'https://api.mailgun.net/v3/mg.stiftelseneffekt.no/messages',
                            auth: {
                                user: 'api',
                                password: config.mailgun_api_key
                            },
                            formData: data,
                            resolveWithFullResponse: true
                        })];
                case 3:
                    result = _a.sent();
                    if (result.statusCode === 200) {
                        return [2 /*return*/, true];
                    }
                    else {
                        return [2 /*return*/, false];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
module.exports = {
    sendDonationReciept: sendDonationReciept,
    sendEffektDonationReciept: sendEffektDonationReciept,
    sendDonationRegistered: sendDonationRegistered,
    sendDonationHistory: sendDonationHistory,
    sendTaxDeductions: sendTaxDeductions,
    sendOcrBackup: sendOcrBackup
};
