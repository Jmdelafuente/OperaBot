const request = require("request");
var Chat = require("./models/Chat");
var op = require("./operators");
var chatsList = {};

async function nuevalistaChats(lista, origen) {
    for (var c of lista){
        var newChat;
        if (origen == "W") {
            newChat = new Chat(c.id, "W", c.t, c.unreadCount, c.contact.pushname);
        }
        chatsList[newChat.id] = newChat;
    }
    chatsList.sort(function (a, b) {
        return b.t - a.t;
    });
}

async function nuevoMensaje(id, cont, origen, t, nombre) {
    // Check if chat exists
    if (chatsList[id]){
        chatsList[id].timestamp = t;
        chatsList[id].name = name;
        chatsList[id].pendingMessage++;
    }else{
        var chat = new Chat(id, origen, t, 1, nombre);
        chatsList.push(chat);
    }
    // Notify new message
    op.recibirMensaje(id, cont);
}


async function enviarMensaje(id, cont) {
  var chat = chatsList[id];
  chat.timestamp = Date.now();
  chat.pendingMessage = 0;
//   // ! Datos de prueba
//   var chat = {};
//   chat.origin = "W";

  let org;
  let port;
  let body;
  let res = false;
  if ((chat.origin == "W")) {
    org = "wa";
    port = 3003;
    body = JSON.stringify({
      id: id,
      message: cont,
    });
  }
  if ((chat.origin == "F")) {
    org = "fa";
    port = 3002;
    body = JSON.stringify({
      senderID: id,
      messageText: cont,
      type: "text",
    });
  }
  var options = {
    method: "POST",
    url: `http://localhost:${port}/${org}/sendMessage`,
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    res = response.body;
  });
  return res;
}

function getListaChats(){
    return JSON.stringify(chatsList);
}


module.exports.nuevoMensaje = nuevoMensaje;
module.exports.enviarMensaje = enviarMensaje;
module.exports.nuevalistaChats = nuevalistaChats;
module.exports.chatsList = getListaChats;