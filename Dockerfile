FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 9002
CMD ["npm", "run", "dev", "--", "--host"]
