const fs = require('fs');
let rawdata = fs.readFileSync('./configs/diccionario-opciones.json');
let data = fs.readFileSync('./configs/diccionario-menu.json');
let dic = JSON.parse(rawdata);
let nuevo_menu = JSON.parse(data);

function modificarOpciones(msg) {
    console.log(`llegue a modificar ${JSON.stringify(msg)}`);
    fs.writeFile('./configs/diccionario-opciones.json', msg, 'utf8', (err) => {
        if (err) { console.log(err); throw err; }
        console.log('se guardo el archivo');
    });
}

function obteneropciones(msg) {
    return dic;
}

function obtenermenu(msg) {
    data = fs.readFileSync('./configs/diccionario-menu.json');
    nuevo_menu = JSON.parse(data);
    return nuevo_menu;
}

function agregar_menu(msg) {
    var nombre = msg.nombre;

}

function modificar(msg) {
        
    nuevo_menu.forEach((element, i) => {
         if (element.nombre == msg.nombre) {
            nuevo_menu[i] = JSON.parse(msg);
        }
        });
    fs.writeFile('./configs/diccionario-menu.json', nuevo_menu, (err)=>{
        if (err) { console.log(err); throw err; }
        console.log('se guardo el archivo');
    });
}

function filtrarOpciones(msg) {
    let retorno = {};
    var filtrado = dic.filter(function (v) {
        return v.nombre == msg
    });
    if (Object.keys(filtrado).length != 0) {
        retorno.nombre = filtrado[0].nombre;
        retorno.opciones = filtrado[0].opciones;
        retorno.informacion = filtrado[0].informacion;
        retorno.link = filtrado[0].link;
    }

    return retorno;
}


module.exports.filtrarOpciones = filtrarOpciones;
module.exports.obteneropciones = obteneropciones;
module.exports.modificarOpciones = modificarOpciones;
module.exports.obtenermenu = obtenermenu;
module.exports.modificar = modificar;

