// const request = require("request");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3001;
var jsonParser = bodyParser.json();
// var urlencodedParser = bodyParser.urlencoded({ extended: false });

// * Business Logic
var msg = require("./messengerService.js");

// * Allowing requests from outside of the domain
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type,Accept"
  );
  next();
});

// * Begging of API
// ? Tiene sentido pedir todos los chats a la API si no es por websocket?
  app.get("/api/allChats", (req, res) => {
  // ? TODO authenticate origin
  // ? // * Get all WA chats
  // ? var wa_list = [];
  // ? var fc_list = [];
  // ? var chat_list = [];
  // ? var options = {
  // ?   method: "POST",
  // ?   url: "http://localhost:3003/wa/list",
  // ?   headers: {
  // ?     "Content-Type": "application/json",
  // ?   },
  // ? };
  // ? request(options, function (error, response) {
  // ?   if (error) throw new Error(error);
  // ?   wa_list = response.body;
  // ? });
  // ? // ? Add a mark for know is whatsapp chat
  // ? // * Get all Facebook chats
  // ? // TODO consume api

  // ? // * Order all chats by timestamp
  // ? // ? wa uses a variable called 't', facebook ?

  // ? res.send(chat_list);
  res.sendStatus(403);
}) ;

// * Nuevo mensaje de whatsapp
app.post("/api/wa/newmessage", jsonParser, (req, res) => {
  // TODO authenticate origin
  // New whatsapp ("w") messaje
  msg.nuevoMensaje(req.body.user, req.body.text, "W").then(
    (cb) => {
      console.log("Whatsapp \u{1F919}");
      res.sendStatus(200);
    },
    (err) => {
      console.log("Oh no! Maldición!");
      res.sendStatus(504);
    }
  );
});

// * Incio de WA_Server, recibimos la lista de chats
app.post("/api/wa/list", jsonParser, (req, res) => {
  // TODO authenticate origin
  msg.nuevalistaChats(req.body,'W')
    .then(()=> {
      res.sendStatus(200);
    })
    .catch(() => {
      res.sendStatus(500);
    });
});

// * Nuevo mensaje de facebook
app.post("/api/fa/newmessage", jsonParser, (req, res) => {
  // TODO authenticate origin
  // New facebook ("f") messaje
  msg.nuevoMensaje(req.body.user, req.body.text, "F").then(
    (cb) => {
      console.log("Facebook \u{1F919}");
      res.sendStatus(200);
    },
    (err) => {
      console.log("Oh no! Maldición!");
      res.sendStatus(504);
    }
  );
});

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.get("/index", function (req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});

app.listen(port, () => console.log(`OperaBot listening on port ${port}!`));
