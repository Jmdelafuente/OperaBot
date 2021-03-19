//const SURLe = "localhost";
//const SURLe = "128.53.1.23";
const SURLe = "chat.muninqn.gov.ar/operadores/admin/";
const socketa = io(`${SURLe}`);
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

    /**
     * Escape an ID for being HTML and JQuery compatible.
     * This allow to use it with JQuery even if it has specials symbols
     * @param {String} myid ID for being transform
     * @returns string. The ID already escaped
     */
    function jq(myid) {
        return "#" + myid.replace(/(:|\.|\[|\]|,|=|@)/g, "\\$1");
    }
    /**
     * Retrive GETs paramemeters from URL and retrive it as an associative array
     *
     * @returns array with GET parameters
     */
    function getSearchParameters() {
        var prmstr = window.location.search.substr(1);
        return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
    }

    function transformToAssocArray(prmstr) {
        var params = {};
        var prmarr = prmstr.split("&");
        for (var i = 0; i < prmarr.length; i++) {
            var tmparr = prmarr[i].split("=");
            params[tmparr[0]] = tmparr[1];
        }
        return params;
    }

    var params = getSearchParameters();

   

    var iframe_chat = document.getElementById("frame_chat");
    iframe_chat.setAttribute('src', `../index.html?${window.location.search.substr(1)}`);
    
    var iframe_opcion = document.getElementById("frame_opciones");
    iframe_opcion.setAttribute('src', `opciones.html?${window.location.search.substr(1)}`);
 
});
