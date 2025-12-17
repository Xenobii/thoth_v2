FROM node:20

RUN apt-get update && apt-get install -y git

RUN npm install -g npm
RUN npm install -g pm2

# 1. Clone ATON
WORKDIR /
RUN git clone https://github.com/phoenixbf/aton.git

# 2. Install ATON dependencies
WORKDIR /aton
RUN npm install

# 3. Copy thoth items into ATON wapps as THOTH
RUN mkdir -p /aton/wapps/thoth
COPY . /aton/wapps/thoth

# 4. Run ATON
WORKDIR /aton
CMD ["pm2-runtime", "ecosystem.config.js"]