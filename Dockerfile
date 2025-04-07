FROM node:14-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose port for the app
EXPOSE 5000

# Start the application
CMD ["npm", "start"]