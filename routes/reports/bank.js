const bankParser = require('../../custom_modules/parsers/bank.js')
const DAO = require('../../custom_modules/DAO.js')
const config = require('../../config')
const mail = require('../../custom_modules/mail')

const BANK_NO_KID_ID = 5

module.exports = async (req, res, next) => {
    let metaOwnerID = parseInt(req.body.metaOwnerID)

    var data = req.files.report.data.toString('UTF-8')

    try {
        var transactions = bankParser.parseReport(data)
    } catch(ex) {
        return next(ex)
    }

    /**
     * We fetch a connection to reuse
     */
    let connection;
    try {
        connection = await DAO.donations.pool.getConnection()
    } catch(ex) {
        console.error(ex)
        res.status(500).json({
            status: 500,
            content: "Failed to fetch connection"
        })
        return false
    }

    /**
     * Construct task list
     */
    const tasklist = transactions.map(t => addDonation(transactions, metaOwnerID, connection))
    
    /**
     * Add all donations in paralell
     */
    const results = await Promise.all(tasklist)

    /**
     * Release connection after all donations are processed
     */
    try {
        await connection.release()
    } catch(ex) {
        console.error("CATASTROPHIC: Failed to release connection after processing donations")
        console.error(ex)
    }

    /**
     * Count up all valid and invalid transactions for returning to client
     */
    let valid = results.reduce((acc, result) => (result === true ? ++acc : acc), 0)
    let invalid = results.reduce((acc, result) => (result !== true ? ++ acc : acc), 0)
    let invalidTransactions = results.filter((result) => result !== true)

    res.json({
        status: 200,
        content: {
            valid,
            invalid,
            invalidTransactions
        }
    })
}

/**
 * @typedef FailedTransaction
 * @property {string} reason The reason the transaction was not added to the database
 * @property {import('../../custom_modules/parsers/bank.js').BankCustomTransaction} transaction The failed transaction
 */

/**
 * @param {import('../../custom_modules/parsers/bank.js').BankCustomTransaction} transaction 
 * @param {import('mysql2/promise').PromisePoolConnection} connection Reusable connection
 * @return {FailedTransaction | boolean} A failed transaction object or true
 */
async function addDonation(transaction, metaOwnerID, connection) {
    transaction.paymentID = BANK_NO_KID_ID

    if (transaction.KID != null) {
        let donationID;
        try {
            donationID = await DAO.donations.add(transaction.KID, BANK_NO_KID_ID, transaction.amount, transaction.date.toDate(), transaction.transactionID, metaOwnerID, connection)
        } catch (ex) {
            //If the donation already existed, ignore and keep moving
            if (ex.message.indexOf("EXISTING_DONATION") !== -1) {
                return {
                    reason: failed_reasons.existing,
                    transaction
                }
            }
            else {
                console.error("Failed to update DB for bank_custom donation with KID: " + transaction.KID)
                console.error(ex)

                return {
                    reason: ex.message,
                    transaction
                }
            }
        }

        try {
            if (config.env === 'production') {
                console.log(`Sending email for transaction with external id ${transaction.externalRef}`)
                if (metaOwnerID === 1) {
                    //Send special reciept if the donation is for the old effekt system
                    await mail.sendEffektDonationReciept(donationID);
                }
                else {
                    await mail.sendDonationReciept(donationID);
                }
                console.log(`Email sent for transaction with external id ${transaction.externalRef}`)
            }
        } catch (ex) {
            console.error(`Failed to send donation reciept for donation with ID ${donationID}`)
            console.error(ex)
        }
    } else  {
        return {
            reason: no_kid,
            transaction: transaction
        }
    }

    return true
}

const failed_reasons = {
    existing: "Existing donation",
    no_kid: "Could not find valid KID"
}