module.exports = {
  API: require('../lib/API'),
  Provider: require('../lib/Provider'),
  XHRProvider: require('../lib/XHRProvider'),
  middleware: require('../lib/middleware'),
  isowirePlugin: require('./isowirePlugin'),
  WebSocketProvider: require('./WebSocketProvider'),
  webSocketServer: require('./webSocketServer')
};