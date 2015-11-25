var _ = require('lodash');

module.exports = function middleware(provider) {
  var methods = provider.methods;
  var xhrPath = provider.xhrPath;

  var paths = _.map(methods, function(method, name) {
    return xhrPath + name;
  });

  return function(req, res, next) {
    if (req.path.substr(0, xhrPath.length) !== xhrPath) {
      return next();
    }

    if (_.indexOf(paths, req.path) === -1) {
      return res.send("Isowire API method is not defined", 400);
    }

    var verb = (req.method || 'post').toLowerCase();

    if (!req.body && verb === 'post') {
      throw (
        "Couldn’t read POST body. Please use the body-parser middleware (or equivalent).\n" +
        "http://expressjs.com/api.html#req.body"
      );
    }

    var name = req.path.substr(xhrPath.length);
    var params = _.merge({}, req.body, req.query);

    provider.execMethod(verb, name, params)
      .then(function(result) {
        // TODO: handle stuff that's not JSON
        res.json(result);
      })['catch'](function(result) {
        var payload = _.isError(result) ? {error: result.message} : result;
        res.status(500).json(payload);
      });
  };
};