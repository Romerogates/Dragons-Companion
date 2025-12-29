# Étape 1 : Build Node.js
FROM node:22-alpine AS build
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./
# Utilisation de 'npm ci' pour une installation propre et exacte
RUN npm ci

# Copie du code source
COPY . .

# Build en mode production
RUN npm run build -- --configuration production

# Étape 2 : Serveur Nginx
FROM nginx:alpine

# Copie de la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie des fichiers compilés.
# ATTENTION : Avec le nouveau builder, le chemin contient '/browser'
# Le nom du dossier 'Dragons.Web' respecte la casse de ton angular.json
COPY --from=build /app/dist/Dragons.Web/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
