const ms = require('./messengerService');
var socket = require("./websocket");

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
  let data = JSON.parse(req.body.body);
  // console.log(data);
  ms.nuevoMensaje(data.user, data.text, "W").then(
    (cb) => {
      socket.recibirMensaje("", data.user, data.text);
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