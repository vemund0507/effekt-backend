const parse = require('csv-parse/lib/sync')
const moment = require('moment')

const fieldMapping = {
    foundEmail1: 0,
    foundEmail2: 1,
    foundEmail3: 2,
    email: 3,
    date: 4,
    externalRef: 5,
    metaOwner: 6,
    paymentMethod: 7,
    name: 8,
    sum: 9,
    transactionCost: 10,
    gw: 11,
    amf: 12,
    sci: 13,
    dwi: 14,
    end: 15,
    mc: 16,
    gd: 17,
    sight: 18,
    hki: 19,
    phc: 20,
    effekt: 21
}

module.exports = {
    /**
     * @typedef HistoricDonation
     * @property {string} foundEmail1
     * @property {string} foundEmail2
     * @property {string} foundEmail3
     * @property {string} email
     * @property {moment.Moment} date
     * @property {string} externalRef
     * @property {number} amount
     * @property {string} KID
     * @property {number} paymentID
     * @property {string} name
     * @property {number} transactionCost
     * @property {number} gw
     * @property {number} amf
     * @property {number} sci
     * @property {number} dwi
     * @property {number} end
     * @property {number} mc
     * @property {number} gd
     * @property {number} sight
     * @property {number} hki
     * @property {number} phc
     * @property {number} effekt
     */

    /**
     * Parses a CSV file containing historic bank donations
     * @param {Buffer} buffer A file buffer, from a CSV comma-separated file
     * @return {Array<HistoricDonation>}
     */
    parseHistoric: function(buffer) {
        let csvText = buffer.toString()
        try {
            var data = parse(csvText, { delimiter: ';', bom: true, skip_empty_lines: true })
        }
        catch(ex) {
            console.error("Using semicolon delimiter failed, trying comma.")

            try {
                var data = parse(csvText, { delimiter: ',', bom: true, skip_empty_lines: true })
            }
            catch(ex) {
                console.error("Using comma delimiter failed.")
                console.error("Parsing historic donations failed.")
                console.error(ex)
                return false
            }
        }

        let historicDonations = data.reduce((acc, row, i) => {
            if (i !== 0) acc.push(this.parseRow(row))
            return acc
        }, [])

        return historicDonations
    },

    /**
     * Parses a row (string array) from the CSV file buffer to a HistoricDonation object
     * @param {Array<string>} row 
     * @returns {HistoricDonation}
     */
    parseRow: function(row) {
        return {
            date: moment(row[fieldMapping.date], "YYYY-MM-DD").toDate(),
            amount: this.parseNumber(row[fieldMapping.sum]),
            paymentID: 5,
            foundEmail1: row[fieldMapping.foundEmail1],
            foundEmail2: row[fieldMapping.foundEmail2],
            foundEmail3: row[fieldMapping.foundEmail3],
            email: row[fieldMapping.email],
            externalRef: row[fieldMapping.externalRef],
            metaOwner: row[fieldMapping.metaOwner],
            name: row[fieldMapping.name],
            transactionCost: this.parseNumber(row[fieldMapping.transactionCost]),
            gw: this.parseNumber(row[fieldMapping.gw]),
            amf: this.parseNumber(row[fieldMapping.amf]),
            sci: this.parseNumber(row[fieldMapping.sci]),
            dwi: this.parseNumber(row[fieldMapping.dwi]),
            end: this.parseNumber(row[fieldMapping.end]),
            mc: this.parseNumber(row[fieldMapping.mc]),
            gd: this.parseNumber(row[fieldMapping.gd]),
            sight: this.parseNumber(row[fieldMapping.sight]),
            hki: this.parseNumber(row[fieldMapping.hki]),
            phc: this.parseNumber(row[fieldMapping.phc]),
            effekt: this.parseNumber(row[fieldMapping.effekt])
        }
    },

    /**
     * Parses a values from the "numeric" columns of the CSV file, which might be strings or integers
     * @param {string|number} value
     * @returns {number}
     */
    parseNumber: function(value) {
        if (typeof value == "string") {
            return Number(value.replace(/\,/g, ""))
        } else if (typeof value == "number" && !isNaN(value)) {
            return value
        } else {
            console.error("Failed to parse number " + value + "from CSV file.")
        }
    }
}