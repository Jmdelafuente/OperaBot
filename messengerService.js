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
  // Ordenamos de mas reciente a menos reciente
  chatsList.sort(function (a, b) {
    return b.timestamp - a.timestamp;
  });
}

async function nuevoMensaje(id, cont, origen, t, nombre) {
  // Check if chat exists
  if (chatsList[id]) {
    chatsList[id].timestamp = t;
    chatsList[id].name = nombre; //puede haber cambiado de nombre la persona
    chatsList[id].pendingmessage++;
  } else {
    var chat = new Chat(id, origen, t, 1, nombre);
    chatsList[id] = chat;
  }
  // Notify new message
  op.recibirMensaje(id, cont);
}

async function enviarMensaje(id, cont) {
  var chat = chatsList[id];
  let res = await chat.enviarMensaje(cont);
  return res;
}

async function getMensajesChat(id){
  
}

function getListaChats() {
  return chatsList;
  // return JSON.stringify(chatsList);
}


function getChatById(id) {
  return chatsList[id];
  // return JSON.stringify(chatsList);
}


module.exports.nuevoMensaje = nuevoMensaje;
module.exports.enviarMensaje = enviarMensaje;
module.exports.nuevalistaChats = nuevalistaChats;
module.exports.chatsList = getListaChats;
module.exports.getChatById = getChatById;
