port = 3000;
portClient = 2999;

const cors = require("cors");
const express = require('express');
const helmet = require("helmet");
const morgan = require("morgan");
const path = require('path');
bodyParser = require("body-parser");
jsonParser = bodyParser.json();

app = express();
api = express();
app.set('port', process.env.PORT || portClient);
api.set('port', process.env.PORT || port);


// logging http requests
app.use(morgan("tiny"));
api.use(morgan("tiny"));
// Helmet for securing requests
// app.use(helmet()); // FIXME: en produccion revisar/configurar TLS
api.use(helmet());
// static files
app.use(express.static(path.join(__dirname, 'public')));

// Allowing requests from outside of the domain
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // FIXME: update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type,Accept");
  next();
});

api.use(cors()); // FIXME: remove or comment this (34-42) in production
api.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // FIXME: update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type,Accept"
  );
  next();
});

api.use(express.json({ limit: "20mb" }));
api.use(express.urlencoded({ limit: "20mb", extended: true }));



// Websokets (usa la configuracion previa de socket io)
var websocket = require('./websocket.js');
// API REST para recibir webhooks de los servicios de mensajeria
var apiService = require('./api.js');

// Iniciar servidor de Operadores
const server = app.listen(app.get('port'), () => {
    console.log('server on port', app.get('port'));
});