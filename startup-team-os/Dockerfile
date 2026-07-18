# Startup Team OS — container for your own cloud server.
FROM node:20-slim

WORKDIR /app

# Install deps first for better layer caching.
COPY package.json ./
RUN npm install --omit=dev

# App source.
COPY src ./src

ENV PORT=3000
EXPOSE 3000

# ANTHROPIC_API_KEY must be provided at runtime, e.g.:
#   docker run -e ANTHROPIC_API_KEY=sk-ant-... -p 3000:3000 startup-team-os
CMD ["node", "src/server.js"]
