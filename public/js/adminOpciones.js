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
        var iframe_opcion = parent.document.getElementById("frame_opciones");
        iframe_opcion.setAttribute('src', `../admin/creacion.html?${window.location.search.substr(1)}`);
        event.preventDefault();
        let botones_iniciales = document.getElementById("opciones-iniciales");
        botones_iniciales.setAttribute("style", "display: none");
        var div = document.getElementById("div-creacion");
        let div_alerta = document.createElement('div');
        div_alerta.setAttribute('id','alerta-crear');
        div_alerta.setAttribute('style','padding: 1% 0;');
        var content = document.createElement("div");
        var contenedor = document.getElementById("contenedor-creacion");
        $('#contenedor-creacion').show();
        var contenedor_editables = document.getElementById("contenedor-editables");
        var div_nombre = document.getElementById("nombre");
        
        var div_informacion = document.getElementById("informacion");
        
        var div_submenu = document.getElementById("submenu");
        
        var div_link = document.getElementById("links");
         
        content.setAttribute('id', 'div-creaciones');
        contenedor.setAttribute('id','contenedor-creacion');
        contenedor.className = "row";      
        contenedor_editables.appendChild(div_nombre);
        contenedor_editables.appendChild(div_submenu);
        contenedor_editables.appendChild(div_informacion);
        contenedor_editables.appendChild(div_link);
        contenedor.appendChild(contenedor_editables);
        
        div.appendChild(contenedor);

        socketopciones.emit("titulos","");
        //content.appendChild(contenedor);
       
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
        var pack = {};
        pack.menu = msg;
        pack.selector = "selector-menu";
        crear_selector(pack);
       
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
                while (content && content.firstChild) {
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
  
                    //botones que serian submenus
                var botones = "";
                var div_botones = document.createElement('div');
                div_botones.setAttribute('id','div-botones');
                div_botones.setAttribute('style',"padding: 2% 0;")
                let titulo_botones = document.createElement('p');
                titulo_botones.innerHTML = "<b>Asi se ve el menú actualmente:</b>"
                div_botones.appendChild(titulo_botones);
                menu[msg].opciones.forEach((element,i) => {
                    var btn = document.createElement("button");
                    btn.className = "btn btn-outline-primary rounded-pill mr-2 opcion-menu";
                    var titulo = element;
                    if(i == (menu[msg].opciones.length - 1)){
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
                let boton_prueba = document.createElement('button');
                boton_volver.setAttribute('id','volver-editar');
                boton_enviar.className = "btn btn-primary mx-3";
                boton_volver.className = "btn btn-primary mx-3";
                boton_prueba.className = "btn btn-primary mx-3";
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
                boton_prueba.innerHTML = "Ver menú editado";
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
                content.appendChild(boton_prueba);
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
                    var links_listos = [];
                    var submenus_listos = [];
                    let links_tomados = document.getElementById(`link-${menu[msg].nombre}`).value;
                    //console.log(`en links hay = ${links_tomados}`);
                    if (links_tomados.includes(",")) {
                        var links_preparados = links_tomados.split(",");
                        links_preparados.forEach(element => {
                            var link = element.trim();
                            links_listos.push(link);
                        });
                        //data_links = data_links.slice(0,-1);
                    }else{
                        links_listos.push(links_tomados);                        
                    }
                    //console.log(`en los links procesados serian = ${links_listos}`);
                    var submenus_tomados = document.getElementById(`botones-${menu[msg].nombre}`).value;
                    //console.log(`en botones hay = ${submenus_tomados}`);
                    if (submenus_tomados.includes(",")) {
                        var submenus_preparados = submenus_tomados.split(",");
                        submenus_preparados.forEach(element => {
                            var submenu = element.trim();
                            submenus_listos.push(submenu);
                        });
                       //data_botones = data_botones.slice(0,-1);
                    }else{
                        submenus_listos.push(submenus_tomados);
                    }
                    //console.log(`en los botones procesados serian = ${submenus_listos}`);
                    let data_info = document.getElementById(`info-${menu[msg].nombre}`).value;
                    let nuevo_menu = {};
                    nuevo_menu.nombre = menu[msg].nombre;
                    nuevo_menu.opciones = submenus_listos;
                    nuevo_menu.informacion = data_info;
                    nuevo_menu.link = links_listos;

                    //console.log(`sin el strigi ${nuevo_menu}`);
                    //console.log(`y para el json seria: ${JSON.stringify(nuevo_menu)}`);
                    socketopciones.emit("modificar",nuevo_menu);
                    //alert("Se modifico el menu");
                    volver('#contenedor');
                    $('#selector-menu').empty();
                    $('input[type="text"]').val("");
                    let select = document.getElementById("div-menu");
                    select.setAttribute("style","display: none");
                });
                boton_volver.addEventListener('click',function (event) {
                   event.preventDefault();
                   volver('#contenedor');
                   $('input[type="text"]').val("");
                   let select = document.getElementById("div-menu");
                   select.setAttribute("style","display: none");
                });
                boton_prueba.addEventListener('click',function (event) {
                    event.preventDefault();
                    var submenus_listos = [];
                    var submenus_tomados = document.getElementById(`botones-${menu[msg].nombre}`).value;
                    if (submenus_tomados.includes(",")) {
                        var submenus_preparados = submenus_tomados.split(",");
                        submenus_preparados.forEach(element => {
                            var submenu = element.trim();
                            submenus_listos.push(submenu);
                        });
                    }else{
                        submenus_listos.push(submenus_tomados);
                    }

                    submenus_listos.forEach((element,i) => {
                        var btn = document.createElement("button");
                        btn.className = "btn btn-outline-primary rounded-pill mr-2 opcion-menu";
                        var titulo = element;
                        if(i == (menu[msg].opciones.length - 1)){
                            titulo = "volver";
                        }
                        btn.setAttribute("id", element);
                        btn.innerText = titulo;
                        botones = botones + ", " + element;
                        div_botones.appendChild(btn);
                    });
                    botones = botones.slice(2, botones.length);
                    
                });
            });

    $('#obtener-menu').click(function (event){
        event.preventDefault();
        socketopciones.emit("mostrar","");
        
    });

    socketopciones.on("info",function (msg) {
       console.log(`obtenido fue = ${JSON.stringify(msg)}`); 
    });

    $('#borrar-menu').click(function (event) {
        event.preventDefault();
        socketopciones.emit("obtener-menu-borrar");
    });

    function crear_selector(msg) {
        let selector = document.getElementById(`${msg.selector}`);
        var opcion = document.createElement('option');
        opcion.innerText = "seleccione una opción";
        selector.appendChild(opcion);
        for (const [key, prefix] of Object.entries(msg.menu)) {  
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
            selector.appendChild(opcion);
        }

    }

    socketopciones.on("borrar", function (msg) {
        let select = document.getElementById("div-menu-borrar");
        select.removeAttribute("style");
        let botones_iniciales = document.getElementById("opciones-iniciales");
        botones_iniciales.setAttribute("style", "display: none");
        let borrar_selector = document.getElementById('selector-menu-borrar');
        var pack = {};
        pack.menu = msg;
        pack.selector = "selector-menu-borrar";
        crear_selector(pack);
        borrar_selector.addEventListener('change',function (event) {
            var nombre_menu = menu[borrar_selector.value].nombre;
            if(nombre_menu != 'Menu Inicial'){
                if(confirm(`Esta por borrar el menú ${nombre_menu}, esta acción es irreversible, ¿Esta seguro de seguir adelante el borrado?`)){
                socketopciones.emit("borrar", nombre_menu);
                
            }
            }else{
                alert("No puede eliminarse el Menú Inicial, lo siento, pero como queres borrar el menu inicial?, que pasa, a ver?")
            }

            volver();
            $('input[type="text"]').val("");
            select.setAttribute("style","display: none");
        });
    });
        

    function volver(msg) {
        if(msg){
            $(`${msg}`).remove();
        }
        let botones_iniciales = document.getElementById("opciones-iniciales");
        botones_iniciales.removeAttribute("style");        
    }

    socketopciones.on("titulos", function (msg) {
        $('#contenedor-titulos').show();
        var contenedor_titulos = document.getElementById("contenedor-titulos");
        var contener_botones = document.getElementById("contener_botones")
        let titulo_selector = document.getElementById('selector-titulos');
        var titulo = document.getElementById("titulos-menu");
        var boton_volver = document.getElementById('boton-volver-creacion');
        var boton_enviar = document.getElementById('boton-enviar-creacion');
        var nombre = document.getElementById("submenus-menu");
        titulo_selector.innerHTML = "Seleccione el menú padre";
        let select = document.getElementById("tablero");
        titulo_selector.addEventListener('change',function (e) {
            e.preventDefault();
            var nombre_input = menu[titulo_selector.value].nombre;
            nombre.value = nombre.value +  nombre_input;
        });
        var pack = {};
        pack.menu = msg;
        pack.selector = "selector-titulos";
        crear_selector(pack);
    
        let content = document.getElementById('contenedor-creacion');
        contenedor_titulos.appendChild(titulo);
        
        content.appendChild(contenedor_titulos);
        content.appendChild(contener_botones);

        boton_enviar.addEventListener('click',function (event) {
            event.preventDefault();
            var links_listos = [];
            var submenus_listos = [];
            var pack = {};
            var links_tomados = document.getElementById('links-menu').value;
            if(links_tomados.includes(",")){
                var links_preparados = links_tomados.split(",");
                links_preparados.forEach(element => {var link = element.trim(); links_listos.push(link);});
            }else{
               links_listos.push(links_tomados);
            }
            var submenus_tomados = document.getElementById('submenus-menu').value;
            if(submenus_tomados.includes(",")){
                var submenus_preparados = submenus_tomados.split(",");
                submenus_preparados.forEach(element => {var submenu = element.trim(); submenus_listos.push(submenu);});
            }else{
                submenus_listos.push(submenus_tomados);
            }
            pack.nombre = document.getElementById('nombre-menu').value;
            pack.informacion = document.getElementById('informacion-menu').value;
            pack.opciones = submenus_listos;
            pack.link = links_listos;
            var menu_boton = "";
            for (let index = 0; index < submenus_listos.length-1; index++) {
                if(index == submenus_listos.length-3){
                    menu_boton += submenus_listos[index] + " y ";
                }else{
                    menu_boton += submenus_listos[index] + ", ";
                }
            }
            menu_boton = menu_boton.slice(0,-2);
            socketopciones.emit("nuevo_menu",pack);
            $('input[type="text"]').val("");
            alert(`Recuerde que los submenus nuevos ${menu_boton} , deben ser creados y completados para que funcionen como tal`);
            ocultar('#contenedor-creacion');
            $('#contenedor-titulos').show();
        });
        boton_volver.addEventListener('click',function (event) {
            event.preventDefault();
            $('input[type="text"]').val("");
            ocultar('#contenedor-creacion');
            $('#contenedor-titulos').show();
         
         });
    });

    function borrar_inputs(msg) {
        $('#nombre-menu').empty();
        $('#nombre-menu').val("");
        $('#submenus-menu').empty();
        $('#informacion-menu').empty();
        $('#links-menu').empty();
        $('#selector-titulos').empty();
        $('#selector-menu-borrar').empty();
        $('#selector-menu').empty();
    }

    function ocultar(msg) {
        if(msg){
            $(`${msg}`).hide();
        }
        let select = document.getElementById("div-menu");
        select.setAttribute("style","display: none");
        let botones_iniciales = document.getElementById("opciones-iniciales");
        botones_iniciales.removeAttribute("style");        
    }

    socketopciones.on("mostrar",function (msg) {
        var div = document.createElement('div');
        var boton_volver = document.createElement('button');
        boton_volver.className = "btn btn-primary";
        boton_volver.innerText = "Volver";
        div.setAttribute('id','mostrar');
        var ancla = document.getElementById("div-creacion");
        div.innerHTML = JSON.stringify(msg);
        div.appendChild(boton_volver);
        ancla.appendChild(div);
        boton_volver.addEventListener('click',function (event) {
        event.preventDefault();
        volver('#mostrar');
     });
    });
   
});

/*crear mas html para cada una de las opciones */