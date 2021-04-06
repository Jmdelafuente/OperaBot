// Imports from websockets
const express = require("express");
var appFront = express();
//var cors = require("cors");
var helmet = require("helmet");
var http = require("http").createServer(appFront);
var io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  allowEIO3:true
});
var path = require("path");
var plant = require("./configs/messagesConfig");
var portFront = 2999;
var sockets = {};
var sessions = {}; // SESSIONKEY -> Socket para chequear si sufre desconexion temporal

// Operator's logic
var op = require("./operatorsService.js");
const { resolve } = require("path");
const { chatsList } = require("./messengerService");
const { connect } = require("http2");

// * CONFIGURACION DE FRONT-END * //

// Front for websockets
appFront.set("port", portFront);
//appFront.use(helmet());

/*appFront.use(cors);
 appFront.use(function (req, res, next) {
   res.header("Access-Control-Allow-Origin", "*"); // FIXME: update to match the domain you will make the request from
   res.header(
     "Access-Control-Allow-Headers",
     "Origin, X-Requested-With, Content-Type,Accept"
   );
   next();
 });*/

appFront.use(express.static(path.join(__dirname, "public")));

appFront.get("/operadores/", function (req, res) {
 
  let param = req.query.SESSIONKEY;
  let perfil = op.validar(param);
  if(perfil != -1){
    if(perfil == 3){
      res.sendFile(__dirname + "public/admin/index.html");
    }else{
      res.sendFile(__dirname + "public/index.html");
    }
  }else{
    res.send(Error("Operador no valido"))
  }
});
http.listen(portFront, function () {
  console.log("express server listening");
});

// * EVENTOS * //


io.on("connection", function (socket) {
  socket.on("send_op_message", function (msg) {
    op.enviarMensaje(msg.id, msg.contenido);
  });
  socket.on("wamessage", function (msg) {
    op.enviarWAMessage(msg.id,msg.contenido);
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
          if (valido.id) {
            sessions[msg.SESSIONKEY] = socket;
            sockets[socket.id] = socket;
            socket.emit('operador_set_id',valido.id);
            socket.emit('operador_set_nombre',valido.razonSocial);
            console.log(`Nuevo operador ${msg.SESSIONKEY}`);
            //pasar aca la verificacion
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

  socket.on("seen", function(chat){
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

  socket.on('cambiar_Email', function (msg) {
    op.cambiar_Email(msg);
  })

  socket.on('adjunto-archivo', function (msg) {
    op.enviarArchivo(msg.id,msg.contenido,msg.type);
  });

  socket.on('obtener-opciones',function(msg){
    let opciones = op.obteneropciones();
    socket.emit('obtener-opciones',opciones);
  });

  socket.on('enviar-menu',function (msg) {
    op.enviarMenu(msg.id,msg.contenido);
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

  socket.on("desconexion", function(msg){
    socket.emit("email",);
  });

   
  
});

/* Getter de plantillas de un operador
api.get(`/api/client/blueprints`, jsonParser, (req, res) => {
  res.send(JSON.stringify(blueprints.blueprints));
});*/


// * FUNCIONES * //

// Functions define for export and modularization
const enviarMensaje = function (id, contenido) {};

const recibirMensaje = function (chat, tipo, operador) {
  var mensaje = {};
  mensaje.id = chat.id;
  mensaje.contenido = chat.lastmessage;
  mensaje.tipo = tipo;
  mensaje.hora = chat.timestamp;
  mensaje.nom = chat.name;
  mensaje.email = chat.email;
  mensaje.origen = chat.origin;
  mensaje.state = chat.state;
  mensaje.asign = operador;
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

async function asignarMensaje(socket, chat) {
  var mensaje = {};
  mensaje.id = chat.id;
  mensaje.contenido = chat.lastmessage;
  mensaje.tipo = tipo;
  mensaje.hora = chat.timestamp;
  mensaje.nom = chat.name;
  mensaje.email = chat.email;
  mensaje.origen = chat.origin;
  mensaje.state = chat.state;
  mensaje.asign = operador;
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

async function quieremail(operador, idUser, chat) {

  //operador.emit("getAllMessagesByChat",{lista: msg.historial, id: msg.user});
  pack = {};
  pack.idUser = idUser;
  pack.chat = chat;

   return new Promise(resolve => {
     operador.emit("email", pack, (respuesta) => {
      resolve(respuesta);
     });
   });
};

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
module.exports.quieremail = quieremail;
