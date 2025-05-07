FROM node:20-slim

# Instala Chromium y dependencias necesarias para Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    wget \
    ca-certificates \
    xdg-utils \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Define la ruta del ejecutable de Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Establece el directorio de trabajo
WORKDIR /app

# Copia archivos del proyecto e instala dependencias
COPY package*.json ./
RUN npm install

# Copia el resto del proyecto
COPY . .

# Expón el puerto
EXPOSE 3000

# Inicia la aplicación
CMD ["node", "index.js"]
