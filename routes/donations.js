const config = require('../config')

const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const urlEncodeParser = bodyParser.urlencoded({ extended: true })
const apicache = require('apicache')
const cache = apicache.middleware
const authMiddleware = require('../custom_modules/authorization/authMiddleware')
const multer = require('multer')
const upload = multer({dest: 'tmp/csv'})

const authRoles = require('../enums/authorizationRoles')
const methods = require('../enums/methods')

const DAO = require('../custom_modules/DAO.js')
const mail = require('../custom_modules/mail')
const vipps = require('../custom_modules/vipps')
const dateRangeHelper = require('../custom_modules/dateRangeHelper')
const donationHelpers = require('../custom_modules/donationHelpers')
const rateLimit = require('express-rate-limit')
const historicParser = require('../custom_modules/parsers/historic_donations')
const moment = require('moment')

router.post("/register", async (req,res,next) => {
  if (!req.body) return res.sendStatus(400)
  let parsedData = req.body

  let donationOrganizations = parsedData.organizations
  let donor = parsedData.donor
  let initiatedOrder = null

  try {
    var donationObject = {
      KID: null, //Set later in code
      method: parsedData.method,
      donorID: null, //Set later in code
      amount: parsedData.amount,
      standardSplit: undefined,
      split: []
    }

    //Create a donation split object
    if (donationOrganizations) {
      donationObject.split = await donationHelpers.createDonationSplitArray(donationOrganizations)
      donationObject.standardSplit = false
    }
    else {
      donationObject.split = await donationHelpers.getStandardSplit()
      donationObject.standardSplit = true
    }

    //Check if existing donor
    donationObject.donorID = await DAO.donors.getIDbyEmail(donor.email)

    if (donationObject.donorID == null) {
      //Donor does not exist, create donor
      donationObject.donorID = await DAO.donors.add(donor.email, donor.name, donor.ssn, donor.newsletter)
    }
    else {
      //Check for existing SSN if provided
      if (typeof donor.ssn !== "undefined" && donor.ssn != null) {
        dbDonor = await DAO.donors.getByID(donationObject.donorID)

        if (dbDonor.ssn == null) {
          //No existing ssn found, updating donor
          await DAO.donors.updateSsn(donationObject.donorID, donor.ssn)
        }
      }

      //Check if registered for newsletter
      if (typeof donor.newsletter !== "undefined" && donor.newsletter != null) {
        dbDonor = await DAO.donors.getByID(donationObject.donorID)
        if (dbDonor.newsletter == null || dbDonor.newsletter == 0) {
          //Not registered for newsletter, updating donor
          await DAO.donors.updateNewsletter(donationObject.donorID, donor.newsletter)
        }
      }
    }
    //Try to get existing KID
    donationObject.KID = await DAO.distributions.getKIDbySplit(donationObject.split, donationObject.donorID)

    //Split does not exist create new KID and split
    if (donationObject.KID == null) {
      donationObject.KID = await donationHelpers.createKID()
      await DAO.distributions.add(donationObject.split, donationObject.KID, donationObject.donorID)
    }
    
    //Get external paymentprovider URL
    if (donationObject.method == methods.VIPPS) {
      initiatedOrder = await vipps.initiateOrder(donationObject.KID, donationObject.amount)
      //Start polling for updates
      await vipps.pollOrder(initiatedOrder.orderId)
    }

    try {
      await DAO.initialpaymentmethod.addPaymentIntent(donationObject.KID, donationObject.method)  
    } catch (error) {
      console.error(error)
    }
  
  }

  catch (ex) {
    return next(ex)
  }

  try {
    var hasAnsweredReferral = await DAO.referrals.getDonorAnswered(donationObject.donorID)
  } catch(ex) {
    console.error(`Could not get whether donor answered referral for donorID ${donationObject.donorID}`)
    var hasAnsweredReferral = false
  }

  res.json({
    status: 200,
    content: {
      KID: donationObject.KID,
      donorID: donationObject.donorID,
      hasAnsweredReferral,
      paymentProviderUrl: (initiatedOrder !== null ? initiatedOrder.externalPaymentUrl : "")
    }
  })
})

router.post("/bank/pending", urlEncodeParser, async (req,res,next) => {
  let parsedData = JSON.parse(req.body.data)

  if(config.env === "production")
    var success = await mail.sendDonationRegistered(parsedData.KID)
  else
    var success = true

  if (success) res.json({ status: 200, content: "OK" })
  else res.status(500).json({ status: 500, content: "Could not send bank donation pending email" })
})

router.post("/confirm", 
  authMiddleware(authRoles.write_all_donations),
  urlEncodeParser,
  async (req, res, next) => {
  try {
    let sum = Number(req.body.sum)
    let timestamp = new Date(req.body.timestamp);
    let KID = Number(req.body.KID)
    let methodId = Number(req.body.paymentId)
    let externalRef = req.body.paymentExternalRef
    let metaOwnerID = req.body.metaOwnerID

    let donationID = await DAO.donations.add(KID, methodId, sum, timestamp, externalRef, metaOwnerID)

    if (config.env === "production" && req.body.reciept === true) 
      await mail.sendDonationReciept(donationID)

    res.json({
      status: 200,
      content: "OK"
    })
  } catch(ex) {
    next(ex)
  }
})

router.get("/total", async (req, res, next) => {
  try {
    let dates = dateRangeHelper.createDateObjectsFromExpressRequest(req)

    let aggregate = await DAO.donations.getAggregateByTime(dates.fromDate, dates.toDate)

    res.json({
      status: 200,
      content: aggregate
    })
  } catch(ex) {
    next(ex)
  }
})

router.get("/median", cache("5 minutes"), async (req, res, next) => {
  try {
    let dates = dateRangeHelper.createDateObjectsFromExpressRequest(req)

    let median = await DAO.donations.getMedianFromRange(dates.fromDate, dates.toDate)

    if (median == null) {
      return res.json({
        status: 404,
        content: "No donations found in range"
      })
    }

    res.json({
      status: 200,
      content: median
    })
  } catch(ex) {
    next(ex)
  }
})

router.post("/", authMiddleware(authRoles.read_all_donations), async(req, res, next) => {
  try {
    var results = await DAO.donations.getAll(req.body.sort, req.body.page, req.body.limit, req.body.filter)
    return res.json({ 
      status: 200, 
      content: {
        rows: results.rows,
        pages: results.pages
      }
    })
  } catch(ex) {
    next(ex)
  }
})

router.get("/histogram", async (req,res,next) => {
  try {
    let buckets = await DAO.donations.getHistogramBySum()

    res.json({
      status: 200,
      content: buckets
    })
  } catch(ex) {
    next(ex)
  }
})

router.get("/:id", authMiddleware(authRoles.read_all_donations), async (req,res,next) => {
  try {
    var donation = await DAO.donations.getByID(req.params.id)

    return res.json({
      status: 200,
      content: donation
    })
  } catch (ex) {
    next(ex)
  }
})

router.delete("/:id", authMiddleware(authRoles.write_all_donations), async (req,res,next) => {
  try {
    var removed = await DAO.donations.remove(req.params.id)

    if (removed) {
      return res.json({
        status: 200,
        content: removed
      })
    } 
    else {
      throw new Error("Could not remove donation")
    }
  } catch (ex) {
    next(ex)
  }
})

router.post("/receipt", authMiddleware(authRoles.write_all_donations), async (req, res, next) => {
  let donationID = req.body.donationID

  if (req.body.email && req.body.email.indexOf("@") > -1) {
    var mailStatus = await mail.sendDonationReciept(donationID, req.body.email)
  } else {
    var mailStatus = await mail.sendDonationReciept(donationID)
  }

  if (mailStatus === true) { 
    res.json({
      status: 200,
      content: `Reciept sent for donation id ${donationID} to donor ID {}`
    }) 
  }
  else {
    res.json({
      status: 500,
      content: `Reciept failed with error code ${mailStatus}`
    })
  }
})

router.post("/reciepts", authMiddleware(authRoles.write_all_donations) ,async (req,res,next) => {
  let donationIDs = req.body.donationIDs

  try {
    for (let i = 0; i < donationIDs.length; i++) {
      let donationID = donationIDs[i];

      var mailStatus = await mail.sendDonationReciept(donationID)

      if (mailStatus == false)
        console.error(`Failed to send donation for donationID ${donationID}`)
    }

    res.json({
      status: 200,
      content: "OK"
    })
  } catch(ex) {
    next(ex)
  }
})

router.get("/summary/:donorID", authMiddleware(authRoles.read_all_donations), async (req, res, next) => {
  try {
      var summary = await DAO.donations.getSummary(req.params.donorID)

      res.json({
          status: 200,
          content: summary
      })
  }
  catch(ex) {
      next(ex)
  }
})

router.get("/history/:donorID", authMiddleware(authRoles.read_all_donations), async (req, res, next) => {
  try {
      var history = await DAO.donations.getHistory(req.params.donorID)

      res.json({
          status: 200,
          content: history
      })
  }
  catch(ex) {
      next(ex)
  }
})

let historyRateLimit = new rateLimit({
    windowMs: 60*1000*60, // 1 hour
    max: 5,
    delayMs: 0 // disable delaying - full speed until the max limit is reached 
  })
router.post("/history/email", historyRateLimit, async (req, res, next) => {
  try {
    let email = req.body.email
    let id = await DAO.donors.getIDbyEmail(email)
    
    if (id != null) {
      var mailsent = await mail.sendDonationHistory(id)
      if (mailsent) {
        res.json({
            status: 200,
            content: "ok"
        })
      }
    } else {
      res.json({
        status: 200,
        content: "ok"
      })
    }
  }
  catch(ex) {
      next(ex)
  }
})

router.post("/history/register",
  upload.single('historic_donations'),
  authMiddleware(authRoles.write_all_donations),
  // urlEncodeParser,
  async (req, res, next) => {
    try {
      // Respond with bad request status code if no file was included in the request
      if (!req.files && !req.files.historic_donations) return res.sendStatus(400)
      console.log(req.files.historic_donations, req.body)

      let parsedData = historicParser.parseHistoric(req.files.historic_donations.data)
      console.log(parsedData)
      let successes = []
      let failures = []

      const organizaitons = await DAO.organizations.getAll()

      for (let donation of parsedData) {
        console.log(donation.name, donation.email)
        var donorID
        if (donation.email != '' && donation.email != null) {
          const emailIDResult = await DAO.donors.getIDbyEmail(donation.email)
          console.log(`Email ID: ${emailIDResult}`)
          if (emailIDResult != null) {
            console.log('ID found by email')
            donorID = emailIDResult
            successes.push(donation)
          }
        }

        if (!donorID && donation.name != '' && donation.name != null) {
          const nameSearch = await DAO.donors.exact_name_search(donation.name)
          console.log(`Name search: ${nameSearch}`)
          if (nameSearch != null) {
            if (nameSearch.length == 1) {
              console.log('One ID found by name search')
              console.log(nameSearch[0])
              donorID = nameSearch[0].id
              successes.push(donation)
            } else {
              console.log('More than one ID found by name search')
              failures.push(donation)
              for (let value of nameSearch) {
                console.log(value)
              }
            }
          }
        }

        if (donorID) {
          var donationExists = false
          // Check if donation exists
          var donationHistory = await DAO.donations.getHistory(donorID)
          for (var existingDonation of donationHistory) {
            console.log(existingDonation)
            if (existingDonation.date.toISOString().slice(0, 11) == donation.date) {
              console.log(`Donation on date ${donation.date} already exists`)
              donationExists = true
            }
          }
          
          if (!donationExists) {
            // Create donation split array to look up or create KID
            // Map from parsed data from spreadsheet to organisation IDs
            var split = await donationHelpers.createDonationSplitArray()

            // Fetch or create KID
            var KID = DAO.distributions.getKIDbySplit(split, donorID)
            DAO.donations.add()
          }
        }
        

        failures.push(donation)
      }

      // TODO: Check if the specific donation exists already
      // TODO: (Possibly) check if the distibution matches for same day donations
      // TODO: Explain why failed donations failed 
      // TODO: 

      res.json({
        status: 200,
        content: {
          success: successes,
          failures: failures
        }
      })
    }

    catch(ex) {
      next(ex)
    }
})

module.exports = router
