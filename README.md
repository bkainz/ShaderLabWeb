# ShaderLabWeb

## docker

```
docker pull biomediaicl/shaderlabweb_webgl2
docker run -p 80:3000 -d -t biomediaicl/shaderlabweb_webgl2
```

## Building the Project

Install nodejs >= 14 and its package manager yarn (`npm install -g yarn`).

Checkout the code and install dependencies with:

```
git clone git@github.com:bkainz/ShaderLabWeb.git
cd ShaderLabWeb
yarn install
```

Run the web app locally with:

```
yarn serve
```

This serves the web app under http://localhost:3000.


## Setup of the server

a) On the server:

Install nginx (webserver) and certbot (SSL Certificate registration), e.g. on
Ubuntu with:

```
apt install -y nginx
snap install certbot --classic
```

Add your SSH public key to `~/.ssh/authorized_keys` to avoid entering your SSH
password multiple times during deployment.


b) On your development machine:

Change the current directory to the root directory of this repo and run:

```
yarn init-server user@hostname ssl@email.com 3000
```

with `user@hostname` being your SSH login to the server. `server` must also already
be the actual hostname (e.g. `shaderlabweb.doc.ic.ac.uk`) the app will be reachable
under. For this hostname an SSL certificate will be registered with `ssl@email.com`
being the email attached to the registered SSL certificate (through LetsEncrypt).
The email is used to warn about an expiring certificate in the case the automatic
renewal did not work as it should. `3000` is the port used internally by the nodejs
server to which nginx is a public proxy.

All of the above needs only to be done once on a newly created server. To push
changes to the server follow the following deployment instructions.


## Deploying updates to the server

On the development machine, change the current directory to the root directory
of this repo and run:

```
yarn deploy user@hostname
```

with `user@hostname` being the same as during the server setup above.


## Development

### Project Structure

```
ROOT
├── defaultStates/
│   ├── Model.json
│   │     The state loaded into a newly created model pass
│   ├── project.json
│   │     The state loaded into the app on startup and into a newly created project
│   └── Quad.json
│         The state loaded into a newly created quad pass
├── exampleFeedbackServer/
│   └── serve.js
├── public/
│   ├── assets/logo.png
│   │     The logo displayed at the top right corner
│   └── teapot.obj
│         The teapot model
├── server/
│     Scripts and files for setting up and updating a server
└── src/
    ├── _renderer/
    │     Custom renderer and bundler to generate the output html. Unless
    │     you intend to modify how the project is bundled you do not need
    │     to touch this code.
    ├── componentHelpers/
    │     Helper functions used across several components
    ├── components/
    │   │ This folder contains the view part of the app is made of. There are
    │   │ main components for the editor with webgl canvas are:
    │   ├── App/Canvas/
    │   │     The render window at the top left. This folder contains
    │   │     all the webGl state management.
    │   ├── App/Controls/Camera/
    │   │     The camera tab at the bottom left.
    │   ├── App/Controls/Log/
    │   │     The log tab at the bottom left.
    │   ├── App/Controls/Model/
    │   │     The model tab at the bottom left.
    │   ├── App/Controls/Uniforms/
    │   │     The uniforms tab at the bottom left.
    │   ├── App/Editor/
    │   │     The editor to the right.
    │   └── App/Header/
    │         The header at the top.
    ├── helpers/
    │     Helper functions used in models and routers
    ├── models/
    │     Database models
    ├── pages/
    │     Technically, pages are just like ordinary components but since they
    │     are the root of the render tree with enclosing html tags their setup
    │     is a little bit different.
    ├── routes/
    │     Contains definition of the routes (i.e. URLs) of the web app.
    └── defaultState.json
          The state loaded into the app on startup
```

The project uses [koa](https://koajs.com) as its web framework. Routes are defined in the
`routes/` directory. These routes either render a page from the `pages/` directory
or a component from the `components/` directory. The app uses sqlite as persistent
data storage. Records are loaded from the sqlite database via the models in the
`models/` directory. Models are defined with the help of the `helpers/View` class
which uses `helpers/database/queryBuilder.js` to build its SQL queries.


### Component Structure

Each folder in `src/components` with a capitalized name constitutes a *component*
which is a self-contained bundle of HTML markup, CSS styles and javascript scripts.
These files are rendered during the build process and combined with the files of
other components to the final html page.

Each component has the following file structure:

```
COMPONENT
├── index.js
│     The html markup of the component in JSX.
├── class.css
│     The style for all instances of the component. This uses ordinary CSS except
│     for the special `${className}` string which is replaced by the component's
│     class name.
├── instance.js
│     The Javascript class being instantiated for each instance of the component.
└── instance/
      Additional classes imported by instance.js.
```

To import other js modules in `instance.js` use `import defaultExport from 'path/to/module'`.
To export the main class of the file use `export default MainClassName`. The same
applies to all imported modules as well.
Note: Because of the custom bundler in `src/_renderer` further signatures of
the ES6 [import][1] and [export][2] statements are not supported.

[1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
[2]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export

In general, all components are organized in a way that they only imports components that
are placed directly in their folder. The exception are a few general-purpose top-level
components like `Tabs` or `Initializer` which might be included by a component at any level.
All used instances of these components are then compiled by the code in the `src/_renderer`
folder to the html output.


### Startup Of the App In the Browser

The browser parses the HTML markup sequentially from top to bottom. Once it encounters
the root element of a component having an `instance.js` file it instantiates the javascript
interface in this file for the element. While doing so, it is not guaranteed that the
browser has also already parsed all descendants of the component's element, but usually
you want to do something with them somewhere during the initialization of said interface.
To have access to all these descendants the component can include the `Initializer`
helper component and once the browsers encounters *its* element, the `initialize()`
method of its embedding component interface will be called. Here, all descendants
encountered up to this point will be available. Therefore, it usually makes the most sense
to include the `Initializer` component right before the closing tag of the component.

It is probably easiest to understand this by looking at an example. The `App` component
is the root component containing all of the app. The constructor in its `instance.js` is
very short and just defines a couple members. Before its closing tag, after all sub
components for the canvas, controls and editor panes have been loaded and initialized,
it includes the `Initializer` component which calls `App.prototype.initialize()`.
There, the app is actually initialized by setting its initial state, setting up the pane
resize functionality (accessing descendant elements) and finally entering the render loop.

This general initialization structure is followed by all components: They have a light-weight
constructor and if necessary a heavy-duty `initialize()` method triggered by an embedded
`Initializer` component.


### Data Flow Through the App

While initializing the app with the default state or when loading a saved state via the
header, the app's state is set by calling the `App.prototype.state` setter. From there
the state is passed through the sub components by calling *their* `state` setter. All
components having a `state` setter also have a `state` getter which is used to collect
the state of all components. More details about how and where a specific state is set
or comes from can be learned about by following the state setter and getter chain through
all participating components.

When some value is changed by setting the state, it usually triggers two side-effects.
For one, the input field in the UI is changed to the new value and secondly, the update
of the corresponding value in webgl is triggered. For uniforms and vertex data this
happens by calling a method of the `Canvas` component. Webgl configuration like the
depth func or viewport size is updated on an indirect way by setting a value in the
app's central value registry which the `Canvas` component then watches for changes.
Changing a value through the UI follow exactly the same path for updating the webgl
state.

A code example for setting the webgl state via the app's central value registry can be
found in `helpers/state.js`, which is used by the `App/Controls/Camera` and
`App/Controls/Model` components. Setting the mesh in the `App/Controls/Model` component
and setting uniform values via the `App/Controls/Uniforms/instance/Value.prototype.value`
setter directly call methods of the `Canvas`.


### App Value Registry & Uniform Attachments

The interface of the `App` component has the methods

- `setValue(type, name, value)`,
- `getValue(type, name)` and
- `removeValue(type, name)`.

These method let you interact with the app's value registry. Each value has a type and a
name. If a value is set and has a type equal to one of GLSL's recognized types `int`,
`bool`, `float`, `ivec[234]`, `bvec[234]`, `vec[234]` or `mat[234]`, it appears as a
possible attachment in the *attach to:*-dropdown for a uniform of that type. A simple
example is the 'Time in Milliseconds' value of type `int` that is set in the render
loop in `App.prototype.initialize()`.


### Feedback Mechanism

In the web app, clicking the *Get Feedback* button at the bottom right in a project
takes a screenshot of the render window, collects the current state of the project
and `POST`s it to URL `/` of the feedback server. The screenshot is sent as file
`screenshot` and the state is stored in field `state` of the body. The html response
of the feedback server is then output to the log of the web app.

The feedback server is expected to run on `localhost` one port above the web server, i.e.
if the web server runs under `http://localhost:3000`, the feedback server must run under
`http://localhost:3001`. And if if the web server runs under `http://localhost:3002`,
the feedback server must run under `http://localhost:3003`

There is an example feedback server written in Javascript located at
`exampleFeedbackServer/serve.js` in this repository. To run the feedback server
under a specific port in the background execute the command line:

```
$ PORT=3003 ./exampleFeedbackServer/serve.js &
```

### Notes on Implementing GitLab integration for ShaderLabWeb
 * The general workflow is to essentially implement the OAuth 2.0 authentication workflow
 * This workflow involves the following four things:
	1. A button on the main website that requests a redirect via the backend to the OAuth authentication endpoint for gitlab (this is https://gitlab.com/oauth/authorize)
		1. The redirect requires multiple query parameters that identify the application and where to redirect users after authentication
		2. The query parameters are:
			* client_id=APP_ID
			* redirect_uri=REDIRECT_URI
			* response_type=code
			* state=STATE
			* scope=REQUESTED_SCOPES
			* code_challenge=CODE_CHALLENGE
			* code_challenge_method=S256
		3. The `client_id` parameter specifies the application making the requests
		4. The `redirect_uri` is where gitlab should redirect users post-authentication
		5. The `response_type=code` requests that gitlab redirects to the `redirect_uri` endpoint with the query parameter `code` which is the authentication code that identifies a user is logged in and is used to make requests to gitlab on the users behalf. This parameter needs to be stored (encrypted) in a cookie or, better yet, on the server backend and associated with a randomized user identifier stored in browser cookies.  The latter enforces that any requests made to gitlab go through the server backend rather than through the users browser allowing for more secure communication as it is easier to harden the server to attacks than the browser application.
		6. The `scope` is the access scope for the user, this specifies what the authentication code allows the backend to do.
		7. The `code_challenge` and `code_challenge_method` parameters specify the additional security mechanism used by the OAuth backend for identifying that the request is from the application in question rather than a bad actor with access to the app ID.
	2. A callback endpoint on the backend that can accept a query parameter of `code` and appropriately manage successful and unsuccessful authentication as well as associate the user with the authentication code. If the authentication code is stored entirely in the backend, then the redirect URI from above might also include a way of identifying the user who made the request and then associating the user with the authentication code.
	3. Ability to refresh the authentication code when it expires as the code is valid for only a limited amount of time.
	4. Ability to log-out the user post-authentication and correctly handle invalidation of codes as well as proper syncing with gitlab states as needed.
	
References:
[1] https://docs.gitlab.com/ee/api/oauth2.html

[2] https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#web-application-flow

[3] https://dominictobias.medium.com/writing-an-oauth-flow-from-scratch-in-nodejs-397496acafbe

[4] https://permify.co/post/oauth-20-implementation-nodejs-expressjs/
