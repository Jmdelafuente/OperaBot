// Configure los puertos, prefijos y servidores para los servicios de chats
const WA_PORT = 3003;
const WA_PREFIX = "wa";
const WA_SERVER = "http://localhost";
const FB_PORT = 3002;
const FB_PREFIX = "fa";
const FB_SERVER = "http://localhost";

// formateo automatico para los imports
const WA_URL = `${WA_SERVER}${WA_PORT}/${WA_PREFIX}`;
const FB_URL = `${FB_SERVER}${FB_PORT}/${FB_PREFIX}`;
const URLs = { W: WA_URL, F: FB_URL };

function bodyParser(origen, destino, mensaje, tipo = "text") {
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
}

// Configure los puertos, prefijos y servidores para los servicios de chats
module.exports.WA_PORT;
module.exports.WA_PREFIX;
module.exports.WA_SERVER;
module.exports.FB_PORT;
module.exports.FB_PORT;
module.exports.FB_SERVER;

// formateo automatico para los imports
module.exports.WA_URL = `${WA_SERVER}${WA_PORT}/${WA_PREFIX}`;
module.exports.FB_URL = `${FB_SERVER}${FB_PORT}/${FB_PREFIX}`;
module.exports.URLs = { W: WA_URL, F: FB_URL };

module.exports.bodyParser;
