// Imports from websockets
const express = require("express");
var appFront = express();
var http = require("http").createServer(appFront);
var path = require("path");
var io = require("socket.io")(http);
var cors = require("cors");
var portFront = 3001;
var sockets = {};
var sessions = {}; // SESSIONKEY -> Socket para chequear si sufre desconexion temporal

// Operator's logic
var op = require("./operators.js");
const { resolve } = require("path");

// Front for websockets
appFront.set("port", portFront);
appFront.use(express.static(path.join(__dirname, "public")));
appFront.use(cors);
appFront.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // FIXME: update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type,Accept"
  );
  next();
});
appFront.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});
http.listen(portFront);

io.on("connection", function (socket) {
  socket.on("send_op_message", function (msg) {
    op.enviarMensaje(msg.id, msg.contenido);
  });
  socket.on("new_operator", function (msg) {
    // TODO: validar con weblogin el token/sessionkey
    socket.user = msg.SESSIONKEY; // TODO: Cambiar por nombre de usuario cuando este la conexion con WL
    sockets[socket.id] = socket;
    op.altaOperador(msg.SESSIONKEY, socket);
    if (sessions[msg.SESSIONKEY]) {
      var s = sessions[msg.SESSIONKEY];
      delete sockets[s.id];
    }else{
      sessions[msg.SESSIONKEY] = socket;
      console.log(`Nuevo operador ${msg.SESSIONKEY}`);
    }
  });
  // Remove disconnected op
  socket.on("disconnect", function (causa) {
    if (causa == "transport close" && sockets[socket.id]) {
      setTimeout(function () {
        let s = sockets[socket.id];
        if(!sessions[s.user]){
          op.bajaOperador(s.user);
          delete sockets[socket.id];
        }
      }, 10000);
    }
    // console.log(`Disconnect ${socket.id} ${causa}`);
  });

  socket.on("all_messages_chat", function(id){
    
  });

  socket.on("send_op_seen", function(chat){
    op.confirmarVisto(chat, sockets[socket.id].user);
    console.log(`${sockets[socket.id]}`);
  });

  // socket.on("recive_op_message", function (msg) {
  //   io.emit("recive_op_message",msg);
  // });
});

// Functions define for export and modularization
const enviarMensaje = function (id, contenido) {};

const recibirMensaje = function (operador, id, contenido) {
  var mensaje = {};
  mensaje.id = id;
  mensaje.contenido = contenido;
  io.emit("recive_op_message", mensaje);
  return true;
};

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

const recibirLista = function (operador, lista, asignado) {
  console.log(`Propagando lista ${JSON.stringify(lista)}`);
  let msg = {};
  msg.chats = lista;
  msg.asignado = asignado;
  operador.emit("send_op_list", msg);
};

module.exports.enviarMensaje = enviarMensaje;
module.exports.recibirMensaje = recibirMensaje;
module.exports.asignarMensaje = asignarMensaje;
module.exports.recibirLista = recibirLista;
