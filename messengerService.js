var Chat = require("./models/Chat");
var op = require("./operatorsService");
var axios = require("axios").default;
const services = require("./configs/servicesConfig");
var chatsList = {};
/**
 * !DEPRECATED
 * Recibe una lista de chats de un servicio de mensajeria y genera los objetos correspondientes
 * @param {*} lista
 * @param {*} origen
 */
async function nuevalistaChats(lista, origen) {
  for (var c of lista) {
    var newChat;
    switch (origen) {
      case "W":
        newChat = new Chat(c.id, "W", c.t, c.unreadCount, c.contact.pushname);
        break;
      case "P":
        newChat = new Chat(
          c.id,
          "P",
          c.timestamp,
          0,
          c.name ? c.name : `Anonimo - ${c.id.substring(4)}`
        );
        break;
      default:
        break;
    }
    chatsList[newChat.id] = newChat;
  }
  // Ordenamos de mas reciente a menos reciente
  chatsList.sort(function (a, b) {
    return b.timestamp - a.timestamp;
  });
}

async function nuevoMensaje(
  id,
  cont,
  origen,
  t,
  nombre = "Anonimo",
  tipo = "chat",
  email
) {
  var nuevo = false;
  let res = false;
  // Check if chat exists
  if (chatsList[id]) {
    chatsList[id].timestamp = t;
    chatsList[id].name = nombre; //puede haber cambiado de nombre la persona
    chatsList[id].pendingmessage++;
    chatsList[id].lastmessage = cont;
    chatsList[id].email = email;
    chatsList[id].leido = false;
    var chat = chatsList[id];
    chat.chat_abierto("Abierto");
     console.log(`chat en MS es ${chat}`);
     if (chat) {
       res = await chat.asignacion();
     }
  } else {
    var chat = new Chat(id, origen, nombre, t, 1, cont, email);
    chatsList[id] = chat;
    nuevo = true;
    res = true;
  }
  // Notify new message
  op.recibirMensaje(chat,tipo,nuevo);
  return res;
}

async function nuevaImagen(
  id,
  cont,
  origen,
  t,
  nombre = "Anonimo",
  type = "image",
  email
) {
  var nuevo = false;
  // Check if chat exists
  if (chatsList[id]) {
    chatsList[id].timestamp = t;
    chatsList[id].name = nombre; //puede haber cambiado de nombre la persona
    chatsList[id].pendingmessage++;
    chatsList[id].lastmessage = cont;
    chatsList[id].email = email;
    chat = chatsList[id];
    chat.chat_abierto("Abierto");
    if (chat) {
      res = await chat.asignacion();
    }
    } else {
    var chat = new Chat(id, origen, nombre, t, 1, cont, email);
    chatsList[id] = chat;
    nuevo = true;
    res = true;
  }
  // Notify new message
  op.recibirImagen(chat,type,nuevo);
  return res;
}

async function enviarMensaje(id, cont,operadorid) {
  var chat = chatsList[id];
  let res = await chat.enviarMensaje(cont,operadorid);
  return res;
}

async function enviarWAMessage(id, cont) {

  let res;
  await axios
    .post("http://localhost:3003/wa/sendmessage", {
      body: services.bodyParser('W', id, cont),
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
    })
    .catch(function (error) {
      res = new Error(error);
    });
  return res;  

}

//Se envia a page Server el chat correspondiente al email para que tengan todo el historial
//de conversaciones anteriores (si es que existieron)
async function recuperarChatEmail(idUser,email) {
  let historial = await op.recuperarChatEmail(email);
  console.log(`historal de chat ${historial}`);
  await axios
    .post("http://localhost:3004/ps/recuperarChatEmail", {
      body: services.bodyParser('P', idUser, historial),
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
       console.log(`statusCode: ${response.statusCode}`);
        console.log(response);
    })
    .catch(function (error) {
      console.error(error);
    });
}

async function cambiar_Email(id) {
  var chat = chatsList[id];
  let res = await chat.cambiar_Email(id);
  return res;
}

async function enviarArchivo(id, cont, type, operadorid) {
  var chat = chatsList[id];
  let res = await chat.enviarArchivo(cont, type, operadorid);
  return res;
}

async function enviarEstado(id, cont) {
  var chat = chatsList[id];
  let res = false;
  if (chat) {
    res = await chat.enviarEstado(cont);
  }
  return res;
}

async function chat_leido(id,leido) {
  var chat = chatsList[id];
  let res = false;
  if(chat){
    res = await chat.chat_leido(leido);
  }
  return res;
}

//funcionalidad para añadir tag de un chat
async function add_tag(id, tag) {
  var chat = chatsList[id];
  let res = false;
  if (chat) {
    res = await chat.insertarTag(tag);
  }
  return res;
}
//funcionalidad para eliminar tag de un chat
async function delete_tag(id, tag) {
  var chat = chatsList[id];
  let res = false;
  if (chat) {
    res = await chat.eliminarTag(tag);
  }
  return res;

}

async function obtenerChat(chatid) {
  var chat = chatsList[chatid];
  if(chat){
    return chat;
  }
}


async function enviarMenu(id, cont) {
  var chat = chatsList[id];
  let res = await chat.enviarMenu(cont);
  return res;
}

async function closeChat(id) {
  var chat = chatsList[id];
  let res = false;
  chat.chat_cerrado("Cerrado");
  console.log(`chat en MS de closeChat es ${chat}`);
  if (chat) {
    res = await chat.resolucionOk();
  }
  //delete chatsList[id];
  return res;
}

//TODO: parte del administrador, cuando modifique el menú que se envie a burbuja el nuevo menú 
async function cambiar_opciones(msg) {
  
    let res;
    await axios
      .post(services.URLs[this.origin] + "/modificaropciones", {
        body: services.bodyParser('P', 0, msg),
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
      })
      .catch(function (error) {
        res = new Error(error);
      });
    return res;
  }


async function getMensajesChat(id) {}

function getListaChats() {
  
  return chatsList;
  // return JSON.stringify(chatsList);
}

async function getChatById(id) {
  var rta = false;
   
  console.log(`estoy en chatById`);
  await axios
    .post(services.URLs[this.origin] + "/obtenerDatos", {
      body: services.bodyParser('P', id, "obtengo datos"),
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      console.log(`respuesta de chatById ${res}`);
      if (res.nombre != '') {
        chatsList[id].name = res.nombre;
      } else {
        chatsList[id].name = "Anomimo";
      }
      chatsList[id].email = res.email;
      if (res.leido == 'leido') {
        rta = true;
      }
      chatsList[id].leido = rta;
      chatsList[id].estado = res.estado;
      return chat_actual;
    })
    .catch(function (error) {
      res = new Error(error);
    });

 
  // return JSON.stringify(chatsList);
}

async function disconnect(msg, timestamp) {
  // TODO: aviso de cliente desconectado
  var text = JSON.parse(msg.body);
  //var chat = chatsList[text.user];
  // * como le digo si quiere o no para mandar mail?
  //chat.resolucionOk();
  op.desconexionCivil(text);
}

// * INIT
// Get all chats
Chat.getAll().then(
  (lista) => {
    console.log(`esto se hace al init o que onda? ${lista}`);
    chatsList = lista;
  },
  (error) => {
    console.log(error);
  }
);

module.exports.chatsList = getListaChats;
module.exports.closeChat = closeChat;
module.exports.cambiar_Email = cambiar_Email;
module.exports.disconnect = disconnect;
module.exports.enviarMensaje = enviarMensaje;
module.exports.enviarEstado = enviarEstado;
module.exports.enviarArchivo = enviarArchivo;
module.exports.cambiar_opciones = cambiar_opciones;
module.exports.getChatById = getChatById;
module.exports.nuevaImagen = nuevaImagen;
module.exports.nuevalistaChats = nuevalistaChats;
module.exports.nuevoMensaje = nuevoMensaje;
module.exports.enviarMenu = enviarMenu;
module.exports.enviarWAMessage = enviarWAMessage;
module.exports.recuperarChatEmail = recuperarChatEmail;
module.exports.add_tag = add_tag;
module.exports.delete_tag = delete_tag;
module.exports.chat_leido = chat_leido;
module.exports.obtenerChat = obtenerChat;