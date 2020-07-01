FROM node:12.16.1

ADD ./ /home/app
WORKDIR /home/app

RUN yarn install --frozen-lockfile
RUN yarn global add pm2
RUN yarn run build

ENV NODE_ENV=production

CMD ["pm2-runtime","dist/index.js"]
