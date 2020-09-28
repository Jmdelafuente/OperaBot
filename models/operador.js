/**
 * Operador (persona) que utiliza el sistema, tiene relacion con las personas de WebLogin
 * y facilita la generacion de analiticas y auditorias.
 * No esta relacionado con Operator (controlador).
 * @class Operador
 */
class Operador {

  /**
   *Creates an instance of Operador.
   * @param {*} id del operador (persona) en la DB
   * @param {*} wappersona id de la persona relacionada del weblogin
   * @param {*} perfil 
   * @memberof Operador
   */
  constructor(id, wappersona, perfil) {
    this.id = id;
    this.idwappersona = wappersona;
    this.online = false;
    this.autoasignacion = true;
    this.perfil = perfil;
  }

}