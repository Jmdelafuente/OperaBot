// TODO: plantillas de mensajes
//const [key, prefix] of Object.entries(services.PREFIXes)
const fs = require('fs');
var plantillas = {};
let data = fs.readFileSync("./configs/plantilla.json");
let plant = JSON.parse(data);

function modificarplantilla(msg) {
    fs.writeFile('./configs/plantilla.json', msg, 'utf8', (err) => {
        if (err) throw err;
        console.log('se guardo el archivo');
    });
}



for(const [key, prefix] of Object.entries(plant)){
         plantillas[`${key}`]=prefix;
}


module.exports.blueprints = plantillas;