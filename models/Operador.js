/**
 * Operador (persona) que utiliza el sistema, tiene relacion con las personas de WebLogin
 * y facilita la generacion de analiticas y auditorias.
 * No esta relacionado con Operator (controlador).
 * @class Operador
 */
const db = require("../dbService");
const weblogin = require("../configs/weblogin");

class Operador {
  /**
   *Creates an instance of Operador.
   * @param {*} id del operador (persona) en la DB
   * @param {*} wappersona id de la persona relacionada del weblogin
   * @param {*} perfil
   * @memberof Operador
   */
  constructor(){
    this.id = "";
    this.idwappersona = '';
    this.email = '';
    this.razonSocial = '';
    this.cuit = '';
    this.online = false;
    this.autoasignacion = true;
    this.perfil = '';
    this.socket = null;
    this.db = new db("../operaBOT.db");
  }

  init(wappersona, perfil, email, razonSocial, cuit) {
    this.id = '';
    this.idwappersona = wappersona;
    this.email = email;
    this.razonSocial = razonSocial;
    this.cuit = cuit;
    this.online = false;
    this.autoasignacion = true;
    this.perfil = perfil;
    this.socket = null;
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

  validar(token){
    var res = false;
    var operadorGuardado = null;
    let usuario = weblogin.validarToken(token);
    let hoy = new Date().toISOString();
    let esValido = false;
    // TODO: verificar si el usuario existe
    if(usuario.perfil){
      esValido = true;
      this.db
        .buscar(
          "operadores",
          ["operadorId", "email", "cuit", "razonSocial", "wapPersonaId"],
          [["email", usuario.correoElectronico]]
        )
        .then(
          (op) => {
            if (op) {
              operadorGuardado = op[0];
              // TODO: revisar si es necesario actualizar datos
              this.db.actualizar("operadores",["ultimoAcceso"],[hoy],[["id",operadorGuardado.id]]);
            } else {
              // TODO: No existe el usuario, pero tiene permiso, dar alta
              operadorGuardado.id = this.db
                .insertar(
                  "operadores",
                  [
                    "email",
                    "cuit",
                    "razonSocial",
                    "wapPersonaId",
                    "ultimoAcceso",
                  ],
                  [
                    usuario.correoElectronico,
                    usuario.cuit,
                    usuario.datosPersonales.razonSocial,
                    usuario.datosPersonales.referenciaID,
                    hoy,
                  ]
                )
                .then((v) => {
                  operadorGuardado.wapPersonaId =
                    usuario.datosPersonales.referenciaID;
                  operadorGuardado.email = usuario.correoElectronico;
                  operadorGuardado.razonSocial =
                    usuario.datosPersonales.razonSocial;
                  operadorGuardado.cuit = usuario.cuit;
                });
            }
          },
          (err) => {throw new Error(err);}
        );
      if (esValido && operadorGuardado.id) {
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