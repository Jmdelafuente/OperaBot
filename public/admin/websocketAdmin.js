const express = require("express");
var app = express();
var cors = require("cors");
var helmet = require("helmet");
var config_opcion = require("../../configs/opciones");
var menu = require("../../models/menu");
var http = require("http").Server(app);
var iois = require("socket.io")(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },    
    maxHttpBufferSize: 1e8,
    allowEIO3: true
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
var ms = require("../../configs/messagesConfig");
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

app.use('/static',express.static(path.join(__dirname, "../../public")));

app.get("/operadores/admin/", function (req, res) {
  console.log("entre al get");
  let param = req.query.SESSIONKEY;
  let perfil = op.validar(param);
  if(perfil != -1){
    if(perfil == 3){
      res.sendFile(__dirname + "../index.html");
    }else{
      res.sendFile(__dirname + "/index.html");
    }
  }else{
    res.send(Error("Operador no valido"))
  }
});

http.listen(app.get('port'), () => {
    console.log('server on port', app.get('port'));
});

iois.on("connection", function (socket) {
    console.log("user connect en websocket admin");

socket.on("obtener-menu",async function (msg) {
   let opciones = await op.obteneropciones();
   //console.log(JSON.stringify(opciones));
   socket.emit("selector-menu", opciones); 
});

socket.on("sub-menu", function (msg) {
    socket.emit("menu-grafico",msg);
});

socket.on("borrar", function (msg) {
    config_opcion.borrar_menu(msg); 
});

socket.on("info", function(msg){
    let obtenido = config_opcion.filtrarOpciones(msg);
    socket.emit("info",obtenido);
});

socket.on("modificar", async function (msg) {
   await config_opcion.modificar(msg);
});

socket.on("mostrar" , function (msg) {
    var nuevo = config_opcion.obtenermenu();
   socket.emit("mostrar", nuevo);
});

socket.on("nuevo_menu",function (msg) {
   //nuevo menu
  
   op.agregar_menu(msg);
   //var menu = new Menu(msg.nombre,msg.submenus,msg.informacion,msg.links);

});

socket.on("opciones_admin",function (msg) {
    let opcion = JSON.stringify(op.obteneropciones());
    let nuevasopciones = msg;
    if(opcion.length != 0){
        nuevasopciones = opcion.substring(0 , opcion.length-1);
        nuevasopciones += "\," + msg + "]";
    }
    op.modificarOpciones(nuevasopciones);
    socket.emit("alert", "Se modifico el menu");
});

socket.on("plantilla_admin", function (msg) {
    let plantilla = JSON.stringify(plant.obtenerPlantillas());
    let nuevasPlantillas = msg;
    console.log(plantilla);
    console.log(nuevasPlantillas);
    if (plantilla.length != 0) {
        nuevasPlantillas= plantilla.substring(0, plantilla.length - 1);
        nuevasPlantillas += "\," + msg + "}";
    } 
    console.log(nuevasPlantillas);
    op.modificarPlantilla(nuevasPlantillas);

    socket.emit("alert", "Se agrego la plantilla");
});


}); 