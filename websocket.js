// Imports from websockets
const express = require("express");
var appFront = express();
var http = require("http").createServer(appFront);
var path = require("path");
var io = require("socket.io")(http);
var cors = require("cors");
var portFront = 3001;
var sockets = {};

// Operator's logic
var op = require("./operators.js");

// Front for websockets
appFront.set("port", portFront);
appFront.use(express.static(path.join(__dirname, "public")));
appFront.use(cors);
appFront.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
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
    console.log(`Nuevo operador ${msg.SESSIONKEY}`);
    socket.user = msg.SESSIONKEY; // TODO Cambiar por nombre de usuario cuando este la conexion con WL
    op.altaOperador(msg.SESSIONKEY, socket);
    sockets[socket.id] = socket;
  });
  // Remove disconnected op
  socket.on("disconnect", function (causa) {
    if (causa == "transport close" && sockets[socket.id]) {
      op.bajaOperador(sockets[socket.id].user);
      delete sockets[socket.id];
    }
    // console.log(`Disconnect ${socket.id} ${causa}`);
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

const asignarMensaje = function (socket, id, contenido) {
  var mensaje = {};
  mensaje.id = id;
  mensaje.contenido = contenido;
  socket.emit("assign_op_message", mensaje);
  return socket;
};

const recibirLista = function (operador, lista) {
  console.log(`Propagando lista ${lista}`);
  operador.emit("send_op_list", lista);
};

module.exports.enviarMensaje = enviarMensaje;
module.exports.recibirMensaje = recibirMensaje;
module.exports.asignarMensaje = asignarMensaje;
module.exports.recibirLista = recibirLista;
