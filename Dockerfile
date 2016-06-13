FROM node:latest

RUN mkdir -p /whatsup
WORKDIR /whatsup

COPY package.json /whatsup/
RUN npm install

COPY . /whatsup

EXPOSE 8000

CMD ["node","app.js"]
