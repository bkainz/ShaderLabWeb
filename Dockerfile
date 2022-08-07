FROM node:18-alpine

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

RUN apk add git
RUN apk add curl

WORKDIR /home/node
RUN curl -i -u bkainz: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 https://api.github.com/repos/chrismile/ShaderLabWeb/git/refs/heads/node18 
#ADD https://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@api.github.com/repos/chrismile/ShaderLabWeb/git/refs/heads/ecg version.json
WORKDIR /home/node/app
#RUN git clone -b node18 https://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@github.com/chrismile/ShaderLabWeb.git /home/node/app
#RUN git checkout node18
COPY ./ ./
#RUN git config --global --add safe.directory /home/node/app
USER root
RUN chown -R node:node /home/node/app
USER node
RUN yarn install

COPY --chown=node:node . .

EXPOSE 3000

CMD [ "yarn", "serve" ]

#https://github.com/chrismile/ShaderLabWeb.git