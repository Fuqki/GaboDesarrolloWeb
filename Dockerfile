FROM node:22-bookworm-slim AS frontend
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY public ./public
COPY src ./src
ENV CI=true
RUN npm test -- --watchAll=false && npm run build

FROM node:22-bookworm-slim AS backend
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
RUN npm audit --omit=dev --audit-level=high

FROM node:22-bookworm-slim AS release
ARG REVISION=local
LABEL org.opencontainers.image.revision=$REVISION
ENV NODE_ENV=production PORT=3001 HOST=0.0.0.0 DB_PATH=/data/database.db UPLOAD_DIR=/data/uploads
WORKDIR /app
COPY --from=backend /app/server/node_modules ./server/node_modules
COPY server ./server
COPY --from=frontend /src/build ./build
COPY scripts/smoke.mjs ./scripts/smoke.mjs
USER node
EXPOSE 3001
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 CMD node scripts/smoke.mjs http://127.0.0.1:3001
CMD ["node", "server/server.js"]
