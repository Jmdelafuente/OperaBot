const sqlite3 = require("sqlite3");
const Promise = require("bluebird");
const { response } = require("express");
const dbPath = "./operaBOT.db";

class OperaDB {
  constructor(dbPath) {
    this.lastError = "";
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.log("Could not connect to database", err);
        this.lastError = err;
      }
    });
  }
  /**
   * Funcion Insertar en la base de datos
   *
   * @param {*} tabla nombre de la tabla donde insertar el valor
   * @param {[*]} campos listado de los campos de la tabla a insertar
   * @param {[*]} valores valores correspondientes con los campos listados
   * @returns Si la insercion fue correcta el ID corresponiente, -1 en caso contrario y exporta el error.
   * @memberof OperaDB
   */
  insertar(tabla, campos, valores) {
    var query = "";
    var values = "";
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
            this.lastError = error;
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
    var placeholder = "";
    var ret = [];
    filtros.forEach(([e, v]) => {
      where += `${e}=\$${e}`;
      placeholder += `\$${e}:${v}, \n`;
    });
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT ${campos} FROM ${tabla} where ${where}`,
        {
          placeholder,
        },
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