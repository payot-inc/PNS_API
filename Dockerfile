FROM node:10-alpine

WORKDIR /home/app

COPY . .
ENV NODE_ENV=production
EXPOSE 3000
RUN npm install

CMD ["node", "app.js"]
