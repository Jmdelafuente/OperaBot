const socket = io("localhost:3001");

var conn = false;
  $(function () {
    $('#action_menu_btn').click(function () {
      $('.action_menu').toggle();
    });

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

    function addChat(cont, tipo, t){
      var ex = document.createElement("div");
      var msj = document.createElement("div");
      var hora = document.createElement("span");
      if(tipo == "R"){
        ex.className = "d-flex justify-content-start mb-4";
        msj.className = "msg_cotainer";
      }else{
        ex.className = "d-flex justify-content-end mb-4";
        msj.className = "msg_cotainer_send";
      }
      hora.className = "msg_time";
      hora.innerText = t;
      msj.innerText = cont;
      document.getElementById('mensajes').appendChild(ex);
      ex.appendChild(msj);
      msj.appendChild(hora);
    }
    
    function asign(nom,id){
      var li = document.createElement("li");
      var ex = document.createElement("div");
      var img = document.createElement("div");
      var avatar = document.createElement("img");
      var info = document.createElement("div");
      var nombre = document.createElement("span");
      var estatus = document.createElement("p");
      // li.classList = "active";
      ex.className = "d-flex bd-highlight";
      img.className = "img_cont";
      avatar.src = "user-profile.png";
      avatar.className = "rounded-circle user_img";
      info.className = "user_info";
      nombre.innerText = nom;
      estatus.innerText = "Online";
      document.getElementById('listaContactos').appendChild(li);
      li.appendChild(ex);
      ex.appendChild(img);
      img.appendChild(avatar);
      ex.appendChild(info);
      info.appendChild(nombre);
      info.appendChild(estatus);
      li.onclick = function(){
        $("#idChat").val(id);
      };
    }

    function newList(lista){
      for (let c of Object.keys(lista)) {
        asign(lista[c].name,lista[c].id);
      }
    }

    $('form').submit(function () {
      var mensaje = {};
      mensaje.id = $("#idChat").val();
      mensaje.contenido = $('#m').val();
      socket.emit('send_op_message', mensaje);
      addChat($('#m').val(), "E", "Ahora");
      $('#m').val('');
      return false;
    });

    socket.on("connect", function () {
      if(!conn){
        console.log(`conn: ${conn}, params: ${params}`);
        socket.emit('new_operator', params);
        conn = true;
      }
    });
    socket.on('send_op_list', function (msg) {
      newList(JSON.parse(msg));
    });
    socket.on('recive_op_message', function (msg) {
      console.log("Mensaje recibido: "+JSON.stringify(msg));
      addChat(msg.contenido,"R","Ahora");
      window.scrollTo(0, document.body.scrollHeight);
    });
    socket.on('confirm_op_message', function (msg) {
      confirm(msg, "R", "Ahora");
      window.scrollTo(0, document.body.scrollHeight);
    });
    socket.on('assign_op_message', function (msg) {
      asign(msg.id,msg.contenido);
    });
  });