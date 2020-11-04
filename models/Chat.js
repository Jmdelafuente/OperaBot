// import { URLs, bodyParser } from "../configs/services";
const services = require("../configs/services");
const axios = require("axios").default;
const estado = require("./Estado"); // estado.js exporta las clases 'Abierto' y 'Cerrado'

/**
 *
 *
 * @class Chat
 */
class Chat {
  // * chat.id;           -> Posiblemente el mismo que usen F o W
  // * chat.timestamp;    -> Ultimo timestamp, puede ser local o la que traiga original
  // * chat.lastmessage;  -> Ultimo mensaje, para mantener una verificación de actualizacion
  // * chat.origin;       -> Origen 'F' o 'W'
  // * chat.name;         -> Nombre para mostrar / humano legible
  // ? chat.avatar;       -> Tal vez sea necesario usar las fotos de perfil o avatares para mejor usabilidad
  // ? chat.estado        -> Para llevar control de los estados de una conversacion
  /**
   *Creates an instance of Chat.
   * @param {*} id remitente del chat, igual que el original que usan las plataformas
   * @param {*} origen (W)hatsapp, (F)acebook...
   * @param {*} name nombre humano-legible del remitente
   * @param {*} timestamp ultima marca de tiempo
   * @param {*} pendingmessage cantidad de mensajes sin leer
   * @param {*} lastmessage contenido del ultmo mensaje (para que exista un chat, al menos un mensaje hubo)
   * @memberof Chat
   */
  constructor(id, origen, name, timestamp, pendingmessage = 0, lastmessage='') {
    this.id = id;
    this.origin = origen;
    this.name = name;
    this.lastmessage = lastmessage;
    this.pendingmessage = pendingmessage;
    this.timestamp = timestamp;
    this.state = new estado.Abierto(this);
  }

  async enviarMensaje(cont) {
    let res = false;
    axios
      .post(services.URLs[this.origin]+"/sendMessage", {
        body: services.bodyParser(this.origin, this.id, cont),
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        res = response.data;
        // Actualizamos el estado interno del chat
        this.pendingmessage = 0;
        this.lastmessage = cont;
        this.timestamp = Date.now();
        return res;
      })
      .catch(function (error) {
        throw new Error(error);
      });
  }

  changeState (state) {
    this.state = state;
  }

  // funcionalidad para modificar el estado del chat
  asignacion () {
    this.state.asignacion();
  }
  
  // funcionalidad para modificar el estado del chat
  resolucionOk () {
    this.state.resolucionOk();
  }
  
  // funcionalidad para modificar el estado del chat
  resolucionFallida () {
    this.state.resolucionFallida();
  }
  
}

module.exports = Chat;