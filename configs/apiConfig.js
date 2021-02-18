const IPs = []; // TODO: agregar listado de ips validas
const allowedOrigins = []; // TODO: agregar listado de origenes validos
module.exports.VALID_IPS = (ip) => {return IPs.includes(ip);};
module.exports.corsOrigin = function (origin, callback) {
  // allow requests with no origin
  // (like mobile apps or curl requests)
  if (!origin) return callback(null, true);
  if (allowedOrigins.indexOf(origin) === -1) {
    var msg =
      "The CORS policy for this site does not " +
      "allow access from the specified Origin.";
    return callback(new Error(msg), false);
  }
  return callback(null, true);
};