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
    console.log(`menu en agregar_menu ${msg}`);
    console.log(`menu con stringy en agregar ${JSON.stringify(msg)}`);
    nuevo_menu.push(msg);
}

function borrar_menu(msg) {
    nuevo_menu = nuevo_menu.filter(function (v) {
        return v.nombre != msg
});

}

function modificar(msg) {
    //console.log(`si stringifyamos en opciones modificar2 antes de "cambiar" ${JSON.stringify(nuevo_menu)}`);
    //console.log(`nombre del menu a cambiar ${msg.nombre}`);
    nuevo_menu.forEach((element, i) => {
        //console.log(element);
     if (element.nombre == msg.nombre) {
         //console.log(`antes de "cambiar" ${JSON.stringify(nuevo_menu[i])}`);
         
         //console.log(`y dice prueba? ${JSON.stringify(msg)}`);
         
         nuevo_menu[i] = msg;
         //console.log(`despues de "cambiar" ${JSON.stringify(nuevo_menu[i])}`);
         
     }
    });
    //console.log(`si stringifyamos en opciones modificar2 despues del supuesto cambio ${JSON.stringify(nuevo_menu)}`);
    
    //fs.writeFileSync('./configs/diccionario-menu.json', nuevo_menu, 'utf8');
    var nuevo = JSON.stringify(nuevo_menu);
    fs.writeFile('./configs/diccionario-menu.json', nuevo, 'utf8', (err)=>{
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
module.exports.agregar_menu = agregar_menu;


