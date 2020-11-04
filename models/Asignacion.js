const db = require("../dbService");

class Asignacion {
  constructor(chatId, operadorId, asignacionEstable = false) {
    this.chatId = chatId;
    this.operadorId = operadorId;
    this.asignacionEstable = asignacionEstable;
  }
  async guardar() {
    this.db
      .insertar("asignaciones", ["operadorId", "chatId"], [this.operadorId, this.chatId])
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
}