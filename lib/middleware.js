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

    var name = req.path.substr(xhrPath.length);
    // TODO: take verb into consideration
    // TODO: handle runtime errors
    var params = _.merge({}, req.params, req.query);
    provider.execMethod('get', name, params)
      .then(function(results) {
        // TODO: handle stuff that's not JSON
        res.json(results);
      })['catch'](function(err) {
        next(err);
      });
  };
};