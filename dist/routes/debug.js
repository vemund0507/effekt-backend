var config = require('../config');
var express = require('express');
var router = express.Router();
router.get("/env", function (req, res, next) { return res.send(config.env); });
module.exports = router;
