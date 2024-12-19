FROM node:22-slim


WORKDIR /tmp/app 
ADD appjs .

#URI SERVER LDAP DELL'UNIVERSITA'
#ENV URI "ldap://151.97.242.92"
#URI SERVER OPENLDAP NELLA RETE DI CONTAINER
ENV URI_SERVER_LDAP 'ldap://10.0.200.20:389'
#PORTA DOVE ASCOLTA IL SERVER OPENLDAP LOCALHOST
ENV PORT 8082
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


##
