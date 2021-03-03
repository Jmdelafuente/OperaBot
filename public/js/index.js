const SURL = "128.53.1.23";
//const SURL = "localhost";
const socket = io(`${SURL}:3001`);
var blueprints={};
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
  function unreadMessages(chatid, unread = "") {
    if (document.getElementById("unread_" + chatid)) {
      readMessages(chatid);
    }
    let circle = document.createElement("mark");
    let avatar = document.getElementById("avatar_" + chatid);
    circle.className = "swing";
    circle.innerText = unread;
    circle.id = "unread_" + chatid;
    avatar.parentNode.appendChild(circle);
  }

  /**
   * Marca como leido el chat, eliminando la notificacion visual
   *
   * @param {String} chatid
   */
  function readMessages(chatid) {
    let circle = document.getElementById("unread_" + chatid);
    if (circle) {
      document
        .getElementById("avatar_" + chatid)
        .parentNode.removeChild(circle);
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
   */
  function addMessage(cont, tipo, t, type) {
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
        case "ptt": //! AUDIO
          let audio = document.createElement("audio");
          audio.setAttribute("controls", "");
          audio.src = cont;
          msj.appendChild(audio);
          break;
        default:
        case "image": // * Foto
          let link = document.createElement("a");
          let canvas = document.createElement("canvas");
          let ctx = canvas.getContext("2d");
          let image = new Image();
          image.onload = function () {
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          };
          image.src = cont;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.className = "imghover";
          link.addEventListener("click", function () {
            var url_base64jp = cont;
            link.href = url_base64jp;
          });
          msj.appendChild(link);
          link.appendChild(canvas);
          break;
      }
      div.appendChild(ex);
      ex.appendChild(msj);
      msj.appendChild(hora);
      div.scrollTop = div.scrollHeight;
      var time;
      if (t == "Ahora") {
        setTimeout(function () {
          time = new Date(Date.now());
          hora.innerText =
            time.getHours().toString() +
            ":" +
            (time.getMinutes() - 1).toString();
        }, 59 * 1000);
      } else {
        time = new Date(t);
        let s = "";
        let today = new Date();

        let hours = (
          (time.getHours() < 10 ? "0" : "") + time.getHours()
        ).toString();
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

        hora.innerText = s;
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
   */
  function addChat(nom, id, asign, origen) {
    if (!chatListAll.includes(id)) {    
    var li = document.createElement("li");
    var ex = document.createElement("div");
    var img = document.createElement("div");
    var avatar = document.createElement("img");
    var info = document.createElement("div");
    var nombre = document.createElement("span");
    var estatus = document.createElement("p");
    
    // li.classList = "active";
    li.id = "usuario_" + id;
    ex.className = "d-flex bd-highlight";
    img.className = "img_cont";
    avatar.src = "user-profile.png";
    avatar.className = "rounded-circle user_img";
    avatar.id = "avatar_" + id;
    info.className = "user_info";
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


    console.log(`en addchat ahora tiene ${chatListAsign} y asign es ${asign} y lo tiene? ${!chatListAsign.includes(id)}`);
          
    if (asign && !chatListAsign.includes(id)) {
      document.getElementById("listaContactosAsignados").appendChild(li);
      chatListAsign.push(id);
      console.log("porque no dibuja????");
    }

    console.log(`ahora en chat se deberia tener 1 solo al menos ${chatListAsign}`);

    document.getElementById("listaContactos").appendChild(li);
    chatListAll.push(id);
    li.appendChild(ex);
    ex.appendChild(img);
    img.appendChild(avatar);
    ex.appendChild(info);
    info.appendChild(nombre);
    info.appendChild(estatus);
    info.appendChild(orig);
    li.addEventListener('click',function (event) {
      event.preventDefault();
      changeChat(id);
    });
    
    }
  }

  /**
   * Cambia el chat activo, modificando el nombre a mostrar, marcando como activo en la lista y el valor de chatid
   * 
   * @param {String} id ID de chat seleccionado
   * @returns
   */
  function changeChat(id) {
    if ($("#idChat").val() != id) {
      // Actualizamos el destinatario
      $("#idChat").val(id);
      // Dibujar mensajes, avatar y nombre
      let idchat = jq("usuario_" + id);
      let li = $(idchat);
      let nom = $(idchat + " span").html();
      // Actualizamos el nombre
      $("#nombreActivo").html("Chat con " + nom);
      // Marcamos el chat como activo
      $(".chat .active").removeClass("active");
      $(li).addClass("active");
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
      // Enviamos el 'visto' al servidor
      socket.emit("seen", id);
      //tendria que llamar otra vez a dibujar para que se entere que todo salio bien
      // Recuperamos la lista de chats abiertos
      $('div[data-href="' + activeTab + '"]').tab("show");
      // Marcamos como leido el chat
      readMessages(id);
      return false;
    }
  }

   //En los 3 puntos, el operador puede enviar un menu especifico 
   var menuOpciones = document.getElementById('menu-opciones');
   menuOpciones.addEventListener('click', function (e) {
         e.preventDefault();
         socket.emit('obtener-opciones');
   });
        

  document.querySelector('input[type="file"]').addEventListener('change', function () {
    if (this.files && this.files[0]) {

      var iduser = sessionStorage.getItem('key');
      var img = document.createElement('img');
      img.src = URL.createObjectURL(this.files[0]); // set src to blob url
      let permitido = ((this.files[0].size / 1024) / 1024);//no puede pesar mas de 50mb
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

          
          let pack ={
            id: iduser,
            contenido: imagen
          };
          socket.emit('adjunto-archivo', pack);
          addMessage(imagen,'E',hora,"image");

        });
      } else {
         let mensaje ="Imagen demasiado pesada";
         socket.emit('send_op_message', mensaje);
         addMessage(mensaje,'E',hora,'message');
      }

    }
  });
  
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

  function newList(lista, asig) {
    console.log(
      `newList: ${asig} - All: ${chatListAll} - Asign: ${chatListAsign}`
    );
    for (let c of Object.keys(lista)) {
      if (asig) {
        if (!chatListAsign.includes(c)) {
          addChat(lista[c].name, lista[c].id, asig,lista[c].origin);
        }
      }
      if (!chatListAll.includes(c)) {
        addChat(lista[c].name, lista[c].id, asig, lista[c].origin);
      }
    }
    // si existe en la sessionStorage un valor, entonces se muestra el ultimo chat activo
    if(sessionStorage.getItem('key')!='null'){
      let idactual=sessionStorage.getItem('key');
      changeChat(idactual);
    }
  }

  $("form").submit(function (event) {
    event.preventDefault();
    var mensaje = {};
    if ($("#m").val().length > 0) {
      mensaje.id = $("#idChat").val();
      mensaje.contenido = $("#m").val();
      socket.emit("send_op_message", mensaje);
      addMessage($("#m").val(), "E", "Ahora", "chat");
      $("#m").val("");
      limit = false; // Se reanuda el evento de escribir
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
      }else{
          socket.emit("stop-writing", $("#idChat").val());
      }
      if(e.key == '/'){
        socket.emit("send_plantilla",'');
      }
    });
    $("#cerrarChat").on("click",function (e){
      closeChat();
    });
    $("#nav-asignados-tab").on("click",function(e){
      getAsignados();
    });
  });

  // * FIN FUNCIONES DEL DOM * //

  // * EVENTOS WEBSOCKET * //
  function closeChat() {
    let chat_activo = $("#idChat").val();
    socket.emit("close_chat", chat_activo);
    sessionStorage.removeItem('key');
    /* parte grafica del borrado
    let div_chat = document.getElementById("usuario_" + chat_activo);
    let div_mensajes = document.getElementById("mensajes");
    div_mensajes.innerHTML="";
    div_chat.remove();
    */
    // TODO: estetica de chat cerrado
  }
  function getAsignados(){
    // socket.emit("",{});
  }
  socket.on("connect", function () {
    console.log(`conn: ${conn}, params: ${params}`);
    socket.emit("new_operator", params);
    conn = true;
  });
  socket.on("send_op_list", function (listaChats) {
    // let listaChats = JSON.parse(msg);
    console.log(listaChats);
    newList(listaChats.chats, listaChats.asignado);
  });
  socket.on("recive_op_message", function (msg) {
    let esOperador=false;
    console.log("Mensaje recibido: " + JSON.stringify(msg));
    if(sessionStorage.getItem("operadorid") == msg.asign){
      esOperador = true;
    }
      
    addChat(msg.nom, msg.id, esOperador, msg.origen);
      
      if ($("#idChat").val() == msg.id) {
        addMessage(msg.contenido, "R", "Ahora", msg.tipo);
      } else {
        unreadMessages(msg.id);
      }
    
  });
  socket.on("recive_op_image", function (msg) {
    console.log("Imagen recibida: " + JSON.stringify(msg));
    if (!chatListAll.includes(msg.id)) {
      addChat(msg.name, msg.id, msg.asig);
    }
    if ($("#idChat").val() == msg.id) {
      addMessage(msg.contenido, "R", "Ahora", "image");
    } else {
      unreadMessages(msg.id);
    }
  });
  socket.on('operador_set_id',function (msg) {
      sessionStorage.setItem('operadorid', msg);
  });

  socket.on("confirm_op_message", function (msg) {
    confirm(msg, "R", "Ahora");
  });
  //  se muestran las plantillas en el chat
  socket.on("send_plantilla", (msg) => {
    blueprints = msg;
    autocomplete(document.getElementById("m"), blueprints);
  });
  socket.on("assign_op_message", function (msg, ack) {
    // Confirmamos la asignacion al servidor
    ack(true);
    // Generamos los elementos del DOM
    addChat(msg.nom, msg.id, true, msg.origin);
  });
  socket.on("getAllMessagesByChat", function (msg) {
    let lista = msg.lista;
    let chat_activo = $("#idChat").val();
    if (chat_activo == msg.id) {
      $("#mensajes").html("");
      lista.forEach((message) => {
        if (message.user == "me") {
          addMessage(message.contenido, "E", message.t, message.type);
        } else {
          addMessage(message.contenido, "R", message.t, message.type);
        }
      });
    }
  });

  socket.on("email", function(msg,respuesta){
      var ex = document.createElement("div");
      var msj = document.createElement("div");
      var email = document.createElement("button");
      var cancelar = document.createElement("button");
      var div = document.getElementById("mensajes");
      ex.className = "sticky-bottom";
      email.className = "btn btn-primary ";
      cancelar.className = "btn btn-warning";
      msj.innerText = "Ciudadano cerro el chat";
      email.innerText = "guardar";

      email.addEventListener('click', function (e) {
        e.preventDefault();
        respuesta(true);

      });

      cancelar.innerText = "cerrar";

      cancelar.addEventListener('click', function (e) {
        e.preventDefault();
        respuesta(false);        
        //que borre el chat una vez se haga click
      });
      let chatActivo = sessionStorage.getItem('key');

      if(chatActivo == msg){
        div.appendChild(msj);
        div.appendChild(ex);
        ex.appendChild(email);
        ex.appendChild(cancelar);
        document.getElementById("m").setAttribute("disable", "");
        document.getElementById("enviar").setAttribute("disable", "");
      }else{
        document.getElementById('usuario_' + msg).addEventListener('click', function(msg){
          msg.preventDefault();
          console.log("SI");
        })
        
      }

  });

   socket.on("obtener-opciones", function (msg) {
     let divOpcion = document.getElementById('modal-body-opcion');
     divOpcion.innerHTML = '';
     iduser = sessionStorage.getItem('key');
     let pack = {};
     for (const [key, prefix] of Object.entries(msg)) {

       let ulOpcion = document.createElement('ul');
       let liopcion = document.createElement('li');
       let liopcion2 = document.createElement('li');
       liopcion.setAttribute('type', 'button');
       liopcion.setAttribute('data-dismiss', 'modal')
       liopcion2.setAttribute('type', 'button');
       liopcion.innerText = `${msg[key].nombre}: ${msg[key].descripcion}`;
       divOpcion.appendChild(ulOpcion);
       ulOpcion.appendChild(liopcion);
       ulOpcion.appendChild(liopcion2);
       liopcion.addEventListener('click', function (e) {
         e.preventDefault();
         pack.id = iduser;
         pack.contenido = msg[key].opciones;
         if(msg[key].nombre.substring(0,9)!='respuesta'){
           socket.emit('enviar-menu', pack);
           addMessage('Se envio el menu al ciudadano', 'E', Date.now(), 'message');
          }else{
          pack.contenido = msg[key].opciones;
          addMessage(msg[key].opciones,'E',Date.now(),'message');
          socket.emit('send_op_message',pack);
          }
       });
     }
   });
  // * FIN EVENTOS WEBSOCKET * //
  // Fin onload
});
