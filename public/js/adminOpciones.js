//const SURLopciones = "http://localhost";
const SURLopciones = "128.53.80.105";
//const SURLopciones = "https://chat.muninqn.gov.ar/operadores/admin/";
const socketopciones = io(`${SURLopciones}:4002`);
let menu = [];

$(function () {
    // * FUNCIONES AUXILIARES * //
    /**
     *  Clearable input: draw an X when input has value to reset (like search input)
     */
    Array.prototype.forEach.call(
        document.querySelectorAll(".clearable-input"),
        function (el) {
            var input = el.querySelector("input");

            conditionallyHideClearIcon();
            input.addEventListener("input", conditionallyHideClearIcon);
            el.querySelector("[data-clear-input]").addEventListener(
                "click",
                function (e) {
                    input.value = "";
                    conditionallyHideClearIcon();
                }
            );

            function conditionallyHideClearIcon(e) {
                var target = (e && e.target) || input;
                target.nextElementSibling.style.display = target.value ? "block" : "none";
            }
        }
    );

      
    $('#crear-menu').click(function (event) {
        event.preventDefault();
        alert("Funcionalidad en desarrollo");        
    })
    
    $('#editar-menu').click(function (event) {
        event.preventDefault();
        console.log("tocaste para editar");
        socketopciones.emit("obtener-menu");
        let select = document.getElementById("div-menu");
        select.removeAttribute("style");
        let botones_iniciales = document.getElementById("opciones-iniciales");
        botones_iniciales.setAttribute("style", "display: none");
    });

//fede termina la parte del summernote

socketopciones.on("connect", () => {
    
});
    socketopciones.on("selector-menu",function (msg) {
        console.log(`estoy en selector ${msg}`);
        let div = document.getElementById("selector-menu");
        let enviar = document.createElement('button');
        enviar.setAttribute("class", "btn btn-primary");
        let container= document.getElementById("div-menu");
        let text = document.createElement('div');
        text.setAttribute("id","editor");
        for (const [key, prefix] of Object.entries(msg)) {
            console.log(`key ${key} y prefix ${JSON.stringify(prefix)}`);
            var opcion = document.createElement('option');
            opcion.innerText = prefix.nombre;
            opcion.value = key;
            var pack = {};
            pack.informacion = prefix.informacion;
            pack.nombre = prefix.nombre
            pack.opciones = prefix.opciones
            menu[key] = pack;

            div.appendChild(opcion);
        }
        enviar.innerText = "Enviar";
        container.appendChild(enviar);
        container.appendChild(text);
        
        div.addEventListener('change',function (event) {
            event.preventDefault();
            console.log(`obtengo el value del div, ${div.value}`);
            console.log(`menu con el value, ${JSON.stringify(menu[div.value])}`);
            socketopciones.emit("sub-menu",menu[div.value]);
        });
    })

    socketopciones.on("sub-menu",function (msg) {
        console.log(`estoy en sub-menu ${msg.nombre} y ${msg.informacion} y ${msg.opciones}`);
        var string="";
        let div = document.getElementById("selector-menu");
        let text = document.getElementById("editor");
        //$("#selector-menu").empty();
        msg.opciones.forEach(element => {
            if(element.valor){
                string = "<b>titulo del boton: </b>" + element.valor + "<br></br>";
            }
            if(element.nombre){
                string = string + "<b>tiene submenu: </b>" + element.nombre + "<br></br>";
            }
        });
        
        if(msg.informacion){
            string = string + "<b>informacion: </b>" + msg.informacion; 
        }
        text.innerHTML = string;
    })
});