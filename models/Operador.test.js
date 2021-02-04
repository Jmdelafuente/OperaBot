const assert = require("assert").strict;
const axios = require("axios").default;
const weblogin = require("../configs/weblogin");
const Operador = require("./Operador");
const OperaDB = require("../dbService");
const https = require("https");
var usuario;
describe("operador test", function () {
    before("recuperamos datos de un usuario de prueba", async function () {
      this.timeout(10000);
      var data = JSON.stringify({
        userName: "perez.pedro@servidor.com",
        userPass: "_Prueb@2",
      });
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
      usuario = await promise;
      let perfil = usuario.apps.find((app) => app.id === weblogin.APPID);
      usuario.perfil = perfil;
    });

    it("Deberia guardar() un operador", async function () {
      let operador = new Operador();
      operador.init(
        "",
        usuario.datosPersonales.referenciaID,
        usuario.perfil,
        usuario.userName,
        usuario.datosPersonales.razonSocial,
        usuario.datosPersonales.cuil
      );
      await operador.guardar();
      assert.strictEqual(operador.db.error(), "");
    });
    it("Deberia validar() un operador ya guardado", async function () {
      let operador = new Operador();
      operador.init(
        "",
        usuario.datosPersonales.referenciaID,
        usuario.perfil,
        usuario.userName,
        usuario.datosPersonales.razonSocial,
        usuario.datosPersonales.cuil
      );
      await operador.guardar();
      assert.strictEqual(operador.db.error(), "");

      let operador2 = new Operador();
      let esValido = await operador2.validar(usuario.securityToken);
      assert.strictEqual(esValido, true);
      assert.strictEqual(operador2.db.error(), "");
    });
    it("Deberia validar() un operador con guardado", async function () {
        let operador = new Operador();
        let esValido = await operador.validar(usuario.securityToken);
        assert.strictEqual(operador.db.error(), "");
        assert.strictEqual(esValido, true);
    });

    
    
    afterEach("limpiar la DB", async function () {
        this.timeout(10000);
        let db = new OperaDB();
        let promesa = db.borrar("operadores", [["wapPersonaId", "3087"]]);
        await promesa;
    });
});