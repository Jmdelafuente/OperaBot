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
        var boton_volver = document.createElement('button');
        boton_volver.setAttribute('id','volver-creacion');
        var div = document.getElementById("div-creacion");
        let div_alerta = document.createElement('div');
        div_alerta.setAttribute('id','alerta-crear');
        div_alerta.setAttribute('style','padding: 1% 0;');
        var content = document.createElement("div");
        var contenedor = document.createElement("div");
        var div_nombre = document.createElement("div");
        let titulo_nombre = document.createElement('p');
        titulo_nombre.innerHTML = "<b>Nombre del menú: </b>";
        var nombre = document.createElement("input"); 
        nombre.setAttribute('style','width:60%'); 
        var div_informacion = document.createElement("div");
        let titulo_informacion = document.createElement('p');
        titulo_informacion.innerHTML = "<b>Información: </b>"; 
        var informacion = document.createElement("input");
        informacion.setAttribute('style','width:60%');
        var div_submenu = document.createElement("div");
        let titulo_submenu = document.createElement('p');
        titulo_submenu.innerHTML = "<b>opciones de los submenús: </b>";   
        var submenus = document.createElement("input");
        submenus.setAttribute('style','width:60%');
        var div_link = document.createElement("div");
        let titulo_link = document.createElement('p'); 
        titulo_link.innerHTML = "<b>Links: </b>";
        var links = document.createElement("input");
        links.setAttribute('style','width:60%'); 
        var boton_enviar = document.createElement('button');
        content.setAttribute('id', 'div-creaciones');
        contenedor.setAttribute('id','contenedor-creacion');
        nombre.setAttribute('id','nombre-menu');
        submenus.setAttribute('id','submenus-menu');
        informacion.setAttribute('id','informacion-menu');
        links.setAttribute('id','links-menu');
        boton_enviar.className = "btn btn-primary mx-3";
        boton_volver.className = "btn btn-primary mx-3";        
        nombre.placeholder = "Nombre del menú";
        informacion.placeholder = "Información que saldra en forma de mensaje al ciudadano";
        submenus.placeholder = "Nombre de los submenus (separados por coma) el último debe ser el nombre del menú para volver a atrás"
        links.placeholder = "Agregar los links (separados por coma, ejemplo www.example.com, www.example2.com)";
        boton_enviar.innerText = "Enviar";
        boton_volver.innerText = "Volver";
        div_alerta.innerHTML = "<b> Aclaración: </b><br> Nombre de los submenus (Botones) debe ir separados por una coma y el último debe ser el nombre del menú para volver a atrás <br> Los links deben estar separados por coma, por ejemplo: <b>www.exaple.com, www.example2.com</b>";

        div_nombre.appendChild(titulo_nombre);
        div_nombre.appendChild(nombre);
        contenedor.appendChild(div_nombre);
        div_submenu.appendChild(titulo_submenu);
        div_submenu.appendChild(submenus);
        contenedor.appendChild(div_submenu);
        div_informacion.appendChild(titulo_informacion);
        div_informacion.appendChild(informacion);
        contenedor.appendChild(div_informacion);
        div_link.appendChild(titulo_link);
        div_link.appendChild(links);
        contenedor.appendChild(div_link);
        contenedor.appendChild(div_alerta);
        contenedor.appendChild(boton_enviar);
        contenedor.appendChild(boton_volver);
        div.appendChild(contenedor);
        //content.appendChild(contenedor);

        boton_enviar.addEventListener('click',function (event) {
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
            var submenus_tomados = document.getElementById('submenus-menu').value;
            if(submenus_tomados){
                var submenus_preparados = submenus_tomados.split(",");
                submenus_preparados.forEach(element => {var submenu = element.trim(); submenus_listos.push(submenu);});
                pack.submenus = submenus_listos;
            }
            volver('#contenedor-creacion');
            socketopciones.emit("nuevo_menu",pack);
        });
        boton_volver.addEventListener('click',function (event) {
            event.preventDefault();
            volver('#contenedor-creacion');
         });
       
    });
    

    $('#editar-menu').click(function (event) {
        event.preventDefault();
        socketopciones.emit("obtener-menu");
        let select = document.getElementById("div-menu");
        select.removeAttribute("style");
        let titulo_selector = document.getElementById('titulo-selector');
        titulo_selector.innerHTML = "Seleccione el menú que desea editar";
        let botones_iniciales = document.getElementById("opciones-iniciales");
        botones_iniciales.setAttribute("style", "display: none");
    });

socketopciones.on("connect", () => {
    console.log("vamooo nenee!!");
});


    socketopciones.on("selector-menu",function (msg) {
        let opciones = [];
        let div = document.getElementById("selector-menu");
        //let enviar = document.createElement('button');
        //enviar.setAttribute("class", "btn btn-primary");
        let container= document.getElementById("div-menu");
        let text = document.createElement('div');
        text.setAttribute("id","editor");
        //enviar.setAttribute("id", "enviar_opciones");
        let contenedor = document.createElement('div');
        var titulo = document.createElement('div');
        let content = document.createElement('div');
        contenedor.setAttribute("id","contenedor");
        titulo.setAttribute("id","titulo");
        titulo.setAttribute('style','padding: 1% 0;');
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
        //enviar.innerText = "Enviar";
        contenedor.appendChild(titulo);
        contenedor.appendChild(content);
        container.appendChild(text);
        container.appendChild(contenedor);
        //container.appendChild(enviar);
        
        div.addEventListener('change',function (event) {
            event.preventDefault();
            socketopciones.emit("sub-menu",div.value);
        });
    })



    socketopciones.on("menu-grafico", function (msg) {
                var titulo = document.getElementById("titulo");
                let content = document.getElementById("content");
               
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
  
                    //botones que serian submenus
                var botones = "";
                var div_botones = document.createElement('div');
                div_botones.setAttribute('id','div-botones');
                div_botones.setAttribute('style',"padding: 2% 0;")
                let titulo_botones = document.createElement('p');
                titulo_botones.innerHTML = "<b>Asi quedaria el menú:</b>"
                div_botones.appendChild(titulo_botones);
                menu[msg].opciones.forEach((element,i) => {
                    var btn = document.createElement("button");
                    btn.className = "btn btn-outline-primary rounded-pill mr-2 opcion-menu";
                    var titulo = element;
                    if(i == (menu[msg].opciones.length - 1)){
                        console.log(element);
                        titulo = "volver";
                    }
                    btn.setAttribute("id", element);
                    btn.innerText = titulo;
                    botones = botones + ", " + element;
                    div_botones.appendChild(btn);
                });
                botones = botones.slice(2, botones.length);
                }
                let boton_enviar = document.createElement('button');
                let boton_volver = document.createElement('button');
                boton_volver.setAttribute('id','volver-editar');
                boton_enviar.className = "btn btn-primary mx-3";
                boton_volver.className = "btn btn-primary mx-3";
                let div_alerta = document.createElement('div'); 
                div_alerta.setAttribute('id','alerta-editar');
                div_alerta.setAttribute('style','padding: 1% 0;');
                let div_info = document.createElement('div');
                let div_links = document.createElement('div');
                let div_opciones = document.createElement('div');
                let titulo_info = document.createElement('p');
                let titulo_links = document.createElement('p');
                let titulo_opciones = document.createElement('p');
                let textarea_info = document.createElement('textarea');
                let textarea_links = document.createElement('textarea');
                let textarea_botones = document.createElement('textarea');
                div_alerta.innerHTML = "<b> Aclaración: </b><br> Nombre de los submenus (Botones) debe ir separados por una coma y el último debe ser el nombre del menú para volver a atrás <br> Los links deben estar separados por coma, por ejemplo: <b>www.exaple.com, www.example2.com</b>";
                boton_enviar.setAttribute('id','enviar-menu');
                boton_enviar.innerHTML = "Enviar";
                boton_volver.innerHTML = "Volver";
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
                textarea_botones.setAttribute("id", `botones-${menu[msg].nombre}`);
                div_info.appendChild(titulo_info);
                div_info.appendChild(textarea_info);
                div_links.appendChild(titulo_links);
                div_links.appendChild(textarea_links);
                div_opciones.appendChild(titulo_opciones);
                div_opciones.appendChild(textarea_botones);
                content.appendChild(div_info);
                content.appendChild(div_links);
                content.appendChild(div_opciones);
                content.appendChild(div_alerta);
                content.appendChild(div_botones);
                content.appendChild(boton_enviar);
                content.appendChild(boton_volver);
                if(menu[msg].informacion==undefined){
                    textarea_info.placeholder = "No contiene información";
                }else{
                    textarea_info.innerHTML = menu[msg].informacion;
                }
                if(menu[msg].link == undefined){
                    textarea_links.placeholder = "No contiene links";
                }else{
                    textarea_links.innerHTML = menu[msg].link;
                }
                textarea_botones.innerHTML = menu[msg].opciones;
                boton_enviar.addEventListener('click',function (event) {
                    event.preventDefault();
                    //codigo para obtener los textareas, armar el paquete con todos los datos y enviarlo
                    var data_links = "";
                    var data_botones = "";
                    let links_tomados = document.getElementById(`link-${menu[msg].nombre}`).value;
                    console.log(`en links hay = ${links_tomados}`);
                    if (links_tomados) {
                        var links_preparados = links_tomados.split(",");
                        links_preparados.forEach(element => {
                            var link = element.trim();
                            data_links = data_links + "\"" + link +  "\",";
                        });
                        data_links = data_links.slice(0,-1);
                    }
                    console.log(`en los links procesados serian = ${data_links}`);
                    var submenus_tomados = document.getElementById(`botones-${menu[msg].nombre}`).value;
                    console.log(`en botones hay = ${submenus_tomados}`);
                    if (submenus_tomados) {
                        var submenus_preparados = submenus_tomados.split(",");
                        submenus_preparados.forEach(element => {
                            var submenu = element.trim();
                            data_botones = data_botones + "\"" + submenu + "\",";
                        });
                        data_botones = data_botones.slice(0,-1);
                    }
                    console.log(`en los botones procesados serian = ${data_botones}`);
                    let data_info = "\"" + document.getElementById(`info-${menu[msg].nombre}`).value + "\",";
                    console.log(`en informacion = ${data_info}`);
                    let nuevo_menu = {};
                    /*nuevo_menu.nombre = "\"" +menu[msg].nombre+ "\"";
                    nuevo_menu.opciones = data_botones;
                    nuevo_menu.informacion = data_info;
                    nuevo_menu.link = data_links;*/

                    var json_menu = "{" + "\"nombre\":" + "\"" + nuevo_menu.nombre + "\"" + "," + "\"opciones\":[" + nuevo_menu.opciones + "]," + "\"informacion\":" + "\"" + nuevo_menu.informacion + "\"" + "," + "\"link\":[" + nuevo_menu.link + "]}";
                    
                    console.log(`y para el json seria: ${JSON.parse(nuevo_menu)}`);
                    //socketopciones.emit("modificar",nuevo_menu);
                    //alert("Se modifico el menu");
                    volver('#contenedor');
                });
                boton_volver.addEventListener('click',function (event) {
                   event.preventDefault();
                   volver('#contenedor');
                });
            });

    $('#obtener.menu').click(function (event){
        event.preventDefault();
        let select = document.getElementById("div-menu");
        select.removeAttribute("style");
        let botones_iniciales = document.getElementById("opciones-iniciales");
        botones_iniciales.setAttribute("style", "display: none");
        let titulo_selector = document.getElementById('titulo-selector');
        titulo_selector.innerHTML = "Seleccione el menú que desea";
        let div = document.getElementById("selector-menu");
        div.addEventListener('change',function (event) {
            socketopciones.info(menu[div.value].nombre);
        });
    });

    socketopciones.on("info",function (msg) {
       console.log(`obtenido fue = ${JSON.stringify(msg)}`); 
    });

    $('#borrar-menu').click(function (event) {
        event.preventDefault();
        socketopciones.emit("obtener-menu");
        let select = document.getElementById("div-menu");
        select.removeAttribute("style");
        let botones_iniciales = document.getElementById("opciones-iniciales");
        botones_iniciales.setAttribute("style", "display: none");
        let titulo_selector = document.getElementById('titulo-selector');
        titulo_selector.innerHTML = "Seleccione el menú que desea eliminar";
        let div = document.getElementById("selector-menu");
        div.addEventListener('change',function (event) {
            //socketopciones.borrar(menu[div.value].nombre);
        });
    });

    function volver(msg) {
        $(`${msg}`).remove();
        let select = document.getElementById("div-menu");
        select.setAttribute("style","display: none");
        let botones_iniciales = document.getElementById("opciones-iniciales");
        botones_iniciales.removeAttribute("style");        
    }

    socketopciones.on("mostrar",function (msg) {
       console.log(JSON.stringify(msg)); 
    });
   
});