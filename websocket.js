// Imports from websockets
const express = require("express");
var appFront = express();
var cors = require("cors");
var helmet = require("helmet");
var http = require("http").createServer(appFront);
var io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
var path = require("path");
var plant = require("./configs/messagesConfig");
var portFront = 3001;
var sockets = {};
var sessions = {}; // SESSIONKEY -> Socket para chequear si sufre desconexion temporal

// Operator's logic
var op = require("./operatorsService.js");
const { resolve } = require("path");

// * CONFIGURACION DE FRONT-END * //

// Front for websockets
appFront.set("port", portFront);
// appFront.use(helmet());
// appFront.use(express.static(path.join(__dirname, "public")));
appFront.use(cors);
// appFront.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*"); // FIXME: update to match the domain you will make the request from
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type,Accept"
//   );
//   next();
// });
appFront.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});
http.listen(portFront);

// * EVENTOS * //

io.on("connection", function (socket) {
  socket.on("send_op_message", function (msg) {
    op.enviarMensaje(msg.id, msg.contenido);
  });
  socket.on("new_operator", function (msg) {
    // TODO: validar con weblogin el token/sessionkey
    if (sessions[msg.SESSIONKEY]) {
      let s = sessions[msg.SESSIONKEY];
      delete sockets[s.id];
      socket.user = msg.SESSIONKEY;
      sessions[msg.SESSIONKEY] = socket;
      op.reconectarOperador(msg.SESSIONKEY, socket);
    } else {
      socket.user = msg.SESSIONKEY; // TODO: Cambiar por nombre de usuario cuando este la conexion con WL
      op.altaOperador(msg.SESSIONKEY, socket).then(
        (valido) => {
          if (valido) {
            sessions[msg.SESSIONKEY] = socket;
            sockets[socket.id] = socket;
            console.log(`Nuevo operador ${msg.SESSIONKEY}`);
          } else {
            // ! SALIR
          }
        },
        (error) => {
          // TODO: registrar error
          console.log(error);
        }
      );
    }
  });
  // Remove disconnected op
  socket.on("disconnect", function (causa) {
    if (causa == "transport close" && sockets[socket.id]) {
      setTimeout(function () {
        let s = sockets[socket.id];
        if (typeof s !== "undefined") {
          if (sessions[s.user] != s) {
            //console.log(`Baja operador ${s.user}`);
            op.bajaOperador(s.user);
          }
          delete sockets[socket.id];
        }
      }, 100000);
    }
    // console.log(`Disconnect ${socket.id} ${causa}`);
  });

  socket.on("all_messages_chat", function(id){
    op.getAllMessages(id, socket.user).then(
      (lista) => {
        mensajesByChat(id, lista, socket);
      },
      (error) => {
        //  TODO: registrar el error
        console.log(error);
      }
    );
  });

  socket.on("send_op_seen", function(chat){
    op.confirmarVisto(chat, socket.user);
    console.log(`WebSocket -> send_op_seen: ${socket.toString()}`);
  });

  socket.on("writing", function(id){
    op.escribiendo(id, socket.user);
    console.log(`WebSocket -> writing: ${socket.toString()}`);
  });

  socket.on("stop-writing", function (id) {
    op.escribiendo(id, socket.user, false);
  });

  socket.on("close_chat", function(id){
    op.closeChat(id);
  });

  socket.on('adjunto-archivo', function (msg) {
    op.enviarArchivo(msg.id,msg.contenido);
  });

  socket.on("more-messages", function(chatID){
    console.log(`WebSocket -> more-messages: ${chatID}`);
    op.getMoreMessages(chatID).then(
      op.getAllMessages(chatID, socket.user).then(
        (lista) => {
          mensajesByChat(chatID, lista, socket);
        },
        (error) => {
          //  TODO: registrar el error
          console.log(error);
        }
      )
    );
  });
  
  socket.on("send_plantilla", function (msg) {
      socket.emit("send_plantilla",plant.blueprints);
  });

  
});

/* Getter de plantillas de un operador
api.get(`/api/client/blueprints`, jsonParser, (req, res) => {
  res.send(JSON.stringify(blueprints.blueprints));
});*/


// * FUNCIONES * //

// Functions define for export and modularization
const enviarMensaje = function (id, contenido) {};

const recibirMensaje = function (id, contenido, tipo,nombre,origen) {
  var mensaje = {};
  mensaje.id = id;
  mensaje.contenido = contenido;
  mensaje.tipo = tipo;
  mensaje.nom = nombre;
  mensaje.origen = origen;
  io.emit("recive_op_message", mensaje);
  return true;
};

// const recibirImagen = function (id, contenido, type) {
//   var mensaje = {};
//   mensaje.id = id;
//   mensaje.contenido = contenido;
//   mensaje.type = type;
//   io.emit("recive_op_message", mensaje);
//   return true;
// };

async function asignarMensaje(socket, id, contenido, nombre) {
  var mensaje = {};
  mensaje.id = id;
  mensaje.contenido = contenido;
  mensaje.nom = nombre;
  return new Promise(resolve=>{
    socket.emit("assign_op_message", mensaje, (ack) => {
      if (ack) {
        // El chat fue correctamente asignado
        resolve(socket);
      } else {
        // El chat no fue asignado
        resolve(false);
      }
    });
  });
}

const mensajesByChat = function(id, listamensajes, socket, append=false) {
  let msg = {};
  msg.id = id;
  msg.lista = listamensajes;
  if(append){
    socket.emit("getMoreMessagesByChat", msg);
  }else{
    socket.emit("getAllMessagesByChat", msg);
  }
};

const recibirLista = function (operador, lista, asignado) {
  console.log(`Propagando lista ${JSON.stringify(lista)}`);
  let msg = {};
  msg.chats = lista;
  msg.asignado = asignado;
  operador.emit("send_op_list", msg);
};

module.exports.enviarMensaje = enviarMensaje;
module.exports.recibirMensaje = recibirMensaje;
// module.exports.recibirImagen = recibirImagen;
module.exports.asignarMensaje = asignarMensaje;
module.exports.recibirMensajesByChat = mensajesByChat;
module.exports.recibirLista = recibirLista;
