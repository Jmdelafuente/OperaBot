const ms = require('./messengerService');
const services = require('./configs/servicesConfig');
const axios = require("axios").default;

for (const [key, prefix] of Object.entries(services.PREFIXes)) {
  // * Recibimos nuevo mensaje de un messenger service
  app.post(`/api/${prefix}/newmessage`, jsonParser, (req, res) => {
    //console.log(req.body);
    // TODO authenticate origin
    let data = JSON.parse(req.body.body);
    let type = data.type ? data.type : "chat";
    ms.nuevoMensaje(
      data.user,
      data.text,
      `${key}`,
      data.timestamp,
      data.name,
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
  app.post(`/api/${prefix}/newimage`, jsonParser, (req, res) => {
    // TODO authenticate origin
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
  app.post(`/api/${prefix}/list`, jsonParser, (req, res) => {
    // TODO authenticate origin
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
  app.post(`/api/${prefix}/disconnect`, jsonParser, (req, res) => {
    // TODO authenticate origin
    ms.disconnect(req.body, `${key}`)
      .then(() => {
        res.sendStatus(200);
      })
      .catch(() => {
        console.log(
          `Error en pedido de desconecion con ${prefix} - ` + err
        );
        res.sendStatus(500);
      });
  });
}

// // * Recibimos la lista de chats de un messenger service
//   app.post(`/api/pa/echo`, jsonParser, (req, res) => {
//     console.log(req.body);
//     // var data = {
//     //     id: req.body.id,
//     //     mensaje: `Respuesta del operador ${req.body.mensaje}`};
//     // console.log(data);
//     axios
//       .post("http://b62f8f6b5b75.ngrok.io/ps/sendMessage", req.body)
//       .then((response) => {
//         console.log(`Respuesta de cliente: ${response.status}`);
//         res.sendStatus(200);
//       })
//       .catch(function (error) {
//         console.log(`${error}`);
//         res.sendStatus(500);
//       });
//   });

// app.get("/", function (req, res) {
//   res.sendFile(path.join(__dirname + "/index.html"));
// });