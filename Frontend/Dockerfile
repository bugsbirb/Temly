FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./

ARG NEXT_PUBLIC_BackendURL
ENV NEXT_PUBLIC_BackendURL=$NEXT_PUBLIC_BackendURL

ARG NEXT_PUBLIC_DSN
ENV NEXT_PUBLIC_DSN=$NEXT_PUBLIC_DSN

RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
RUN npm ci --omit=dev --ignore-scripts
EXPOSE 80
CMD ["npm", "start"]
