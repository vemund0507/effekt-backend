const sqlString = require('sqlstring')

var con

//region Get
/**
 * Gets all donations, ordered by the specified column, limited by the limit, and starting at the specified cursor
 * @param {id: string, desc: boolean | null} sort If null, don't sort
 * @param {string | number | Date} cursor Used for pagination
 * @param {number=10} limit Defaults to 10
 * @returns {[Array<IDonation & donorName: string>, nextcursor]} An array of donations pluss the donorname
 */
async function getAll(sort, page, limit = 10) {
    try {
        if (sort) {
            const sortColumn = jsDBmapping.find((map) => map[0] === sort.id)[1]

            const [donations] = await con.query(`SELECT 
                    Donations.ID,
                    Donors.full_name,
                    Payment.payment_name,
                    Donations.sum_confirmed,
                    Donations.transaction_cost,
                    Donations.KID_fordeling,
                    Donations.timestamp_confirmed
                FROM Donations
                INNER JOIN Donors
                    ON Donations.Donor_ID = Donors.ID
                INNER JOIN Payment
                    ON Donations.Payment_ID = Payment.ID
                ORDER BY ${sortColumn}
                ${sort.desc ? 'DESC' : ''} 
                LIMIT ? OFFSET ?`, [limit, page*limit])

            const [counter] = await con.query(`SELECT COUNT(*) as count FROM Donations`)
            const pages = parseInt(counter[0].count / limit)

            return {
                rows: mapToJS(donations),
                pages
            }
        }
    } catch(ex) {
        throw ex
    }
}

const jsDBmapping = [
    ["id",              "ID"],
    ["donor",           "full_name"],
    ["paymentMethod",   "payment_name"],
    ["sum",             "sum_confirmed"],
    ["transactionCost", "transaction_cost"],
    ["kid",             "KID_fordeling"],
    ["timestamp",       "timestamp_confirmed"]
]

const mapToJS = (obj) => obj.map((donation) => {
    var returnObj = {}
    jsDBmapping.forEach((map) => {
        returnObj[map[0]] = donation[map[1]]
    })
    return returnObj
})

/**
 * Gets aggregate donations from a spesific time period
 * @param {Date} startTime 
 * @param {Date} endTime
 * @returns {Array} Returns an array of organizations names and their aggregate donations
 */
function getAggregateByTime(startTime, endTime) {
    return new Promise(async (fulfill, reject) => {
        try {
            var [getAggregateQuery] = await con.query("CALL `get_aggregate_donations_by_period`(?, ?)", [startTime, endTime])
            return fulfill(getAggregateQuery[0])
        } catch(ex) {
            return reject(ex)
        }
    })
}

function KIDexists(KID) {
    return new Promise(async (fulfill, reject) => {
        try {
            var [res] = await con.query("SELECT * FROM Combining_table WHERE KID = ? LIMIT 1", [KID])
        } catch(ex) {
            return reject(ex)
        }

        if (res.length > 0) fulfill(true)
        else fulfill(false)
    })
}

function ExternalPaymentIDExists(externalPaymentID, paymentID) {
    return new Promise(async (fulfill, reject) => {
        try {
            var [res] = await con.query("SELECT * FROM Donations WHERE PaymentExternal_ID = ? AND Payment_ID = ? LIMIT 1", [externalPaymentID, paymentID])
        } catch(ex) {
            return reject(ex)
        }

        if (res.length > 0) fulfill(true)
        else fulfill(false)
    })
}

function getKIDbySplit(split, donorID) {
    return new Promise(async (fulfill, reject) => {
        let KID = null
        //Check if existing KID
        try {
            //Construct query
            let query = `
            SELECT 
                KID, 
                Count(KID) as KID_count 
                
            FROM EffektDonasjonDB.Distribution as D
                INNER JOIN Combining_table as C 
                    ON C.Distribution_ID = D.ID
            
            WHERE
            `;
            
            for (let i = 0; i < split.length; i++) {
                query += `(OrgID = ${sqlString.escape(split[i].organizationID)} AND percentage_share = ${sqlString.escape(split[i].share)} AND Donor_ID = ${sqlString.escape(donorID)})`
                if (i < split.length-1) query += ` OR `
            }

            query += ` GROUP BY C.KID
            
            HAVING 
                KID_count = ` + split.length

            var [res] = await con.execute(query)
        } catch(ex) {
            return reject(ex)
        }

        if (res.length > 0) fulfill(res[0].KID)
        else fulfill(null)
    })
}

function getByID(donationID) {
    return new Promise(async (fulfill, reject) => {
        try {
            var [getDonationFromIDquery] = await con.query(`
                SELECT 
                    Donation.ID,
                    Donation.sum_confirmed, 
                    Donation.KID_fordeling,
                    Donation.transaction_cost,
                    Donation.timestamp_confirmed,
                    Donor.full_name,
                    Donor.email,
                    Payment.payment_name
                
                FROM Donations as Donation
                    INNER JOIN Donors as Donor
                        ON Donation.Donor_ID = Donor.ID

                    INNER JOIN Payment
                        ON Donation.Payment_ID = Payment.ID
                
                WHERE 
                    Donation.ID = ?`, [donationID])


            if (getDonationFromIDquery.length != 1) reject(new Error("Could not find donation with ID " + donationID))

            let dbDonation = getDonationFromIDquery[0]

            let donation = {
                id: dbDonation.ID,
                donor: dbDonation.full_name,
                sum: dbDonation.sum_confirmed,
                transactionCost: dbDonation.transaction_cost,
                timestamp: dbDonation.timestamp_confirmed,
                method: dbDonation.payment_name,
                KID: dbDonation.KID_fordeling
            }

            //TODO: Standardize split object form
            let split = await getSplitByKID(donation.KID)
            donation.distribution = split.map((split) => ({
                abbriv: split.abbriv,
                share: split.percentage_share
            }))

            return fulfill(donation)
        } catch(ex) {
            return reject(ex)
        }
    })
}

function getSplitByKID(KID) {
    return new Promise(async (fulfill, reject) => {
        try {
            let [result] = await con.query(`
                SELECT 
                    Organizations.full_name,
                    Organizations.abbriv, 
                    Distribution.percentage_share
                
                FROM Combining_table as Combining
                    INNER JOIN Distribution as Distribution
                        ON Combining.Distribution_ID = Distribution.ID
                    INNER JOIN Organizations as Organizations
                        ON Organizations.ID = Distribution.OrgID
                
                WHERE 
                    KID = ?`, [KID])

            if (result.length == 0) return reject(new Error("No distribution with the KID " + KID))

            return fulfill(result)
        } catch(ex) {
            reject(ex)
        }
    })
}

/**
 * Fetches all the donations in the database for a given inclusive range. If passed two equal dates, returns given day.
 * @param {Date} [fromDate=1. Of January 2000] The date in which to start the selection, inclusive interval.
 * @param {Date} [toDate=Today] The date in which to end the selection, inclusive interval.
 * @param {Array<Integer>} [paymentMethodIDs=null] Provide optional PaymentMethodID to filter to a payment method
 */
function getFromRange(fromDate, toDate, paymentMethodIDs = null) {
    return new Promise(async (fulfill, reject) => {
        try {
            if (!fromDate) fromDate = new Date(2000,0, 1)
            if (!toDate) toDate = new Date()

                let [getFromRangeQuery] = await con.query(`
                    SELECT 
                        Donations.ID as Donation_ID,
                        Donations.timestamp_confirmed,  
                        Donations.Donor_ID, 
                        Donations.transaction_cost,
                        Donors.full_name as donor_name, 
                        Donations.sum_confirmed, 
                        Payment.payment_name,
                        Distribution.OrgID as Org_ID, 
                        Organizations.full_name as org_name, 
                        Distribution.percentage_share, 
                        (Donations.sum_confirmed*Distribution.percentage_share)/100 as actual_share 

                    FROM Donations
                        INNER JOIN Combining_table 
                            ON Donations.KID_fordeling = Combining_table.KID
                        INNER JOIN Distribution 
                            ON Combining_table.Distribution_ID = Distribution.ID
                        INNER JOIN Donors 
                            ON Donors.ID = Donations.Donor_ID
                        INNER JOIN Organizations 
                            ON Organizations.ID = Distribution.OrgID
                        INNER JOIN Payment
                            ON Payment.ID = Donations.Payment_ID
                    
                    WHERE 
                        Donations.timestamp_confirmed >= Date(?)  
                        AND 
                        Donations.timestamp_confirmed < Date(Date_add(Date(?), interval 1 day))
                    ${(paymentMethodIDs != null ? `
                        AND
                        Donations.Payment_ID IN (?)
                    ` : '')}
                    `, [fromDate, toDate, paymentMethodIDs])

                let donations = new Map()
                getFromRangeQuery.forEach((row) => {
                    if(!donations.get(row.Donation_ID)) donations.set(row.Donation_ID, {
                        ID: null,
                        time: null,
                        name: null,
                        donorID: null,
                        sum: null,
                        paymentMethod: null,
                        transactionCost: null,
                        split: []
                    })

                    donations.get(row.Donation_ID).ID = row.Donation_ID
                    donations.get(row.Donation_ID).time = row.timestamp_confirmed
                    donations.get(row.Donation_ID).name = row.donor_name
                    donations.get(row.Donation_ID).donorID = row.Donor_ID
                    donations.get(row.Donation_ID).sum = row.sum_confirmed
                    donations.get(row.Donation_ID).paymentMethod = row.payment_name
                    donations.get(row.Donation_ID).transactionCost = row.transaction_cost

                    donations.get(row.Donation_ID).split.push({
                        id: row.Org_ID,
                        name: row.org_name,
                        percentage: row.percentage_share,
                        amount: row.actual_share
                    })
                })

                donations = [...donations.values()].sort((a,b) => a.time - b.time)

                fulfill(donations)
        } catch(ex) {
            reject(ex)
        }
    })
}

/**
 * Gets KIDs from historic paypal donors, matching them against a ReferenceTransactionId
 * @param {Array} transactions A list of transactions that must have a ReferenceTransactionId 
 * @returns {Object} Returns an object with referenceTransactionId's as keys and KIDs as values
 */
function getHistoricPaypalSubscriptionKIDS(referenceIDs) {
    return new Promise(async (fulfill, reject) => {
        try {
            let [res] = await con.query(`SELECT 
                ReferenceTransactionNumber,
                KID 
                
                FROM Paypal_historic_distributions 

                WHERE 
                    ReferenceTransactionNumber IN (?);`, [referenceIDs])

            let mapping = res.reduce((acc, row) => {
                acc[row.ReferenceTransactionNumber] = row.KID
                return acc
            }, {})

            fulfill(mapping)
        } catch(ex) {
            reject(ex)
            return false
        }
    })
}


//endregion

//region Add
function addSplit(split, KID, donorID) {
    return new Promise(async (fulfill, reject) => {
        try {
            var transaction = await con.startTransaction()

            let distribution_table_values = split.map((item) => {return [item.organizationID, item.share]})
            var res = await transaction.query("INSERT INTO Distribution (OrgID, percentage_share) VALUES ?", [distribution_table_values])

            let first_inserted_id = res[0].insertId
            var combining_table_values = Array.apply(null, Array(split.length)).map((item, i) => {return [donorID, first_inserted_id+i, KID]})

            //Update combining table
            var res = await transaction.query("INSERT INTO Combining_table (Donor_ID, Distribution_ID, KID) VALUES ?", [combining_table_values])

            con.commitTransaction(transaction)
            fulfill(true)
        } catch(ex) {
            con.rollbackTransaction(transaction)
            reject(ex)
        }
    })
}

/**
 * Adds a donation to the database
 * 
 * @param {Number} KID 
 * @param {Number} paymentMethodID 
 * @param {Number} sum The gross amount of the donation (net amount is calculated in the database)
 * @param {Date} [registeredDate=null] Date the transaction was confirmed
 * @param {String} [externalPaymentID=null] Used to track payments in external payment systems (paypal and vipps ex.)
 */
function add(KID, paymentMethodID, sum, registeredDate = null, externalPaymentID = null) {
    return new Promise(async (fulfill, reject) => {
        try {
            var [donorIDQuery] = await con.query("SELECT Donor_ID FROM Combining_table WHERE KID = ? LIMIT 1", [KID])

            if (donorIDQuery.length != 1) { 
                reject(new Error("NO_KID | KID " + KID + " does not exist"));
                return false;
            }

            /*  External transaction ID can be passed to prevent duplicates.
                For example if you upload the same vipps report multiple
                times, we must check the vipps transaction ID against the
                stored ones in the database, to ensure that we are not creating
                a duplicate donation. */
            if (externalPaymentID != null) {
                if (await ExternalPaymentIDExists(externalPaymentID,paymentMethodID)) {
                    reject(new Error("EXISTING_DONATION | Already a donation with ExternalPaymentID " + externalPaymentID + " and PaymentID " + paymentMethodID))
                    return false
                }
            }

            var donorID = donorIDQuery[0].Donor_ID

            var [addDonationQuery] = await con.query("INSERT INTO Donations (Donor_ID, Payment_ID, PaymentExternal_ID, sum_confirmed, timestamp_confirmed, KID_fordeling) VALUES (?,?,?,?,?,?)", [donorID, paymentMethodID, externalPaymentID, sum, registeredDate, KID])

            return fulfill(addDonationQuery.insertId)
        } catch(ex) {
            return reject(ex)
        }
    })
}
//endregion

//region Modify
function registerConfirmedByIDs(IDs) {
    return new Promise(async (fulfill, reject) => {
        try {
            var [donations] = await con.execute(`UPDATE EffektDonasjonDB.Donations 
                SET date_confirmed = NOW()
                WHERE 
                ID IN (` + ("?,").repeat(IDs.length).slice(0,-1) + `)`, IDs)
        }
        catch(ex) {
            reject(ex)
        }

        fulfill()
    })
}
//endregion

//region Delete

//endregion

//region Helpers

//endregion

module.exports = {
    getAll,
    getByID,
    getAggregateByTime,
    getKIDbySplit,
    getFromRange,
    getHistoricPaypalSubscriptionKIDS,
    KIDexists,
    ExternalPaymentIDExists,
    addSplit,
    add,
    registerConfirmedByIDs,

    setup: (dbPool) => { con = dbPool }
}