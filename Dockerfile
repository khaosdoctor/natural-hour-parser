FROM node:iron-alpine as builder
WORKDIR /app
COPY ["package.json", "package-lock.json*", "tsconfig.json", "./"]
COPY src ./src
RUN npm ci
RUN npm run build

#####

FROM node:iron-alpine as production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
RUN npm pkg delete scripts.prepare && npm pkg delete scripts.prestart
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["npm", "start"]
