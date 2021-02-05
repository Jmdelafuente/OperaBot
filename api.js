const ms = require('./messengerService');
const services = require('./configs/servicesConfig');

for (const [key, prefix] of Object.entries(services.PREFIXes)) {
  // * Recibimos nuevo mensaje de un messenger service
  app.post(`/api/${prefix}/newmessage`, jsonParser, (req, res) => {
    // TODO authenticate origin
    // New whatsapp ("w") messaje
    let data = JSON.parse(req.body.body);
    // console.log(data);
    ms.nuevoMensaje(
      data.user,
      data.text,
      `${key}`,
      data.timestamp,
      data.name
    ).then(
      (cb) => {
        // socket.recibirMensaje("", data.user, data.text);
        res.sendStatus(200);
      },
      (err) => {
        console.log(`Error en envio de mensaje a ${prefix} - ` + err);
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
        console.log(`Error en pedido de lista de mensajes a ${prefix} - ` + err);
        res.sendStatus(500);
      });
  });
}

// app.get("/", function (req, res) {
//   res.sendFile(path.join(__dirname + "/index.html"));
// });