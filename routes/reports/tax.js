const taxDeductionParser = require('../../custom_modules/parsers/tax.js')
const mail = require('../../custom_modules/mail')

module.exports = async (req,res,next) => {
    try {
      if (!req.files || !req.files.report) return res.sendStatus(400)
      if (!req.body.year) return res.sendStatus(400)
      if (!req.body.type) return res.sendStatus(400)

      let year = parseInt(req.body.year)

      if (year < 2016 || year > 3000) return res.sendStatus(400)

      let records = taxDeductionParser.parseReport(req.files.report.data)

      let success = 0
      let failed = 0

      for (let i = 0; i < records.length; i++) {
        const record = records[i]

        let result
        switch (req.body.type) {
          case "report":
            result = await mail.sendTaxDeductions(record, year)
          case "missing_ssn":
            result = await mail.sendTaxDeductionsMissingSsn(record, year)
          case "under_limit":
            result = await mail.sendTaxDeductionsUnderLimit(record, year)
          default:
            result = false
        }
        
        if (result === true)
          success++
        else
          failed ++
      }

      res.json({
          status: 200,
          content: `Sent ${success} mails, ${failed} failed`
      })
    } catch(ex) {
      next({ ex })
    }
}