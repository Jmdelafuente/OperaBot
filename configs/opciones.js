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
    var nuevo = JSON.stringify(nuevo_menu);
    console.log(nuevo);
    escribir(nuevo);
}

function escribir(msg) {
    fs.writeFile('./configs/diccionario-menu.json', msg, 'utf8', (err)=>{
        if (err) { console.log(err); throw err; }
        console.log('se guardo el archivo');
    });
}

function borrar_menu(msg) {
    var element = nuevo_menu.filter(function (v) {
        return v.nombre == msg.nombre; 
    });
    
    var opciones = element.opciones;
    var opcion_volver = opciones[opciones.length-1];
    //borrar la opcion deseada en su menu "padre"
    
    var menu_anterior = nuevo_menu.filter(function (v) {
            return v.nombre == opcion_volver; 
    });

    var array_opciones = menu_anterior.opciones;
    var index = array_opciones.indexOf(msg.nombre);
    array_opciones.splice(index,1);

    //borrar todos los "hijos" del hijo?
    
    nuevo_menu = nuevo_menu.filter(function (v) {
        return v.nombre != msg.nombre;
    });
}

function padre(msg) {
    var i = 0;
    if(msg.length > 1){
        while(i < opciones.length){
        borrar_hijos(opciones[i]);
        i++;
        }
    }
}

 function borrar_hijos(msg) {
    //tiene hijos??
     if (msg.length === 0) {

         return;
     }
     //si los tiene, vamos a eliminar sus hijos
     var hijo = nuevo_menu.filter(function (v) {
         v.nombre = msg[1];
     });
     borrar_hijos(hijo.opciones);
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
    escribir(nuevo);

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
module.exports.borrar_menu = borrar_menu;


