# Usar una imagen base de Node.js ligera
FROM node:18-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de dependencias
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto del código del proyecto
COPY . .

# Exponer el puerto que usa tu servidor
EXPOSE 3600

# Comando para iniciar la aplicación
CMD ["npm", "start"]