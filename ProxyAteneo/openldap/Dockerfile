FROM debian:10-slim 


RUN apt update 
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y slapd ldap-utils 
RUN apt-get install nano
RUN apt-get install coreutils  
RUN apt-get install -y gettext

RUN cd /etc/ldap/slapd.d && rm -Rf *
COPY ./slapd_template.conf /etc/ldap/slapd_template.conf

RUN chmod 700 /var/lib/ldap
RUN cd /etc/ldap && chmod 777 -Rf slapd.d

ENV PATH $PATH:/etc/ldap
ENV ROOT_DN_CONFIG "cn=admin,cn=config"
ENV ROOT_PW "default"
ENV LOCAL_ATTRIBUTES "member,memberOf,objectClass"
ENV REMOTE_ATTRIBUTES "member,memberOf"
#CREDENZIALI AMMINISTRATORE (di default chi entra con queste credenziali può modificare)
#ex "cn=codice fiscale,ou=Studenti,dc=unict,dc=ad"
#ENV BIND_DN "${BIND_DN}"
#ENV BIND_PW "${BIND_PW}"
#URI SERVER LDAP UNIVERSITA'
#ENV URI "${URI}"


ADD manager.sh /etc/ldap/manager.sh
WORKDIR /etc/ldap
ADD addMemberOf.ldif .
ADD composeStructure.ldif .
ADD composeStructureTraslucent.ldif .
ADD compose2.ldif .

#ENTRYPOINT  [ "manager.sh"]

#CMD         ["-h", "ldap:/// ldapi:/// ldaps:///", "-u", "openldap", "-g", "openldap", "-dStats,Stats2"]
#perchè mi parte e mi si ferma il container
#ENTRYPOINT ["bash", "manager.sh"]
#DEBIAN FORNTED MI SERVE PER EVITARE CHE MI VENGsA CHIESTA LA PASSWORD DI AMMINISTRATORE

# per riconfigurare ldap "dpkg-reconfigure slapd"
