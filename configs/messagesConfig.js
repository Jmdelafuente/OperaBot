// TODO: plantillas de mensajes
//const [key, prefix] of Object.entries(services.PREFIXes)
const fs = require('fs');
var plantillas = {};
let data = fs.readFileSync("./configs/plantilla.json");
let plant = JSON.parse(data);


function modificarplantilla(msg) {
    //TODO: hacer que en el front haya boton para modificar las plantillas y botones de menu
    fs.writeFile('./configs/plantilla.json', msg, 'utf8', (err) => {
        if (err) throw err;
        console.log('se guardo el archivo');
    });
}


// en plantillas se crean los mensajes predefinidos que esten en plantilla.json 
for(const [key, prefix] of Object.entries(plant)){
         plantillas[`${key}`]=prefix;
}


module.exports.blueprints = plantillas;
//module.exports.modificar = modificarplantilla;