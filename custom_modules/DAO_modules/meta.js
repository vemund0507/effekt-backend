var pool

//region Get

/**
 * @typedef DataOwner 
 * @prop {Number} id
 * @prop {String} name
 * @prop {Boolean} default
 */

/**
 * Gets the diferent data owner actors from the DB
 * @returns {Array<DataOwner>} An array of DataOwner objects
 */
async function getDataOwners() {
    var [res] = await con.query(`SELECT * FROM Data_owner`)
    return res.map((owner) => ({ 
            id: owner.ID,
            name: owner.owner,
            default: (owner.default == 1 ? true : false)
        })
    )
}

/**
 * Gets the default owner ID from the DB
 * @returns {Number} The default owner ID
 * @param {import('mysql2/promise').PromisePoolConnection | null} [connection=null] A reused connection. If not provided, will create connection and release it when done.
 */
async function getDefaultOwnerID(connection) {
    try {
        var con = connection ?? await pool.getConnection()
        var [res] = await con.query('SELECT ID FROM Data_owner WHERE `default` = 1')
        
        //Only release connection if it was not provided as an argument
        if (connection == null)
            con.release()

        return res[0].ID
    }
    catch(ex) {
        //Only release connection if it was not provided as an argument
        if (connection == null)
            con.release()

        throw ex
    }
}

//endregion

//region Add

//endregion

//region Modify

//endregion

//region Delete
//endregion

module.exports = {
    getDataOwners,
    getDefaultOwnerID,

    setup: (dbPool) => { pool = dbPool }
}