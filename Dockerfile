FROM node:18-alpine

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

RUN apk add git
RUN apk add curl

WORKDIR /home/node
WORKDIR /home/node/app
COPY ./ ./
USER root
RUN chown -R node:node /home/node/app
USER node
RUN yarn install

COPY --chown=node:node . .

EXPOSE 3000

CMD [ "yarn", "serve" ]

#https://github.com/chrismile/ShaderLabWeb.git