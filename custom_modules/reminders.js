const DAO = require('./DAO.js')
const KID = require('./KID.js')
const mail = require('./mail')

/**
 * Checks if a distribution with the old KID
 * structure (8 digits) exists as an agreement
 * @param {string} oldKID The comparison KID used for bank transfers
 * @returns {boolean} Wether the comparison KID exists as a avtalegiro agreement
 */
async function checkIfAgreementExists(oldKID) {
  console.log(oldKID)

  const donor = await DAO.donors.getByKID(oldKID)
  const agreements = await DAO.avtalegiroagreements.getByDonor(donor.id)

  if (agreements.length == 0)
    return false

  let distribution = await DAO.distributions.getSplitByKID(oldKID)
  distribution = distribution.sort((a,b) => a.ID - b.ID)
  agreementLoop:
  for (let i = 0; i < agreements.length; i++) {
    let compareDist = await DAO.distributions.getSplitByKID(agreements[i].KID)
    if (distribution.length !== compareDist.length)
      continue

    compareDist = compareDist.sort((a,b) => a.ID - b.ID)

    for (let j = 0; j < distribution.length; j++) {
      if (distribution[i].ID != compareDist[i].ID)
        continue agreementLoop
      if (distribution[i].percentage_share != compareDist[i].percentage_share)
        continue agreementLoop
    }

    return true
  }
  return false
}

/**
 * Duplicates a distribution with a new KID
 * @param {string} oldKID
 * @returns {string} The KID of the duplicated distribution
 */
async function duplicateDistribution(oldKID) {
  const donor = await DAO.donors.getByKID(oldKID)
  const split = await DAO.distributions.getSplitByKID(oldKID)
  const newKID = KID.generate(15, donor.id)
  await DAO.distributions.add(split, newKID, donor.id)
  return newKID
}

/**
 * Sends a mail to donors that have been repeat donors
 * on Bank U/KID. The previous reminder limit specifies
 * the selection criteria for which of them to email / remind.
 * That is, if we have sent a reminder previously, should we 
 * remind them again? This is an integer limit. For example,
 * if we wish to only remind people who have not been reminded
 * before, set this value to 0. If we want to include people
 * we have reminded once before, set it to 1. Etc.
 * @param {number} previousReminderLimit 
 */
async function sendReminders(previousReminderLimit = 0) {
  //TODO Previous reminder limit
  const recurringKIDs = await DAO.donations.getRecurringNoKidDonations()
  for (let i = 0; i < recurringKIDs.length; i++) {
    const recurringKID = recurringKIDs[i]

    if (await checkIfAgreementExists(recurringKID.KID))
      continue
    
    let newKID = await duplicateDistribution(recurringKID.KID)

    await mail.sendAvtalegiroConversionCall(newKID, recurringKID.sum, recurringKID.donorName)
  }
}

module.exports = {
  checkIfAgreementExists,
  duplicateDistribution,
  sendReminders
}