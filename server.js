var express = require('express');
var http = require('http');
var cors = require('cors');
var bodyParser = require('body-parser');
var engines = require('consolidate');
var mustache = require('mustache');

var app = express();
app.use(bodyParser());
app.use(cors());
app.set('port', process.env.PORT || 5000);

app.set("view options", {layout: false});
app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');
app.engine('html', engines.mustache);
app.set('view engine', 'html');

var data = [
  {"validpassword": "true"}
  
];
var regexPassword = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
app.get('/', function(req, res) {
    res.render('index.html');
});

app.get('/data/resdata', function(req, res) {
	
    var retResponse = true;
    if(req.query.password) {
    	retResponse = regexPassword.test(req.query.password);
    } else {
        retResponse = false;
    }
    data[0].validpassword = retResponse;
    res.send(data);
});

http.createServer(app).listen(app.get('port'),function() {

	console.log("running........"+app.get('port'));
});