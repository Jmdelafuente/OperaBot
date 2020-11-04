const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./operaBOT.db");
var lastError = '';
/**
 * Funcion Insertar en la base de datos
 *
 * @param {*} tabla nombre de la tabla donde insertar el valor
 * @param {[*]} campos listado de los campos de la tabla a insertar
 * @param {[*]} valores valores correspondientes con los campos listados
 * @returns Si la insercion fue correcta el ID corresponiente, -1 en caso contrario y exporta el error.
 */
module.exports.insertar = function(tabla,campos,valores){
    var query = '';
    var values = '';
    var id = 0;
    campos.forEach((element) => {
        query += `${element}, `;
        values += "?, ";
    });
    query = query.slice(0, -2); 
    values = values.slice(0, -2); 
    db.run(`INSERT INTO ${tabla}(${query}) VALUES(${values})`, valores, function (error) {
        if(error){
            lastError = error;
            id = -1;
        }else{
            id = this.lastID;
        }
    });
    return id;
};
/**
 * Funcion de busqueda parametrizada. Devuelve un select sobre ciertos campos
 * donde se cumplen las condiciones pedidas en el arreglo de filtros.
 *
 * @param {*} tabla nombre de la tabla a la cual hacerle select
 * @param {[*]} campos arreglo con los nombres de los campos a devolver de la tabla donde se cumplan los filtros
 * @param {[*]} filtros arreglo del tipo [clave,valor] para filtrar la busqueda
 */
module.exports.buscar = function(tabla, campos, filtros){
    var where = "";
    var placeholder = "";
    var ret = [];
    filtros.forEach(([e,v]) => {
        where+=`${e}=\$${e}`;
        placeholder+=`\$${e}:${v}, \n`;
    });
    db.all(
      `SELECT ${campos} FROM ${tabla} where ${where}`,
      {
        placeholder
      },
      (error, rows) => {
        if(error){
            lastError = error;
        }else{
            rows.forEach((row) => {
                ret.push(row);
                // console.log(row);
            });
        }
      }
    );
    return ret;
};

module.exports.error = function(){return lastError;};
