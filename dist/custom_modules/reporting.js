var xlsx = require('node-xlsx').default;
var moment = require('moment');
module.exports = {
    /**
     * Creates an excel file from individual donations
     * @param {Array<Donation>} donations An array containing individual donations
     * @param {Array<Organization>} organizations An array of all the organizations in the database
     * @param {Array<PaymentMethod>} paymentMethods An array of paymentmethods in the donation-list
     * @returns {Buffer} The output excel file, as a buffer
     */
    createExcelFromIndividualDonations: function (donations, organizations, paymentMethods) {
        var organizationMapping = new Map();
        var dataStartRow = 4 + paymentMethods.length;
        //A 2-dimensional array representing rows and columns
        var data = [];
        //Convenience variables defining commonly used excel ranges
        var sumifnameColumn = COLUMN_MAPPING[3]; //Metode header
        var sumifcomparisonrange = sumifnameColumn + dataStartRow + ":" + (sumifnameColumn + (donations.length + dataStartRow));
        var sumationGrossRange = COLUMN_MAPPING[4] + dataStartRow + ":" + (COLUMN_MAPPING[4] + (donations.length + dataStartRow));
        var sumationFeesRange = COLUMN_MAPPING[5] + dataStartRow + ":" + (COLUMN_MAPPING[5] + (donations.length + dataStartRow));
        var sumationNetRange = COLUMN_MAPPING[6] + dataStartRow + ":" + (COLUMN_MAPPING[6] + (donations.length + dataStartRow));
        var checkSumRange = COLUMN_MAPPING[7] + "2:" + COLUMN_MAPPING[7 + (organizations.length - 1)] + "2";
        //Generate headers for data
        var headerRow = ['Checksum', formula(COLUMN_MAPPING[4] + "2-SUM(" + checkSumRange + ")"), '', 'Metode', 'Brutto', 'Avgifter', 'Netto'];
        var dataTopRow = ['ID', 'Donasjon registrert', 'Navn'];
        //Sumation-rows
        //Sumation for specific payment methods
        var methodSumationRows = [];
        paymentMethods.forEach(function (method) {
            methodSumationRows.push(["Antall " + method.name,
                formula("COUNTIF(D" + dataStartRow + ":D1000,\"" + method.name + "\")"), '', "Sum " + method.name,
                formula("SUMIF(" + sumifcomparisonrange + ", \"" + method.name + "\", " + sumationGrossRange + ")"),
                formula("SUMIF(" + sumifcomparisonrange + ", \"" + method.name + "\", " + sumationFeesRange + ")"),
                formula("SUMIF(" + sumifcomparisonrange + ", \"" + method.name + "\", " + sumationNetRange + ")")
            ]);
        });
        var currentColumn = headerRow.length;
        organizations.forEach(function (org) {
            var organizationHeaders = [org.abbriv];
            headerRow.push.apply(headerRow, organizationHeaders);
            var sumationColumn = COLUMN_MAPPING[headerRow.length - 1];
            var sumationRange = sumationColumn + dataStartRow + ":" + (sumationColumn + (donations.length + dataStartRow));
            var organizationSumColumns = [formula("SUM(" + sumationRange + ")")];
            //Add sumation for each organization filtered on each payment method
            paymentMethods.forEach(function (method, i) {
                var _a;
                var organizationSumMethodColumns = [formula("SUMIF(" + sumifcomparisonrange + ", \"" + method.name + "\", " + sumationRange + ")")];
                (_a = methodSumationRows[i]).push.apply(_a, organizationSumMethodColumns);
            });
            organizationMapping.set(org.id, currentColumn);
            currentColumn += organizationHeaders.length;
        });
        //Generate the actual donation data
        var dataRows = [];
        donations.forEach(function (donation) {
            var donationTime = moment(donation.time);
            var donationRow = [donation.ID,
                { v: new Date(donationTime.utc(true)), t: 'd' },
                donation.name,
                donation.paymentMethod,
                donation.sum,
                Number(donation.transactionCost),
                roundCurrency(donation.sum - Number(donation.transactionCost))];
            //For each organization in donation
            donation.split.forEach(function (split) {
                var startIndex = organizationMapping.get(split.id);
                donationRow[startIndex] = roundCurrency(Number(split.amount));
            });
            dataRows.push(donationRow);
        });
        //Add all the generated data
        data.push(headerRow); //Overall sumation
        data.push.apply(//Overall sumation
        data, methodSumationRows); //Sumation for all the payment methods
        data.push([]); //Spacing row
        data.push(dataTopRow); //Headers for individual donations
        data.push.apply(//Headers for individual donations
        data, dataRows); //All the individual donations
        var buffer = xlsx.build([{ name: "Donations", data: data }]);
        return buffer;
        //Helper functions
        function formula(formula) {
            return { v: '', f: "=" + formula };
        }
        function roundCurrency(num) {
            return (Math.round(num * 100) / 100);
        }
    }
};
var COLUMN_MAPPING = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AV', 'AW', 'AX', 'AY', 'AZ',
    'BA', 'BB', 'BC', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BK', 'BL', 'BM', 'BN', 'BO', 'BP', 'BQ', 'BR', 'BS', 'BT', 'BU', 'BV', 'BW', 'BX', 'BY', 'BZ'];
