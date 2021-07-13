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
        console.log(`nuevo menu antes de cambio ${JSON.stringify(nuevo_menu)}`);
        console.log(JSON.stringify(msg));
    nuevo_menu.forEach((element, i) => {
         if (element.nombre == msg.nombre) {
             nuevo_menu[i] = JSON.stringify(JSON.stringify(msg));
        }
        });
    fs.writeFile('./configs/diccionario-menu.json', nuevo_menu, 'utf8', (err)=>{
        if (err) { console.log(err); throw err; }
        console.log('se guardo el archivo');
    });
        console.log(`nuevo menu despues de cambio ${JSON.stringify(nuevo_menu)}`);

}

function modificar2(msg) {
    console.log(`si stringifyamos en opciones modificar2 antes de "cambiar" ${JSON.stringify(nuevo_menu)}`);
   
    nuevo_menu.forEach((element, i) => {
        if (element.nombre == msg.nombre) {
            nuevo_menu[i] = JSON.stringify(msg);
       }
       });
    
    fs.writeFileSync('./configs/diccionario-menu.json', nuevo_menu, 'utf8');

    console.log(`si stringifyamos en opciones modificar2 despues del supuesto cambio ${JSON.stringify(nuevo_menu)}`);

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
module.exports.modificar2 = modificar2;

