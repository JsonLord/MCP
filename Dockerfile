FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./

# Install dependencies including devDependencies (for tsx, typescript)
RUN npm install

COPY . .

# Set ownership to non-root user
RUN chown -R 1000:1000 /app

USER 1000

EXPOSE 7860

CMD ["npx", "tsx", "-r", "tsconfig-paths/register", "src/server.ts"]
