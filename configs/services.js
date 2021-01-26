// * Configure los puertos, prefijos y servidores para los servicios de chats. No olvide agregar el servicio al URLs
// Whatsapp
const WA_PORT = 3003;
const WA_PREFIX = "wa";
const WA_SERVER = "http://localhost";
const WA_URL = `${WA_SERVER}:${WA_PORT}/${WA_PREFIX}`;

// Facebook
const FB_PORT = 3002;
const FB_PREFIX = "fa";
const FB_SERVER = "http://localhost";
const FB_URL = `${FB_SERVER}:${FB_PORT}/${FB_PREFIX}`;

// formateo automatico para los imports
// const URLs = { W: WA_URL, F: FB_URL };
const URLs = { W: WA_URL};

module.exports.URLs = URLs;

module.exports.bodyParser = function (origen, destino, mensaje, tipo = "text") {
  let body;
  switch (origen) {
    case "W":
      body = JSON.stringify({
        id: destino,
        message: mensaje,
      });
      break;
    case "F":
      body = JSON.stringify({
        senderID: destino,
        messageText: mensaje,
        type: tipo,
      });
      break;
    default:
      break;
  }
  return body;
};
module.exports.chatParser = function (origen, body){
  let chat;
  switch (origen) {
    case "W":
      let pending = body.unreadCount > 0?true:false;
      chat = {
        id: body.id,
        origin: "W",
        name: body.contact.pushname,
        timestamp: body.t,
        pendingmessage: pending,
      };
      break;
    case "F":
      chat = {
        id: senderID,
      };
      break;
    default:
      break;
  }
  return chat;
};

