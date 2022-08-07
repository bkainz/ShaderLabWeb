FROM node:15-alpine

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

WORKDIR /home/node/app

RUN apk add git

USER node
RUN git clone https://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@github.com/bkainz/ShaderLabWeb.git /home/node/app

RUN yarn install

COPY --chown=node:node . .

EXPOSE 3000

CMD [ "yarn", "serve" ]
