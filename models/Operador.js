/**
 * Operador (persona) que utiliza el sistema, tiene relacion con las personas de WebLogin
 * y facilita la generacion de analiticas y auditorias.
 * No esta relacionado con Operator (controlador).
 * @class Operador
 */
const weblogin = require("../configs/weblogin");
const OperaDB = require("../dbService");

class Operador {
  /**
   *Creates an instance of Operador.
   * @param {*} id del operador (persona) en la DB
   * @param {*} wappersona id de la persona relacionada del weblogin
   * @param {*} perfil
   * @memberof Operador
   */
  constructor() {
    this.id = "";
    this.idwappersona = "";
    this.email = "";
    this.razonSocial = "";
    this.cuit = "";
    this.online = false;
    this.autoasignacion = true;
    this.perfil = "";
    this.socket = null;
    this.db = new OperaDB();
  }

  init(operadorId, idwappersona, perfil, email, razonSocial, cuit) {
    this.id = operadorId;
    this.idwappersona = idwappersona;
    this.email = email;
    this.razonSocial = razonSocial;
    this.cuit = cuit;
    this.online = true;
    this.autoasignacion = true;
    this.perfil = perfil;
    this.socket = null;
    // this.db = new db("../operaBOT.db");
  }
  /**
   * Método para recuperar un operador dado un filtro o conjunto de igualdades a cumplir
   *
   * @param {*} filtro arreglo cuyos elementos tienen la forma [clave, valor] a buscar por igualdad.
   * @returns {Boolean} true en caso de recuperarlo exitosamente, false en otro caso.
   * @memberof Operador
   */
  async recuperar(filtro) {
    var ret = true;
    var promesa = this.db
      .buscar(
        "operadores",
        ["email", "cuit", "razonSocial", "wapPersonaId", "operadorId"],
        filtro
      )
      .then((response) => response[0]);
    let operador = await promesa;
    this.init(
      operador.operadorId,
      operador.idwappersona,
      undefined,
      operador.email,
      operador.razonSocial,
      operador.cuit
    );
    return ret;
  }

  async guardar() {
    var ret = false;
    var op = this;
    var promesa = this.db
      .insertar(
        "operadores",
        ["email", "cuit", "razonSocial", "wapPersonaId"],
        [this.email, this.cuit, this.razonSocial, this.idwappersona]
      )
      .then(
        (done) => {
          op.id = done;
          ret = done;
        },
        (fail) => {
          ret = fail;
        }
      );
    await promesa;
    return ret;
  }

  async validar(token) {
    var res = false;
    var operadorGuardado = {};
    let usuario = await weblogin.validarToken(token);
    let hoy = new Date().toISOString();
    let esValido = false;
    // TODO: verificar si el usuario existe
    if (usuario.perfil) {
      esValido = true;
      let promise = this.db.buscar(
        "operadores",
        ["operadorId", "email", "cuit", "razonSocial", "wapPersonaId"],
        [["email", usuario.userName]]
      );
      let op = await promise;
      if (op.length != 0) {
        operadorGuardado = op[0];
      } else {
        // TODO: No existe el usuario, pero tiene permiso, dar alta
        promise = this.db.insertar(
          "operadores",
          ["email", "cuit", "razonSocial", "wapPersonaId", "ultimoAcceso"],
          [
            usuario.userName,
            usuario.datosPersonales.cuil,
            usuario.datosPersonales.razonSocial,
            usuario.datosPersonales.referenciaID,
            hoy,
          ]
        );
        let v = await promise;
        operadorGuardado.operadorId = v.id;
        operadorGuardado.wapPersonaId = usuario.datosPersonales.referenciaID;
        operadorGuardado.email = usuario.correoElectronico;
        operadorGuardado.razonSocial = usuario.datosPersonales.razonSocial;
        operadorGuardado.cuit = usuario.datosPersonales.cuil;
      }
      // TODO: revisar si es necesario actualizar datos
      if (esValido && operadorGuardado.operadorId) {
        this.db.actualizar(
          "operadores",
          ["ultimoAcceso"],
          [hoy],
          [["id", operadorGuardado.id]]
        );
        // TODO: actualizar estado interno
        this.idwappersona = operadorGuardado.wapPersonaId;
        this.email = operadorGuardado.email;
        this.razonSocial = operadorGuardado.razonSocial;
        this.cuit = operadorGuardado.cuit;
        this.id = operadorGuardado.id;
        this.online = true;
        this.autoasignacion = true;
        this.perfil = usuario.perfil;
        // Es valido
        res = true;
      }
    }
    return res;
  }
}
module.exports = Operador;