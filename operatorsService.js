var Queue = require("better-queue");
const nodemailer = require("nodemailer");
const Asignacion = require("./models/Asignacion");
const Operador = require("./models/Operador");
const socket = require("./websocket");
const status = require("./configs/statusConfig");
const config = require("./configs/operatorsConfig");
const opciones = require("./configs/opciones");
var messenger = require("./messengerService");
var chat_asig = {}; // * Diccionario 'chatID' ->  Asignacion
var operators = {}; // * Todos los operadores disponbles
var operators_channels = {}; // * channelID -> OperatorID
var chat_unassig = [];

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
      operador.socket = canal;
      operators[operador.id] = operador;
      operators_channels[canal.user] = operador.id;
    }
    // TODO: recuperar chats asignados/asignar chats y enviar
    var lista_asig = recuperarChatsOperador(operador.id);
    console.log(`lista de asignados en reconectar operador ${lista_asig}`);
    if (Object.keys(lista_asig).length > 0) {
      socket.recibirLista(canal, lista_asig, true);
    }

    // TODO: enviar todos los chats
    socket.recibirLista(canal, messenger.chatsList(), false);
    return operador.id;
  }
}

function reconectarOperador(id, canal) {
  // * Recuperar y actualizar socket del operador
  let operador = operators[operators_channels[id]];
  operador.socket = canal;

  // * Recuperar listados de chats
  // Enviar chats asignados
  lista_asig = recuperarChatsOperador(operador.id);

  if (Object.keys(lista_asig).length > 0) {
    socket.recibirLista(operador.socket, lista_asig, true);
  }

  // Enviar todos los chats
  socket.recibirLista(operador.socket, messenger.chatsList(), false);
}

/**
 *  Recupera todos los chats asignados a un operador dado el id del mismo.
 *
 * @param {Numbers} id ID del operador que se requiren recuperar sus chats
 * @returns {Chat[]}  Lista de chats
 */
function recuperarChatsOperador(id) {
  let chats = {};
  let asigns = Object.assign(
    [],
    ...Object.entries(chat_asig)
      .filter(([k, v]) => v.operadorId == id)
      .map(([k, v]) => ({ [k]: v }))
  );
 
  for (const [chatId, value] of Object.entries(asigns)) {
    let chat = messenger.getChatById(chatId);
    if(chat!=undefined){
      console.log(`estoy en recuperar chat ${JSON.stringify(chat)}`);
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
async function recibirMensaje(chat, tipo) {
  // TODO: check horario de trabajo / operadores online
  let horaInicio = new Date();
  let id = chat.id;
  horaInicio.setHours = config.START_TIME;
  let horaFin = Date(config.END_TIME);
  horaFin.setHours = config.START_TIME;
  let horaActual = new Date(Date.now());
  //FIXME: arreglar el if que no entra bien
  //if (horaActual.getHours() > horaInicio && horaActual.getHours() < horaFin) {
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
          socket.recibirMensaje(chat, tipo, operador.id);
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
    socket.recibirMensaje(chat,tipo,operador.id);
  }
  //} else {
    // FIXME: autorespuesta
  //}
}

/**
 * Funcion que captura la recepcion de una imagen a traves
 * de los servicios de mensajeria y la envia a un operador
 * (asignando el chat de ser necesario)
 *
 * @param {Numbers} id del remitente (propio del servicio de mensajeria)
 * @param {String} cont contenido del mensaje
 */

async function recibirImagen(chat, tipo) {
  // TODO: check horario de trabajo / operadores online
  let horaInicio = new Date();
  let id = chat.id;
  horaInicio.setHours = config.START_TIME;
  let horaFin = Date(config.END_TIME);
  horaFin.setHours = config.START_TIME;
  let horaActual = new Date(Date.now());
  //FIXME: arreglar el if que no entra bien
  //if (horaActual.getHours() > horaInicio && horaActual.getHours() < horaFin) {
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
        socket.recibirMensaje(chat, tipo, operador.id);
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
    socket.recibirMensaje(chat, tipo, operador.id);
  }
}

async function getAllMessages(id, user) {
  operador = operators_channels[user];
  chat = messenger.getChatById(id);
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
function obteneropciones() {
  let cont = opciones.obteneropciones();
  return cont;
}

/**
 * enviar el menu correspondiente al civil.
 * @param {*} Id al cual quiere enviarse el menu
 * @param {*} cont las opciones del chat
 */
function enviarMenu(id,cont) {
  messenger.enviarMenu(id,cont);
  
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
async function enviarMensaje(id, cont) {
  messenger.enviarMensaje(id, cont);
}

async function enviarArchivo(id,cont) {
  messenger.enviarArchivo(id, cont); 
}

async function confirmarVisto(chatId, channelId) {
  // let operador = operators[operadorId];
  // Al abrir el mensaje, la asignacion pasa a ser estable (no se busca nuevo operador para el chat)
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
  if(chat!=undefined){
    chat.seen();
  }
}

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

async function desconexionCivil(msg){
  //TODO: que sea algo visual (boton?), en page service, hacer json con todos los mensajes (hecha) y 
  //TODO: preguntar al operador si los quiere, si dice si, mail, else, borrar
  
  let operador = chat_asig[msg.user].operadorId;
  let socketOperador = operators[operador].socket;
  let str = '';
  
  //messenger.recuperarHistorial();
  let quieremail = await socket.quieremail(socketOperador,msg.user,chat);
  if(quieremail){
    console.log(`dentro de quiere email ${JSON.stringify(msg)}`);
    let img ='';
    //TODO: guardar historial en BD 
    var time = new Date(Date.now());
    var meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    str += `<p>chat finalizado con el 147 el dia ${time.getDate().toString()} de ${meses[time.getMonth()]} del año ${time.getFullYear()} a las ${time.getHours().toString()} horas con ${time.getMinutes().toString()}</p> `
    str += `<p> con el siguiente contenido </p>`;
    msg.historial.forEach(element => {
      var hora = new Date(parseInt(element.hora));

      if(element.type=='chat'){
        str += `<p>${element.contenido}`;
      if(element.tipo_chat == 0){
        str += ` enviado por usted `;
      }else{
        str += ` enviado por operador `;
      }
      str += `a las ${hora.getHours().toString()} horas con ${hora.getMinutes().toString()} minutos </p>`;
    }else{
      str += `<img src=\"${element.contenido}\" alt=\"red dot\"`;
    }
    });


    console.log(str)
    var pack = {};
    pack.email = (msg.email[0].email);
    pack.subject = 'Chat con el 147';
    pack.text = str;
    pack.type = msg.type;
    pack.img = img;
    mandar(pack);
    str = '';

   
 }

}

function mandar(msg) {
  // create reusable transporter object using the default SMTP transport
  var smtpTransport = nodemailer.createTransport({
    service: 'Gmail', // sets automatically Host, port and connection security settings
    auth: {
      user: "no.responder.mnqn@gmail.com",
      pass: "noResponder@Code13:08"
    }
  });

 

  // setup email data with unicode symbols
  var mailOptions = {
    from: "no.responder.mnqn@gmail.com", // sender address
    to: msg.email, // list of receivers
    subject: msg.subject, // Subject line
    text: "Para su comodidad se le adjuntara un archivo txt con el contenido de la conversación", // plain text body
    html: msg.text
  };

  // send mail with defined transport object
  smtpTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log('Error while sending mail: ' + error);
    } else {
      console.log('Message sent: %s', info.messageId);
    }
    smtpTransport.close(); // shut down the connection pool, no more messages.
  });
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
module.exports.closeChat = closeChat;
module.exports.enviarMensaje = enviarMensaje;
module.exports.enviarArchivo = enviarArchivo;
module.exports.escribiendo = escribiendo;
module.exports.getAllMessages = getAllMessages;
module.exports.getMoreMessages = getMoreMessages;
module.exports.recibirMensaje = recibirMensaje;
module.exports.recibirImagen = recibirImagen;
module.exports.reconectarOperador = reconectarOperador;
module.exports.operators = operators;
module.exports.obteneropciones = obteneropciones;
module.exports.enviarMenu = enviarMenu;
module.exports.desconexionCivil = desconexionCivil;