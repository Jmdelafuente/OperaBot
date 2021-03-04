const axios = require("axios").default;
const https = require("https");
const URL = "http://weblogin.muninqn.gov.ar/api/getUserByToken/";
const APPID = "30"; //TODO: FIX el APPID es 41, fue modificado para testing

module.exports.validarToken = async function (token){
  let usuario;
  var config = {
    method: "get",
    url: `${URL}${token}`,
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  };
  const proxy = {
    host: "http://128.53.7.2/",
    port: 8080,
  };

  const promise = axios(config)
    .then((response) => response.data)
    .catch(function (error) {
      throw new Error(error);
    });
    try {
      usuario = await promise;
    } catch (error) {
      
    }
  let perfil = usuario.apps.find((app) => app.id == APPID);
  // usuario.perfil = perfil.userProfiles; //TODO: descomentar antes de produccion
  usuario.perfil = 1;
  usuario.wappersonaid = usuario.datosPersonales.referenciaID;
  return usuario;
};

// module.exports.URL = URL;
module.exports.APPID = APPID;