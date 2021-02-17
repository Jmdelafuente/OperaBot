var Chat = require("./models/Chat");
var op = require("./operatorsService");
var chatsList = {};
/**
 * !DEPRECATED
 * Recibe una lista de chats de un servicio de mensajeria y genera los objetos correspondientes
 * @param {*} lista
 * @param {*} origen
 */
async function nuevalistaChats(lista, origen) {
  for (var c of lista) {
    var newChat;
    switch (origen) {
      case "W":
        newChat = new Chat(c.id, "W", c.t, c.unreadCount, c.contact.pushname);
        break;
      case "P":
        newChat = new Chat(c.id, "P", c.timestamp, 0, c.name);
        break;
      default:
        break;
    }
    chatsList[newChat.id] = newChat;
  }
  // Ordenamos de mas reciente a menos reciente
  chatsList.sort(function (a, b) {
    return b.timestamp - a.timestamp;
  });
}

async function nuevoMensaje(
  id,
  cont,
  origen,
  t,
  nombre = "anonimo",
  tipo = "chat"
) {
  // Check if chat exists
  if (chatsList[id]) {
    chatsList[id].timestamp = t;
    chatsList[id].name = nombre; //puede haber cambiado de nombre la persona
    chatsList[id].pendingmessage++;
  } else {
    var chat = new Chat(id, origen, nombre, t, 1, cont);
    chatsList[id] = chat;
  }
  // Notify new message
  op.recibirMensaje(id, cont, tipo);
}

async function nuevaImagen(
  id,
  cont,
  origen,
  t,
  nombre = "anonimo",
  type = "image"
) {
  // Check if chat exists
  if (chatsList[id]) {
    chatsList[id].timestamp = t;
    chatsList[id].name = nombre; //puede haber cambiado de nombre la persona
    chatsList[id].pendingmessage++;
  } else {
    var chat = new Chat(id, origen, nombre, t, 1, cont);
    chatsList[id] = chat;
  }
  // Notify new message
  op.recibirImagen(id, cont, type);
}

async function enviarMensaje(id, cont) {
  var chat = chatsList[id];
  let res = await chat.enviarMensaje(cont);
  return res;
}

async function enviarEstado(id, cont) {
  var chat = chatsList[id];
  let res = false;
  if (chat) {
    res = await chat.enviarEstado(cont);
  }
  return res;
}

async function closeChat(id) {
  var chat = chatsList[id];
  let res = false;
  if (chat) {
    res = await chat.resolucionOk();
  }
  return res;
}

async function getMensajesChat(id) {}

function getListaChats() {
  return chatsList;
  // return JSON.stringify(chatsList);
}

function getChatById(id) {
  return chatsList[id];
  // return JSON.stringify(chatsList);
}

async function disconnect(id, timestamp) {
  // TODO: aviso de cliente desconectado
}

// * INIT
// Get all chats
Chat.getAll().then(
  (lista) => {
    chatsList = lista;
  },
  (error) => {
    console.log(error);
  }
);

module.exports.chatsList = getListaChats;
module.exports.closeChat = closeChat;
module.exports.disconnect = disconnect;
module.exports.enviarMensaje = enviarMensaje;
module.exports.enviarEstado = enviarEstado;
module.exports.getChatById = getChatById;
module.exports.nuevaImagen = nuevaImagen;
module.exports.nuevalistaChats = nuevalistaChats;
module.exports.nuevoMensaje = nuevoMensaje;
