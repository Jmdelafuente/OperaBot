const axios = require("axios").default;
const URL = "https://weblogin.muninqn.gov.ar/api/getUserByToken/";
const APPID = "40";

module.exports.validarToken = function (token){
  axios
    .get(URL + token)
    .then((usuario) => {
      let perfil = usuario.apps.find((app) => app.id === APPID);
      usuario.perfil = perfil;
      return usuario;
    })
    .catch(function (error) {
      throw new Error(error);
    });
};

// module.exports.URL = URL;
// module.exports.APPID = APPID;