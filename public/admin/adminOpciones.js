const SURLopciones = "localhost";
const socketopciones = io(`${SURLopciones}:4002`);
var blueprints = {};
var conn = false;
var chatListAll = [];
var chatListAsign = [];
var activeTab;
var limit = false;
var datasession = sessionStorage.getItem('key');
var dataoperador = sessionStorage.getItem('operadorid');
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

    socketopciones.on("connect", function () {
        
    });

    //* jquery para la parte del summernote que sirve para modificar el json de opciones

    $(document).ready(function () {
        $('#summernote').summernote({
            placeholder: "Escriba ejemplo para saber como escribir el menu, respuesta para saber como escribir la respuesta final de un boton, aclaracion para saber los detalles de escritura a tener en cuenta, plantilla para un ejemplo de una plantilla",
            tabsize: 2,
            height: 250,
            hint: {
                words: ['nombre": "nombre"', "opciones:[]", 'valor":', 'informacion":', 'descripcion":' , "descripcion:", 'estructura de un menu => "nombre" o "respuesta nombre": Nombre que representa la opcion o la respuesta,\n "opciones": [ "nombre": "submenu" que sera el que indique otro submenu o si es una respuesta final, el nombre debe comenzar con "respuesta" ("respuesta nombresubmenu"),\n "valor": "NOMBRE" QUE APARECE EN EL BOTON, siempre en mayuscula: ], informacion: un pequeño mensaje si es necesario para el ciudadano descripcion: Sirve para que el operador pueda saber una descripcion del menu}", "aclaraciones: cada elemento viene de a pares que son separados por comas y deben escribirse entre comillas dobles, excepto los dos puntos (:) y las comas => "elemento 1":"nombre elemento 1" , "elemento 2":"nombre elemento 2" . Dentro de opciones:[] deben escribirse dentro de los corchetes cada submenu entre llaves separadas por "coma" es decir {nombre: submenu 1, valor: valor 1} , {nombre: submenu 1, valor: valor 2}. La informacion no es obligatoria solo si sirve para describir que hace el boton si no es muy explicativo su nombre.', 'ejemplo => "nombre": "menu 1" , "opciones": [{"nombre": "respuesta submenu 1" , "valor": "SUBMENU 1"} , {"nombre": "submenu 2" , "valor": "SUBMENU 2"}]', 'respuesta => "nombre": "respuesta submenu 1" , "opciones": ["Esto solo es el texto de la respuesta"]', 'plantilla => "plantilla":"mensaje predeterminado"'],
                match: /\b(\w{1,})$/,
                search: function (keyword, callback) {
                    callback($.grep(this.words, function (item) {
                       return item.indexOf(keyword) === 0;
                        
                    }));
                }
            },
        });
    });

  
    $('.enviar-opciones').click(function (event) {
        event.preventDefault();
        if ($('#summernote').val().length > 0) {
            let mensaje = $($("#summernote").summernote("code")).text();   
            mensaje = "\,{" + mensaje + "}";
            console.log(mensaje);
            socketopciones.emit("opciones_admin",mensaje);
            $("#summernote").summernote("code", "");
         }
    });

    $('.enviar-plantilla').click(function (event) {
        event.preventDefault();
        if ($('#summernote').val().length > 0) {
            let mensaje = $($("#summernote").summernote("code")).text();   
            mensaje = "{" + mensaje + "}";
            console.log(mensaje);
            socketopciones.emit("plantilla_admin",mensaje);
            $("#summernote").summernote("code","");
         }
    });

//fede termina la parte del summernote

  socketopciones.on("alert", function (msg) {
      alert(msg);
  });


});