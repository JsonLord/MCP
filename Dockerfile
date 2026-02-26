FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

COPY . .

# Set ownership to non-root user
RUN chown -R 1000:1000 /app

USER 1000

EXPOSE 7860

# Write environment variables to .dev.vars for wrangler dev
CMD echo "JINA_API_KEY=$JINA_API_KEY" > .dev.vars && \
    echo "VITE_GHOST_API_KEY=$VITE_GHOST_API_KEY" >> .dev.vars && \
    echo "API_BASE_URL=$API_BASE_URL" >> .dev.vars && \
    npx wrangler dev --port 7860 --ip 0.0.0.0
