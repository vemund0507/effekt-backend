const sinon = require('sinon');
const chai = require('chai');
const DAO = require('../custom_modules/DAO');
const KID = require('../custom_modules/KID')
const mail = require('../custom_modules/mail')
const reminder = require('../custom_modules/reminders')
const expect = (chai.expect);

const donorStub = sinon.stub(DAO.donors, 'getByKID')
const agreementsStub = sinon.stub(DAO.avtalegiroagreements, 'getByDonor')
const splitStub = sinon.stub(DAO.distributions, 'getSplitByKID')
const recurringStub = sinon.stub(DAO.donations, 'getRecurringNoKidDonations')
const mailStub = sinon.stub(mail, 'sendAvtalegiroConversionCall')
const duplicateStub = sinon.stub(reminder, 'duplicateDistribution')

const oldKID = '12345678';
const donor = { id: 1, name: 'Håkon Harnes', email: 'account@harnes.me' }
const agreemnts = [
  { ID: 1, KID: '00000122345678', amount: 400, paymentDay: 6, notice: true, active: true },
  { ID: 1, KID: '00000132345678', amount: 1200, paymentDay: 12, notice: false, active: true },
  { ID: 1, KID: '00000142345678', amount: 200, paymentDay: 24, notice: false, active: false },
]

const recurringDonations = [
  { donorID: 1, KID: '12345678', numDonations: 8, donorName: 'Håkon Harnes', latestSum: 200 },
  { donorID: 2, KID: '22345678', numDonations: 12, donorName: 'Elise Hansen', latestSum: 20000 },
  { donorID: 3, KID: '32345678', numDonations: 3, donorName: 'Kraugstad Klokkesen', latestSum: 120 },
]

beforeEach(() => {
  donorStub.reset()
  agreementsStub.reset()
  splitStub.reset()
  recurringStub.reset()
})

describe('Recurring bank donor avtalegiro reminder', () => {
  describe('Check for existing agreements', () => {
    it('returns false if no agreements', async() => {
      donorStub.withArgs(oldKID).resolves(donor)
      agreementsStub.withArgs(1).resolves([])
  
      expect(await reminder.checkIfAgreementExists(oldKID)).to.be.false
      expect(donorStub.called).to.be.true
      expect(agreementsStub.called).to.be.true
      expect(splitStub.called).to.be.false
    })
  
    it('returns false if agreement does not exist', async() => {
      donorStub.withArgs(oldKID).resolves(donor)
      agreementsStub.withArgs(1).resolves([agreemnts[0]])
  
      splitStub.withArgs(oldKID).resolves([splitItem.amf(30), splitItem.sci(30), splitItem.givewell(40)])
      splitStub.withArgs(agreemnts[0].KID).resolves([splitItem.amf(100)])
  
      expect(await reminder.checkIfAgreementExists(oldKID)).to.be.false
      expect(donorStub.called).to.be.true
      expect(agreementsStub.called).to.be.true
      expect(splitStub.called).to.be.true
    })
  
    it('returns true if existing agreement does exists', async () => {
      donorStub.withArgs(oldKID).resolves(donor)
      agreementsStub.withArgs(1).resolves(agreemnts)
  
      //These match but have different ordering
      splitStub.withArgs(oldKID).resolves([splitItem.amf(30), splitItem.sci(30), splitItem.givewell(40)])
      splitStub.withArgs(agreemnts[2].KID).resolves([splitItem.sci(30), splitItem.givewell(40), splitItem.amf(30)])
      //These are not a match
      splitStub.withArgs(agreemnts[0].KID).resolves([splitItem.amf(100)])
      splitStub.withArgs(agreemnts[1].KID).resolves([splitItem.amf(10), splitItem.sci(10), splitItem.givewell(80)])
  
      expect(await reminder.checkIfAgreementExists(oldKID)).to.be.true
      expect(donorStub.called).to.be.true
      expect(agreementsStub.called).to.be.true
      expect(splitStub.called).to.be.true
    })
  })
  
  describe('Send reminders for recurring bank u/KID conversion', () => {
    it('Sends no emails if no recurring', async () => {
      recurringStub.resolves([])
  
      await reminder.sendReminders()

      console.log(existingStub.callCount)

      expect(recurringStub.calledOnce).to.be.true
      expect(existingStub.called).to.be.true
      expect(mailStub.called).to.be.false
    })
  
    it('Sends no emails if all recurring have existing agreements', async () => {
      recurringStub.resolves(recurringDonations)

      existingStub.withArgs(recurringDonations[0].KID).resolves(true)
      existingStub.withArgs(recurringDonations[1].KID).resolves(true)
      existingStub.withArgs(recurringDonations[2].KID).resolves(true)

      await reminder.sendReminders()
      
      expect(mailStub.called).to.be.false
      expect(duplicateStub.called).to.be.false
    })
  
    it('Sends email to those that do not have an existing agreement', async () => {
      recurringStub.resolves(recurringDonations)

      existingStub.withArgs(recurringDonations[0].KID).resolves(false)
      existingStub.withArgs(recurringDonations[1].KID).resolves(true)
      existingStub.withArgs(recurringDonations[2].KID).resolves(false)

      await reminder.sendReminders()

      console.log(existingStub.callCount)
      expect(mailStub.callCount).to.be.equal(2)
      expect(duplicateStub.callCount).to.be.equal(2)
    })
  })
})

const splitItem = {
  amf: (share) => ({ ID: 1, full_name: 'Against Malaria Foundation', abbriv: 'AMF', percentage_share: share }),
  sci: (share) => ({ ID: 2, full_name: 'Schistosomiasis Control Initiative', abbriv: 'SCI', percentage_share: share }),
  givewell: (share) => ({ ID: 12, full_name: 'GiveWells tildelingsfond', abbriv: 'GiveWell', percentage_share: share })
}