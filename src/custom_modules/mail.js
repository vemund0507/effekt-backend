const config = require('../config.js')
const DAO = require('./DAO.js')
const moment = require('moment')

const template = require('./template.js')

const request = require('request-promise-native')
const fs = require('fs-extra')


/**
 * Sends a donation reciept
 * @param {number} donationID
 * @param {string} reciever Reciever email
*/
async function sendDonationReciept(donationID, reciever = null) {
    try {
      var donation = await DAO.donations.getByID(donationID)
      if (!donation.email)  {
        console.error("No email provided for donation ID " + donationID)
        return false
      }
    } catch(ex) {
      console.error("Failed to send mail donation reciept, could not get donation by ID")
      console.error(ex)
      return false
    }

    try {
      var split = await DAO.distributions.getSplitByKID(donation.KID)
    } catch (ex) {
      console.error("Failed to send mail donation reciept, could not get donation split by KID")
      console.error(ex)
      return false
    }

    try {
      var hasReplacedOrgs = await DAO.donations.getHasReplacedOrgs(donationID)
    } catch(ex) {
      console.log(ex)
      return false
    }

    let organizations = formatOrganizationsFromSplit(split, donation.sum)

    try {
      await send({
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
            hasReplacedOrgs
        }
      })

      return true
    } catch(ex) {
      console.error("Failed to send donation reciept")
      console.error(ex)
      return ex.statusCode
    }
}

/**
 * Sends a donation reciept with notice of old system
 * @param {number} donationID
 * @param {string} reciever Reciever email
*/
async function sendEffektDonationReciept(donationID, reciever = null) {
    try {
        var donation = await DAO.donations.getByID(donationID)
        if (!donation.email)  {
          console.error("No email provided for donation ID " + donationID)
          return false
        }
    } catch(ex) {
        console.error("Failed to send mail donation reciept, could not get donation by ID")
        console.error(ex)
        return false
    }

    try {
        var split = await DAO.distributions.getSplitByKID(donation.KID)
    } catch (ex) {
        console.error("Failed to send mail donation reciept, could not get donation split by KID")
        console.error(ex)
        return false
    }

    try {
      var hasReplacedOrgs = await DAO.donations.getHasReplacedOrgs(donationID)
    } catch(ex) {
      console.log(ex)
      return false
    }

    let organizations = formatOrganizationsFromSplit(split, donation.sum)

    try {
        await send({
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
            hasReplacedOrgs
        }
        })

        return true
    } catch(ex) {
        console.error("Failed to send donation reciept")
        console.error(ex)
        return ex.statusCode
    }   
}

function decideUIPaymentMethod(donationMethod){
  if(donationMethod.toUpperCase() == 'BANK U/KID') {
    donationMethod = 'Bank'
  }

  return donationMethod
}

function formatOrganizationsFromSplit(split, sum) {
  return split.map(function(org) {
    var amount = sum * parseFloat(org.percentage_share) * 0.01
    var roundedAmount = (amount > 1 ? Math.round(amount) : 1)

    return {
      name: org.full_name,
      //Add thousand seperator regex at end of amount
      amount: (roundedAmount != amount ? "~ " : "") + roundedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "&#8201;"),
      percentage: parseFloat(org.percentage_share)
    }
  })
}

/** 
 * @param {number} KID 
*/
async function sendDonationRegistered(KID) {
    try {
      try {
        var donor = await DAO.donors.getByKID(KID)
      } catch(ex) {
        console.error("Failed to send mail donation reciept, could not get donor by KID")
        console.error(ex)
        return false
      }

      if (!donor) {
        console.error(`Failed to send mail donation reciept, no donors attached to KID ${KID}`)
        return false
      }

      try {
        var split = await DAO.distributions.getSplitByKID(KID)
      } catch(ex) {
        console.error("Failed to send mail donation reciept, could not get donation split by KID")
        console.error(ex)
        return false
      }

      let organizations = split.map(split => ({ name: split.full_name, percentage: parseFloat(split.percentage_share) }))

      var KIDstring = KID.toString()
      //Add seperators for KID, makes it easier to read
      KIDstring = KIDstring.substr(0,3) + " " + KIDstring.substr(3,2) + " " + KIDstring.substr(5,3)
  
      await send({
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
      })

      return true
    }
    catch(ex) {
        console.error("Failed to send mail donation registered")
        console.error(ex)
        return ex.statusCode
    }
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
async function sendDonationHistory(donorID) {
  let total = 0
    try {
      var donationSummary = await DAO.donations.getSummary(donorID)
      var yearlyDonationSummary = await DAO.donations.getSummaryByYear(donorID)
      var donationHistory = await DAO.donations.getHistory(donorID)
      var donor = await DAO.donors.getByID(donationSummary[donationSummary.length - 1].donorID)
      var email = donor.email
      var dates = []
      var templateName;

      if (!email)  {
        console.error("No email provided for donor ID " + donorID)
        return false
      } 

      if(donationHistory.length == 0) {
        templateName = "noDonationHistory"
      }
      else { 
        templateName = "donationHistory"
        for (let i = 0; i < donationHistory.length; i++) {
          let month = donationHistory[i].date.getMonth()+1
          let dateFormat = donationHistory[i].date.getDate().toString() + "/" + month.toString() + "/" + donationHistory[i].date.getFullYear().toString()
          dates.push(dateFormat)  
        }

        for (let i = 0; i < donationSummary.length - 1; i++) {
          total += donationSummary[i].sum;
        }
      }

      // Formatting all currencies

      yearlyDonationSummary.forEach((obj) => {
        obj.yearSum = formatCurrency(obj.yearSum);
      })

      donationSummary.forEach((obj) => {
        obj.sum = formatCurrency(obj.sum);
      })

      donationHistory.forEach((obj) => {
        obj.distributions.forEach((distribution) => {
          distribution.sum = formatCurrency(distribution.sum);
        })
      })

      total = formatCurrency(total);
      
    } catch(ex) {
      console.error("Failed to send donation history, could not get donation by ID")
      console.error(ex)
      return false
    }

    try {
      await send({
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
      })

      return true
    } catch(ex) {
      console.error("Failed to send donation history")
      console.error(ex)
      return ex.statusCode
    }
}

/**
 * Sends donors confirmation of their tax deductible donation for a given year
 * @param {TaxDeductionRecord} taxDeductionRecord 
 * @param {number} year The year the tax deductions are counted for
 */
async function sendTaxDeductions(taxDeductionRecord, year) {
  
  try {
    await send({
      reciever: taxDeductionRecord.email,
      subject: `gieffektivt.no - Årsoppgave, skattefradrag donasjoner ${year}`,
      templateName: "taxDeduction",
      templateData: { 
          header: "Hei " + taxDeductionRecord.firstname + ",",
          donationSum: taxDeductionRecord.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "&#8201;"),
          fullname: taxDeductionRecord.fullname,
          ssn: taxDeductionRecord.ssn,
          year: year.toString(),
          nextYear: (year+1).toString()
      }
    })

    return true
  } catch(ex) {
    console.error("Failed to tax deduction mail")
    console.error(ex)
    return ex.statusCode
  }
}

/**
 * Sends OCR file for backup
 * @param {Buffer} fileContents 
 */
async function sendOcrBackup(fileContents) {
  var data = {
    from: 'gieffektivt.no <donasjon@gieffektivt.no>',
    to: 'hakon.harnes@effektivaltruisme.no',
    bcc: "donasjon@gieffektivt.no",
    subject: 'OCR backup',
    text: fileContents.toString(),
    inline: []
  }

  let result = await request.post({
    url: 'https://api.mailgun.net/v3/mg.stiftelseneffekt.no/messages',
    auth: {
        user: 'api',
        password: config.mailgun_api_key
    },
    formData: data,
    resolveWithFullResponse: true
  })
  if(result.statusCode === 200) {
    return true
  } else {
    return false
  }
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
async function send(options) {
    const templateRoot = appRoot + '/views/mail/' + options.templateName

    var templateRawHTML = await fs.readFile(templateRoot + "/index.html", 'utf8')
    var templateHTML = template(templateRawHTML, options.templateData)

    var data = {
        from: 'gieffektivt.no <donasjon@gieffektivt.no>',
        to: options.reciever,
        bcc: "donasjon@gieffektivt.no",
        subject: options.subject,
        text: 'Your mail client does not support HTML email',
        html: templateHTML,
        inline: []
    }

    var filesInDir = await fs.readdir(templateRoot + "/images/")
    for (var i = 0; i < filesInDir.length; i++) {
        data.inline.push(fs.createReadStream(templateRoot + "/images/" + filesInDir[i]))
    }

    //Exceptions bubble up
    let result = await request.post({
        url: 'https://api.mailgun.net/v3/mg.stiftelseneffekt.no/messages',
        auth: {
            user: 'api',
            password: config.mailgun_api_key
        },
        formData: data,
        resolveWithFullResponse: true
    })
    if(result.statusCode === 200) {
      return true
    } else {
      return false
    }
}

module.exports = {
  sendDonationReciept,
  sendEffektDonationReciept,
  sendDonationRegistered,
  sendDonationHistory,
  sendTaxDeductions,
  sendOcrBackup
}