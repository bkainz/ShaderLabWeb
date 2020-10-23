# ShaderLabWeb


## Development

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

This creates a `public` folder. Open `public/index.html` in a browser to check the build was successful.


## Deployment

1) Set up the server

Install nginx.

Configure the server with:

```
rm /etc/nginx/sites-enabled/default
mkdir /var/www/html/ShaderLabWeb
chown user:user /var/www/html/ShaderLabWeb
```

with `user` being the user used for deployment.

Add your public key to `~/.ssh/authorized_keys` to avoid entering the ssh password multiple times during deployment.


2) Deploy from the development environment

Change the current directory to the root directory of this repo and run:

```
yarn deploy user@server
```

with `user@server` being e.g. `ShaderLabWeb@51.105.38.14`.