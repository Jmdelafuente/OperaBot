/**
 * Abstract Class Estado.
 * Clase abstracta para utilizar un patron State sobre los chats.
 * Cada chat puede comportarse de forma distinta segun el estado que tiene.
 * See: https://es.wikipedia.org/wiki/State_(patr%C3%B3n_de_dise%C3%B1o)
 * @class Estado
 */
class Estado {
  /**
   *Creates an instance of Estado.
   * @param {*} id en la DB
   * @param {*} nombre del estado, humano-legible
   * @param {*} descripcion adicional si hiciera falta
   * @memberof Estado
   * @abstract
   * @constructor
   */

  constructor(id, nombre, descripcion) {
    if (this.constructor === Estado) {
      throw new Error("No se pude inicializar una clase abstracta");
    }
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
  }

    /**
     @abstract
    */
    // Estado.prototype.say = function() {
    //     throw new Error("Abstract method!");
    // }

}

/**
 *
 *
 * @class Cerrado
 * @extends {Estado}
 */
class Cerrado extends Estado {

}

/**
 *
 *
 * @class Abierto
 * @extends {Estado}
 */
class Abierto extends Estado{

}