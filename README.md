# ShaderLabWeb


## Building the Project

Install nodejs >= 14 and its package manager yarn (`npm install -g yarn`).

Checkout the code and install dependencies with:

```
git clone git@github.com:bkainz/ShaderLabWeb.git
cd ShaderLabWeb
yarn install
```

Build the project locally with:

```
yarn build
```

This creates a `public` folder. Open `public/index.html` in a browser to check the
build was successful.


## Deployment

1) Set up the server

Install nginx.

Configure the server with:

```
rm /etc/nginx/sites-enabled/default
mkdir /var/www/html/ShaderLabWeb
chown user:group /var/www/html/ShaderLabWeb
chmod 775 /var/www/html/ShaderLabWeb
```

with `user` being the user used for deployment.

Add your public key to `~/.ssh/authorized_keys` to avoid entering the ssh password
multiple times during deployment.


2) Deploy from the development environment

Change the current directory to the root directory of this repo and run:

```
yarn deploy user@server
```

with `user@server` being e.g. `ShaderLabWeb@51.105.38.14`.


## Development

### Project Structure

```
ROOT
├── assets/
│   ├── logo.png
│   │     The logo displayed at the top right corner
│   └── teapot.obj
│         The teapot model
├── scripts/
│     Scripts and files for building and deploying
└── src/
    ├── _renderer/
    │     Custom renderer and bundler to generate the output html. Unless
    │     you intend to modify how the project is bundled you do not need
    │     to touch this code.
    ├── components/
    │   │ This folder contains the main code the app is made of. There are
    │   │ a few more components than listed below which are more auxiliary
    │   │ and not integral to the core functionality.
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
    │     Helper functions used across several components
    └── defaultState.json
          The state loaded into the app on startup
```


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

In general, all components are organized in a way that a component only imports components
that are placed directly in their folder. The exception are a few general-purpose top-level
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
the state of all components. (Except for the `App/Canvas` component which is treated a
bit differently because its state is derived from the state of other components as can
be seen in the `App.prototype.state` setter.) More details about how and where a specific
state is set or comes from can be learned about by following the state setter and getter
chain through all participating components.

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