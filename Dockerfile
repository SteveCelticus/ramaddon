# Usa una versione leggera di Node.js
FROM node:22-alpine

# Crea la directory di lavoro
WORKDIR /usr/src/app

# Copia i file di configurazione
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia l'intero progetto nella directory di lavoro
COPY . .

# Esponi la porta 2000
EXPOSE 2000

# Comando per avviare l'addon
CMD [ "npm", "start" ]

