var _ = require('lodash');
var ws;

module.exports = function webSocketServer(provider, httpServer) {
  if (!ws) _loadOptionalDependencies();

  var methods = provider.methods;
  
  var wss = new ws.Server({server: httpServer, path: provider.wsPath});
  wss.on('connection', addClient);

  function addClient(ws) {
    // TODO: DO we need to listen for 'close' or 'error' events?  
    ws.on('message', function(message, flags) {
      try { message = JSON.parse(message); }
      catch (e) { /*TODO: need to do anything here? */ }

      var call = message.payload;    
      if (!call.name in methods) {
        // TODO: Better error message for this?
        return console.error("Method is not defined");
      }

      var response = {type: 'response', id: message.id};

      provider._execMethodNode('get', call.name, call.params)
        .then(function(result) {
          response.result = result;
          ws.send(JSON.stringify(response));
        })['catch'](function(err) {
          response.error = err;
          ws.send(JSON.stringify(response));
        });
    });
  }

  return wss;
};

function _loadOptionalDependencies() {
  try { ws = require('ws'); }
  catch(e) { throw new Error("Couldn't load 'ws'. Please `npm install ws` in order to use Isowire's WebSocketProvider."); }
}