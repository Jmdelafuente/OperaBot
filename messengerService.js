var Chat = require("./models/Chat");
var op = require("./operators");
var chatsList = {};

async function nuevalistaChats(lista, origen) {
  for (var c of lista) {
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
  if (chatsList[id]) {
    chatsList[id].timestamp = t;
    chatsList[id].name = name;
    chatsList[id].pendingmessage++;
  } else {
    var chat = new Chat(id, origen, t, 1, nombre);
    chatsList.push(chat);
  }
  // Notify new message
  op.recibirMensaje(id, cont);
}

async function enviarMensaje(id, cont) {
  var chat = chatsList[id];
  chat.timestamp = Date.now();
  // ? pendingmessage seria para saber si hay mensajes pendientes de envio?
  chat.pendingmessage = 0;

  let res = await chat.enviarMensaje(cont);
  return res;
}

function getListaChats() {
  return JSON.stringify(chatsList);
}

module.exports.nuevoMensaje = nuevoMensaje;
module.exports.enviarMensaje = enviarMensaje;
module.exports.nuevalistaChats = nuevalistaChats;
module.exports.chatsList = getListaChats;
