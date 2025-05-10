FROM node:18
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install && npm install -g nodemon
RUN curl -LO https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl \
    && install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl \
    && rm kubectl
COPY . .
EXPOSE 3000
CMD ["npm", "start"] 