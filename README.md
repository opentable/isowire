***NOTE: This is a pre-alpha release, use in production at your own risk. Pull requests, bug reports, or suggestsions welcome.***

```
    ____                   _         
   /  _/________ _      __(_)_______ 
   / // ___/ __ \ | /| / / / ___/ _ \
 _/ /(__  ) /_/ / |/ |/ / / /  /  __/
/___/____/\____/|__/|__/_/_/   \___/ 
```

# Isowire
An elegant isomorphic API for Fluxible apps to communicate with databases and other backend services.

## Demo app
[opentable/fluxible-isowire/demo](https://github.com/opentable/fluxible-isowire-demo)

## Getting Started
To use Isowire in your Fluxible app, you need three things: some API methods, the Fluxible plugin, and the connect/express middleware.

#### Define Your API

Let’s start by defining an API method. These methods will only be run in the server environment, and will not be included in client-side JS bundles. Isowire API methods are where you make calls to your database, other APIs, etc.

```javascript
// users-api.js
var api = require('isowire').API();

api.method('users.find', (params) => {
  return new Promise((resolve, reject) => {
    User.findById(params.id, (err, user) => {
      if (err) reject(err);
      else resolve(user);
    });
  });
});
```

#### Plug into your Fluxible app

Next, set up the Fluxible plugin and plug it into your Fluxible app. This will be included on the server and in the browser.

```javascript
// app.js
var {isowirePlugin} = require('isowire');

var app = new Fluxible({
  component: require('./components/Application')
});

app.plug(isowirePlugin());
```

#### Include the Isowire middleware

In your server code, add your API to the plugin instance, and mount the Isowire middleware into your server.

```javascript
// server.js
var usersAPI = require('./users-api');
var isowirePlugin = app.getPlugin('Isowire');
isowirePlugin.add(usersAPI);

server.use(isowirePlugin.getMiddleware());
```

#### Usage

Now you can call your method from your actions without having to worry about what environment you're running in using the `api()` method on the action context.

```javascript
// actions/loadUser.js
module.exports = function(context, payload, done) {
  context.api('users.find', {id: payload.id})
    .then(user => {
      done(null, user);
    })
    .catch(err => {
      done(err);
    });
};
```

### Why Fluxible?

Isowire depends on Fluxible's dehydrate/rehydrate mechanism to expose available data methods to the browser. If you already have your Fluxible app configured to dehydrate on the server and rehydrate in the browser, you're done. If you haven't, you'll need to do something like this:

```javascript
// server.js
var app = require('./app');

server.get('/', (req, res) => {
  var context = app.createContext();
  var dehydratedState = serialize(app.dehydrate(context));
  var injectedJS = 'window.FLUXIBLE_DEHYDRATED_STATE = ' + dehydratedState + ';';
  res.render('index', {injectedJS: injectedJS});
});

// index.ejs
<script type="text/javascript"><%- injectedJS -%></script>
<script src="/js/client.js"></script>

// client.js
var app = require('./app');
var context = app.createContext();

var dehydratedState = window.FLUXIBLE_DEHYDRATED_STATE || {};
app.rehydrate(dehydratedState, (err, context) => {
  React.render(context.createElement(), document.getElementById('react-root'));
});
```

## Copyright and license

Code and documentation copyright 2015 OpenTable, Inc. Code released under [the MIT license](https://github.com/opentable/isowire/blob/master/LICENSE).
