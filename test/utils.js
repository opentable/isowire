var _ = require('lodash');
var createMockIsowirePlugin = require('../utils').createMockIsowirePlugin;

var mock1 = {
  method: 'test1',
  params: {key: 'val'},
  response: {body: {val: 1}}
};

var mock2 = {
  method: 'test2',
  response: {body: {val: 2}}
};

var mock3 = {
  response: {body: {val: 3}}
};

var mock4 = {
  response: {
    status: 500,
    body: {val: 4}
  }
};

describe('createMockIsowirePlugin()', function() {
  var api;

  beforeEach(function() {
    api = createMockIsowirePlugin();
  });

  it('initializes correctly', function(done) {
    api.should.be.type('function');
    api.mocks.length.should.equal(0);
    done();
  });

  it('can define mocks', function(done) {
    api.mock(mock1.method, mock1.params, mock1.response);
    api.mock(mock2.method, mock2.response);
    api.mock(mock3.response);

    api.mocks[0].response.body.val.should.equal(mock1.response.body.val);
    api.mocks[1].response.body.val.should.equal(mock2.response.body.val);
    api.mocks[2].response.body.val.should.equal(mock3.response.body.val);
    
    done();
  });

  it('resolves on successful call', function() {
    api.mock(mock3.response);

    return api('test.method', {}).then(function(response) {
      response.val.should.equal(3);
    });
  });

  it('rejects on errored call', function() {
    api.mock(mock4.response);

    return api('test.method', {}).catch(function(response) {
      response.val.should.equal(4);
    });
  });

  it('can call catchall mock', function() {
    api.mock({body: 'catchAll'});

    return api('test.method', {a: 1}).then(function(response) {
      response.should.equal('catchAll');
    });
  });

  it('prefers mock with matching method + params to method-only or catchall', function() {
    var method = 'test.method';

    api.mock({body: 'catchAll'});
    api.mock(method, {body: 'methodOnly'});
    api.mock(method, {a: 1}, {body: 'methodAndParams'});

    return api(method, {a: 1}).then(function(response) {
      response.should.equal('methodAndParams');
    });
  });

  it('prefers mock with method name to catchall', function() {
    var method = 'test.method';

    api.mock({body: 'catchAll'});
    api.mock(method, {body: 'methodOnly'});

    return api(method, {a: 1}).then(function(response) {
      response.should.equal('methodOnly');
    });
  });

});