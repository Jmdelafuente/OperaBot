const ms = require('./messengerService');
const services = require('./configs/servicesConfig');
const blueprints = require("./configs/messagesConfig");
const config = require("./configs/apiConfig");

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
    //console.log(req.body);
    // TODO: authenticate origin
    let data = JSON.parse(req.body.body);
    let type = data.type ? data.type : "chat";
    let name = data.name ? data.name : "anonimo";
    ms.nuevoMensaje(
      data.user,
      data.text,
      `${key}`,
      data.timestamp,
      name,
      type
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
    // TODO: authenticate origin
    let data = JSON.parse(req.body.body);
    console.log(data);
    ms.nuevaImagen(
      data.user,
      data.text,
      `${key}`,
      data.timestamp,
      data.name
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
    // TODO: authenticate origin
    ms.nuevalistaChats(req.body, `${key}`)
      .then(() => {
        res.sendStatus(200);
      })
      .catch(() => {
        console.log(
          `Error en pedido de lista de mensajes a ${prefix} - ` + err
        );
        res.sendStatus(500);
      });
  });

  // * Desconectamos un usuario
  api.post(`/api/${prefix}/disconnect`, jsonParser, (req, res) => {
    // TODO: authenticate origin
    ms.disconnect(req.body, `${key}`)
      .then(() => {
        res.sendStatus(200);
      })
      .catch(() => {
        console.log(`Error en pedido de desconecion con ${prefix} - ` + err);
        res.sendStatus(500);
      });
  });
}


// * Desconectamos un usuario
api.get(`/api/client/blueprints`, jsonParser, (req, res) => {
  // TODO: authenticate origin
  res.send(JSON.stringify(blueprints.blueprints));
});

const serverAPI = api.listen(api.get("port"), () => {
  console.log("server on port", api.get("port"));
});