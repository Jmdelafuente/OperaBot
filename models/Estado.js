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
   * @param {*} chat id del chat cuyo estado se modifica
   * @memberof Estado
   * @abstract
   * @constructor
   */

  constructor(id, nombre, descripcion, chat) {
    if (this.constructor === Estado) {
      throw new Error("No se pude inicializar una clase abstracta");
    }
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.chat = chat;
  }

}

/**
 *
 *
 * @class Cerrado
 */
class Cerrado extends Estado {

  constructor(chat) {
    super(1, 'Cerrado', 'asdf',chat);
  }
  
  asignacion () {
    this.chat.state = new Abierto(this.chat);
  }
  
  resolucionOk () {
    this.chat.state = new Cerrado(this.chat);
  }

  resolucionFallida () {
    this.chat.state = new Cerrado(this.chat); 
  }

}

/**
 *
 *
 * @class Abierto
 */
class Abierto extends Estado{

  constructor(chat) {
    super(1, 'Abierto', 'asdf', chat);
  }
  
  asignacion () {
    this.chat.state = new Abierto(this.chat);
  }
  
  resolucionOk () {
    this.chat.state = new Cerrado(this.chat);
  }

  resolucionFallida () {
    this.chat.state = new Abierto(this.chat);
  }
}

module.exports.Abierto = Abierto;
module.exports.Cerrado = Cerrado;