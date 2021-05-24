console.log("--------------------------------------------------");
console.log("| gieffektivt.no donation backend (╯°□°）╯︵ ┻━┻ |");
console.log("--------------------------------------------------");
var config = require('./config.js');
console.log("Config loaded");
var express = require('express');
var fileUpload = require('express-fileupload');
var pretty = require('express-prettify');
var path = require('path');
var logging = require('./handlers/loggingHandler.js');
var http = require('http');
var hogan = require('hogan-express');
var bearerToken = require('express-bearer-token');
console.log("Top level dependencies loaded");
var DAO = require('./custom_modules/DAO.js');
//Connect to the DB
//If unsucsessfull, quit app
DAO.connect(function () {
    console.log("DAO setup complete");
    var errorHandler = require('./handlers/errorHandler.js');
    //Setup express
    var app = express();
    //Set global application variable root path
    global.appRoot = path.resolve(__dirname);
    //Setup request logging
    logging(app);
    app.get("/", function (req, res, next) {
        res.send("Dr. Livingstone, I presume?");
    });
    //Parse post body
    app.use(express.json());
    //Pretty printing of JSON
    app.use(pretty({
        query: 'pretty'
    }));
    //File upload 
    app.use(fileUpload({
        limits: { fileSize: 10 * 1024 * 1024 } //Probably totally overkill, consider reducing
    }));
    app.enable('trust proxy');
    //Set cross origin as allowed
    app.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
        next();
    });
    //Look for bearer tokens
    app.use(bearerToken());
    //Render engine for served views
    app.set('view engine', 'mustache');
    app.set('layout', __dirname + '/views/layout.mustache');
    app.engine('mustache', hogan);
    //Server
    var mainServer = http.createServer(app);
    //Routes
    var donorsRoute = require('./routes/donors');
    var donationsRoute = require('./routes/donations');
    var distributionsRoute = require('./routes/distributions');
    var organizationsRoute = require('./routes/organizations');
    var reportsRoute = require('./routes/reports');
    var paypalRoute = require('./routes/paypal');
    var vippsRoute = require('./routes/vipps');
    var paymentRoute = require('./routes/payment');
    var csrRoute = require('./routes/csr');
    var referralsRoute = require('./routes/referrals');
    var scheduledRoute = require('./routes/scheduled');
    var authRoute = require('./routes/auth');
    var metaRoute = require('./routes/meta');
    var debugRoute = require('./routes/debug');
    var facebookRoute = require('./routes/facebook');
    app.use('/donors', donorsRoute);
    app.use('/donations', donationsRoute);
    app.use('/distributions', distributionsRoute);
    app.use('/organizations', organizationsRoute);
    app.use('/reports', reportsRoute);
    app.use('/paypal', paypalRoute);
    app.use('/vipps', vippsRoute);
    app.use('/payment', paymentRoute);
    app.use('/csr', csrRoute);
    app.use('/referrals', referralsRoute);
    app.use('/scheduled', scheduledRoute);
    app.use('/auth', authRoute);
    app.use('/meta', metaRoute);
    app.use('/debug', debugRoute);
    app.use('/facebook', facebookRoute);
    app.use('/static', express.static(__dirname + '/static'));
    app.use('/style', express.static(__dirname + '/views/style'));
    app.use('/img', express.static(__dirname + '/views/img'));
    //Error handling
    app.use(errorHandler);
    mainServer.listen(config.port, function () {
        console.log("Main http server listening on port " + config.port + " 📞");
        console.log("Don’t Panic. 🐬");
        console.log("---");
    });
});
