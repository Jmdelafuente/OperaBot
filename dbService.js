const sqlite3 = require("sqlite3");
const Promise = require("bluebird");
// const dbPath = "./operaBOT.db";

class OperaDB {
  constructor() {
    this.lastError = "";
    this.db = new sqlite3.Database("operaBOT.db", (err) => {
      if (err) {
        console.log("Could not connect to database", err);
        this.lastError = err;
      }
    });
  }
  /**
   * Funcion Insertar en la base de datos
   *
   * @param {String} tabla nombre de la tabla donde insertar el valor
   * @param {[String]} campos listado de los campos de la tabla a insertar
   * @param {[*]} valores valores correspondientes con los campos listados
   * @returns Si la insercion fue correcta el ID corresponiente, -1 en caso contrario y exporta el error.
   * @memberof OperaDB
   */
  insertar(tabla, campos, valores) {
    var query = "";
    var values = "";
    var objeto = this;
    campos.forEach((element) => {
      query += `${element}, `;
      values += "?, ";
    });
    query = query.slice(0, -2);
    values = values.slice(0, -2);
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO ${tabla}(${query}) VALUES(${values})`,
        valores,
        function (error) {
          if (error) {
            objeto.lastError = error;
            console.log(error);
            reject({ id: -1 });
          } else {
            resolve({ id: this.lastID });
          }
        }
      );
    });
  }
  /**
   * Funcion de busqueda parametrizada. Devuelve un select sobre ciertos campos
   * donde se cumplen las condiciones pedidas en el arreglo de filtros.
   *
   * @param {*} tabla nombre de la tabla a la cual hacerle select
   * @param {[*]} campos arreglo con los nombres de los campos a devolver de la tabla donde se cumplan los filtros
   * @param {[*]} filtros arreglo del tipo [clave,valor] para filtrar la busqueda
   * @memberof OperaDB
   */
  buscar(tabla, campos, filtros) {
    var where = "";
    var placeholder = [];
    var objeto = this;
    filtros.forEach(([e, v]) => {
      where += `${e}=? AND `;
      placeholder.push(v);
    });
    where += "TRUE";
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT ${campos} FROM ${tabla} where ${where}`,
        placeholder,
        (error, rows) => {
          if (error) {
            objeto.lastError = error;
            reject(error);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  borrar(tabla, filtros) {
    var where = "";
    var valores = [];
    filtros.forEach(([e, v]) => {
      where += `${e}=?`;
      valores.push(v);
    });
    return new Promise((resolve, reject) => {
      this.db.run(
        `DELETE FROM ${tabla} where ${where}`,
        valores,
        (error, rows) => {
          if (error) {
            this.lastError = error;
            reject(error);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  /**
   * Función de actualización de datos en una tabla parametrizada. Realiza un UPDATE sobre los datos especificados utilizando el WHERE especificado
   *
   * @param {*} tabla nombre de la tabla a la cual hacerle select
   * @param {*} campos listado de los campos de la tabla a actualizar
   * @param {*} valores valores correspondientes con los campos listados
   * @param {*} filtros arreglo del tipo [clave,valor] para filtrar la actualización
   * @returns Int Cantidad de filas actualizadas
   * @memberof OperaDB
   */
  actualizar(tabla, campos, valores, filtros) {
    var query = "";
    var values = [];
    var where = "";
    var objeto = this;
    campos.forEach((element) => {
      query += `${element} = ?, `;
    });
    filtros.forEach(([e, v]) => {
      where += `${e} = ?`;
      values.push(v);
    });
    query = query.slice(0, -2);
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE ${tabla} SET ${query} WHERE ${where}`,
        valores,
        function (error) {
          if (error) {
            objeto.lastError = error;
            reject(0);
          } else {
            resolve(this.changes);
          }
        }
      );
    });
  }

  /**
   * Recupera el ultimo error ocurrido en la DB o string vacio.
   *
   * @returns String que contiene el ultimo mensaje de error
   * @memberof OperaDB
   */
  error() {
    return this.lastError;
  }
}

module.exports = OperaDB;