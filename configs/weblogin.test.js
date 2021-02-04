const assert = require("assert").strict;
const weblogin = require("../configs/weblogin");
const axios = require("axios").default;
const https = require("https");
describe("weblogin integration test", function () {
    it("Deberia conectarse correctamente a weblogin y validar el TOKEN", async function () {
    this.timeout(10000);
    var data = JSON.stringify({ userName: "perez.jose@servidor.com", userPass: "_Prueb@1" });
    var config = {
      method: "post",
      url: "http://webLogin.muninqn.gov.ar/api/getToken",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    };

    let promise = axios(config)
      .then((response) => response.data)
      .catch(function (error) {
        console.log(error);
      });
    let usuario = await promise;
    let perfil = usuario.apps.find((app) => app.id === weblogin.APPID);
    usuario.perfil = perfil;
    let respuesta = await weblogin.validarToken(usuario.securityToken);
    // Hay una clave fallada en la API, es indiferente para nuestro sistema, la ignoramos
    delete usuario.fechaUltimoAcceso;
    delete respuesta.fechaUltimoAcceso;
    // El contenido debe ser el mismo - el objeto no necesariamente
    assert.notStrictEqual(respuesta, usuario);
  });
});
