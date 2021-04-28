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
  console.log("entre al get");
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
    op.enviarMensaje(msg.id, msg.contenido,msg.operadorid);
    op.obtenerNombre(msg.operadorid).then(
      (nombre) => {
        let split = nombre.split(",");
        var pack = {
          contenido: msg.contenido,
          nombre: split[1]
        }
        socket.emit("dibujar_mensaje", pack);
      },
      (error) => {
        //  TODO: registrar el error
        console.log(error);
      }
    )
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
      var operator = op.reconectarOperador(msg.SESSIONKEY, socket);
      socket.emit('operador_set_id', operator.id);
    } else {
      socket.user = msg.SESSIONKEY; // TODO: Cambiar por nombre de usuario cuando este la conexion con WL
      op.altaOperador(msg.SESSIONKEY, socket).then(
        (valido) => {
          if (valido.id) {
            sessions[msg.SESSIONKEY] = socket;
            sockets[socket.id] = socket;
            socket.emit('operador_set_id',valido.id);
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

  // se obtienen todos los mensajes de un chat especifico que viene por parametro su id
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

  
  socket.on("seen", function(chat, ack){
    var resp = op.confirmarVisto(chat, socket.user);
    ack(resp);
    console.log(`WebSocket -> send_op_seen: ${socket.toString()}`);
  });

  socket.on("quitar-leido", function (msg) {
    io.emit("quitar-leido",msg.id);
    op.chat_leido(msg.id,msg.leido);
  });
 
   socket.on("writing", function (id) {
     op.escribiendo(id, socket.user);
     console.log(`WebSocket -> writing: ${socket.toString()}`);
   });

   socket.on("stop-writing", function (id) {
     op.escribiendo(id, socket.user, false);
   });

  socket.on("dibujar_etiquetas",function (msg) {
    io.emit("dibujar_etiquetas",msg);
  });

  socket.on("close_chat", function(id){
    op.closeChat(id);
    io.emit("chat-cerrado",id);
  });

  socket.on('cambiar_Email', function (msg) {
    op.cambiar_Email(msg);
  })

  socket.on('adjunto-archivo', function (msg) {
    op.enviarArchivo(msg.id, msg.contenido, msg.type, msg.operadorid);
  });

  socket.on('obtener-plantillas',function(msg){
    let plantillas = op.obtenerplantillas();
    socket.emit('obtener-plantillas',plantillas);
  });

  socket.on("add_tag", function (msg) {
   op.add_tag(msg.id, msg.tag);
  });

  socket.on("delete_tag", function (msg) {
    op.delete_tag(msg.id, msg.tag);
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

const recibirMensaje = function (chat, tipo, operador,nuevo) {
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
  if(!nuevo){
    io.emit("redibujar",chat.id);
  }
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
  mensaje.tipo = chat.type;
  mensaje.hora = chat.timestamp;
  mensaje.nom = chat.name;
  mensaje.email = chat.email;
  mensaje.origen = chat.origin;
  mensaje.state = chat.state;
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

async function cambiar_asignado(canalOperador, chatid) {
  io.to(canalOperador).emit("borrar-asign", chatid);
  console.log("entre a cambiar");
}

async function quieremail(operador, idUser, chat) {
  pack = {};
  pack.idUser = idUser;
  pack.chat = chat;

   return new Promise(resolve => {
     operador.emit("email", pack, (respuesta) => {
      resolve(respuesta);
     });
   });
};

//se obtiene el nombre de que operador contesto cada mensaje, esta informacion en conjunto
// con los mensajes de todo el chat son emitidos para ser dibujados
const mensajesByChat = function(id, listamensajes, socket, append=false) {
  let msg = {};
  let promises = [];
  msg.id = id;
  
  /*se utiliza una lista de promesas ya que obtenerNombre es una promesa,
    se pushea todas las promesas dentro de promises, una vez que se cumplan
    todas las promesas, entonces se sigue el curso del codigo */
  if (Object.keys(listamensajes).length != 0){
  listamensajes.forEach((element) => {
    if(element.operador_id != undefined){
    promises.push(
    op.obtenerNombre(element.operador_id).then(
      (nombre) => {
        let split = nombre.split(",");
        element.operador_id = split[1]
      },
      (error) => {
        //  TODO: registrar el error
        console.log(error);
      }
      )
    );
    }
  });
  Promise.allSettled(promises).then((cb) => {
    msg.lista = listamensajes;
  
    if(append){
      socket.emit("getMoreMessagesByChat", msg);
    }else{
      socket.emit("getAllMessagesByChat", msg);
    }
    
  });
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
module.exports.cambiar_asignado = cambiar_asignado;


/*<script type="text/javascript">
      function enviarWA(id,contenido)
      {
            var SURL = "https://chat.muninqn.gov.ar";
            var socketo = io(`${SURL}` , {'forceNew': true, path:'/operadores/socket.io'});
            socketo.emit("wamessage",{id:id,contenido:contenido});
      }
    </script>
*/