var Queue = require("better-queue");
// var Chat = require("./models/Chat");
var socket = require("./websocket");
const Asignacion = require("./models/Asignacion");
var messenger = require("./messengerService");
var chat_asig = {}; // * Diccionario 'chatID' ->  Asignacion
var operators = {}; // * Todos los operadores disponbles

var newAsign = new Queue(async function (input, cb) {
  // Pick an op and try to assign it
  // FIXME: a modo de prueba, tomamos uno 'aleatorio'
  let op = random_item(operators);
  let result = await socket.asignarMensaje(op, input.id, input.cont, input.nombre);
  if (result) {
    // Save the new assignment
    chat_asig[input.id] = new Asignacion(input.id,result.user);
    result = true;
    cb(null, result);
  } else {
    // ? TODO:
    cb(error, null);
  }
});

function random_item(items) {
  let keys = Object.keys(items);
  let i = keys.length;
  let random = Math.floor(Math.random() * i);
  return items[keys[random]];
}


/**
 * Notificar el alta de un operador
 * cuando un operador se conecta a la plataforma, se registra
 * el id del operador y el id del canal de comunicación del mismo
 * 
 * @param {*} id del operador nuevo
 * @param {*} canal socket o websocket de comunicacion con el operador
 */
async function altaOperador(id, canal) {
  // Check si el operador ya existe
  if (!operators[id]){
    // Save {id,connection} for later
    operators[id] = canal;
  }else{
    // TODO: recuperar chats asignados/asignar chats y enviar
    lista_asig = recuperarChatsOperador(id);
    socket.recibirLista(canal, lista_asig, true);
  }
  // TODO: enviar todos los chats
  lista = messenger.chatsList();
  socket.recibirLista(canal, lista, false);
}
/**
 *  Recupera todos los chats asignados a un operador dado el id del mismo.
 *
 * @param {*} id ID del operador que se requiren recuperar sus chats
 * @returns {Chat[]}  Lista de chats
 */
function recuperarChatsOperador(id){
  return Object.assign(
                    {},
                    ...Object.entries(chat_asig)
                    .filter(([k, v]) => v.user == id)
                    .map(([k, v]) => ({ [k]: v }))
                );
}

async function bajaOperador(id) {
    var baja = false;
    delete operators[id];
    console.log('Baja operador '+id);
    //  Antes de dar de baja un operador, esperamos un tiempo prudencial
    //  -4min- tal vez sea sólo una ligera desconexión.
    setTimeout(
        id=>{
            // Si no se volvio a conectar, le doy la desconexion logica
            if (! operators[id]) {
                // ? Cuando un operador se deconecta, sus chats se reasignan?
                // Buscar chats asignados a ese operador
                var assigned_chats = recuperarChatsOperador(id);
                // Solicitar reasignacion
                for (const [chat, op] of Object.entries(assigned_chats)) {
                    newAsign
                    .push({ id: chat.id, cont: chat.cont, nombre: chat.nombre })
                    .on("failed", err => {
                        // The last one op
                        // ? siendo el último se puede desconectar con chats aún abiertos?
                    });
                }
                baja = true;
            }
        }, 240000, id
    );
    return baja;
}
/**
 * Funcion que captura la recepcion de un mensaje a traves
 * de los servicios de mensajeria y la envia a un operador
 * (asignando el chat de ser necesario)
 *
 * @param {*} id del remitente (propio del servicio de mensajeria)
 * @param {*} cont contenido del mensaje
 */
async function recibirMensaje(id, cont) {
  // Check if chat is already assigned
  if (chat_asig[id]) {
    // Push notification to operator
    socket.recibirMensaje(chat_asig[id].user, id, cont);
  } else {
    // * We need to assign it
    chat = messenger.getChatById(id);
    newAsign
      .push({id:id, cont: cont, nombre:chat.name })
      .on("finish", function (res) {
        // Save the assignment
        // chat_asig[id] = res.op;
        return true;
      })
      .on("failed", function (err) {
        // Exception, I hope never see this
        // ? evaluar que hacer en este caso
        return new Error("No se puedo asignar el chat");
      });
  }
}


/**
 * Recupera todos los mensajes de un chat.
 * Puede recurrir a la cache/DB o pedirle al servicio de mensajeria los mensajes
 * @param {*} chatId del cual quieren recuperarse los mensajes
 */
async function mensajesChat(chatId){
  
}

/**
 * Envia el contenido cont redactado por un operador al remitente id
 * Sin importar el origen del chat.
 * Responsabilidad delegada a la clase chat.
 *
 * @param {*} id del desintatario (propio del servicio de mensajeria)
 * @param {*} cont contenido del mensaje
 */
async function enviarMensaje(id, cont) {
  messenger.enviarMensaje(id,cont);
}

async function confirmarVisto(chatId,operadorId){
  let operador = operators[operadorId];
  var asignado = await operador.guardarAsignacion(chatId);
  // TODO: analiticas?
  // TODO: faltaria enviar el visto a la mensajeria
}


module.exports.altaOperador = altaOperador;
module.exports.bajaOperador = bajaOperador;
module.exports.recibirMensaje = recibirMensaje;
module.exports.enviarMensaje = enviarMensaje;
module.exports.confirmarVisto = confirmarVisto;
module.exports.operators = operators;