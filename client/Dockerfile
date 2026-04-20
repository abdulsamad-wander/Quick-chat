# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Back4app should set this at build time to your deployed backend URL
ARG VITE_BACKEND_URL=http://localhost:5000
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

RUN npm run build

# Runtime stage
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
