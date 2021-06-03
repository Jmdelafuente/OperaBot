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
            socketopciones.emit("sub-menu",div.value);
        });

         var envio = document.getElementById("editor");
         envio.addEventListener('click', function (e) {
             e.preventDefault();
             alert("funciona¡");
         })
    })

    socketopciones.on("sub-menu",function (msg) {

        var string="";
        let i=0;
        let div = document.getElementById("selector-menu");
        let text = document.getElementById("editor");
        //$("#selector-menu").empty();
        if(menu[msg].opciones){
        menu[msg].opciones.forEach(element => {
            if (element.valor != undefined) {
                string += `<div id=${element.valor}><b>titulo del boton: </b> <textarea style = \"width:50%\">` + element.valor + `</textarea> </div>`;
            }
            if (element.nombre != undefined) {
                string += `<div id=\"${element.nombre}\"><b>tiene submenu: </b> <textarea style = \"width:50%\">` + element.nombre + `</textarea> </div>`;
            }
            if (element.informacion != undefined) {
                string += `<div id=\"informacion_${element.valor}\"><b>informacion: </b> <textarea style = \"width:50%\">` + element.informacion + `</textarea> </div>`;
            }
            i++;
         });
         }
         if (menu[msg].descripcion!=undefined) {
             string += `</div id=descripcion_${menu[msg].nombre}><b>Descripcion: </b>` + menu[msg].descripcion + `</div>`;
         }
        text.innerHTML = string;        
        
    });

    socketopciones.on("menu-grafico",function (msg) {
       let container = document.getElementById("div-menu");
       let contenedor = document.createElement('div');
       let content = document.createElement('div');
       let titulo = document.createElement('div');
      
       if (menu[msg].informacion){
           let textarea = document.createElement('textarea');
            content.appendChild(textarea);
            textarea.innerHTML = menu[msg].informacion
        }
       titulo.innerHTML=menu[msg].nombre;
        menu[msg].opciones.forEach(element => {
            var btn = document.createElement("button");
            btn.setAttribute("value", element.valor);
            btn.setAttribute("id", msg);
            btn.innerText = element.valor;
            content.appendChild(btn);
            btn.className = "btn btn-outline-primary rounded-pill mr-2 opcion-menu";
            btn.addEventListener("click", function (e) {
                        e.preventDefault();
                        alert("funca");
            });

        });
        let div = document.getElementById("div-menu");
         contenedor.appendChild(titulo);
         contenedor.appendChild(content);
         div.appendChild(contenedor);
    });

   
});