//const SURLopciones = "http://localhost";
//const SURLopciones = "128.53.1.23";
const SURLopciones = "https://chat.muninqn.gov.ar/operadores/admin/";
const socketopciones = io(`${SURLopciones}:4002`);


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

    

    //* jquery para la parte del summernote que sirve para modificar el json de opciones

   

    $('.obtener-menu').click(function (event) {
        event.preventDefault();
        alert("Funcionalidad en desarrollo");
        
        
    });

//fede termina la parte del summernote

  socketopciones.on("alert", function (msg) {
      alert(msg);
  });


});