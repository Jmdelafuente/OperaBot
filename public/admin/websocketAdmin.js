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
var portFront = process.env.PORT || 3050;
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
//app.use(helmet());

//app.use(cors);
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*"); // FIXME: update to match the domain you will make the request from
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type,Accept"
//   );
//   next();
// });

app.use(express.static(path.join(__dirname, "public")));

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