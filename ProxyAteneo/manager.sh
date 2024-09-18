#!/bin/sh
envsubst < "/etc/ldap/slapd_template.conf" > "/etc/ldap/slapd.conf"

mkdir -p /cache
/usr/sbin/slaptest -f /etc/ldap/slapd.conf -F /etc/ldap/slapd.d
#slapd -f slapd.conf  per un file
slapd -F slapd.d  -d 0 & #per una directory, & serve per indicare che il comando deve essere eseguito in background

sleep 6
#ldapmodify -x -W -D "cn=admin,cn=config" -f addMemberOf.ldif
ldapadd -x  -D "cn=admin,dc=unict,dc=ad" -w $ROOT_PW -f composeStructure.ldif 
ldapadd -x  -D "cn=admin,ou=Studenti,dc=unict,dc=ad" -w $ROOT_PW -f composeStructureTraslucent.ldif 
ldapadd -x  -D "cn=admin,ou=Gruppi Studenti,dc=unict,dc=ad" -w $ROOT_PW -f compose2.ldif 

echo "Proxy started"

tail -f /dev/null 


 #per dire che non si deve aspettare più nulla in input
#slapd -d 0  #slapd -d 32 se voglio il debugging


#se entrambi -f e -F sono specificati il file di configurazione sarà convertito nel formato directory 
#e il server avviato. Se nessuna opzione è specificata , slapd tenterà di legger ei file di configurazione di default slapd.conf(se la directory slapd.d è definita legge
#prima slapd.d)