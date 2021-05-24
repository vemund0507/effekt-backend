var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var http = require("http");
var https = require("https");
var he = require('he');
var config = {
    feedItemsToFetch: 2,
    currencyApiKey: "fd654297fe844f97a06ffb450c33147d",
    exchangeRate: 8 //NOK per USD
};
function getOptions(number) {
    var yql = "/v1/public/yql?q=select%20*%20from%20htmlstring%20where%20url%3D'https%3A%2F%2Flive.givedirectly.org'%20and%20xpath%3D'%2F%2Fdiv%5Bcontains(%40id%2C%22recipient-cards%22)%5D%2Fchild%3A%3Adiv%5Bposition()<=" + number + "%5D'&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";
    return {
        host: 'query.yahooapis.com',
        port: 443,
        path: yql,
        method: 'GET',
    };
}
function getNextFromSplit(searchString, htmlSplit) {
    var found = 0;
    var padding = 0;
    var finds = [];
    while (found != -1) {
        found = htmlSplit.slice(padding).findIndex(function (element) {
            return element.includes(searchString);
        });
        if (found != -1) {
            padding += found + 1;
            finds.push(htmlSplit[padding]);
        }
    }
    return finds;
}
//region Exchange rates
function getExchangeRate() {
    return new Promise(function (resolve, reject) {
        try {
            var req = https.request(options = {
                host: 'openexchangerates.org',
                path: '/api/latest.json?app_id=fd654297fe844f97a06ffb450c33147d&base=USD',
                method: 'GET',
            }, function (res) {
                var output = '';
                console.log(options.host + ':' + res.statusCode);
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    output += chunk;
                });
                res.on('end', function () {
                    var obj = JSON.parse(output);
                    resolve(obj.rates.NOK);
                });
            });
            req.on('error', function (err) {
                res.send('error: ' + err.message);
            });
            req.end();
        }
        catch (exception) {
            reject(exception);
        }
    });
}
function setExchangeRate() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, exception_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    _a = config;
                    return [4 /*yield*/, getExchangeRate()];
                case 1:
                    _a.exchangeRate = _b.sent();
                    console.log("Exchange rate satt til " + config.exchangeRate);
                    return [3 /*break*/, 3];
                case 2:
                    exception_1 = _b.sent();
                    console.log("En feil oppstod ved oppdatering av valutakurs.\nFeilmelding: " + exception_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
setInterval(setExchangeRate, 24 * 60 * 60 * 1000);
//endregion
//region Parsing
function onResult(statusCode, obj, resolve, reject) {
    var htmlString = obj.query.results.result;
    var htmlSplit = htmlString.split(/>\s+<|[<>]/);
    var json = {};
    try {
        //Extract links
        var linksRegex = /\/newsfeed\/[a-z0-9\-]+\/\d+\?\w+=\w+#\w+_\d+/g;
        var links = htmlSplit.filter(function (entry) {
            return linksRegex.exec(entry);
        });
        links = links.map(function (current) {
            var result = linksRegex.exec(current);
            return result ? result[0] : result;
        });
        links = links.filter(function (current) { return current; });
        links = links.map(function (current) {
            return "https://live.givedirectly.org" + current;
        });
        //Extract time
        var timeRegex = /[\\n\s]+\d+\s(minutes?|hours?|days?)\sago[\\n\s]+/g;
        times = htmlSplit.filter(function (current) {
            return timeRegex.exec(current);
        });
        times = times.map(function (current) {
            return current.replace(/\\n/g, "").trim();
        });
        times = times.map(function (current) {
            if (current.includes("minute")) {
                var date = new Date();
                date.setMinutes(date.getMinutes() - Number.parseInt(/\d+/.exec(current)[0]));
                return date;
            }
            else if (current.includes("hour")) {
                var date = new Date();
                date.setHours(date.getHours() - Number.parseInt(/\d+/g.exec(current)[0]));
                return date;
            }
            else if (current.includes("day")) {
                var date = new Date();
                date.setTime(date.getTime() - Number.parseInt(/\d+/.exec(current)[0] * 24 * 60 * 60 * 1000));
                return date;
            }
            return current;
        });
        times = times.map(function (current) {
            // TODO: kan få 0 dager og timer, i teorien
            var now = new Date();
            var diff = now.getTime() - current.getTime();
            if (diff >= 24 * 60 * 60 * 1000) {
                var days = Math.ceil(diff / (24 * 60 * 60 * 1000));
                return days + " dag" + (days == 1 ? "" : "er") + " siden";
            }
            else if (diff >= 60 * 60 * 1000) {
                var hours = Math.ceil(diff / (60 * 60 * 1000));
                return hours + " time" + (hours == 1 ? "" : "r") + " siden";
            }
            else {
                var minutes = Math.ceil(diff / (60 * 1000));
                return minutes + " minutt" + (minutes == 1 ? "" : "er") + " siden";
            }
        });
        //Extract payment
        var paymentRegex = /[\\n\s]+received a \$(\d+)\s\w+\spayment\.?[\\n\s]+/g;
        payments = htmlSplit.filter(function (current) {
            return paymentRegex.exec(current);
        });
        payments = payments.map(function (current) {
            return /\$(\d+)/g.exec(current)[1];
        });
        payments = payments.map(function (current) {
            return current * config.exchangeRate;
        });
        //Til streng på formen "123 kr"
        payments = payments.map(function (current) {
            return current + " kr";
        });
        //Extract text
        var found = 0;
        var padding = 0;
        var texts = [];
        while (found != -1) {
            found = htmlSplit.slice(padding).findIndex(function (element) {
                return element.includes("survey-answer-small");
            });
            if (found != -1) {
                padding += found + 1;
                texts.push(htmlSplit[padding]);
            }
        }
        texts = texts.map(function (current) {
            return current.replace(/\\n|\n/g, "").trim();
        });
        // Decodes HTML entities, for example &amp;
        texts = texts.map(function (current) {
            return he.decode(current);
        });
        //Extract image
        //TODO: alt-tekst
        var imageRegex = /^img.*src="([a-z0-9:\/\-\._]+)"/g;
        images = htmlSplit.filter(function (current) {
            return imageRegex.exec(current);
        });
        images = images.map(function (current) {
            return /https?:\/\/[a-z0-9\/\._-]+/g.exec(current)[0];
        });
        //Extract name
        var names = getNextFromSplit("card-name", htmlSplit);
        //Bygg JSON
        var jsonObjekt = {};
        try {
            var num = links.length;
            for (i = 0; i < num; i++) {
                jsonObjekt[i] = {
                    name: names[i],
                    link: links[i],
                    time: times[i],
                    payment: payments[i],
                    image: images[i],
                    text: texts[i],
                };
            }
        }
        catch (exception) {
            console.log(exception);
            reject(exception);
        }
        resolve(jsonObjekt);
    }
    catch (exception) {
        console.log(exception);
        reject(exception);
    }
}
//endregion
function getJSON(number) {
    return new Promise(function (resolve, reject) {
        try {
            var options = getOptions(number);
            var port = options.port == 443 ? https : http;
            var req = port.request(options, function (res) {
                var output = '';
                console.log(options.host + ':' + res.statusCode);
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    output += chunk;
                });
                res.on('end', function () {
                    var obj = JSON.parse(output);
                    onResult(res.statusCode, obj, resolve, reject);
                });
            });
            req.on('error', function (err) {
                res.send('error: ' + err.message);
            });
            req.end();
        }
        catch (exception) {
            reject(exception);
        }
    });
}
module.exports = {
    getJSON: getJSON,
};
