/**
 * Operador (persona) que utiliza el sistema, tiene relacion con las personas de WebLogin
 * y facilita la generacion de analiticas y auditorias.
 * No esta relacionado con Operator (controlador).
 * @class Operador
 */
const db = require("../dbService");
class Operador {
  /**
   *Creates an instance of Operador.
   * @param {*} id del operador (persona) en la DB
   * @param {*} wappersona id de la persona relacionada del weblogin
   * @param {*} perfil
   * @memberof Operador
   */
  constructor(wappersona, perfil, email, razonSocial, cuit) {
    this.id = '';
    this.idwappersona = wappersona;
    this.email = email;
    this.razonSocial = razonSocial;
    this.cuit = cuit;
    this.online = false;
    this.autoasignacion = true;
    this.perfil = perfil;
    this.db = new db("../operaBOT.db");
  }

  async guardar() {
    this.db
      .insertar(
        "operadores",
        ["email","cuit","razonSocial","wapPersonaId"],
        [this.email, this.cuit, this.razonSocial, this.idwappersona]
      )
      .then(
        (done) => {
          this.id = done;
          return done;
        },
        (fail) => {return fail;}
      );
  }
}
module.exports = Operador;