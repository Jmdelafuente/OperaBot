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
        let div = document.getElementById("selector-menu");
        let enviar = document.createElement('button');
        enviar.setAttribute("class", "btn btn-primary");
        let container= document.getElementById("div-menu");
        let text = document.createElement('div');
        text.setAttribute("id","editor");
        enviar.setAttribute("id", "enviar_opciones");
        let contenedor = document.createElement('div');
        var titulo = document.createElement('div');
        let content = document.createElement('div');
        contenedor.setAttribute("id","contenedor");
        titulo.setAttribute("id","titulo");
        content.setAttribute("id","content");
        for (const [key, prefix] of Object.entries(msg)) {
          
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
        contenedor.appendChild(titulo);
        contenedor.appendChild(content);
        container.appendChild(text);
        container.appendChild(enviar);
        container.appendChild(contenedor);
        
        div.addEventListener('change',function (event) {
            event.preventDefault();
            socketopciones.emit("sub-menu",div.value);
        });

         var envio = document.getElementById("enviar_opciones");
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
       var titulo = document.getElementById("titulo");
       let content = document.getElementById("content");
       if(content.childNodes.length != 0){
           content.remove();
       }
      
       titulo.innerHTML= "<b>" + menu[msg].nombre + "</b>";
        menu[msg].opciones.forEach(element => {
            var btn = document.createElement("button");
            btn.setAttribute("value", element.valor);
            btn.setAttribute("id", msg);
            btn.innerText = element.valor;
             if (element.informacion != undefined) {
                 let titulo_boton = document.createElement('div');
                 let textarea = document.createElement('textarea');
                 textarea.setAttribute('style', "width:50%");
                 content.appendChild(titulo_boton);
                 content.appendChild(textarea);
                 titulo_boton.innerHTML = "<b>" + element.nombre + "</b>";
                 textarea.innerHTML = element.informacion;
             }
            content.appendChild(btn);
            btn.className = "btn btn-outline-primary rounded-pill mr-2 opcion-menu";
            btn.addEventListener("click", function (e) {
                        e.preventDefault();
                        alert("funca");
            });

        });

        
    });

   
});