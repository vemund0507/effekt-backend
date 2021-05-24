var KID = require('./../KID.js');
module.exports = {
    /**
     * Attempts to extract a valid KID from the
     * @param {string} input A string with a possible KID
     * @returns {null | number} Returns null if not found, or the KID as a number
     */
    extractKID: function (input) {
        var extractionRegex = /(?=(\d{8}))/;
        var attemptedExtraction = extractionRegex.exec(String(input));
        if (!attemptedExtraction || attemptedExtraction.length < 2)
            return null;
        attemptedExtraction = attemptedExtraction[1];
        var KIDsubstr = attemptedExtraction.substr(0, 7);
        var checkDigit = KID.luhn_caclulate(KIDsubstr);
        if (KIDsubstr + checkDigit.toString() != attemptedExtraction)
            return null;
        return Number(attemptedExtraction);
    }
};
