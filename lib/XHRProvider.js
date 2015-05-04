var _ = require('lodash');
var request = require('superagent');
var Promise = require('es6-promise').Promise;

var Provider = require('./Provider');

function XHRProvider(opts) {
  Provider.apply(this, arguments);

  this.options = _.merge({}, XHRProvider.defaultOptions, this.options, opts);
  this.xhrPath = this.options.xhrPath;
}

XHRProvider.defaultOptions = {
  xhrPath: '/isowire/'
};

XHRProvider.prototype = new Provider();

XHRProvider.prototype._execMethodBrowser = function _execMethodBrowser(verb, name, params) {
  var self = this;
  return new Promise(function(resolve, reject) {
    // TODO: handle other HTTP verbs / better
    var path = self.xhrPath + name;

    if ('get' === verb) {
      var r = request.get(path).query(params);
    }
    else if ('post' === verb) {
      var r = request.post(path).send(params);
    }

    r.end(function(err, res) {
      if (err) reject(err);
      else resolve(res.body || res.text);
    });
  });
};

module.exports = XHRProvider;