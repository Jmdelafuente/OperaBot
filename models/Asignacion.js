const OperaDB = require("../dbService");

class Asignacion {
  /**
   *Creates an instance of Asignacion.
   * @param {*} chatId Identificador del chat asignado
   * @param {*} operadorId Identificador del operador a tratar el chat
   * @param {boolean} [asignacionEstable=false] Por defecto la asignacion es transitoria hasta que el operador abra el chat o escriba un mensaje.
   * @memberof Asignacion
   */
  constructor(chatId, operadorId, asignacionEstable = false) {
    this.chatId = chatId;
    this.operadorId = operadorId;
    this.asignacionEstable = asignacionEstable;
    this.db = new OperaDB();
  }
  async guardar() {
    await this.db
      .insertar(
        "asignaciones",
        ["operadorId", "chatId"],
        [this.operadorId, this.chatId]
      )
      .then(
        (done) => {
          this.asignacionEstable = true;
          return done;
        },
        (fail) => {
          return fail;
        }
      );
  }

  static async getAll() {
    let db = new OperaDB();
    let asigns = [];
    let res = await db.buscar("asignaciones", ["*"], []);
    res.forEach((element) => {
      asigns.push(new Asignacion(element.chatId, element.operadorId, true));
    });
    return asigns;
  }
}

module.exports = Asignacion;