var ws;
var uuid;
var _ = require('lodash');
var request = require('superagent');
var Promise = require('es6-promise').Promise;

var Provider = require('../lib/Provider');

function WebSocketProvider(opts) {
  Provider.apply(this, arguments);

  this.options = _.merge({}, WebSocketProvider.defaultOptions, this.options, opts);
  this.wsPath = this.options.wsPath;
  this.isConnecting = false;
  this.ws = null;
  this.queue = [];
  this.pending = [];

  if (!ws || !uuid) _loadOptionalDependencies();
}

WebSocketProvider.defaultOptions = {
  wsPath: '/isowire-ws/',
  wsURL: null
};

WebSocketProvider.prototype = new Provider();

WebSocketProvider.prototype.getWebSocketURL = function getWebsocketURL() {
  // TODO: Make this more robust
  if (this.options.wsURL) return this.options.wsURL;
  if (this.env === 'browser') return 'ws://' + location.host + this.options.wsPath;
  return 'ws://localhost' + this.options.wsPath;
};

WebSocketProvider.prototype._execMethodBrowser = function _execMethodBrowser(verb, name, params) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var payload = {verb: verb, name: name, params: params, resolve: resolve, reject: reject};

    if (self.ws) {
      self._sendPayload(payload);
    }
    else {
      self.queue.push(payload);
    }

    if (!self.ws && !self.isConnecting) {
      self._connectWs();
    }
  });
};

WebSocketProvider.prototype._sendPayload = function _sendPayload(payload) {
  var id = uuid();
  var message = {id: id, type: 'request', payload: payload};
  var self = this;

  this.ws.send(JSON.stringify(message), function(err) {
    if (err) return console.warn("Failed to send ", message);
  });

  self.pending.push(message);
};

WebSocketProvider.prototype._sendQueuedPayloads = function _sendQueuedPayloads() {
  var payload;
  while (payload = this.queue.shift()) {
    this._sendPayload(payload);
  }
};

WebSocketProvider.prototype._handleMessage = function _handleMessage(message, flags) {
  // TODO: check flags for binary/masked data?
  try { message = JSON.parse(message.data); }
  catch (e) { /* TODO: warn here? */ }

  if (!message.id || message.type !== 'response') return;
  var index = _.findIndex(this.pending, {id: message.id});

  if (index !== -1) {
    var call = this.pending[index].payload;
    this.pending.splice(index, 1);
    if (message.result) call.resolve(message.result);
    else call.reject(message.error);
  }
};

WebSocketProvider.prototype._connectWs = function _connectWs() {
  // TODO: Handle reconnecting

  if (this.env === 'node') return;

  this.isConnecting = true;
  this.ws = new ws(this.getWebSocketURL());

  var self = this;
  this.ws.onopen = function onOpen() {
    self.isConnecting = false;
    self._sendQueuedPayloads();
  };

  this.ws.onerror = function onError() {
    self.isConnecting = false;
    self.ws = null;
  };

  this.ws.onclose = function onError() {
    self.isConnecting = false;
    self.ws = null;
  };

  this.ws.onmessage = function onMessage(message, flags) {
    self._handleMessage(message, flags);
  };

};

module.exports = WebSocketProvider;

function _loadOptionalDependencies() {
  try { ws = require('ws'); }
  catch(e) { throw new Error("Couldn't load 'ws'. Please `npm install ws` in order to use Isowire's WebSocketProvider."); }
  try { uuid = require('node-uuid'); }
  catch(e) { throw new Error("Couldn't load 'node-uuid'. Please `npm install node-uuid` in order to use Isowire's WebSocketProvider."); }
}