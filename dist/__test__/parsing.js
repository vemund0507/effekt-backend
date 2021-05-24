// External
var chai = require('chai');
chai.use(require('chai-datetime'));
var expect = (chai.expect);
var fs = require('fs');
var moment = require('moment');
//Custom modules
var paypal = require('../custom_modules/parsers/paypal');
var vipps = require('../custom_modules/parsers/vipps');
var bank = require('../custom_modules/parsers/bank');
var reportType = {
    vipps: "vipps",
    paypal: "paypal"
};
describe("Paypal CSV", function () {
    it("Parses paypal CSV with comma seperation and \"", function () {
        var sample = readCSV(reportType.paypal, "Paypal April 2019");
        var transactions = paypal.parse(sample);
        expect(transactions).to.be.length(9);
    });
    it("Parses paypal CSV with semicolon seperation and \"", function () {
        var sample = readCSV(reportType.paypal, "Paypal April 2019 - Semicolon");
        var transactions = paypal.parse(sample);
        expect(transactions).to.be.length(9);
    });
    it("Parses paypal CSV with semicolon seperation and without \"", function () {
        var sample = readCSV(reportType.paypal, "Paypal April 2019 - Semicolon Stripped");
        var transactions = paypal.parse(sample);
        expect(transactions).to.be.length(9);
    });
    it("Parses paypal CSV with semicolon seperation and without \" with . comma seperator", function () {
        var sample = readCSV(reportType.paypal, "Paypal April 2019 - Semicolon Stripped Dot");
        var transactions = paypal.parse(sample);
        expect(transactions).to.be.length(9);
    });
    it("Parses problematic paypal CSV for september", function () {
        var sample = readCSV(reportType.paypal, "Paypal Special");
        var transactions = paypal.parse(sample);
        expect(transactions).to.be.length(6);
    });
    it("Parses problematic paypal CSV for october", function () {
        var sample = readCSV(reportType.paypal, "Effekt PayPal oktober");
        var transactions = paypal.parse(sample);
        expect(transactions).to.be.length(2);
    });
});
describe("Vipps CSV", function () {
    it("Parses vipps CSV with semicolon seperation", function () {
        var sample = readCSV(reportType.vipps, "Vipps April 2019");
        var transactions = vipps.parseReport(sample).transactions;
        expect(transactions).to.be.length(15);
    });
});
describe("Bank CSV", function () {
    it("Parses bank report correctly when downloaded from google drive", function () {
        var transactions = bank.parseReport(readCSV("bank", "sampleReport"));
        expect(transactions[0].KID).to.be.equal(57967549);
        expect(transactions[6].date.isSame(moment("02.01.2019", "DD.MM.YYYY"))).to.be.equal(true);
        expect(transactions[2].amount).to.be.equal(250.15);
        expect(transactions[4].transactionID).to.be.equal("1264");
    });
});
function readCSV(type, filename) {
    return fs.readFileSync("__test__/data/" + type + "/" + filename + ".CSV");
}
