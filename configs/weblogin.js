const { resolve, reject } = require("bluebird");

const axios = require("axios").default;
const URL = "https://weblogin.muninqn.gov.ar/api/getUserByToken/";
const APPID = "40";

module.exports.validarToken = async function (token){
    var config = {
      method: "get",
      url:
        `https://weblogin.muninqn.gov.ar/api/getUserByToken/${token}`,
    };
    const promise = axios(config)
      .then((response) => response.data)
      .catch(function (error) {
        throw new Error(error);
      });
  let usuario = await promise;
  let perfil = usuario.apps.find((app) => app.id === APPID);
  usuario.perfil = perfil;
  return usuario;
};

// module.exports.URL = URL;
module.exports.APPID = APPID;