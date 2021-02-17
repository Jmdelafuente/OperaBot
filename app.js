port = 3000;

const path = require('path');
const express = require('express');
const morgan = require("morgan");
bodyParser = require("body-parser");
jsonParser = bodyParser.json();
app = express();
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
  res.header("Access-Control-Allow-Origin", "*"); // FIXME: update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type,Accept");
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));


// Websokets (usa la configuracion previa de socket io)
var websocket = require('./websocket.js');
// API REST para recibir webhooks de los servicios de mensajeria
var websocket = require('./api.js');
