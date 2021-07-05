//const SURLopciones = "http://localhost";
const SURLopciones = "128.53.80.105";
const socketopciones = io(`${SURLopciones}:4002`);
/*const SURLopciones = "https://chat.muninqn.gov.ar";
const socketopciones = io(`${SURLopciones}`, {
    'forceNew': true,
    path: '/operadores/admin/'
});*/
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
        console.log("ajaa");
        let botones_iniciales = document.getElementById("opciones-iniciales");
        botones_iniciales.setAttribute("style", "display: none");
        var div = document.getElementById("div-creacion");
        var content = document.createElement("div");   
        var contenedor = document.createElement("div");   
        var nombre = document.createElement("input");   
        var valor = document.createElement("input");   
        var informacion = document.createElement("input");   
        var submenus = document.createElement("input");   
        var links = document.createElement("input");
        var enviar = document.createElement('button');
        content.setAttribute('id', 'div-creaciones');
        contenedor.setAttribute('id','contenedor-creacion');
        nombre.setAttribute('id','nombre-menu');
        submenus.setAttribute('id','submenus-menu');
        informacion.setAttribute('id','informacion-menu');
        links.setAttribute('id','links-menu');
   
        nombre.placeholder = "Nombre del menú";
        informacion.placeholder = "Información que saldra en forma de mensaje al ciudadano";
        submenus.placeholder = "Nombre de los submenus (separados por coma) el último debe ser el nombre del menú para volver a atrás"
        links.placeholder = "Agregar los links (separados por coma, ejemplo www.example.com, www.example2.com)";
        enviar.innerText = "Enviar";
        contenedor.appendChild(nombre);
        contenedor.appendChild(submenus);
        contenedor.appendChild(informacion);
        contenedor.appendChild(links);
        contenedor.appendChild(enviar);
        div.appendChild(contenedor);
        //content.appendChild(contenedor);
        console.log("despues del contenedor");
        enviar.addEventListener('click',function (event) {
            event.preventDefault();
            var links_listos = [];
            var submenus_listos = [];
            var pack = {};
            pack.nombre = document.getElementById('nombre-menu').value;
            pack.informacion = document.getElementById('informacion-menu').value;
            var links_tomados = document.getElementById('links-menu').value;
            if(links_tomados){
                var links_preparados = links_tomados.split(",");
                links_preparados.forEach(element => {var link = element.trim(); links_listos.push(link);});
                pack.links = links_listos;
            }
            var submenus_tomados = document.getElementById('submenus-menu');
            if(submenus_tomados){
                var submenus_preparados = submenus_tomados.split(",");
                submenus_preparados.forEach(element => {var submenu = element.trim(); submenus_listos.push(submenu);});
                pack.submenus = submenus_listos;
            }
            
            socketopciones.emit("nuevo_menu",pack);
        });
       
    });
    

    $('#editar-menu').click(function (event) {
        event.preventDefault();
        socketopciones.emit("obtener-menu");
        let select = document.getElementById("div-menu");
        select.removeAttribute("style");
        let botones_iniciales = document.getElementById("opciones-iniciales");
        botones_iniciales.setAttribute("style", "display: none");
    });

socketopciones.on("connect", () => {
    console.log("sipisi");
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
            links = prefix.link;
            pack.link = links;
            menu[key] = pack;

            div.appendChild(opcion);
        }
        enviar.innerText = "Enviar";
        contenedor.appendChild(titulo);
        contenedor.appendChild(content);
        container.appendChild(text);
        container.appendChild(contenedor);
        container.appendChild(enviar);
        
        div.addEventListener('change',function (event) {
            event.preventDefault();
            socketopciones.emit("sub-menu",div.value);
        });

         var envio = document.getElementById("enviar_opciones");
         envio.addEventListener('click', function (e) {
             e.preventDefault();
             let opcion = $('#titulo').attr('data-value');
             console.log(menu[opcion]);
             let info = document.getElementById(`info-${menu[opcion].nombre}`).value;
             menu[opcion].informacion = info;
             let link = document.getElementById(`link-${menu[opcion].nombre}`).value;
             menu[opcion].link = link;
             console.log(menu[opcion]);
             socketopciones.emit("editar_menu",menu);
             //alert("Se modifico el menu");
             //location.reload(); //una vez se haya modificado, recargamos la pagina
         });
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

    socketopciones.on("menu-grafico", function (msg) {
                var titulo = document.getElementById("titulo");
                let content = document.getElementById("content");
                while (content.firstChild) {
                    content.removeChild(content.firstChild);
                }
                titulo.setAttribute('data-value', msg);
                titulo.innerHTML = "<b>" + menu[msg].nombre + "</b>";
                // links para despues intercambiarlos
                if (menu[msg].link){
                var links = "";
                menu[msg].link.forEach(element => {
                    links = links +", " + element;
                });
                links = links.slice(2,links.length);
                }
                if (menu[msg].opciones){
                //botones que serian submenos
                var botones = "";
                var div_botones = document.createElement('div');
                menu[msg].opciones.forEach(element => {
                    var btn = document.createElement("button");
                    var ultimo = menu[menu.length-1];
                    if(element==ultimo){
                        element  = "volver";
                    }
                    btn.setAttribute("id", element);
                    btn.innerText = element;
                    botones = botones + ", " + element;
                    div_botones.appendChild(btn);
                });
                botones = botones.slice(2, botones.length);
                }
                let boton_enviar = document.createElement('button');
                let div_info = document.createElement('div');
                let div_links = document.createElement('div');
                let div_opciones = document.createElement('div');
                let titulo_info = document.createElement('p');
                let titulo_links = document.createElement('p');
                let titulo_opciones = document.createElement('p');
                let textarea_info = document.createElement('textarea');
                let textarea_links = document.createElement('textarea');
                let textarea_botones = document.createElement('textarea');
                boton_enviar.setAttribute('id','enviar-menu');
                div_info.setAttribute('id','div-info');
                div_links.setAttribute('id','div-links');
                div_opciones.setAttribute('id','div-opciones');
                titulo_info.innerHTML = "<b>Informacion: </b>";
                titulo_links.innerHTML = "<b>Links: </b>";
                titulo_opciones.innerHTML = "<b>Botones: </b>";
                textarea_info.setAttribute('style', "width:50%");
                textarea_info.setAttribute("id", `info-${menu[msg].nombre}`);
                textarea_links.setAttribute('style', "width:50%");
                textarea_links.setAttribute("id", `link-${menu[msg].nombre}`);
                textarea_botones.setAttribute('style', "width:50%");
                textarea_links.setAttribute("id", `botones-${menu[msg].nombre}`);
                div_info.appendChild(titulo_info);
                div_info.appendChild(textarea_info);
                div_links.appendChild(titulo_links);
                div_links.appendChild(textarea_links);
                div_opciones.appendChild(titulo_opciones);
                div_opciones.appendChild(div_opciones);
                content.appendChild(div_info);
                content.appendChild(div_links);
                content.appendChild(div_opciones);
                content.appendChild(div_botones);
                textarea_info.innerHTML = menu[msg].informacion;
                textarea_links.innerHTML = menu[msg].link;
                textarea_botones.innerHTML = menu[msg].opciones;
            });
    /*socketopciones.on("menu-grafico",function (msg) {
       var titulo = document.getElementById("titulo");
       let content = document.getElementById("content");
       while(content.firstChild){
           content.removeChild(content.firstChild);
       }
       titulo.setAttribute('data-value', msg);
       titulo.innerHTML= "<b>" + menu[msg].nombre + "</b>";
        menu[msg].opciones.forEach(element => {
            var btn = document.createElement("button");
            btn.setAttribute("value", element.valor);
            btn.setAttribute("id", element.nombre);
            btn.innerText = element.valor;
             if (element.informacion != undefined) {
                 let titulo_boton = document.createElement('div');
                 let textarea = document.createElement('textarea');
                 textarea.setAttribute('style', "width:50%");
                 textarea.setAttribute("id",element.valor);
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

        
    });*/


    $('#borrar-menu').click(function (event) {
        event.preventDefault();
    });

   
});