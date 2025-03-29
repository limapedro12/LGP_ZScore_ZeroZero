FROM node:19-alpine

RUN mkdir -p /usr/src/
WORKDIR /usr/src/

COPY package*.json ./

RUN npm install

COPY tsconfig.json .
COPY tsconfig.node.json .
COPY .eslintrc .
COPY vite.config.ts .

# Necessary files for building the app
COPY src/ src/

COPY index.html .

# Copy env files
COPY .env* ./

EXPOSE $PORT

CMD ["npm", "start"]
