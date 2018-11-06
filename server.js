var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var app = express();

var https = require('https');
var fs = require('fs');

var SSLPORT = 18081;

var privateKey = fs.readFileSync('./key.pem', 'utf8');
var certificate = fs.readFileSync('./server.crt', 'utf8');
var credentials = {
    key: privateKey,
    cert: certificate
};

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(SSLPORT, function () {
    console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT);
});

app.use(express.static(__dirname + '/client'));

app.use(bodyParser.json());

app.set('port', process.env.PORT || SSLPORT);

/*Allow CORS*/
app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization,X-Authorization');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
    res.setHeader('Access-Control-Max-Age', '1000');

    next();
});


app.all('/proxy', function (req, res, next) {

    var url = req.header('SalesforceProxy-Endpoint');
    request({
        url: url,
        method: req.method,
        json: req.body,
        headers: {
            'Authorization': req.header('X-Authorization'),
            'Content-Type': 'application/json'
        },
        body: req.body
    }).pipe(res);

});

app.get('/', function (req, res, next) {
    res.sendfile('views/index.html');
});

app.get('/index*', function (req, res, next) {
    res.sendfile('views/index.html');
});

app.get('/oauthcallback.html', function (req, res, next) {
    res.sendfile('views/oauthcallback.html');
});

app.get('/main*', function (req, res, next) {
    res.sendfile('views/main.html');
});