//const SURL = "http://localhost";
const SURL = "128.53.80.105";
//const socket = io(`${SURL}`, { 'forceNew': true, path: '/operadores/socket.io' });
//const SURL = "https://chat.muninqn.gov.ar";
const socket = io(`${SURL}` , {'forceNew': true, path:'/operadores/socket.io'});

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

  // * FIN FUNCIONES AUXILIARES * //

  // * FUNCIONES DEL DOM * //

  /**
   * Marca un chat como no leido, incorporando un elemento visual al mismo
   *
   * @param {string} chatid
   * @param {string} [unread=""]
   */
  function unreadMessages(chatid, asign,unread = "") {
    if (document.getElementById("unread_" + chatid)) {
      readMessages(chatid);
    }
    let circle = document.createElement("mark");
    let avatar = document.getElementById("avatar_" + chatid);
    circle.className = "swing";
    circle.innerText = unread;
    circle.id = "unread_" + chatid;
    avatar.parentNode.appendChild(circle);
    if(asign){
      var avatar_asig = document.querySelector(`#listaContactosAsignados img[id="avatar_${chatid}"]`);
      if (avatar_asig ){
        let circle_clone = circle.cloneNode(true);
        avatar_asig.parentNode.appendChild(circle_clone);
      }
    }
  }

  /**
   * Marca como leido el chat, eliminando la notificacion visual
   *
   * @param {String} chatid id que identifica al chat
   */
  function readMessages(chatid) {
    let circle = document.getElementById("unread_" + chatid);
    if (circle) {
      document
      .getElementById("avatar_" + chatid)
      .parentNode.removeChild(circle);
      
    }
    if(chatListAll.includes(chatid)){
      var circle_asig = document.querySelector(`#listaContactosAsignados mark[id="unread_${chatid}"]`);
      if(circle_asig){
        document.querySelector(`#listaContactosAsignados img[id="avatar_${chatid}"]`).parentNode.removeChild(circle_asig);
      }
    }
}

  $("#action_menu_btn").click(function () {
    $(".action_menu").toggle();
  });

  /**
   * Dibuja en el DOM un mensaje de texto
   *
   * @param {String} cont Contenido del mensaje o texto a mostrar
   * @param {String} tipo 'E' para los mensajes enviados, 'R' para los mensajes recibidos
   * @param {Number} t Timestamp o marca de tiempo del mensaje
   * @param {String} type Para saber de que tipo es el contenido del mensaje.
   * @param {String} nombreOperador nombre del operador que responde el mensaje 
   */
  function addMessage(cont, tipo, t, type,nombreOperador) {
    if (cont) {
      var ex = document.createElement("div");
      var msj = document.createElement("div");
      var hora = document.createElement("span");
      var div = document.getElementById("mensajes");
      if (tipo == "R") {
        ex.className = "d-flex justify-content-start mb-4";
        msj.className = "msg_cotainer";
      } else {
        ex.className = "d-flex justify-content-end mb-4";
        msj.className = "msg_cotainer_send";
      }
      hora.className = "msg_time";
      // hora.innerText = t;
      // * Distintos parser segun contenido: canvas, twemoji,...
      // console.log(type);
      switch (type) {
        case "message":
        case "chat": // * Emoji o chat
          msj.innerHTML = twemoji.parse(cont);
          break;
        case "sticker": // ! Sticker
          var canvas = document.createElement('canvas');
          var ctx = canvas.getContext('2d');
          canvas.width = msj.width/2;
          canvas.height = msj.height/2;
          iduser = sessionStorage.getItem('key');
          let imagen = new Image();
          imagen.onload = function () {
            ctx.drawImage(imagen, 0, 0,100,100);
          };
          imagen.src = cont;
          msj.appendChild(imagen);
        break;
        case "ptt": //! AUDIO
          let audio = document.createElement("audio");
          audio.setAttribute("controls", "");
          audio.src = cont;
          msj.appendChild(audio);
          break;
        default:
          break;
        case "image": // * Foto
          var link = document.createElement("a");
          var canvas = document.createElement("canvas");
          var ctx = canvas.getContext("2d");
          let image = new Image();
          image.onload = function () {
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          };
          image.src = cont;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.className = "imghover";
          link.addEventListener("click", function () {
            var w = window.open("");
            w.document.write(image.outerHTML);
          });
          msj.appendChild(link);
          link.appendChild(canvas);
          break;
          case "pdf":
          var link = document.createElement('a');
          let pdf = document.createElement('div');
          link.setAttribute('download','pdf');
          link.setAttribute('href',cont);
          link.setAttribute('title','Descarga de PDF');
          pdf.innerText = "haga click para descargar el PDF";
          msj.appendChild(link);
          link.appendChild(pdf);
            break;
      }
      div.appendChild(ex);
      ex.appendChild(msj);
      msj.appendChild(hora);
      div.scrollTop = div.scrollHeight;
      var time;
      if (t == "Ahora" || t == undefined) {
        setTimeout(function () {
          time = new Date(Date.now());
          var tiempo = time.getHours().toString() + ":" + ((time.getMinutes() < 10 ? "0" : "") + time.getMinutes()).toString();
          if(tipo=='E'){
            hora.innerText = tiempo + " " + nombreOperador; 
          }else{
            hora.innerText = tiempo;
          }
        });
      } else {
        time = new Date(parseInt(t)); 
        let s = "";
        let today = new Date();

        let hours = time.getHours().toString();
        let min = (
          (time.getMinutes() < 10 ? "0" : "") + time.getMinutes()
        ).toString();
        if (
          time.getMonth() == today.getMonth() &&
          time.getDate() == today.getDate()
        ) {
          s = s.concat(hours, ":", min);
        } else {
          let month = (
            (time.getMonth() + 1 < 10 ? "0" : "") +
            (time.getMonth() + 1)
          ).toString();
          let day = (
            (time.getDate() < 10 ? "0" : "") + time.getDate()
          ).toString();
          s = s.concat(day, "/", month, "  ", hours, ":", min);
        }
        
        if(tipo == "E"){
          hora.innerText = s + " " + nombreOperador;
        }else{
          hora.innerText = s;
        }
    }
  }
}

  /**
   * Dibuja en el DOM un chat en particular.
   * Pudiendo dibujarse en la lista de todos los contactos o sólo en los asignados
   *
   * @param {String} nom Nombre a mostrar del contacto
   * @param {String} id Identificador interno del chat para saber el destinatario
   * @param {Boolean} asign true si esta asignado a este operador, false en otro caso.
   * @param {char} origen "P" para saber si viene por message service o "W" si viene de wpp
   * @param {String} estado el estado representa si esta abierto o cerrado un chat
   * @param {String} email el email del ciudadano que sirve para buscar su chat
   */
  function addChat(nom, id, asign, origen, email,leido , estado = "Abierto",tags_guardados = []) {
    if (!chatListAll.includes(id)) {
      var li = document.createElement("li");
      var ex = document.createElement("div");
      var img = document.createElement("div");
      var avatar = document.createElement("img");
      var info = document.createElement("div");
      var tags = document.createElement("div");
      var nombre = document.createElement("span");
      var estatus = document.createElement("p");
      // li.classList = "active";
      li.id = "usuario_" + id;
      li.setAttribute("value", email);
      ex.className = "d-flex bd-highlight";
      img.className = "img_cont";
      avatar.src = "user-profile.png";
      avatar.className = "rounded-circle user_img";
      avatar.id = "avatar_" + id;
      info.className = "user_info";
      tags.className = "user_tags";
      tags.setAttribute("id", "user_tags");
      nombre.innerText = nom;
      estatus.innerText = "Online";
      var orig = document.createElement("i");


      switch (origen) {
        case "P":
          orig.className = "fa fa-desktop origen";
          break;
        case "W":
          orig.className = "fab fa-whatsapp origen";
          break;

        default:
          break;
      }


      if (Object.keys(tags_guardados).length !== 0){
        tags_guardados.forEach((element)=>{
          var span = document.createElement('span');
          var p = document.createElement('p');
          p.className = "etiqueta";
          span.setAttribute("id", element.nombre);
          span.className = `badge badge-pill ${element.color}`;
          p.innerText = element.nombre;
          span.appendChild(p);
          var tag = {
            nombre: element.nombre,
            color: element.color
          }
          var idChat = sessionStorage.getItem('key');
          var package = {
            id: idChat,
            tag: tag
          }
          var close_etiqueta = document.createElement('i');
          close_etiqueta.setAttribute('class', "fas fa-times close_etiqueta");
            close_etiqueta.addEventListener('click', function (event) {
              event.preventDefault();
              var nodo_asign = document.querySelector(`#listaContactosAsignados li[id="usuario_${id}"] div[id="user_tags"] span[id="${element.nombre}"] `);
              var nodo = document.querySelector(`#listaContactos li[id="usuario_${id}"] div[id="user_tags"] span[id="${element.nombre}"] `);
              if (nodo_asign) {
                nodo_asign.parentNode.removeChild(nodo_asign);
              }
              if (nodo) {
                nodo.parentNode.removeChild(nodo);
              }
              socket.emit("delete_tag", package);
            });
            span.appendChild(close_etiqueta);
            tags.append(span);
        });
      }

      document.getElementById("listaContactos").append(li);
      chatListAll.push(id);
      li.prepend(ex);
      ex.appendChild(img);
      img.appendChild(avatar);
      ex.appendChild(info);
      ex.appendChild(tags);
      info.appendChild(nombre);
      info.appendChild(estatus);
      info.appendChild(orig);
      li.addEventListener('click', function (event) {
        event.preventDefault();
        changeChat(id,estado,origen);
      });
      let clonediv = li.cloneNode(true);
      
      
      if (estado != 'Cerrado') {
        li.removeAttribute('class', "chat-cerrado");
        li.setAttribute("class", "chat-abierto todos");
      } else {
        li.removeAttribute("class", "chat-abierto")
        li.setAttribute("class", "chat-cerrado");
      }
      
      if (asign && !chatListAsign.includes(id) && estado!="Cerrado") {
        clonediv.setAttribute("class","asig");
        document.getElementById("listaContactosAsignados").prepend(clonediv);
        chatListAsign.push(id);
        clonediv.addEventListener('click', function (event) {
          event.preventDefault();
          changeChat(id,estado,origen);
        });
      }
      
      if (!leido) {
        unreadMessages(id, asign);
      }
    }
      $("#listaContactos li").slice(20).hide();

  }

  /**
   * Cambia el chat activo, modificando el nombre a mostrar, marcando como activo en la lista y el valor de chatid
   * 
   * @param {String} id ID de chat seleccionado
   * @param {String} estado indica que un chat se encuentra cerrado o abierto
   * @returns
   */
  function changeChat(id,estado,origen) {
    if ($("#idChat").val() != id) {
      activeTab = sessionStorage.getItem("activeTab");

      // Actualizamos el destinatario
      $("#idChat").val(id);
      // Dibujar mensajes, avatar y nombre
      let idchat = jq("usuario_" + id);
      //let li = $(idchat);
      let li = document.querySelector(`#listaContactos li[id="usuario_${id}"]`);

      let nom = $(idchat + " span").html();
      // Actualizamos el nombre
      $("#nombreActivo").html("Chat con " + nom);
      // Marcamos el chat como activo
      $(".chat .active-chat").removeClass("active-chat");
      // Ponemos icono si es de W o P depende el origen
      if(origen=="P"){
        $("#logo-origen").removeClass("fab fa-2x fa-whatsapp");
        icono = "fa fa-desktop origen";
      }else{
        $("#logo-origen").removeClass("fa fa-desktop origen");
        icono = "fab fa-2x fa-whatsapp";
      }

      $("#logo-origen").addClass(icono);
      
      if (estado != "Cerrado"){
        $(li).removeClass("chat-cerrado");
        $(li).addClass("active-chat");
        if(chatListAsign.includes(id)){
        let li_asign = document.querySelector(`#listaContactosAsignados li[id="usuario_${id}"]`);
        $(li_asign).addClass("active-chat");
        }
        // Enviamos el 'visto' al servidor
        //socket.emit("seen", id);
        return new Promise(resolve => {
          socket.emit("seen", id, (ack) => {
            if (ack) {
              // El chat fue correctamente asignado
              // Pedimos los mensajes del chat
              socket.emit("all_messages_chat", id);
              // Borramos la lista de mensajes
              $("#mensajes").html(`
              <div class="d-flex justify-content-center">
              <div class="spinner-border text-primary" role="status">
              <span class="sr-only">Loading...</span>
              </div>
              </div>`);
              // se guarda en el sessionStorage del cliente, la id del civil  
              sessionStorage.setItem('key', id);
              //tendria que llamar otra vez a dibujar para que se entere que todo salio bien
              // Recuperamos la lista de chats abiertos
              $('div[data-href="' + activeTab + '"]').tab("show");
              // Marcamos como leido el chat
              //readMessages(id);
              var envio = { id: id, leido: true };
              socket.emit("quitar-leido", envio);

              resolve(true);
            } else {
              // El chat no fue asignado
              resolve(false);
            }
          });
        });
      } else {
        $(li).addClass("chat-cerrado");
        socket.emit("all_messages_chat", id);
        $("#mensajes").html(`
              <div class="d-flex justify-content-center">
              <div class="spinner-border text-primary" role="status">
              <span class="sr-only">Loading...</span>
              </div>
              </div>`);
        // se guarda en el sessionStorage del cliente, la id del civil  
        sessionStorage.setItem('key', id);
        //tendria que llamar otra vez a dibujar para que se entere que todo salio bien
        // Recuperamos la lista de chats abiertos
        $('div[data-href="' + activeTab + '"]').tab("show");
              // Marcamos como leido el chat
              //readMessages(id);
      }
             
      }
      return false;
  }

  //En los 3 puntos, el operador puede enviar un menu especifico 
  var menuPlantillas = document.getElementById('menu-plantillas');
  menuPlantillas.addEventListener('click', function (e) {
    e.preventDefault();
    socket.emit('obtener-plantillas');
  });

  //funcionalidad de etiquetas
  document.getElementById('etiquetas').addEventListener('click', function (msg) {
    msg.preventDefault();

    //TODO: mover a operadores muy seguramente
    var tags = [{ nombre: "Sube", color: "badge_sube" }, { nombre: "Gestión Tributaria", color: "badge_gestion_tributaria" }, { nombre: "Licencia de Conducir", color: "badge_licencia" }, { nombre: "Limpieza Urbana", color: "badge_limpieza" }, { nombre: "Juzgados de Faltas", color: "badge_juzgado" }, { nombre: "Tierras", color: "badge_tierras" }, { nombre: "Transporte", color: "badge_transporte" }, { nombre: "Arbolado Urbano", color: "badge_arbolado" }, { nombre: "Bienestar Animal", color: "badge_bienestar" }, { nombre: "Comercio", color: "badge_comercio" }, { nombre: "Capacitación y Empleo", color: "badge_empleo" }, { nombre:"Reclamo", color:"badge_reclamo"}];
    //cada etiqueta es tratada para darle su color y funcionalidad
    var id_activo = sessionStorage.getItem("key");
    var envio = {tags:tags , id:id_activo};
    socket.emit("dibujar_etiquetas", envio);
    $('#modal-etiquetas').modal('show');
  });
  
  $("#modal-etiquetas").on("hidden.bs.modal", function () {
    $('#modal-body-etiquetas').empty();
  });

  //funcion que dibuja las etiquetas
  
  //Permite al operador enviarle la opcion al ciudadano para cambiar su email en caso que sea solicitado
  var cambioEmail = document.getElementById('cambiar_Email');
  cambioEmail.addEventListener('click', function (e) {
    e.preventDefault();
    var iduser = sessionStorage.getItem('key');
    socket.emit('cambiar_Email', iduser);
    addMessage("Se le envio al ciudadano la opcion de cambiar el email", 'E', Date.now(), 'message');
  });

  //Funcion que permite subir y enviar archivos (imagenes y pdf) al ciudadano
  document.querySelector('input[type="file"]').addEventListener('change', function () {
    if (this.files && this.files[0]) {

      var iduser = sessionStorage.getItem('key');
      var img = document.createElement('img');
      img.src = URL.createObjectURL(this.files[0]); // set src to blob url
      let permitido = ((this.files[0].size / 1024) / 1024);//no puede pesar mas de 50mb
      var mime = this.files[0].type;
      var hora = Date.now();
      if (permitido <= 50) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        img.crossOrigin = 'anonymous';
        iduser = sessionStorage.getItem('key');
        ctx.drawImage(img, 0, 0);
        toDataURL(img.src, function (imagen) {
          let pack = {
            id: iduser,
            contenido: imagen,
            operadorid: sessionStorage.getItem("operadorid")
          };


        if (mime.substring(0, 5) == 'image') {
          pack.type = 'image';
          pack.operadorid = sessionStorage.getItem("operadorid");
          socket.emit('adjunto-archivo', pack);
          addMessage(imagen, 'E', hora, "image");
          } else if (mime == 'application/pdf'){
          pack.type = 'pdf';
          pack.operadorid = sessionStorage.getItem("operadorid");
          socket.emit('adjunto-archivo', pack);
          addMessage(imagen, 'E', hora, "pdf");
          }

        });
      } else {
        let mensaje = "Archivo demasiado pesada";
        socket.emit('send_op_message', mensaje);
        addMessage(mensaje, 'E', hora, 'message');
      }

    }
  });
 //devuelve el BASE64 del archivo 
  function toDataURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      var reader = new FileReader();
      reader.onloadend = function () {
        callback(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }

  // se obtienen los chats, los asignados y los que no
  function newList(lista, asig) {
    console.log(
      `newList: ${asig} - All: ${chatListAll} - Asign: ${chatListAsign}`
    );
    if (Object.keys(lista).length > 0){
      var items = Object.keys(lista).map(function (key) {
        return [key, lista[key]];
      });

      items.sort(function (first, second) {
        return second[1].timestamp - first[1].timestamp;
      });
    
    items.forEach(element => {
      if (asig) {
        if (!chatListAsign.includes(element[0])) {
          addChat(element[1].name, element[1].id, asig, element[1].origin, element[1].email, element[1].leido, element[1].estado, element[1].tags);
        }
      }
      if (!chatListAll.includes(element[0])) {
        addChat(element[1].name, element[1].id, asig, element[1].origin, element[1].email, element[1].leido, element[1].estado, element[1].tags);
      }
    });
    }
        // si existe en la sessionStorage un valor, entonces se muestra el ultimo chat activo
    if (sessionStorage.getItem('key') != 'null') {
      let idactual = sessionStorage.getItem('key');
      changeChat(idactual);
    }
  }

  //se envia el mensaje que este escrito en el input #m
  $("form").submit(function (event) {
    event.preventDefault();
    var mensaje = {};
    if ($("#m").val().length > 0) {
      mensaje.id = $("#idChat").val();
      mensaje.contenido = $("#m").val();
      mensaje.operadorid = sessionStorage.getItem("operadorid");
      socket.emit("send_op_message", mensaje);
    }
    return false;
  });


  $(document).ready(function () {
    // Get all blueprints
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Origin", "weblogin");

    $('a[data-toggle="tab"]').on("click", function (e) {
      sessionStorage.setItem("activeTab", $(e.target).attr("href"));
    });
    activeTab = sessionStorage.getItem("activeTab");
    if (activeTab) {
      $('div[data-href="' + activeTab + '"]').tab("show");
    }
    $("#mensajes").on("scroll", function (msg) {
      var scrollPos = $(this).scrollTop();
      if(scrollPos == 0){
        let id = $("#idChat").val();
        socket.emit("more-messages", id);
      }
    })
    $("#mensajes-anteriores").on("click", function () {
      let id = $("#idChat").val();
      socket.emit("more-messages", id);
    });


    $("#m").on("keydown", function (e) {
      if (e.key.length == 1) {
        if (!limit) {
          socket.emit("writing", $("#idChat").val());
          limit = true;
          setTimeout(() => {
            limit = false;
          }, 10000);
        }
      } else {
        socket.emit("stop-writing", $("#idChat").val());
      }
      if (e.key == '/' || e.key == 154 || e.key == 76) {
        
        socket.emit("send_plantilla", '');
      }
    });

    $("#cerrarChat").on("click", function (e) {
      let id = $("#idChat").val();
      closeChat(id);
    });
    $("#nav-asignados-tab").on("click", function (e) {
      getAsignados();
    });
  });

  // * FIN FUNCIONES DEL DOM * //

  // * EVENTOS WEBSOCKET * //

  function enviarWA(id,contenido) {
    socket.emit("wamessage",{id:`${id}@c.us`,contenido:contenido});
  }

  function closeChat(id) {
    socket.emit("close_chat", id);
  }
  function getAsignados() {
    // socket.emit("",{});
  }
  socket.on("connect", function () {
    //console.log(`conn: ${conn}, params: ${params}`);
    socket.emit("new_operator", params);
    conn = true;
  });

  socket.on("borrar_asign", function (msg) {
   var li_asign = document.querySelector(`#listaContactosAsignados li[id="usuario_${msg}"]`);
   if(li_asign){
     li_asign.parentNode.removeChild(li_asign);
   }
  });


  socket.on("dibujar_asign", function (msg) {
    let esOperador = false;
    if (sessionStorage.getItem("operadorid") == msg.id_op) {
      esOperador = true;
    }
    var li = document.querySelector(`#listaContactos li[id="usuario_${msg.id}"]`).cloneNode(true);
    var li_asign = li.cloneNode(true);
    document.querySelector(`#listaContactosAsignados `).prepend(li_asign);

  });
 
  socket.on("dibujar_etiquetas", function (msg) {
    var modalBody = document.getElementById("modal-body-etiquetas");
    if (Object.keys(msg.tags).length !== 0){
    msg.tags.forEach(element => {
      var span = document.createElement('span');
      var p = document.createElement('p');
      p.className = "etiqueta";
      span.setAttribute("id", element.nombre);
      span.className = `badge badge-pill ${element.color}`;
      p.innerText = element.nombre;
      span.appendChild(p);
      
      var tag = {
        nombre: element.nombre,
        color: element.color
      }
      var package = {
        id: msg.id,
        tag: tag
      }
      //se le agrega una "X" a la etiqueta por si se selecciono erroneamente y se le agrega la funcion de "quitar etiqueta"
      span.addEventListener('click', function (event) {
        event.preventDefault();
        var close_etiqueta = document.createElement('i');
        close_etiqueta.setAttribute('class', "fas fa-times close_etiqueta");
        close_etiqueta.addEventListener('click', function (event) {
          event.preventDefault();
          var nodo_asign = document.querySelector(`#listaContactosAsignados li[id="usuario_${msg.id}"] div[id="user_tags"] span[id="${element.nombre}"] `);
          var nodo = document.querySelector(`#listaContactos li[id="usuario_${msg.id}"] div[id="user_tags"] span[id="${element.nombre}"] `); 
          if (nodo_asign) {
            nodo_asign.parentNode.removeChild(nodo_asign);
          }
          if (nodo) {
            nodo.parentNode.removeChild(nodo);
          }
          socket.emit("delete_tag", package);
        });
        var clone_tag = span.cloneNode(true);
        var clone_tag_asign = span.cloneNode(true);
        span.setAttribute('style',"display: none");
        let close_etiqueta_asign = close_etiqueta.cloneNode(true);
        socket.emit("add_tag", package);
        clone_tag.appendChild(close_etiqueta);
        clone_tag_asign.appendChild(close_etiqueta_asign);
        //document.querySelector(`#listaContactosAsignados li[id="usuario_${msg.id}"] div[id="user_tags"]`).append(clone_tag_asign);
        //document.querySelector(`#listaContactos li[id="usuario_${msg.id}"] div[id="user_tags"]`).append(clone_tag);
        var pack = {};
        pack.id = msg.id;
        pack.nombre = element.nombre;
        pack.color = element.color;
        socket.emit("dibujar_tags",pack); 
      }); 
      modalBody.appendChild(span);
    });
  }
  });

  socket.on("dibujar_tags", function (msg) {
    var span = document.createElement('span');
    var p = document.createElement('p');
    p.className = "etiqueta";
    span.setAttribute("id", msg.nombre);
    span.className = `badge badge-pill ${msg.color}`;
    p.innerText = msg.nombre;
    span.appendChild(p);
    var tag = {
      nombre: msg.nombre,
      color: msg.color
    }
    var package = {
      id: msg.id,
      tag: tag
    }
    //se le agrega una "X" a la etiqueta por si se selecciono erroneamente y se le agrega la funcion de "quitar etiqueta"
      var close_etiqueta = document.createElement('i');
      close_etiqueta.setAttribute('class', "fas fa-times close_etiqueta");
      close_etiqueta.addEventListener('click', function (event) {
        event.preventDefault();
        socket.emit("delete_tag", package);
      });
      var close_etiqueta_asign = close_etiqueta.cloneNode(true);
      var clone_tag = span.cloneNode(true);
      span.appendChild(close_etiqueta);
      clone_tag.appendChild(close_etiqueta_asign);

    var nodo_asign = document.querySelector(`#listaContactosAsignados li[id="usuario_${msg.id}"] div[id="user_tags"]`);
    var nodo = document.querySelector(`#listaContactos li[id="usuario_${msg.id}"] div[id="user_tags"]`);
    if (nodo_asign) {
      nodo_asign.append(clone_tag);
    }
    if (nodo) {
      nodo.append(span);
    }
 
});

socket.on("borrar_tags", function (msg) {
  var nodo_asign = document.querySelector(`#listaContactosAsignados li[id="usuario_${msg.id}"] div[id="user_tags"] span[id="${msg.nombre}"] `);
  var nodo = document.querySelector(`#listaContactos li[id="usuario_${msg.id}"] div[id="user_tags"] span[id="${msg.nombre}"] `);
  if (nodo_asign) {
    nodo_asign.parentNode.removeChild(nodo_asign);
  }
  if (nodo) {
    nodo.parentNode.removeChild(nodo);
  }
});


 socket.on("send_op_list", function (listaChats) {
    // let listaChats = JSON.parse(msg);
    //console.log(JSON.stringify(listaChats));
    newList(listaChats.chats, listaChats.asignado);
  });
  socket.on("recive_op_message", function (msg) {
    let esOperador = false;
    //console.log("Mensaje recibido: " + JSON.stringify(msg));
    if (sessionStorage.getItem("operadorid") == msg.asign) {
      esOperador = true;
    }

    addChat(msg.nom, msg.id, esOperador, msg.origen,msg.email,false,"Abierto");

    if ($("#idChat").val() == msg.id) {
      addMessage(msg.contenido, "R", msg.timestamp, msg.tipo);
    } else {
      unreadMessages(msg.id, esOperador);
    }

  });
  //TODO: borrar
  socket.on("recive_op_image", function (msg) {
    //console.log("Imagen recibida: " + JSON.stringify(msg));
    if (!chatListAll.includes(msg.id)) {
      addChat(msg.nom, msg.id, msg.asig,msg.origen,msg.email,false,"Abierto");
    }
    if ($("#idChat").val() == msg.id) {
      addMessage(msg.contenido, "R", msg.timestamp, "image");
    } else {
      unreadMessages(msg.id);
    }
  });
  socket.on('operador_set_id', function (msg) {
    sessionStorage.setItem('operadorid', msg);
  });

  socket.on("quitar-leido", function (msg) {
    readMessages(msg);
  });

  socket.on("chat-cerrado", function (id) {
    var li = document.querySelector(`#listaContactos li[id="usuario_${id}"]`);
    let li_asign = document.querySelector(`#listaContactosAsignados li[id="usuario_${id}"]`);
    //var li = document.getElementById(`usuario_${msg}`);
    li.setAttribute("class","todos chat-cerrado");
    if(li_asign){
      li_asign.setAttribute("class", "asign chat-cerrado");
    }
  });

  socket.on("redibujar", function (msg){
    var lista = document.getElementById("listaContactos"); 
    var li_chat = document.getElementById(`usuario_${msg.id}`);
    lista.prepend(li_chat);
    if (sessionStorage.getItem("operadorid") == msg.asign){
    var lista_asig = document.getElementById("listaContactosAsignados");
    var li_asig = document.querySelector(`#listaContactosAsignados li[id="usuario_${msg.id}"]`);
    lista_asig.prepend(li_asig);
    }
  });

  socket.on("confirm_op_message", function (msg) {
    confirm(msg, "R", "Ahora");
  });
  //  se muestran las plantillas en el chat
  socket.on("send_plantilla", (msg) => {
    blueprints = msg;
    autocomplete(document.getElementById("m"), blueprints);
  });
  socket.on("dibujar_mensaje", (msg) =>{
    addMessage(msg.contenido, "E", "Ahora", "chat",msg.nombre);
    $("#m").val("");
    limit = false; // Se reanuda el evento de escribir 
  });
  socket.on("assign_op_message", function (msg, ack) {
    // Confirmamos la asignacion al servidor
    ack(true);
    // Generamos los elementos del DOM
    addChat(msg.nom, msg.id, true, msg.origen,msg.email,false,"Abierto");
  });
  socket.on("getAllMessagesByChat", function (msg) {
    let lista = msg.lista;
    let chat_activo = $("#idChat").val();
    if (chat_activo == msg.id) {
      if (lista != '') {
        $("#mensajes").html("");
       
        lista.forEach((message) => {
          if (message.user == "me") {
            addMessage(message.contenido, "E", message.timestamp, message.type, message.operador_id);
          } else {
            addMessage(message.contenido, "R", message.timestamp, message.type);
          }
        });
      }
    }
  });

  //! Deprecada funcionalidad para saber si se envia el email o no 
 /* socket.on("email", function (msg, respuesta) {
    var ex = document.createElement("div");
    var msj = document.createElement("div");
    var email = document.createElement("button");
    var cancelar = document.createElement("button");
    var div = document.getElementById("mensajes");
    ex.className = "sticky-bottom";
    email.className = "btn btn-primary boton-enviar-email";
    cancelar.className = "btn btn-warning boton-cerrar-email";
    msj.innerText = "Ciudadano cerro el chat";
    email.innerText = "Enviar charla por email";

    email.addEventListener('click', function (e) {
      e.preventDefault();
      respuesta(true);
      $('#modal-email').modal('hide');
      closeChat();
    });

    cancelar.innerText = "cerrar chat";

    cancelar.addEventListener('click', function (e) {
      e.preventDefault();
      respuesta(false);
      $('#modal-email').modal('hide');
      closeChat();
    });
    let chatActivo = sessionStorage.getItem('key');

    if (chatActivo == msg.idUser) {
      div.appendChild(msj);
      div.appendChild(ex);
      ex.appendChild(email);
      ex.appendChild(cancelar);
      document.getElementById("m").setAttribute("disable", "");
      document.getElementById("enviar").setAttribute("disable", "");
    } else {
      document.getElementById('usuario_' + msg.idUser).addEventListener('click', function (msg) {
        msg.preventDefault();
        var modalBody = document.getElementById("modal-body-email");
        //esta parte es cuando no esta activo el chat, dejar cartel o algo
        modalBody.appendChild(email);
        modalBody.appendChild(cancelar);
        $('#modal-email').modal('show');
        modalBody.remove();
      });

    }
    div.scrollTop = div.scrollHeight;
  });*/

  var mincount = 20;
  var maxcount = 40;


  $("#listaContactos").scroll(function () {
    var elem = document.getElementById("listaContactos");
    if (elem.scrollTop >= elem.scrollHeight - 550) {
      $("#listaContactos li").slice(mincount, maxcount).fadeIn(1200);
      mincount = mincount + 20;
      maxcount = maxcount + 20;
    }
  });

    // funcionalidad para buscar un chat en base a su email o telefono
    $(document).ready(function () {
      $("#buscar").on("keyup", function () {
        var input, filter, ul, li, i, ul_asign, li_asign;
        input = document.getElementById('buscar');
        filter = input.value;
        ul = document.getElementById("listaContactos");
        li = ul.getElementsByTagName('li');
        ul_asign = document.getElementById("listaContactosAsignados");
        li_asign = ul_asign.getElementsByTagName('li');

        if(filter.length!=0){
          for (i = 0; i < li.length; i++) {
            var emailValue = li[i].getAttribute("value");
            var telefonoValue = li[i].getAttribute("id");

            if(emailValue!=0 || telefonoValue != 0){
              if (emailValue.indexOf(filter) > -1 || telefonoValue.indexOf(filter) > -1) {
                li[i].style.display = "";
              } else {
                li[i].style.display = "none";
              }
            }
          }
          for (i = 0; i < li_asign.length; i++) {
            var emailValue_asign = li_asign[i].getAttribute("value");
            var telefonoValue_asign = li_asign[i].getAttribute("id");

            if (emailValue_asign != 0 || telefonoValue_asign != 0) {
              if (emailValue_asign.indexOf(filter) > -1 || telefonoValue_asign.indexOf(filter) > -1) {
                li_asign[i].style.display = "";
              } else {
                li_asign[i].style.display = "none";
              }
            }
          }

        }else{
          for(i=0; i < li.length; i++){
          li[i].style.display = "";
        }
          for(i=0; i < li_asign.length; i++){
          li_asign[i].style.display = "";
        }
      }
      });
    });

    socket.on("redirect",function (msg) {
      window.location.replace("https://www.neuquencapital.gov.ar/");
    });

 
    // funcionalidad de obtener todo el menu disponible y seleccionar algun sub-menu para enviar al ciudadano
  socket.on("obtener-plantillas", function (msg) {
    let divPlantilla = document.getElementById('modal-body-plantillas');
    divPlantilla.innerHTML = '';
    iduser = sessionStorage.getItem('key');
    for (const [key, prefix] of Object.entries(msg)) {

      let ulPlantilla = document.createElement('ul');
      let liPlantilla = document.createElement('li');
      liPlantilla.setAttribute('type', 'button');
      liPlantilla.setAttribute('data-dismiss', 'modal')
      liPlantilla.innerText = `${key}`;
      if (msg[key].descripcion) {
        liPlantilla.innerText = `${key}: ${prefix}`;
      }
      divPlantilla.appendChild(ulPlantilla);
      ulPlantilla.appendChild(liPlantilla);
      liPlantilla.addEventListener('click', function (e) {
        e.preventDefault();
        $("#m").val(prefix);
      });
    }
  });

  //setInterval(function () {location.reload(); }, 5000);

  /*$(document).ready(function(){
  $("#myInput").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $("#myTable tr").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
  });
});*/

  // * FIN EVENTOS WEBSOCKET * //
  // Fin onload
});
