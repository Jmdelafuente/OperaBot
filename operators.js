module.exports.nuevoMensaje = nuevoMensaje;
module.exports.enviarMensaje = enviarMensaje;
module.exports.altaOperador = altaOperador;
module.exports.bajaOperador = bajaOperador;
module.exports.chat_all = chat_all;
var Queue = require("better-queue");
const request = require("request");
var chat_asig = {};
var chat_all = [];
var operators = {};

// TODO: Tenemos que definir una estructura interna para el chat
// ? posible estructura guardada en models/chat.js
// * chat.id;           -> Posiblemente el mismo que usen F o W
// * chat.timestamp;    -> Ultimo timestamp, puede ser local o la que traiga original
// * chat.lastmessage;  -> Ultimo mensaje, para mantener una verificación de actualizacion
// * chat.origin;       -> Origen 'F' o 'W'
// * chat.name;         -> Nombre para mostrar / humano legible
// * chat.avatar;       -> Tal vez sea necesario usar las fotos de perfil o avatares para mejor usabilidad

var notify_newAssig = new Queue(function (input, cb) {
    // Pick an op and try to assign it

    // Callback / response
    cb(null, result);
});

async function enviarMensaje(id, cont){
    // var chat = chat_all[id];
    // ! Datos de prueba
    var chat = {};
    chat.origin = 'W';

    var org = "";
    var port = "";
    if(chat.origin = 'W'){
        org='wa';
        port=3003
    }else{
        org = "fa";
        port = 3002
    }
    var options = {
      'method': "POST",
      'url': `http://localhost:${port}/${org}/sendMessage`,
      'headers': {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        'id': id,
        'message': cont
      }),
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      wa_list = response.body;
    });
}

async function nuevoMensaje(id, cont, origen) {
    // Check if chat is already assigned
    if (chat_asig[id]) {
        // Push notification to operator
        chat_asig[id].notify_newMessage(id, cont);
    } else {
        // * We need to assign it
        var chat = {};
        
        notify_newAssig.push({ id: id, cont: chat })
            .on('finish', function (res) {
                // Save the assignment
                chat_asig[id] = res.op;
                return true;
            })
            .on('failed', function (err) {
                // Exception, I hope never see this
                // ? evaluar que hacer en este caso
                return new Error("No se puedo asignar el chat");
            })
        chat_all.push(chat);
    }
}

async function altaOperador(id) {
    // Create new connection for this op
    
    // Save {id,connection} for later
}

async function bajaOperador(id) {
    // Reassign chats
    var assigned_chats = Object.assign({}, ...
        Object.entries(chat_asig).filter(([k, v]) => v == id).map(([k, v]) => ({ [k]: v }))
    );
    assigned_chats.forEach(chat => {
        notify_newAssig.push({ id: chat.id, cont: chat.cont })
            .on('finish', function (res) {
                // Save the new assignment
                chat_asig[id] = res.op;
            })
            .on('failed', function (err) {
                // The last one op
                // ? siendo el último se puede desconectar con chats aún abiertos?
            })
    });
    // 'Disconnect' the op
    delete operators[id];
    // Release its connection
}