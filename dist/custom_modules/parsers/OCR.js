var serviceCodeEnum = require('../../enums/serviceCode');
var transactionCodeEnum = require('../../enums/transactionCode');
var recordTypeEnum = require('../../enums/recordType');
var transactionCode = require('../../enums/transactionCode');
var BANK_ID = 2;
module.exports = {
    /**
     * @typedef OCRTransaction
     * @property {number} amount
     * @property {string} transactionID
     * @property {Date} date
     * @property {number} KID
     */
    /**
     * Takes in an OCR file in string form and returns valid transations
     * @param {string} data A string from an OCR file
     * @returns {Array<OCRTransaction>} An array of transactions
     */
    parse: function (data) {
        var lines = data.split(/\r?\n/);
        var transactions = [];
        for (var i = 0; i < lines.length - 1; i++) {
            if (lines[i].length > 0) {
                var currLine = lines[i];
                var nextLine = lines[i + 1];
                var serviceCode = currLine.substr(2, 2);
                var transactionCode_1 = currLine.substr(4, 2);
                var recordType = currLine.substr(6, 2);
                if (serviceCode == serviceCodeEnum.ocr && (transactionCode_1 == transactionCodeEnum.btg || transactionCode_1 == transactionCodeEnum.avtalegiro) && recordType == recordTypeEnum.post1) {
                    this.transactions.push(new OCRTransaction(element, nextLine));
                }
            }
        }
        return transactions;
    }
};
var OCRTransaction = /** @class */ (function () {
    function OCRTransaction(element, nextline) {
        this.number = element.substr(8, 7);
        var year = element.substr(19, 2);
        var month = element.substr(17, 2);
        var day = element.substr(15, 2);
        var date = new Date(parseInt("20" + year), parseInt(month) - 1, parseInt(day));
        this.date = date;
        this.amount = parseInt(element.substr(32, 17)) / 100;
        this.kid = parseInt(element.substr(49, 25));
        var archivalReference = nextline.substr(25, 9);
        var transactionRunningNumber = parseInt(nextline.substr(9, 6));
        var transactionID = day + month + year + "." + archivalReference + transactionRunningNumber;
        this.transactionID = transactionID;
        this.paymentID = BANK_ID;
    }
    return OCRTransaction;
}());
