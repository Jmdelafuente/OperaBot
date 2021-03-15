const express = require("express");
var app = express();
var cors = require("cors");
var helmet = require("helmet");
var http = require("http").Server(app);
var io = require("socket.io")(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
var path = require("path");
var plant = require("../../configs/messagesConfig");
var portFront = 4002;
var sockets = {};
var sessions = {}; // SESSIONKEY -> Socket para chequear si sufre desconexion temporal

// Operator's logic
var op = require("../../operatorsService.js");
const {
    resolve
} = require("path");
const {
    chatsList
} = require("../../messengerService");

// * CONFIGURACION DE FRONT-END * //

// Front for websockets
app.set("port", portFront);
//appFront.use(helmet());

//appFront.use(cors);
// appFront.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*"); // FIXME: update to match the domain you will make the request from
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type,Accept"
//   );
//   next();
// });

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
    let param = req.query.SESSIONKEY;
    let perfil = op.validar(param);
    if (perfil != -1) {
        if (perfil == 3) {
            socket.emit("redirect", "public/admin/index.html")
        } else {
            socket.emit("redirect", "admin/index.html")
            //res.sendFile(__dirname + "/index")
        }
    } else {
        res.send(Error("Operador no valido"))
    }
});
http.listen(portFront);


io.on("connection", function (socket) {
    
socket.on("opciones_admin",function (msg) {
   let opcion = JSON.stringify(op.obteneropciones());
    if(opcion!=''){
        let nuevasopciones = opcion.substring(0 , opcion.length-1);
        nuevasopciones += "\," + msg + "]";
    }else{
        nuevasopciones = msg;
    }

    op.modificarmenu(nuevasopciones);
    socket.emit("alert", "Se modifico el menu");
});

socket.on("plantilla_admin", function (msg) {
    let plantilla = JSON.stringify(plant.obtenerPlantillas());
    let nuevasPlantillas = msg;
    if (plantilla != '') {
        let nuevasPlantillas= plantilla.substring(0, plantilla.length - 1);
        nuevasPlantillas += "\," + msg + "]";
    } 

    op.modificarPlantilla(nuevasPlantillas);
    socket.emit("alert", "Se agrego la plantilla");
});


}); 


/*function formatearJSON(json) {
    // Arreglo con los cambios del json
    const array = JSON.parse(JSON.stringify(json)).map(function (element, index) {
        // Obtengo la fecha a setear en el metadata > timestamp > value
        const date = element.date;
        //Remuevo la propiedad de la fecha donde estaba originalmente para posicionarla
        // en un nuevo lugar posteriormente
        delete element.date;
        // Recorro las llaves del elemento actual de la iteracion del arreglo del json
        for (var key in element) {
            // Creo la nueva estructura
            element[key] = isNaN(element[key]) ? element[key] : parseFloat(element[key]);
            
        }
        return element;
    });

    return array;
};*/

