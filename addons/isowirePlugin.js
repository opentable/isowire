var vanillaPlugin = require('../lib/isowirePlugin');
var webSocketServer = require('./webSocketServer');

module.exports = function isowirePlugin(opts) {
  var plugin = vanillaPlugin(opts);
  var provider = plugin.getProvider();

  plugin.getWebSocketServer = function(httpServer) {
    return webSocketServer(provider, httpServer);
  };

  return plugin;
};