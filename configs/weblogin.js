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
  /*const datos = {
    "referenciaID": 468,
    "userName": "perez.jose@servidor.com",
    "userPass": "6A1AAC948CCB18E4B84D19256AD51581",
    "fechaDeAlta": "2020-07-01T10:24:39Z",
    "fechaUltimoAcceso": "2021-02-05T15:02:18Z",
    "securityToken": "DBDCBDBGCGBDCJGFGBDBBBBBGCB",
    "datosPersonales": {
      "referenciaID": 510,
      "documento": 35077970,
      "cuil": 23112223339,
      "razonSocial": "TOLOZA, HUGO ORLANDO",
      "fechaDeNacimiento": "1954-03-22T00:00:00Z",
      "edad": 0,
      "genero": {
        "id": 0,
        "textID": "M",
        "value": "MASCULINO"
      },
      "celular": 2994665544,
      "correoElectronico": "perez.jose@servidor.com",
      "correoVerificado": true,
      "correoEnviado": true,
      "domicilioReal": {
        "direccion": "MZA 15 LOTE 11 0 - VILLA DEL CARMEN 450 VIVIENDAS",
        "barrio": null,
        "codigoPostal": {
          "postalID": 4200,
          "ciudad": "SANTIAGO DEL ESTERO",
          "departamento": "SANTIAGO DEL ESTERO CAPITAL",
          "provincia": "SANTIAGO DEL ESTERO",
          "pais": "ARGENTINA"
        },
        "ubicacion": {
          "latitud": 0.0,
          "longitug": 0.0,
          "point": null
        }
      },
      "domicilioLegal": {
        "direccion": "DIRECCION 1234",
        "barrio": null,
        "codigoPostal": {
          "postalID": 8300,
          "ciudad": "NEUQUÉN CAPITAL",
          "departamento": "CONFLUENCIA",
          "provincia": "NEUQUÉN",
          "pais": "ARGENTINA"
        },
        "ubicacion": {
          "latitud": 0.0,
          "longitug": 0.0,
          "point": null
        }
      },
      "actualizacionRenaper": "2020-08-19T15:24:03Z",
      "domicilioFiscalElectronico": null,
      "properties": {
        "renaperID": 321028019,
        "ciudadanoID": 34943078,
        "ejemplar": "A",
        "fechaDeEmision": "2014-11-17T00:00:00Z",
        "fechaDeVencimiento": "2029-11-17T00:00:00Z"
      },
      "imagen": null,
      "tR02100_ID": 2035772,
      "autoPercepcion": null
    },
    "apps": [
      {
        "id": 19,
        "name": "EMPLEADOS",
        "title": "EMPLEADOS",
        "url": "apps/webRecibos/webRecibos.aspx",
        "image": "webResources/images/apps/fondoRecibos.png",
        "standardType": 2,
        "userProfiles": null,
        "backgroundColor": null
      },
      {
        "id": 3,
        "name": "PDP",
        "title": "PRESENTACION DIGITAL DE PLANOS",
        "url": "apps/webPDP/pdp.aspx",
        "image": "webResources/images/apps/fondopdp.png",
        "standardType": 2,
        "userProfiles": null,
        "backgroundColor": null
      },
      {
        "id": 27,
        "name": "CITYPOINTS",
        "title": "PUNTOS DE INTERÉS",
        "url": "apps/webCityPoints/cpAdmin.html",
        "image": "webResources/images/apps/puntos-de-interes.png",
        "standardType": 2,
        "userProfiles": null,
        "backgroundColor": null
      },
      {
        "id": 22,
        "name": "ADOPCIONES",
        "title": "ADOPCIONES",
        "url": "apps/Mascotas/Home/Index",
        "image": "webResources/images/apps/adopciones.png",
        "standardType": 1,
        "userProfiles": null,
        "backgroundColor": null
      },
      {
        "id": 16,
        "name": "ARBOLADO",
        "title": "ARBOLADO",
        "url": "apps/Arbolado",
        "image": "webResources/images/apps/fondoArbolado.png",
        "standardType": 1,
        "userProfiles": null,
        "backgroundColor": null
      },
      {
        "id": 26,
        "name": "CV",
        "title": "CARGA TU CV",
        "url": "http://pde.neuquencapital.gob.ar",
        "image": "webResources/images/apps/cv.png",
        "standardType": 1,
        "userProfiles": null,
        "backgroundColor": null
      },
      {
        "id": 39,
        "name": "CONCURSOS",
        "title": "CONCURSOS / CONVOCATORIAS",
        "url": "apps/Concursos/public/index.php",
        "image": "webResources/images/apps/icono-concursos.png",
        "standardType": 1,
        "userProfiles": null,
        "backgroundColor": null
      },
      {
        "id": 17,
        "name": "CUENTAS TRIBUTARIAS",
        "title": "CUENTAS TRIBUTARIAS",
        "url": "cuentasTributarias.html",
        "image": "webResources/images/apps/fondoCuentasTtributarias.png",
        "standardType": 1,
        "userProfiles": null,
        "backgroundColor": null
      },
      {
        "id": 36,
        "name": "CURSO LICENCIA",
        "title": "CURSO PROFESIONAL LICENCIA DE CONDUCIR",
        "url": "https://www.neuquencapital.gov.ar/licencia-conducir/wp-login.php",
        "image": "webResources/images/apps/curso-licencia.png",
        "standardType": 1,
        "userProfiles": null,
        "backgroundColor": null
      },
      {
        "id": 30,
        "name": "REMUANE",
        "title": "REGISTRO DE ARTISTAS",
        "url": "https://www.neuquencapital.gov.ar/remuane/",
        "image": "webResources/images/apps/registro-artistas.png",
        "standardType": 1,
        "userProfiles": null,
        "backgroundColor": null
      },
      {
        "id": 21,
        "name": "RECLAMOS",
        "title": "SOLICITUDES",
        "url": "apps/SistemaReclamos",
        "image": "webResources/images/apps/fondoReclamos.png",
        "standardType": 1,
        "userProfiles": null,
        "backgroundColor": null
      },
      {
        "id": 46,
        "name": "turnos juzgado de faltas N°1",
        "title": "TURNOS JUZGADO DE FALTAS N°1",
        "url": "apps/Turnero/Inicio.aspx",
        "image": "webResources/images/apps/tribunal-de-faltas.png",
        "standardType": 1,
        "userProfiles": null,
        "backgroundColor": null
      },
      {
        "id": 40,
        "name": "turnos tribunal de faltas",
        "title": "TURNOS JUZGADO DE FALTAS N°2",
        "url": "apps/Turnero/Inicio.aspx",
        "image": "webResources/images/apps/tribunal-de-faltas.png",
        "standardType": 1,
        "userProfiles": null,
        "backgroundColor": null
      },
      {
        "id": 13,
        "name": "webTURNOS",
        "title": "TURNOS LICENCIA DE CONDUCIR",
        "url": "apps/Turnero/Inicio.aspx",
        "image": "webResources/images/apps/webTurnos.png",
        "standardType": 1,
        "userProfiles": null,
        "backgroundColor": null
      },
      {
        "id": 35,
        "name": "turnos tributarias",
        "title": "TURNOS TRIBUTOS MUNICIPALES",
        "url": "apps/Turnero/Inicio.aspx",
        "image": "webResources/images/apps/icono-turno-tributaria.png",
        "standardType": 1,
        "userProfiles": null,
        "backgroundColor": null
      },
      {
        "id": 43,
        "name": "BOLETO GRATUITO",
        "title": "BOLETO GRATUITO",
        "url": "apps/boletogratuito/public/index.php",
        "image": "webResources/images/apps/boletogratuito.png",
        "standardType": 0,
        "userProfiles": "3",
        "backgroundColor": "DD5E71"
      }
    ],
    "dfe": true,
    "error": null
  };*/
  //borrar: usuario hardcodeado para test
  let data = JSON.stringify(datos);

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