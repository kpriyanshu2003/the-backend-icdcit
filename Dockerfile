FROM node:20.11.0-bullseye
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install


COPY . .

RUN npx prisma generate 

EXPOSE 3000

CMD ["npm", "start"]