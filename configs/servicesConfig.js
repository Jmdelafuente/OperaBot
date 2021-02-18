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

// Page Server / Burbuja de chat
const PS_PORT = 3004;
const PS_PREFIX = 'ps';
const PS_SERVER = "http://ca43c46a780e.ngrok.io";
const PS_URL = `${PS_SERVER}/${PS_PREFIX}`;
// const PS_URL = `${PS_SERVER}:${PS_PORT}/${PS_PREFIX}`;

// formateo automatico para los imports
// const URLs = { W: WA_URL, F: FB_URL, P: PS_URL};
const URLs = { W: WA_URL, P: PS_URL};
// const URLs = { W: WA_URL};
const PREFIXes = {W: WA_PREFIX, P: PS_PREFIX};
// const PREFIXes = {W: WA_PREFIX};

module.exports.URLs = URLs;
module.exports.PREFIXes = PREFIXes;

/**
 *  Da formato a un mensaje enviado por el operador para que el servicio de mensajeria destino pueda comprenderlo
 *  Operador --> MessengerService
 * @param {*} origen 
 * @param {*} destino ID del chat destino propio del servicio de mensajeria 
 * @param {*} mensaje Contenido del mensaje a envíar
 * @param {*} tipo Tipo de mensaje a enviar
 */
module.exports.bodyParser = function (origen, destino, mensaje, tipo = "chat") {
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
    case "P":
      body = {
        id: destino,
        text: mensaje
      };
      break;
    default:
      break;
  }
  return body;
};

module.exports.getMessagesParser = function (
  origen,
  destino,
  includeMe
) {
  let body;
  switch (origen) {
    case "W":
      body = JSON.stringify({
        id: destino,
        includeMe: includeMe,
      });
      break;
    case "F":
      body = JSON.stringify({
        senderID: destino,
        messageText: mensaje,
        type: tipo,
      });
      break;
    case "P":
      body = {
        id: destino,
      };
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
    case "P":
      chat = {
        id: body.user,
        name: 'Anonimo',
        origin: "P",
        timestamp: body.hora,
        pendingmessage: 0
      };
      break;
    default:
      break;
  }
  return chat;
};

module.exports.messageParser = function (origen, body) {
  let message;
  let url="";
  let contenido;
  switch (origen) {
    case "W":
      contenido = body.text;
      if (body.type == "image") {
        // TODO: save image on disk and get URL
        url = body.URL;
        // body.text = "data:image/jpeg;base64," + body.text;
        contenido = {
          contenido: body.text,
          url: url
        };
        console.log(contenido);
      }
      message = {
        user: body.user,
        contenido: contenido,
        timestamp: body.timestamp,
        type: body.type,
      };
      break;
    case "P":
      contenido = body.contenido;
      if (body.type == "image") {
        // TODO: save image on disk and get URL
        url;
        contenido = {
          contenido: body.contenido,
          url: url,
        };
      }
      message = {
        user: body.tipo_chat == 0 ? "another" : "me",
        contenido: contenido,
        timestamp: body.hora,
        type: body.type,
        URL: url,
      };
      break;
    default:
      break;
  }
  return message;
};

module.exports.messagesParser = function (origen, list) {
  let chats = [];
  list.forEach(body => {
    let m = this.messageParser(origen, body);
    chats.push(m);
  });
  return chats;
};
