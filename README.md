# UserGate: un LDAP Translucent Proxy per la gestione degli utenti UNICT
## COS'E'
L’Università di Catania, come tutti gli enti pubblici, ha negli anni trovato il bisogno di gestire le informazioni riguardo ad un numero elevatissimo di utenti e di dare ad essi autorizzazzioni ed accesso a risorse messe a disposizione dalla rete universitaria. Proprio per questo anche UNICT basa questa gestione sul servizio di directory Microsoft Active Directory, che permette l’archiviazione di informazioni su utenti e oggetti nella rete. Uno degli aspetti del servizio di directory che l’amministrazionedell’Universita' di Catania sfrutta è la possibilità di suddividere le utenze in gruppi, ovvero di poter creare particolari raggruppamenti in base alle esigenze e gestire i controlli di accesso e le autorizzazioni a particolari servizi sulla base della membership degli utenti a questi, in modo da garantire controlli di sicurezza pi`u granulari.

Potrebbe tornare utile, per ogni dipartimento, avere un sistema locale di gestione di utenti e gruppi, permettendo quindi, ad esempio, la creazione di entità o membership locali in maniera veloce e sicura, sulla quale poi verrano garantiti particolari accessi a risorse del dipartimento. Possiamo fare un esempio banale: supponiamo che nel nostro dipartimento nasca l’esigenza di creare un gruppo ”Test” ed aggiungervi solo particolari utenti del dipartimento, in modo da dar loro autorizzazioni particolari. Questo dovrebbe essere gestito in maniera globale a livello d’ateneo e potrebbe essere poco scalabaile.

UserGate, basato su OpenLDAP, ha come obiettivo la creazione di un servizio di gestione utenzetrasparente al di sopra dell’Active Directory d’ateneo. Lo scopo principale è mettere a disposizione di ogni dipartimento una piattaforma che, se da un lato presenta le stesse informazioni memorizzate dall’Active Directory originario, dall’altro permetta una gestione interna di gruppi ed utenze locali. Il progetto comprende anche l’implementazione di un’applicazione web, chiamata Translucent Proxy Admin, che ha come obiettivo quello di presentare un’interfaccia web user-friendly per facilitare la gestione dell’OpenLDAP Server agli amministratori.

## COME E' DIVISO IL PROGETTO
### APP NODE
L'applicazione web sviluppata in Javascript che cerca di fornire uno strumento user-frienly agli amministratori per la gestione delle risorse tramite UserGate

### OpenLDAP
Software di gestione delle risorse tramite protocollo LDAP che è configurato in modo da funzionare come Traslucent Proxy sopra l'Active Directory d'Ateneo

Maggiori dettagli riguardo l'implementazione e la struttura del progetto è possibile trovarli nel file Tesi_di_Laurea__UserGate.pdf

## COME PROVARE L'APPLICAZIONE
Per poter utilizzare l'operazione bisogna creare nella cartella principale ProxyAteneo un file .env dove settare

BIND_DN=

BIND_PW=

URI=

- la variabile d'ambiente che contiene il nome utente dell'amministratore che vuole utilizzre l'applicazione
- la variabile d'ambiente che contiene la password dell'amministratore che vuole utilizzare l'applicazione
- l'indirizzo ip dell'Active Directory d'Ateneo


Tutte e 3 le varibabili devono essere inizializzate con delle stringe. 

Lanciare il comando (avendo installato l'engine Docker), posizionandosi nella cartella ProxyAteneo
-  docker compose --env-file .env  up
L'applicazione sarà attiva in localhost:8083
