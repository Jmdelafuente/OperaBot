const ms = require('./messengerService');
const services = require('./configs/servicesConfig');
const blueprints = require("./configs/messagesConfig");
const config = require("./configs/apiConfig");

/**
 * Dado un request (express) valida si la IP origen es una direccion permitida.
 * See: configs/apiConfig.js para mas detalle
 * @param {*} req
 * @returns {Boolean} true si el request es válido o false en caso contrario
 */
function validateIP(req){
  var ip =
    (req.headers["x-forwarded-for"] || "").split(",").pop().trim() ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  return config.VALID_IPS(ip);
}

for (const [key, prefix] of Object.entries(services.PREFIXes)) {
  // * Recibimos nuevo mensaje de un messenger service
  api.post(`/api/${prefix}/newmessage`, jsonParser, (req, res) => {
    // TODO: authenticate origin: usar validateIP con req
    let data = JSON.parse(req.body.body);
    //console.log(data);
    let type = data.type ? data.type : "chat";
    
    ms.nuevoMensaje(
      data.user,
      data.text,
      `${key}`,
      data.timestamp,
      data.name,
      type,
      data.email
    ).then(
      (cb) => {
        res.sendStatus(200);
      },
      (err) => {
        console.log(`Error en recepcion de mensaje a ${prefix} - ` + err);
        res.sendStatus(504);
      }
    );
  });

  // * Recibimos nueva imagen de un messenger service
  api.post(`/api/${prefix}/newimage`, jsonParser, (req, res) => {
    // TODO: authenticate origin: usar validateIP con req
    let data = JSON.parse(req.body.body);
    ms.nuevaImagen(
      data.user,
      data.text,
      `${key}`,
      data.timestamp,
      data.name,
      data.type,
      data.email
    ).then(
      (cb) => {
        res.sendStatus(200);
      },
      (err) => {
        console.log(`Error en recepcion de mensaje a ${prefix} - ` + err);
        res.sendStatus(504);
      }
    );
  });

  // * Recibimos la lista de chats de un messenger service
  api.post(`/api/${prefix}/list`, jsonParser, (req, res) => {
    // TODO: authenticate origin: usar validateIP con req
    ms.nuevalistaChats(req.body, `${key}`)
      .then(() => {
        res.sendStatus(200);
      })
      .catch((err) => {
        console.log(
          `Error en pedido de lista de mensajes a ${prefix} - ` + err
        );
        res.sendStatus(500);
      });
  });

  // * Desconectamos un usuario
  api.post(`/api/${prefix}/disconnect`, jsonParser, (req, res) => {
    // TODO: authenticate origin: usar validateIP con req
    ms.disconnect(req.body, `${key}`)
      .then(() => {
        res.sendStatus(200);
      })
      .catch((err) => {
        console.log(`Error en pedido de desconexion con ${prefix} - ` + err);
        res.sendStatus(500);
      });
  });

  
  api.post(`/api/${prefix}/recuperarChatEmail`, jsonParser, (req, res) => {
    let data = JSON.parse(req.body.body);
    ms.recuperarChatEmail(data.user,data.email)
      .then((cb) => {
        res.sendStatus(200);
      })
      .catch((err) => {
        console.log(`Error en pedido de desconexion con ${prefix} - ` + err);
        res.sendStatus(500);
      });
  });

}

// Iniciar servidor de API/Webhooks
const serverAPI = api.listen(api.get("port"), () => {
  console.log("server on port", api.get("port"));
});