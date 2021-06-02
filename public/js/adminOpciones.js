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
        let opciones = [];
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
            opciones = prefix.opciones;
            pack.opciones = opciones;
            pack.descripcion = prefix.descripcion;
            menu[key] = pack;

            div.appendChild(opcion);
        }
        enviar.innerText = "Enviar";
        container.appendChild(text);
        container.appendChild(enviar);
        
        div.addEventListener('change',function (event) {
            event.preventDefault();
            console.log(`obtengo el value del div, ${div.value}`);
            socketopciones.emit("sub-menu",div.value);
        });
    })

    socketopciones.on("sub-menu",function (msg) {
        console.log(`estoy en sub-menu ${menu[msg].nombre} y ${menu[msg].opciones}`);
        var string="";
        let i=0;
        let div = document.getElementById("selector-menu");
        let text = document.getElementById("editor");
        //$("#selector-menu").empty();
        if(menu[msg].opciones){
        menu[msg].opciones.forEach(element => {
            if (element.valor != undefined) {
                string += "<b>titulo del boton: </b>" + element.valor + `<button id=\"editar-titulo\" class=\"btn btn-primary\">Editar</button>` + "<br></br>";
            }
            if (element.nombre != undefined) {
                string += "<b>tiene submenu: </b>" + element.nombre + `<button id=\"editar-nombre\" class=\"btn btn-primary\">Editar</button>` + "<br></br>";
            }
            if (element.informacion != undefined) {
                string += "<b>informacion: </b>" + element.informacion + `<button id=\"editar-informacion\" class=\"btn btn-primary\">Editar</button>` + "<br></br>";
            }
            i++;
         });
         }
         if (menu[msg].descripcion!=undefined) {
             string += "<b>Descripcion: </b>" + menu[msg].descripcion;
         }
        text.innerHTML = string;

        var editar_titulo = document.getElementById("editar-titulo");
        editar_titulo.addEventListener("click",function (msg) {
           msg.preventDefault();
           alert(text.textContent);
        });
        var editar_nombre = document.getElementById("editar-nombre");
        editar_nombre.addEventListener("click", function (msg) {
            msg.preventDefault();
            alert(text.textContent);
        });
        var editar_info = document.getElementById("editar-informacion");
        editar_info.addEventListener("click", function (msg) {
            msg.preventDefault();
            alert(text.textContent);
        });
    })
});