const fs = require('fs');
let rawdata = fs.readFileSync('./configs/diccionario-opciones.json');
let dic = JSON.parse(rawdata);

function modificarOpciones(msg) {
    console.log(`llegue a modificar ${JSON.stringify(msg)}`);
    fs.writeFile('./configs/diccionario-opciones.json', msg, 'utf8', (err) => {
     if(err){ console.log(err);throw err;}
     console.log('se guardo el archivo');   
    });
}

function obteneropciones(msg){
return dic;
}

function filtrarOpciones(msg){
    let retorno ={};
    var filtrado = dic.filter(function (v) {
        return v.nombre == msg 
    });
    if(Object.keys(filtrado).length!=0){
        retorno.nombre = filtrado[0].nombre,
        retorno.opciones = filtrado[0].opciones
    }

    return retorno;
}


module.exports.filtrarOpciones = filtrarOpciones;
module.exports.obteneropciones = obteneropciones;
module.exports.modificarOpciones = modificarOpciones;

