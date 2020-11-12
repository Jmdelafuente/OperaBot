const axios = require("axios").default;
const URL = "https://weblogin.muninqn.gov.ar/api/getUserByToken/";
const APPID = "30"; //TODO: FIX el APPID es 41, fue modificado para testing

module.exports.validarToken = async function (token){
  var config = {
    method: "get",
    url:
      `${URL}${token}`,
  };
  const promise = axios(config)
    .then((response) => response.data)
    .catch(function (error) {
      throw new Error(error);
    });
  let usuario = await promise;
  let perfil = usuario.apps.find((app) => app.id == APPID);
  usuario.perfil = perfil.userProfiles;
  return usuario;
};

// module.exports.URL = URL;
module.exports.APPID = APPID;