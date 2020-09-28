import { URLs, bodyParser } from "../configs/services";
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

  /**
   *Creates an instance of Chat.
   * @param {*} id remitente del chat, igual que el original que usan las plataformas
   * @param {*} origen (W)hatsapp, (F)acebook...
   * @param {*} timestamp ultima marca de tiempo
   * @param {*} lastmessage contenido del ultmo mensaje (para que exista un chat, al menos un mensaje hubo)
   * @param {*} name nombre humano-legible del remitente
   * @memberof Chat
   */
  constructor(id, origen, timestamp, pendingmessage = 0, name, lastmessage='') {
    this.id = id;
    this.origin = origen;
    this.timestamp = timestamp;
    this.lastmessage = lastmessage;
    this.name = name;
    this.pendingmessage = pendingmessage;
  }

  async enviarMensaje(cont) {
    var options = {
      method: "POST",
      url: URLs[this.origin],
      headers: {
        "Content-Type": "application/json",
      },
      body: bodyParser(this.origin, this.id, cont),
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      res = response.body;
    });
    return res;
  }
}

module.exports = Chat;