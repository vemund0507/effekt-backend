var serviceCodeEnum = require('../../enums/serviceCode');
var transactionCodeEnum = require('../../enums/transactionCode');
var recordTypeEnum = require('../../enums/recordType');
var transactionCode = require('../../enums/transactionCode');
module.exports = {
    /**
     * @typedef AvtalegiroAgreement
     * @property {number} fboNumber
     * @property {string} KID
     * @property {boolean} isAltered
     * @property {boolean} isTerminated
     */
    /**
     * Takes in an OCR file in string form and returns valid transations
     * @param {string} data A string from an OCR file
     * @returns {Array<AvtalegiroAgreement>} An array of transactions
     */
    parse: function (data) {
        var lines = data.split('\r\n');
        var agreements = [];
        for (var i = 0; i < lines.length - 1; i++) {
            if (lines[i].length > 0) {
                var currLine = lines[i];
                var serviceCode = currLine.substr(2, 2);
                var transactionCode_1 = currLine.substr(4, 2);
                var recordType = currLine.substr(6, 2);
                //translate these numeric values to enum values
                if (serviceCode == "21" && transactionCode_1 == "94" && recordType == "70") {
                    this.transactions.push(new AvtalegiroAgreement(element));
                }
            }
        }
        return agreements;
    }
};
var AvtalegiroAgreement = /** @class */ (function () {
    function AvtalegiroAgreement(element) {
        this.fboNumber = parseInt(element.substr(8, 7));
        this.KID = parseInt(element.substr(16, 26));
        this.notice = element.substr(41, 1);
        var registrationType = element.substr(15, 1);
        //slik jeg forstår det vil vi sjelden få 0 her? Hva betyr i så fall 0?
        if (registrationType == 1) {
            this.isTerminated = true;
        }
        else if (registrationType == 2) {
            this.isAltered = true;
        }
    }
    return AvtalegiroAgreement;
}());
