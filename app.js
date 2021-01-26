port = 3000;

const path = require('path');
const express = require('express');
const morgan = require("morgan");
bodyParser = require("body-parser");
jsonParser = bodyParser.json();
app = express();
 
// var urlencodedParser = bodyParser.urlencoded({ extended: false });

/* 
 * Set up server
 */
app.set('port', process.env.PORT || port);

// Iniciar servidor
const server = app.listen(app.get('port'), () => {
    console.log('server on port', app.get('port'));
});
// logging http requests
app.use(morgan("tiny"));
// static files
app.use(express.static(path.join(__dirname, 'public')));

// Allowing requests from outside of the domain
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type,Accept");
  next();
});

// APIs
var api = require("./api");

// Websokets (usa la configuracion previa de socket io)
var websocket = require('./websocket.js');
