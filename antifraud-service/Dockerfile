FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["node", "dist/main.js"]
