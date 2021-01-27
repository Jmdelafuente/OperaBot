const socket = io("localhost:3001");

var conn = false;
$(function () {
  // * FUNCIONES AUXILIARES * //

  $("#action_menu_btn").click(function () {
    $(".action_menu").toggle();
  });
  /**
   * Escape an ID for being HTML and Jquery compatible. This allow to use it with JQuery
   *
   * @param {String} myid ID for being transform
   * @returns string. The ID already escaped
   */
  function jq(myid) {
    return "#" + myid.replace(/(:|\.|\[|\]|,|=|@)/g, "\\$1");
  }
  /**
   * Retrive GETs paramemetres from URL and retrive it as an associative array
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
   * Dibuja en el DOM un mensaje de texto
   *
   * @param {String} cont Contenido del mensaje o texto a mostrar
   * @param {*} tipo 'E' para los mensajes enviados, 'R' para los mensajes recibidos
   * @param {*} t Timestamp o marca de tiempo del mensaje
   */
  function addMessage(cont, tipo, t) {
    var ex = document.createElement("div");
    var msj = document.createElement("div");
    var hora = document.createElement("span");
    if (tipo == "R") {
      ex.className = "d-flex justify-content-start mb-4";
      msj.className = "msg_cotainer";
    } else {
      ex.className = "d-flex justify-content-end mb-4";
      msj.className = "msg_cotainer_send";
    }
    hora.className = "msg_time";
    hora.innerText = t;
    msj.innerHTML = twemoji.parse(cont);
    document.getElementById("mensajes").appendChild(ex);
    ex.appendChild(msj);
    msj.appendChild(hora);
    setTimeout(function () {
      let time;
      if (t == "Ahora") {
        time = new Date();
      } else {
        time = new Date(t);
      }
      hora.innerText =
        time.getHours().toString() + ":" + (time.getMinutes() - 1).toString();
    }, 59 * 1000);
  }
  /**
   * Dibuja en el DOM un chat en particular.
   * Pudiendo dibujarse en la lista de todos los contactos o sólo en los asignados
   *
   * @param {String} nom Nombre a mostrar del contacto
   * @param {String} id Identificador interno del chat para saber el destinatario
   * @param {Boolean} asign true si esta asignado a este operador, false en otro caso.
   */
  function addChat(nom, id, asign) {
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
    info.className = "user_info";
    nombre.innerText = nom;
    estatus.innerText = "Online";
    if (asign) {
      document.getElementById("listaContactosAsignados").appendChild(li);
    }
    document.getElementById("listaContactos").appendChild(li);
    li.appendChild(ex);
    ex.appendChild(img);
    img.appendChild(avatar);
    ex.appendChild(info);
    info.appendChild(nombre);
    info.appendChild(estatus);
    li.onclick = function () {
      changeChat(id);
    };
  }

  function changeChat(id) {
    if($("#idChat").val() != id){
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
      // TODO: Recuperar mensajes y los dibujarlos
      // Borramos la lista de mensajes
      $("mensajes").html("");
      // Pedimos los mensajes del chat
      socket.emit("all_messages_chat", id);
      // Enviamos el 'visto' al servidor
      socket.emit("send_op_seen", id);
    }
  }

  function newList(lista, asig) {
    for (let c of Object.keys(lista)) {
      addChat(lista[c].name, lista[c].id, asig);
    }
  }

  $("form").submit(function () {
    var mensaje = {};
    mensaje.id = $("#idChat").val();
    mensaje.contenido = $("#m").val();
    socket.emit("send_op_message", mensaje);
    addMessage($("#m").val(), "E", "Ahora");
    $("#m").val("");
    return false;
  });

  // * FIN FUNCIONES DEL DOM * //

  // * EVENTOS WEBSOCKET * //

  socket.on("connect", function () {
    console.log(`conn: ${conn}, params: ${params}`);
    socket.emit("new_operator", params);
    conn = true;
  });
  socket.on("send_op_list", function (listaChats) {
    // let listaChats = JSON.parse(msg);
    newList(listaChats.chats, listaChats.asignado);
  });
  socket.on("recive_op_message", function (msg) {
    console.log("Mensaje recibido: " + JSON.stringify(msg));
    addMessage(msg.contenido, "R", "Ahora");
    window.scrollTo(0, document.body.scrollHeight);
  });
  socket.on("confirm_op_message", function (msg) {
    confirm(msg, "R", "Ahora");
    window.scrollTo(0, document.body.scrollHeight);
  });
  socket.on("assign_op_message", function (msg, ack) {
    // Confirmamos la asignacion al servidor
    ack(true);
    // Generamos los elementos del DOM
    addChat(msg.nom, msg.id, true);
  });
  socket.on("getAllMessagesByChat", function (msg) {
    let lista = msg.lista;
    let chat_activo = $("#idChat").val();
    if (chat_activo == msg.id) {
      lista.forEach((message) => {
        if (message.user == "me") {
          addMessage(message.text, "E", message.t);
        } else {
          addMessage(message.text, "R", message.t);
        }
      });
    }
  });
  // * FIN EVENTOS WEBSOCKET * //
  // Fin onload
});
