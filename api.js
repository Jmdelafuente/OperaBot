const request = require("request");
const express = require("express");
const bodyParser = require("body-parser");
var op = require("./operators.js");
const app = express();
const port = 3001;
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

//allowing requests from outside of the domain
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type,Accept"
  );
  next();
});

app.get("/api/allChats", (req, res) =>
{
  // TODO authenticate origin
  // * Get all WA chats
  var wa_list = [];
  var fc_list = [];
  var chat_list = [];
  var options = {
    method: "POST",
    url: "http://localhost:3003/wa/list",
    headers: {
      "Content-Type": "application/json",
    },
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    wa_list = response.body;
  });
  // ? Add a mark for know is whatsapp chat
  // * Get all Facebook chats
  // TODO consume api

  // * Order all chats by timestamp
  // ? wa uses a variable called 't', facebook ?

  res.send(chat_list);
});

// * Nuevo mensaje de whatsapp
app.post("/api/wa/newmessage", jsonParser, (req, res) => {
  // TODO authenticate origin
  // New whatsapp ("w") messaje
  op.nuevoMensaje(req.body.user, req.body.text, "W")
    .then( 
      cb => {
        console.log("\u{1F919}")
        res.sendStatus(200);
      },
      err => {
        console.log("Oh no! Maldición!")
        res.sendStatus(504);
      });
});

app.get("/api/connect",jsonParser, (req,res) => {

})

// app.get("/", (req, res) => res.send("Hello World!"));

app.listen(port, () => console.log(`OperaBot listening on port ${port}!`));
