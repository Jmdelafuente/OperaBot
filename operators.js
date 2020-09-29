var Queue = require("better-queue");
var Chat = require("./models/Chat");
var socket = require("./websocket");
var messenger = require("./messengerService");
var chat_asig = {}; // * Diccionario 'operadorID' -> socket
var operators = {}; // * Todos los operadores disponbles

// TODO: Tenemos que definir una estructura interna para el chat
// ? posible estructura guardada en models/chat.js

var newAsign = new Queue(function (input, cb) {
  // Pick an op and try to assign it
  // FIXME: a modo de prueba, tomamos uno 'aleatorio'
  let op = operators[Math.floor(Math.random() * arr.length)];
  result = socket.asignarMensaje(operators[op], input.id, input.cont);
  // Callback / response
  cb(null, result);
});


async function altaOperador(id, canal) {
  // Save {id,connection} for later
  operators[id] = canal;
  lista = messenger.chatsList();
  // socket.recibirLista(canal, lista);
}

async function bajaOperador(id) {
    var baja = false;
    delete operators[id];
    //  Antes de dar de baja un operador, esperamos un tiempo prudencial
    //  -4min- tal vez sea sólo una ligera desconexión.
    setTimeout(
        id=>{
            // Si no se volvio a conectar, le doy la desconexion logica
            if (! operators[id]) {
                // ? Cuando un operador se deconecta, sus chats se reasignan?
                // Reassign chats
                var assigned_chats = Object.assign(
                    {},
                    ...Object.entries(chat_asig)
                    .filter(([k, v]) => v == id)
                    .map(([k, v]) => ({ [k]: v }))
                );
                assigned_chats.forEach((chat) => {
                    newAsign
                    .push({ id: chat.id, cont: chat.cont })
                    .on("finish", function (res) {
                        // Save the new assignment
                        chat_asig[id] = res.op;
                    })
                    .on("failed", function (err) {
                        // The last one op
                        // ? siendo el último se puede desconectar con chats aún abiertos?
                    });
                });
                baja = true;
            }
        }, 240000, id
    );
    return baja;
}

async function recibirMensaje(id, cont) {
  // Check if chat is already assigned
  if (chat_asig[id]) {
    // Push notification to operator
    socket.recibirMensaje(chat_asig[id], id, cont);
  } else {
    // * We need to assign it
    newAsign
      .push({ cont: chat })
      .on("finish", function (res) {
        // Save the assignment
        chat_asig[id] = res.op;
        return true;
      })
      .on("failed", function (err) {
        // Exception, I hope never see this
        // ? evaluar que hacer en este caso
        return new Error("No se puedo asignar el chat");
      });
  }
}

async function enviarMensaje(id, cont) {
  messenger.enviarMensaje(id,cont);
}


module.exports.altaOperador = altaOperador;
module.exports.bajaOperador = bajaOperador;
module.exports.recibirMensaje = recibirMensaje;
module.exports.enviarMensaje = enviarMensaje;
module.exports.operators = operators;