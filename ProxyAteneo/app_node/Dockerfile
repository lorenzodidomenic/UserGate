FROM node:22-slim


WORKDIR /tmp/app 
ADD appjs .

WORKDIR /tmp/app/appjs
#RUN apt-get update
#RUN apt-get install -y python3
#RUN apt-get install -y build-essential
#RUN apt-get install -y libldap2-dev
#RUN apt-get install libc-dev
#RUN npm install -g npm@^8
#RUN npm config set python /usr/bin/python3
#RUN npm install ldap-client
RUN npm install express-session
#RUN npm install cookie-parser
#RUN npm install uuid
RUN npm install ldapjs-client
RUN npm install 



#gli dovrei montare un file con il serve express attivo e mettere come entrypoint npm start