FROM node:lts-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
RUN npm ci

COPY . .
ENV NPM_CONFIG_PRODUCTION=true
RUN npm run build -- --configuration production

FROM nginx:stable-alpine
COPY --from=build /app/dist/prog-demos-frontend/browser /usr/share/nginx/html
COPY ./Docker/nginx.conf /etc/nginx/nginx.conf

EXPOSE 4200

CMD ["nginx", "-g", "daemon off;"]
