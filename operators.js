module.exports.nuevoMensaje = nuevoMensaje;
module.exports.altaOperador = altaOperador;
module.exports.bajaOperador = bajaOperador;


var Queue = require("better-queue");
chat_asig = {};
chat_all = [];
operators = {};

var notify_newAssig = new Queue(function (input, cb) {
    // Pick an op and try to assign it

    // Callback / response
    cb(null, result);
});

async function nuevoMensaje(id, cont, origen) {
    // Check if chat is already assigned
    if (chat_asig[id]) {
        // Push notification to operator
        chat_asig[id].notify_newMessage(id, cont);
    } else {
        // * We need to assign it
        notify_newAssig.push({ id: id, cont: cont })
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