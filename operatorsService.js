var Queue = require("better-queue");
const nodemailer = require("nodemailer");
const Asignacion = require("./models/Asignacion");
const Operador = require("./models/Operador");
const OperaDB = require("./dbService");
const db = new OperaDB();
const socket = require("./websocket");
const status = require("./configs/statusConfig");
const config = require("./configs/operatorsConfig");
const opciones = require("./configs/opciones");
var messenger = require("./messengerService");
var ms = require("./configs/messagesConfig");
var chat_asig = {}; // * Diccionario 'chatID' ->  Asignacion
var operators = {}; // * Todos los operadores disponbles
var operators_channels = {}; // * channelID -> OperatorID
var chat_unassig = [];
var ids;

var newAsign = new Queue(async function (input, cb) {
  // Pick an op and try to assign it
  if (Object.keys(operators).length === 0) {
    // No hay operadores online
    // TODO: chequear la hora de trabajo y esperar
    chat_unassig.push(input);
    cb("fail", null);
  } else {
    // FIXME: a modo de prueba, tomamos uno 'aleatorio'
    let op = random_item(operators);
    let result = await socket.asignarMensaje(
      op.socket,
      input
          );
    if (result) {
      // Save the new assignment
      let operadorID = operators_channels[op.socket.user];
      chat_asig[input.id] = new Asignacion(input.id, operadorID);
      result = true;
      console.log(`chat asig  dentro del if del result tiene ${chat_asig[input.id].operadorId} y la asignacionEstable es ${chat_asig[input.id].asignacionEstable}`);
      cb(null, result);
    } else {
      // ? TODO:
      cb(error, null);
    }
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
 * @param {Number} id TOKEN del operador nuevo
 * @param {*} canal socket o websocket de comunicacion con el operador
 */
async function altaOperador(id, canal) {
  // Validar el SESSIONKEY y recuperar el operador
  var operador = new Operador();
  let esValido = operador.validar(id);
  if (!(await esValido)) {
    // TODO: no es un token valido, salir
    return 0;
  } else {
    // Check si el operador ya existe
    if (!operators[operador.id]) {
      console.log(`entre a checkear ${canal} y opid ${operador.id}`);
      socket.desconectar(operador.socket);
      operador.socket = canal;
      operators[operador.id] = operador;
      operators_channels[canal.user] = operador.id;
    }
    // TODO: recuperar chats asignados/asignar chats y enviar
    var lista_asig = await recuperarChatsOperador(operador.id);
    if (Object.keys(lista_asig).length > 0) {

      socket.recibirLista(canal, lista_asig, true);
    }
    ids = await messenger.obtenerTodosLosChats();
    // TODO: enviar todos los chats
    let lista = await messenger.getListaChatsConDatos(ids);

    console.log(`operadores ${operador} y socket ${operador.socket}`);
    socket.recibirLista(operador.socket, lista, false);
    return operador;
  }
}

async function reconectarOperador(id, canal) {
  // * Recuperar y actualizar socket del operador
  console.log(`entre a reconectarOperador  esto ${id} y ${canal}`);
  let operador = operators[operators_channels[id]];
  console.log(`operador reconect: ${operador} e id ${operador.id}`);
  operador.socket = canal;
  console.log(`operador reconect socket ${operador.socket}`);

  // * Recuperar listados de chats
  // Enviar chats asignados
  lista_asig = await recuperarChatsOperador(operador.id);
  if (Object.keys(lista_asig).length > 0) {
    socket.recibirLista(operador.socket, lista_asig, true);
  }
  ids = await messenger.obtenerTodosLosChats();

  // Enviar todos los chats
  let lista = await messenger.getListaChatsConDatos(ids);
  
  socket.recibirLista(operador.socket, lista , false);

  return operador;
}

/**
 *  Recupera todos los chats asignados a un operador dado el id del mismo.
 *
 * @param {Numbers} id ID del operador que se requiren recuperar sus chats
 * @returns {Chat[]}  Lista de chats
 */
async function recuperarChatsOperador(id) {
  let chats = {};
  let asigns = Object.assign(
    [],
    ...Object.entries(chat_asig)
      .filter(([k, v]) => v.operadorId == id)
      .map(([k, v]) => ({ [k]: v }))
  );
 
  for (const [chatId, value] of Object.entries(asigns)) {
    let chat = await messenger.getChatByIdConDatos(chatId);

    if(chat!=undefined){
      chats[chatId] = chat;
    }
      
  }
  return chats;
}

async function bajaOperador(id) {
  var baja = false;
  var operador = new Operador();
  operador.validar(id);
  delete operators[operador.id];
  console.log("Baja operador " + id);
  //  Antes de dar de baja un operador, esperamos un tiempo prudencial
  //  -4min- tal vez sea sólo una ligera desconexión.
  setTimeout(
    (id) => {
      // Si no se volvio a conectar, le doy la desconexion logica
      if (!operators[operador.id]) {
        // TODO: Reasignar chats que no hayan sido respondidos por el operador
        // Buscar chats asignados a ese operador
        var assigned_chats = recuperarChatsOperador(operador.id);
        // Solicitar reasignacion
        for (const [chat, op] of Object.entries(assigned_chats)) {
          newAsign
            .push({ id: chat.id, cont: chat.cont, nombre: chat.nombre })
            .on("failed", (err) => {
              // The last one op
              // ? como guardamos los chats sin asignacion
            });
        }
        baja = true;
      }
    },
    240000,
    id
  );
  return baja;
}
/**
 * Funcion que captura la recepcion de un mensaje a traves
 * de los servicios de mensajeria y la envia a un operador
 * (asignando el chat de ser necesario)
 *
 * @param {Numbers} id del remitente (propio del servicio de mensajeria)
 * @param {String} cont contenido del mensaje
 */
async function recibirMensaje(chat, tipo,nuevo) {
  // TODO: check horario de trabajo / operadores online
  let horaInicio = new Date();
  let id = chat.id;
  horaInicio.setHours(parseInt(config.START_TIME));
  let horaFin = new Date();
  horaFin.setHours(parseInt(config.END_TIME));
  let horaActual = new Date(Date.now());
  //console.log(`horas inicial = ${horaInicio} hora fin = ${horaFin} y hora actual ${horaActual}`);
  //console.log(horaActual.getHours() >= horaInicio.getHours() && horaActual.getHours() <= horaFin.getHours());
  
  if (horaActual.getHours() >= horaInicio.getHours() && horaActual.getHours() <= horaFin.getHours()) {
    // Check if chat is already assigned
    if (!chat_asig[id]) {
      // Se asigna el chat
      //chat = messenger.getChatById(id);
      console.log(`dentro de !chat_asig`);
      newAsign
        .push(chat)
        .on("finish", function (res) {
          let operadorId = chat_asig[id].operadorId;
          let operador = operators[operadorId];
          console.log(`antes del asign con ${chat.name}`);
          socket.recibirMensaje(chat, tipo, operador.id,nuevo);
          return true;
        })
        .on("failed", function (err) {
          // Exception, I hope never see this
          // ? evaluar que hacer en este caso
          // FIXME: dejar en chats pendientes de asignar
          return new Error("No se puedo asignar el chat");
        });
    }else{
    // Push notification to operator
    let operadorId = chat_asig[id].operadorId;
    let operador = operators[operadorId];
      console.log(`antes del socket del ultimo con ${socket}`);
    socket.recibirMensaje(chat,tipo,operador.id,nuevo);
  }
  } else {
     //FIXME: autorespuesta
    messenger.enviarMensaje(id, config.AUTOMESSAGE, 0); 
  }
}

/**
 * Funcion que captura la recepcion de una imagen a traves
 * de los servicios de mensajeria y la envia a un operador
 * (asignando el chat de ser necesario)
 *
 * @param {Numbers} id del remitente (propio del servicio de mensajeria)
 * @param {String} cont contenido del mensaje
 */

async function recibirImagen(chat, tipo, nuevo) {
  // TODO: check horario de trabajo / operadores online
  let horaInicio = new Date();
  let id = chat.id;
  horaInicio.setHours(parseInt(config.START_TIME));
  let horaFin = new Date();
  horaFin.setHours(parseInt(config.END_TIME));
  let horaActual = new Date(Date.now());
  //FIXME: arreglar el if que no entra bien
  if (horaActual.getHours() >= horaInicio.getHours() && horaActual.getHours() <= horaFin.getHours()) {
    // Check if chat is already assigned
    if (!chat_asig[id]) {
      // Se asigna el chat
      //chat = messenger.getChatById(id);
      console.log(`dentro de !chat_asig de imagen`);
      newAsign
        .push(chat)
        .on("finish", function (res) {
          let operadorId = chat_asig[id].operadorId;
          let operador = operators[operadorId];
          console.log(`antes del asign con ${chat.name} de imagen`);
          socket.recibirMensaje(chat, tipo, operador.id, nuevo);
          return true;
        })
        .on("failed", function (err) {
          // Exception, I hope never see this
          // ? evaluar que hacer en este caso
          // FIXME: dejar en chats pendientes de asignar
          return new Error("No se puedo asignar el chat");
        });
    } else {
      // Push notification to operator
      let operadorId = chat_asig[id].operadorId;
      let operador = operators[operadorId];
      console.log(`antes del socket del ultimo imagen con ${socket}`);
      socket.recibirMensaje(chat, tipo, operador.id, nuevo);
    }
  } else {
    //FIXME: autorespuesta
    messenger.enviarMensaje(id, config.AUTOMESSAGE, 0);
  }
}
/**
 * 
 * @param {*} id identifica al chat 
 * @param {*} user socket del operador para buscarlo
 */

async function getAllMessages(id, user) {
  operador = operators_channels[user];
  chat = await messenger.getChatById(id);
  let lista_mensajes = {};
  if(chat!=undefined){
   lista_mensajes = await chat.getAllMessages(true);
  }
  return lista_mensajes;
}

async function getMoreMessages(id) {
  chat = messenger.getChatById(id);
  await chat.getMoreMessages(true);
}

//Envia el contenido cont obtenido de las opciones para los menus
function obtenerplantillas() {
  let cont = ms.obtenerPlantillas();
  return cont;
}

function modificaropciones(msg) {
  opciones.modificarOpciones(msg);
  //messenger.cambiar_opciones(msg);
}

function modificarPlantilla(msg) {
  ms.modificarPlantilla(msg);
}


/**
 * enviar el menu correspondiente al civil.
 * @param {*} Id al cual quiere enviarse el menu
 * @param {*} cont las opciones del chat
 */
function enviarMenu(id,cont) {
  messenger.enviarMenu(id,cont);
  
}
//funcionalidad de los tags
async function add_tag(id, tag) {
  messenger.add_tag(id, tag);
}

async function delete_tag(id, tag) {
  messenger.delete_tag(id, tag.nombre);
}

async function chat_leido(id,leido) {
  messenger.chat_leido(id,leido);
}

/**
 * Recupera todos los mensajes de un chat.
 * Puede recurrir a la cache/DB o pedirle al servicio de mensajeria los mensajes
 * @param {*} chatId del cual quieren recuperarse los mensajes
 */
async function mensajesChat(chatId) {}

/**
 * Envia el contenido cont redactado por un operador al remitente id
 * Sin importar el origen del chat.
 * Responsabilidad delegada a la clase chat.
 *
 * @param {Number} id del desintatario (propio del servicio de mensajeria)
 * @param {String} cont contenido del mensaje
 */
async function enviarMensaje(id, cont,operadorid) {
  messenger.enviarMensaje(id, cont,operadorid);
}
async function enviarWAMessage(id, cont) {
  messenger.enviarWAMessage(id, cont);
}

async function enviarArchivo(id, cont, type, operadorid) {
  console.log("estoy en enviar archivo de OperadorService");
  messenger.enviarArchivo(id, cont, type, operadorid); 
}

async function obtenerNombre(operadorId) {
    let razonOperador = "";   
    if(operadorId != 0){
    await db.buscar(
    "operadores",
    ["razonSocial"],
    [["operadorId", operadorId]]
  ).then(
    (operador) => {
      razonOperador = operador[0].razonSocial;
    },
    (error) => {
      console.error(error);
    }
    );
  }
  return razonOperador;
}

async function confirmarVisto(chatId, channelId) {
  // let operador = operators[operadorId];
  // Al abrir el mensaje, la asignacion pasa a ser estable (no se busca nuevo operador para el chat)
  if(chat_asig[chatId]){
    //console.log(`en confirmar visto, antes de asignacion nueva ${chat_asig[chatId].operadorId} y ${chat_asig[chatId].chatId}`);
    if (chat_asig[chatId].operadorId != operators_channels[channelId]){
      var id = chat_asig[chatId].operadorId;
      if (operators[id] != undefined){
      var socket_cambiar = operators[id].socket.id;
      socket.cambiar_asignado(socket_cambiar, chatId);
    }
    var id_operador = operators_channels[channelId];
    var nuevo_op = operators[id_operador].socket.id;
    var chat_asign = await messenger.obtenerChat(chatId);
    socket.reasignar(nuevo_op,chat_asign,id_operador);
    console.log("termine todo en confirmar");
    }
  }
  let asignacion = new Asignacion(chatId, operators_channels[channelId]);
  await asignacion.guardar();
  var asignado = asignacion.asignacionEstable;
  if(asignado){
    chat_asig[chatId]=asignacion;
    console.log(`dentro del asignado ${chat_asig[chatId].chatId}`);
  }
  console.log(`Operador -> confirmarVisto: ${asignado} y ${asignacion.chatId} , ${asignacion.operadorId} , ${asignacion.asignacionEstable}`);
  // TODO: analiticas?
  // TODO: faltaria enviar el visto a la mensajeria
  let chat = messenger.getChatById(chatId);
  console.log(`el chat antes de seen es? ${chat}`);
  if(chat!=undefined){
    chat.seen();
  }
  return true;
}

//Le envia la información del estado al chat para poder saber
//si un operador esta escribiendo o no e informarle al ciudadano
async function escribiendo(chatID, channelID, isWriting = true) {
  let operador = operators[operators_channels[channelID]];
  let str = operador.razonSocial;
  let index = str.indexOf(",") + 2;
  let nombre = str.substring(index);
  if (isWriting) {
    messenger.enviarEstado(
      chatID,
      status.WRITING_MESSAGE(nombre)
    );
  } else {
    messenger.enviarEstado(
      chatID,
      status.STOP_WRITING_MESSAGE(nombre)
    );
  }
}

async function closeChat(chatID) {
  messenger.closeChat(chatID);
  delete chat_asig[chatID];
  // TODO: analiticas de operador con chat cerrado
}

//Se recupera todo el historal en base al email
//Para que el chat exista en la BD el ciudadano debio haber cerrado el chat anteriormente
async function recuperarChatEmail(email) {
  let historial_chat;
  await db.buscar(
    "chats",
    ["tipo_chat", "contenido", "email_civil", "type","operador_id","fecha","hora"],
    [["email_civil", email]]
  ).then(
    (chats) => {
      historial_chat = chats;
    },
    (error) => {
      console.error(error);
    }
  );

  return historial_chat;
}

async function desconexionCivil(msg){
  //let operador = chat_asig[msg.user].operadorId;
  //let socketOperador = operators[operador].socket;

    //TODO: guardar historial en BD, hecho 

    var email = msg.email;
    
    msg.historial.forEach(element => {
      var hora = new Date(parseInt(element.hora));
      var fecha = hora.toLocaleDateString().toString();
      var horario = hora.getHours().toString() + ":" + hora.getMinutes().toString();
      var contenido = element.contenido;
      var tipo = element.tipo_chat;
      var operador_id = element.operador_id;
      var type = element.type;

      db.insertar(
        "chats",
        ["tipo_chat", "contenido", "email_civil", "type", "operador_id","fecha","hora"],
        [tipo,contenido , email, type, operador_id,fecha,horario]
      );    
    });
}

//deprecada funcion para mandar el email 
function mandar(msg) {
  var smtpTransport = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
      user: "no.responder.mnqn@gmail.com",
      pass: "noResponder@Code13:08"
    }
  });

  var mailOptions = {
    from: "no.responder.mnqn@gmail.com", 
    to: msg.email, 
    subject: msg.subject, 
    text: "Para su comodidad se le adjuntara un archivo txt con el contenido de la conversación", // plain text body
    html: msg.text
  };

//deprecada funcion para enviar del email
  smtpTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log('Error while sending mail: ' + error);
    } else {
      console.log('Message sent: %s', info.messageId);
    }
    smtpTransport.close(); 
  });
}

async function obteneropciones(msg) {
  return opciones.obteneropciones();
}

async function cambiar_Email(chatId) {
  messenger.cambiar_Email(chatId);
}

async function agregar_menu(msg) {
  opciones.agregar_menu(msg);
}

async function validar(token) {
  let op = new Operador();
  let res = -1;
  if(op.validar(token)){
    res = op.perfil;
  }
  return res;
}
// * Init
// Load static/stable asignations
Asignacion.getAll()
  .then((stable_assig) => {
    stable_assig.forEach((asig) => {
      // TODO: check operador online y reasignar si no
      chat_asig[asig.chatId] = asig;
    });
  })
  .catch((error) => {
    console.log(`Error leyendo Asignaciones en DB :${error}`);
  });



module.exports.altaOperador = altaOperador;
module.exports.bajaOperador = bajaOperador;
module.exports.confirmarVisto = confirmarVisto;
module.exports.cambiar_Email = cambiar_Email
module.exports.closeChat = closeChat;
module.exports.enviarMensaje = enviarMensaje;
module.exports.enviarArchivo = enviarArchivo;
module.exports.enviarWAMessage = enviarWAMessage;
module.exports.escribiendo = escribiendo;
module.exports.getAllMessages = getAllMessages;
module.exports.getMoreMessages = getMoreMessages;
module.exports.recibirMensaje = recibirMensaje;
module.exports.recibirImagen = recibirImagen;
module.exports.reconectarOperador = reconectarOperador;
module.exports.modificaropciones = modificaropciones;
module.exports.modificarPlantilla = modificarPlantilla;
module.exports.operators = operators;
module.exports.obtenerplantillas = obtenerplantillas;
module.exports.enviarMenu = enviarMenu;
module.exports.desconexionCivil = desconexionCivil;
module.exports.validar = validar;
module.exports.recuperarChatEmail=recuperarChatEmail;
module.exports.obtenerNombre = obtenerNombre;
module.exports.add_tag = add_tag;
module.exports.delete_tag = delete_tag;
module.exports.chat_leido = chat_leido;
module.exports.obteneropciones = obteneropciones;
