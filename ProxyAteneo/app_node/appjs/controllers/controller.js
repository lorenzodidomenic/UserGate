const { Request, Response } = require("express");
//const cookieParser = require('cookie-parser');
//const ldap = require("ldapjs")  //const ldap = require("ldap-client")
const LdapClient = require("ldapjs-client")
//const uuid = require("uuid")


//QUESTE DOVREBBERO ESSERE VARIABILI D'AMBIENTE
const serverUrl = 'ldap://10.0.200.20:389';   //indirizzo ip del container col server ldap
//const bindDN = 'cn=DDMLNZ03B03F943C,ou=Studenti,dc=unict,dc=ad';  //credenziali di autenticazione (potrei mettere admin)
//const bindPassword = 'Palazzolo3';  //èpassword autenticazione
response_message = ""

/*
const client = ldap.createClient({
    url: serverUrl,
    
});  */

const client = new LdapClient({
    url: serverUrl
})


class User{
    sn;
    givenName
    cn;
    constructor(sn,givenName,cn){
        this.sn = sn;
        this.givenName = givenName;
        this.cn = cn;
    }
}

class Group{
    cn;
    constructor(cn){
        this.cn=cn;
    }
}

class Attribute{
    type;
    value;
    local;
    constructor(type,value){
        this.type = type;
        this.value = value;
        this.local = false;
    }
}

//ogni sessione contiene username dell'utene e il momento in cui scade la sessione
/*
class Session{
    constructor(username,expiresAt){
        this.username = username;
        this.expiresAt = expiresAt;
    }

    isExpired(){
        this.expiresAt < (new Date());
    }
}*/

//questo oggetto memorizza le sessioni
const sessions = {};


//api che mi permette di fare login
const loginView = async (req , res) =>{ 

    //mi arriva [ '{ "cf": "DDMLNZ03B03F943C " ', '{ "password": "PALAZZOLO " ' ]
    entries = req.body
    bindcf = "cn="+JSON.parse(entries[0]).cf+",ou=Studenti,dc=unict,dc=ad"
    bindpassword = JSON.parse(entries[1]).password

    try {
        await client.bind(bindcf, bindpassword);
        console.log("bind andat a buon fine ")


        /* con la sessione  se son autenticato
        const sessionToken = uuid.v4()
        const now = new Date()
        const expiresAt = new Date(now+120*1000)

        const session = new Session(bindcf,expiresAt)
        sessions[sessionToken] = session

        console.log(sessions)
        res.cookie("session_token",sessionToken,{expires: expiresAt})*/
        if(!req.session.user){  //se ancora req.session.user per quella sessione non esiste lo creo
            req.session.user = [bindcf,bindpassword]
        }
        console.log(req.session)
        
        res.status(200).send("login Ok")
      } catch (e) {
        console.log('Bind failed',e);
        //res.status(401).end()
        res.send("Errore nelle credenziali")
      }
}

/* reinderizzo pagina iniziale del login*/
const indexView = (req, res) => {
      res.render("./index");
}

/* mi porta alla pagina inziale dove ci sono i due bottoni*/
const introView = (req,res) =>{
   
    /*
    console.log(req.cookies)

   if(!req.cookies){

        res.status(401).end()
        return;
    }*/
  /*
    if(!sessionToken){
        console.log("sesion token non esistente")
        res.status(401).end()
        return;
    }

    userSession = sessions[sessionToken]
    if(!userSession){
        console.log("sesion  user non esistente")
        res.status(401).end()
        return;
    }

    if(userSession.isExpired()){
        console.log("sesion user scaduta")
        delete sessions[sessionToken]
        res.status(401).end()
        return;
    }
    
    console.log(userSession)
    console.log("Tutti controlli a buon fine")*/
    if(req.session.user){   //se esiste per quella sessione user vuol dire che ha fatto il login
    credentials = req.session.user
    console.log(credentials)
    res.render("./intro");
    }
    else 
    res.status(401).send('Unauthorized. Please log in.');
}
/* mi port alla sezione ricerca utenti*/
const userSectionView = (req,res)=>{
    if(req.session.user)  //se esiste per quella sessione user vuol dire che ha fatto login
    res.render("./userSection");
    else 
    res.status(401).send('Unauthorized. Please log in.');
}

/* mi porta alla sezione ricerca gruppi*/
const groupSectionView = (req,res)=>{
    if(req.session.user)
    res.render("./groupSection")
    else 
    res.status(401).send('Unauthorized. Please log in.');
}

/* mi torna tutti gli utenti corrispondenti al filtro*/
const searchView = async (req,res)=>{
   
    const userSearchBase = "ou=Studenti,dc=unict,dc=ad";

    entries = [];

    try {

        //await client.bind(bindcf, bindpassword);
        await client.bind(req.session.user[0], req.session.user[1]);  //prendo di quella sessione il codice fiscele e la password
        console.log("bind andato a buon fine ")
        
        const searchOptions = {
            scope: 'sub',
            filter: req.query["query"],
            attributes: ["sn","givenName","cn"],
            timeLimit: 10000
        }

        results = []
        userExist = false;

        entries = await client.search(userSearchBase, searchOptions);  //array di oggetti entry
        

        if(entries.length > 0)
            userExist = true;

        for(entry of entries){
            user = new User(entry.givenName.replace(/\s/g, ''),entry.sn.replace(/\s/g, ''),entry.cn.replace(/\s/g, ''))
            results.push(user)
        }

        if(userExist){
            res.send(results)   //mando tutta la risposta completa, qui perchè così la manda solo a risposta completata
            entries = []
            results = []
        }else{
            res.send(results)
            console.log("no result")
            //dovrei mandare errore lato client
        }
      } catch (e) {
        console.log('Ricerca failed');
        console.log("Eccezione: ",e)
        res.send("Errore nella ricerca")
      }
}

//mi ritorna le informazioni sull'utente con quel cn
const userInfoView = async (req,res)=>{

    const userSearchBase = "ou=Studenti,dc=unict,dc=ad";

    entries = [];

     try {

        //await client.bind(bindcf, bindpassword);
        await client.bind(req.session.user[0],req.session.user[1])
        console.log("bind andat a buon fine ")
        
        const searchOptions = {
           scope: 'sub',
           filter: req.query["query"],
          // attributes: ["sn","givenName","cn","memberOf","MEMBEROFGROUP"],   //potrei far vedere solo gli attributi locali
           sizeLimit: 100000,
           timeLimit: 10000
        }

        results = []
        userExist = false;

        entries = await client.search(userSearchBase, searchOptions);  //array di oggetti entry
         
        let entry = undefined;
        if(entries.length > 0){
            userExist = true;
            entry = entries[0]
        }

        //qui devo fare ricerca anche con un client che si connette ad active directory
        const clientToAD = new LdapClient({
            url: "ldap://151.97.242.92"
        })

       // await clientToAD.bind(bindcf, bindpassword);
       await clientToAD.bind(req.session.user[0],req.session.user[1])
        console.log("bind andat a buon fine ")
        entriesAd = await clientToAD.search(userSearchBase,searchOptions);
        console.log(entriesAd)
        entryAd = entriesAd[0]

        //dovrei adesso confrontare le entry e se sono diverse gli metto come tipo local 
        if(entry != undefined){
        for(attributes in entry){
            
            console.log(entry[attributes])
            if((String(attributes)!="MEMBEROFGROUP")){
            console.log(attributes)
            attr = new Attribute(attributes,String(entry[attributes]).replace(/\s/g, ''))
            if((String(entry[attributes]).replace(/\s/g, '').toLowerCase() != String(entryAd[attributes]).replace(/\s/g, '').toLowerCase()) || (entryAd[attributes] == undefined))
                attr.local = true;
            results.push(attr)
            }
        }
        memberOfAttribute = Array.isArray(entry.MEMBEROFGROUP) ? entry.MEMBEROFGROUP : [entry.MEMBEROFGROUP];
        attrMemberOf = new Attribute("MEMBEROFGROUP",memberOfAttribute)
        results.push(attrMemberOf)
    }

    /*
       if(entry != undefined){
        attrSn = new Attribute("sn",entry.sn.replace(/\s/g, ''))
        if(entry.sn.replace(/\s/g, '').toLowerCase() != entryAd.sn.replace(/\s/g, '').toLowerCase())
            attrSn.local = true;
        results.push(attrSn)
        attrDn = new Attribute("dn",entry.dn.replace(/\s/g, ''))
        if(entry.dn.replace(/\s/g, '').toLowerCase() != entryAd.dn.replace(/\s/g, '').toLowerCase())
            attrDn.local = true;
        results.push(attrDn)
        attrCn = new Attribute("cn",entry.cn.replace(/\s/g, ''))
        if(entry.cn.replace(/\s/g, '').toLowerCase() != entryAd.cn.replace(/\s/g, '').toLowerCase())
            attrCn.local = true;
        results.push(attrCn)
        attrGivenName = new Attribute("givenName",entry.givenName.replace(/\s/g, ''))
        if(entry.givenName.replace(/\s/g, '').toLowerCase() != entryAd.givenName.replace(/\s/g, '').toLowerCase())
            attrGivenName.local = true;
        results.push(attrGivenName)
        
        memberOfAttribute = Array.isArray(entry.MEMBEROFGROUP) ? entry.MEMBEROFGROUP : [entry.MEMBEROFGROUP];
        attrMemberOf = new Attribute("MEMBEROFGROUP",memberOfAttribute)
        results.push(attrMemberOf)
       }*/
        if(userExist){
            console.log(results)
            res.send(results)   //mando tutta la risposta completa, qui perchè così la manda solo a risposta completata
            results = []
        }else{
            res.send(entries)
            console.log("no finish")
            //dovrei mandare errore
        }

      } catch (e) {
        console.log('Ricerca failed');
        console.log("Eccezione: ",e)
        res.send("Errore nella ricerca")
      }
}


//view che mi porta alla pagina dove ho tutti gli attirbuti che posso modificare
const modifyUserView = async (req, res) => {

    const userSearchBase = "ou=Studenti,dc=unict,dc=ad";
    entries = [];
    filterString = "cn="+req.query["cn"]
    if(req.session.user){
    try {

        //await client.bind(bindcf, bindpassword);  //bind cf e bind password presi al login
        await client.bind(req.session.user[0],req.session.user[1])
       
       
        console.log("bind andato a buon fine ")
        
        const searchOptions = {
           scope: 'sub',
           filter: filterString,
           attributes: ["sn","givenName","cn","memberOf","MEMBEROFGROUP"],   //potrei far vedere solo gli attributi locali
           sizeLimit: 100000,
           timeLimit: 10000
        }

        const clientToAD = new LdapClient({
            url: "ldap://151.97.242.92"
        })

        //await clientToAD.bind(bindcf, bindpassword);
        await clientToAD.bind(req.session.user[0],req.session.user[1])
        console.log("bind andat a buon fine ")
        entriesAd = await clientToAD.search(userSearchBase,searchOptions);
        console.log(entriesAd)
        entryAd = entriesAd[0]


        results = []
        userExist = false;

        entries = await client.search(userSearchBase, searchOptions);  //array di oggetti entry
         
        let entry = undefined;
        if(entries.length > 0){
            userExist = true;
            entry = entries[0]
        }
 
        if(entry != undefined){
        attrSn = new Attribute("sn",entry.sn.replace(/\s/g, ''))
        if(entry.sn.replace(/\s/g, '').toLowerCase() != entryAd.sn.replace(/\s/g, '').toLowerCase())
            attrSn.local = true;
        results.push(attrSn)
        attrDn = new Attribute("dn",entry.dn.replace(/\s/g, ''))
        if(entry.dn.replace(/\s/g, '').toLowerCase() != entryAd.dn.replace(/\s/g, '').toLowerCase())
            attrDn.local = true;
        results.push(attrDn)
        attrCn = new Attribute("cn",entry.cn.replace(/\s/g, ''))
        if(entry.cn.replace(/\s/g, '').toLowerCase() != entryAd.cn.replace(/\s/g, '').toLowerCase())
            attrCn.local = true;
        results.push(attrCn)
        attrGivenName = new Attribute("givenName",entry.givenName.replace(/\s/g, ''))
        if(entry.givenName.replace(/\s/g, '').toLowerCase() != entryAd.givenName.replace(/\s/g, '').toLowerCase())
            attrGivenName.local = true;
        results.push(attrGivenName)
        
        memberOfAttribute = Array.isArray(entry.MEMBEROFGROUP) ? entry.MEMBEROFGROUP : [entry.MEMBEROFGROUP];
        attrMemberOf = new Attribute("MEMBEROFGROUP",memberOfAttribute)
        results.push(attrMemberOf)
       }
       if(userExist){
        console.log(results)
        res.render("./modifyUser",{entries: results});
       // res.send(entries)   //mando tutta la risposta completa, qui perchè così la manda solo a risposta completata
        results = []
    }else{
        console.log("no finish")
        //DOVREI MANDARE ERRORE AL CLIENT
    }

    } catch (e) {
        console.log('Ricerca failed');
        console.log("Eccezione: ",e)
        res.send("Errore nella ricerca")
      }
    }else{
        res.status(401).send('Unauthorized. Please log in.');
    }
}


//api che mi modifica le informazioni modificabili dell'utente (QUESTA API NON MODIFICA MEMBER)
const modifyUserInfoView = async (req,res)=>{

    length = 0;

    try {

       
       // await client.bind("cn=admin,ou=Studenti,dc=unict,dc=ad","palazzolo"); //questo con le credenziali di rootdn
        //await client.bind(bindcf,bindpassword);
        await client.bind(req.session.user[0],req.session.user[1])
        console.log("bind modify andat a buon fine ")

        modifiedAttributes = []
        counterAttrModified = 0;
        
        for(entry of req.body){
        //modifiedAttributes.push(JSON.parse(entry))
        modifiedAttributes[Object.keys(JSON.parse(entry))] = JSON.parse(entry)
        length++;
        }

        console.log("Modified attributes: ",modifiedAttributes)


    for(attr in modifiedAttributes){
        console.log(modifiedAttributes[attr][attr])
        console.log(Object.keys(modifiedAttributes[attr]))


     type = modifiedAttributes[attr];
     console.log(type)

    if(Object.keys(modifiedAttributes[attr])[0] =="sn"){
    change = {
    operation: 'replace',
    modification: {
        sn: modifiedAttributes[attr][attr].replace(/\s/g, '')
    }
    }
}
if(Object.keys(modifiedAttributes[attr])[0] =="cn"){
    change = {
    operation: 'replace',
    modification: {
        cn: modifiedAttributes[attr][attr].replace(/\s/g, '')
    }
    }
}

if(Object.keys(modifiedAttributes[attr])[0] =="givenName"){
    change = {
    operation: 'replace',
    modification: {
        givenName: modifiedAttributes[attr][attr].replace(/\s/g, '')
    }
    }
}

console.log(change)
console.log('cn='+modifiedAttributes["cn"].cn+',ou=Studenti,dc=unict,dc=ad')
       await client.modify('cn='+modifiedAttributes["cn"].cn+',ou=Studenti,dc=unict,dc=ad', change);

       console.log("modifica ok")
      
}
    console.log("Modifiche finite")
    res.send("Modifica ok")
      } catch (e) {
        console.log("Eccezione: "+e);
      }    
}

//API CHE MI RITORNA TUTTI I GRUPPI
const searchGroupsView = async (req,res)=>{


    const userSearchBase = "ou=Gruppi Locali,dc=unict,dc=ad";

    entries = [];
    searchOptions = {
        scope: 'sub',
        filter : '(objectClass=groupOfNames)',
        attributes: ["cn"],
        timeLimit: 10000
  };

     try {

        //await client.bind(bindcf, bindpassword);
        await client.bind(req.session.user[0],req.session.user[1])
        console.log("bind andatO a buon fine ")
        
        if((req.query["query"]!=undefined) && (req.query["query"].length != 0)){
            searchOptions = {
                scope: 'sub',
                filter: req.query["query"],
                attributes: ["cn"],
                timeLimit: 10000
          }
          }

        results = []
        userExist = false;
        console.log(searchOptions)
        entries = await client.search(userSearchBase, searchOptions);  //array di oggetti entry
        console.log(entries)

        if(entries.length > 0)
            userExist = true;

        for(entry of entries){
            group = new Group(entry.cn.replace(/\s/g, ''))
            results.push(group)
        }

        if(userExist){
            res.send(results)   //mando tutta la risposta completa, qui perchè così la manda solo a risposta completata
            entries = []
            results = []
        }else{
            res.send(results)
            console.log("no result")
            //dovrei mandare errore lato client
        }
      } catch (e) {
        console.log('Ricerca failed');
        console.log("Eccezione: ",e)
        res.send("Errore nella ricerca")
      }
}

//API CHE Mi RITORNA LE INFORMAZIONI DI UN DETERMINATO GRUPPO
const groupInfoView = async (req,res)=>{

    
    // const userdn = "cn=DDMLNZ03B03F943C,ou=Studenti,dc=unict,dc=ad";
    const userSearchBase = "ou=Gruppi Locali,dc=unict,dc=ad";

    entries = [];

     try {

        //await client.bind(bindcf, bindpassword);
        await client.bind(req.session.user[0],req.session.user[1])
        console.log("bind andatO a buon fine ")
        
        const searchOptions = {
           scope: 'sub',
           filter: req.query["query"],
           attributes: ["dn","cn","member","objectClass"],   //potrei far vedere solo gli attributi locali
           sizeLimit: 100000,
           timeLimit: 10000
        }

        results = []
        userExist = false;

        entries = await client.search(userSearchBase, searchOptions);  //array di oggetti entry
         
        let entry = undefined;
        if(entries.length > 0){
            userExist = true;
            entry = entries[0]
        }
        console.log(entry)
            

        
       if(entry != undefined){
        attrDn = new Attribute("dn",entry.dn.replace(/\s/g, ''))
        results.push(attrDn)
        attrCn = new Attribute("cn",entry.cn.replace(/\s/g, ''))
        results.push(attrCn)
        attrObjectClass = new Attribute("objectClass",entry.objectClass.replace(/\s/g, ''))
        results.push(attrObjectClass)
        
        member= Array.isArray(entry.member) ? entry.member: [entry.member];
        attrMember = new Attribute("member",member)
        results.push(attrMember)
       }
        if(userExist){
            console.log(results)
            res.send(results)   //mando tutta la risposta completa, qui perchè così la manda solo a risposta completata
            results = []
        }else{
            res.send(entries)
            console.log("no finish")
            //dovrei mandare errore
        }

      } catch (e) {
        console.log('Ricerca failed');
        console.log("Eccezione: ",e)
        res.send("Errore nella ricerca")
      }
}

//api che mi permette di creare un nuovo gruppo
const saveGroupView = async (req,res)=>{

    entries = req.body
    newGroup = JSON.parse(entries[0]);


   
    try {
        //await client.bind("cn=admin,dc=unict,dc=ad","palazzolo");
       // await client.bind(bindcf,bindpassword);
       await client.bind(req.session.user[0],req.session.user[1]) 
        console.log("bind andat a buon fine ")

        const entry= {
            cn: newGroup["cn"],
            objectclass: 'groupOfNames',
            member: ""
        };

        
      
        await client.add("cn="+newGroup["cn"]+ ",ou=Gruppi Locali,dc=unict,dc=ad", entry);
        res.send("Ok")
      } catch (e) {
        console.log(e)
        console.log('Add failed');
      }
}


//api che mi permette di aggiungere member e memberof
const addMemberView = async (req,res)=>{
 

    member = JSON.parse(req.body[1])
    nameGroup = JSON.parse(req.body[0])
    
    
    entry = {
        cn: member.cnMember,
        objectclass: 'top',
    };
    /* devo salvare nel database studenti anche l'utente*/
  

    const clientAux= new LdapClient({
        url: serverUrl
    })

    try{
        //await clientAux.bind("cn=admin,ou=Studenti,dc=unict,dc=ad","palazzolo");
        //await clientAux.bind(bindcf,bindpassword);
        await clientAux.bind(req.session.user[0],req.session.user[1])
        console.log("bind modifica andat a buon fine ")
    
        await clientAux.add("cn="+member.cnMember+",ou=Studenti,dc=unict,dc=ad", entry);

    }catch(e){
         console.log("errore nell'inserimento dello studente ma previsto se studente già esiste")
    }

    try {

        //await clientAux.bind("cn=admin,ou=Studenti,dc=unict,dc=ad","palazzolo");
        //await clientAux.bind(bindcf,bindpassword);
        await clientAux.bind(req.session.user[0],req.session.user[1])
        console.log("bind andat a buon fine ")

        const change2 = {
          operation: 'add', // add, delete, replace
          modification: {
            memberOf: "cn="+nameGroup.cnGroup+",ou=Gruppi Locali,dc=unict,dc=ad"
          }
        };

        await clientAux.modify('cn='+member.cnMember+',ou=Studenti,dc=unict,dc=ad', change2);
        console.log("modifica memberOf ok")
      } catch (e) {
        console.log("Errorre inseriemnto member of",e);
    }

    try {

        //await client.bind("cn=admin,dc=unict,dc=ad","palazzolo");
        //await client.bind(bindcf,bindpassword);
        await client.bind(req.session.user[0],req.session.user[1])
        console.log("bind andat a buon fine ")

        const change3 = {
          operation: 'add', // add, delete, replace
          modification: {
            member:"cn="+member.cnMember+",ou=Studenti,dc=unict,dc=ad"
          }
        };


        await client.modify('cn='+nameGroup.cnGroup+',ou=Gruppi Locali,dc=unict,dc=ad', change3);
        console.log("modifica member  effettuato")
        res.send("Ok")
      } catch (e) {
        console.log("Errorre inseriemnto member",e);
    }

    //modifica memberOf  
}

//mi permette di rimuoere un utente da un gruppo e dal gruppo eliminare member of
const modifyMembershipView = async (req,res)=>{

    cnUtente = JSON.parse(req.body[1])  //qui ho cnUtente
    cnGroup = JSON.parse(req.body[0])  //qui ho cn del gruppo

    const clientAux= new LdapClient({
        url: serverUrl
    })

    try {

       // await client.bind("cn=admin,dc=unict,dc=ad","palazzolo");
       //await client.bind(bindcf,bindpassword);
       await client.bind(req.session.user[0],req.session.user[1])
        console.log("bind andat a buon fine ")

        const change = {
          operation: 'delete', // add, delete, replace
          modification: {
            member:"cn="+cnUtente.cnMember+",ou=Studenti,dc=unict,dc=ad"
          }
        };


        await client.modify(cnGroup.cnGroup, change);
        console.log("secondo salvataggio effettuato")
            res.send("Ok")
      } catch (e) {
        console.log("Errorre inseriemnto member",e);
      }

      try {

       // await clientAux.bind("cn=admin,ou=Studenti,dc=unict,dc=ad","palazzolo");
       //await clientAux.bind(bindcf,bindpassword);
       await clientAux.bind(req.session.user[0],req.session.user[1])
        console.log("bind andat a buon fine ")

        const change2 = {
          operation: 'delete', // add, delete, replace
          modification: {
            memberOf: cnGroup.cnGroup 
          }
        };

        await clientAux.modify("cn="+cnUtente.cnMember+",ou=Studenti,dc=unict,dc=ad", change2);
        res.send("Ok")
      } catch (e) {
        console.log("Errorre inseriemnto member of",e);
      }
}

const saveUserView = async (req,res)=>{
    entries = req.body
    newUserCn = JSON.parse(entries[0])
    newUserSn = JSON.parse(entries[1])
    newUserTelephone = JSON.parse(entries[2])
    

    try {
        //await client.bind("cn=admin,dc=unict,dc=ad","palazzolo");
       // await client.bind(bindcf,bindpassword);
       await client.bind(req.session.user[0],req.session.user[1]) 
        console.log("bind andat a buon fine ")

        const entry= {
            objectClass: 'person',
            cn: newUserCn["cn"],
            sn: newUserSn["sn"],
            telephoneNumber: newUserTelephone["telephoneNumber"]
        };

        
      
        await client.add("cn="+newUserCn["cn"]+ ",ou=Studenti Locali,dc=unict,dc=ad", entry);
        console.log("Salvataggio ok")
        res.send("Ok")
      } catch (e) {
        console.log(e)
        console.log('Add failed');
      }
}
module.exports = { modifyUserView,
                   indexView,
                   loginView,
                   introView,
                   userSectionView,
                   groupSectionView,
                   searchView,
                   userInfoView,
                   modifyUserInfoView,
                   searchGroupsView,
                   groupInfoView,
                   saveGroupView,
                   addMemberView,
                   modifyMembershipView,
                   saveUserView} 