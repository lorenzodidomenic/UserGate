const { Request, Response } = require("express");
const LdapClient = require("ldapjs-client")

//const ldap = require("ldapjs")  //const ldap = require("ldap-client") vecchie librerie


//QUESTE DOVREBBERO ESSERE VARIABILI D'AMBIENTE
const serverUrl = 'ldap://10.0.200.20:389';   //indirizzo ip del container col server ldap
response_message = ""

/* VECCHIA LIBRERIA
const client = ldap.createClient({
    url: serverUrl,
    
});  */

const User = require("../models/user.js")
const Group = require("../models/group.js")
const Attribute = require("../models/attribute.js")

const client = new LdapClient({
    url: serverUrl
})


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
//const sessions = {}; questo oggetto memorizza le sessioni

/* reinderizzo pagina iniziale del login*/
const indexView = (req, res) => {
    res.render("./index");
}

//api che mi permette di fare login
const loginView = async (req , res) =>{ 

    //mi arriva [ '{ "cf": " " ', '{ "password": " " ' ]
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
        res.cookie("session_token",sessionToken,{expires: expiresAt})*/

        if(!req.session.user){  //se ancora req.session.user per quella sessione non esiste lo creo
            req.session.user = [bindcf,bindpassword]
        }
        res.status(200).send("login Ok")
      } catch (e) {
        console.log('Bind failed',e);
        res.status(401).send("Errore nelle credenziali")
      }
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
    }*/


    if(req.session.user){   //se esiste per quella sessione user vuol dire che ha fatto il login
    credentials = req.session.user
    res.render("./intro");
    }
    else 
    res.status(401).send('Unauthorized. Please log in.');
}

/* mi porta alla sezione ricerca utenti*/
const userSectionView = (req,res)=>{
    if(req.session.user)  //se esiste per quella sessione user vuol dire che ha fatto login
    res.render("./userSection");
    else 
    res.status(401).send('Unauthorized. Please log in.');
}


/* mi torna tutti gli utenti corrispondenti al filtro*/
const searchView = async (req,res)=>{
   
    const userSearchBase = "dc=unict,dc=ad";

    entries = [];

    try {

        //await client.bind(bindcf, bindpassword);
        await client.bind(req.session.user[0], req.session.user[1]);  //prendo di quella sessione il codice fiscele e la password
        console.log("bind andato a buon fine ")
        
        const searchOptions = {
            scope: 'sub',
            filter: req.query["query"],
            attributes: ["sn","givenName","cn","mail"],
            timeLimit: 10000
        }

        results = []
        userExist = false;

        entries = await client.search(userSearchBase, searchOptions);  //array di oggetti entry
        

        if(entries.length > 0)
            userExist = true;

        for(entry of entries){
            //questo mi serve per entries che non hanno determinati attributi, mando ?
            entry.givenName = entry.givenName ?? "&#63;"
            entry.cn = entry.cn ?? "&#63;"
            entry.sn = entry.sn ?? "&#63;"
            entry.mail = entry.mail ?? "&#63;"
            user = new User(entry.givenName.replace(/\s/g, ''),entry.sn.replace(/\s/g, ''),entry.cn.replace(/\s/g, ''),entry.mail.replace(/\s/g, ''))
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

    const userSearchBase = "dc=unict,dc=ad";

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
        console.log("bind AD andat a buon fine ")
        entriesAd = await clientToAD.search(userSearchBase,searchOptions);
        entryAd = entriesAd[0]

        //dovrei adesso confrontare le entry e se sono diverse gli metto come tipo local 
        if(entry != undefined){

        for(attributes in entry){
            
            if((String(attributes)!="MEMBEROFGROUP")){
            
            entry[attributes] = entry[attributes] ?? "&#63;" ///se non definita vado a mettere ?
            entryAd[attributes] = entryAd[attributes] ?? "&#63;"

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

        if(userExist){
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

    const userSearchBase = "dc=unict,dc=ad";
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
        entry.sn = entry.sn ?? "undefined"
        entry.cn = entry.cn ?? "undefined"
        entry.givenName = entry.givenName ?? "undefined "
        entry.dn = entry.dn ?? "undefined "
        entryAd.sn = entryAd.sn ?? "undefined"
        entryAd.cn = entryAd.cn ?? "undefined"
        entryAd.givenName = entryAd.givenName ?? "undefined "
        entryAd.dn = entryAd.dn ?? "undefined "

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

       await client.bind(req.session.user[0],req.session.user[1]);
       const searchOptions2 = {
        scope: 'sub',
        filter: "objectClass=groupOfNames",   //potrei far vedere solo gli attributi locali
        sizeLimit: 100000,
        timeLimit: 10000
     }
     entries = await client.search("ou=Gruppi locali,dc=unict,dc=ad", searchOptions2);  //array di oggetti entry

     console.log(entries)
     resultsGroup = []
     if(entries.length>0){
     for(result of entries){
        group = new Group(result.cn)
        resultsGroup.push(group)
     }
    }
       if(userExist){
        console.log(results)
        res.render("./modifyUser",{entries: results,groups: resultsGroup});
       // res.send(entries)   //mando tutta la risposta completa, qui perchè così la manda solo a risposta completata
        results = []
    }else{
        console.log("no finish")
        res.status(404)
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
            console.log(entry)
        //modifiedAttributes.push(JSON.parse(entry))
        
        modifiedAttributes[Object.keys(JSON.parse(entry.replace(/\s/g, '')))] = JSON.parse(entry.replace(/\s/g, ''));
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

       await client.modify('cn='+modifiedAttributes["cn"].cn+',ou=Studenti,dc=unict,dc=ad', change);

       console.log("modifica ok")
      
}
    console.log("Modifiche finite")
    res.send("Modifica ok")
      } catch (e) {
        console.log("Eccezione: "+e);
      }    
}

/* mi porta alla sezione ricerca gruppi*/
const groupSectionView = (req,res)=>{
    if(req.session.user)
    res.render("./groupSection")
    else 
    res.status(401).send('Unauthorized. Please log in.');
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
    console.log(entries)
    newGroup = JSON.parse(entries[0]);

    members = [];
    for(i = 1; i<entries.length; i++){
        member = JSON.parse(entries[i])
        members.push(member["member"])
    }
    console.log(members)


   
    try {
        //await client.bind("cn=admin,dc=unict,dc=ad","palazzolo");
       // await client.bind(bindcf,bindpassword);
       await client.bind(req.session.user[0],req.session.user[1]) 
        console.log("bind andat a buon fine ")

        const entry = {
            cn: newGroup["cn"],
            objectclass: 'groupOfNames',
            member: ''
        };

        
      
        await client.add("cn="+newGroup["cn"]+ ",ou=Gruppi Locali,dc=unict,dc=ad", entry);



        /*  E MODIFICO MEMBERSSHIP */

        nameGroup = newGroup["cn"]
    
    
        
    /* devo salvare nel database studenti anche l'utente*/
  
    try{
        //await clientAux.bind("cn=admin,ou=Studenti,dc=unict,dc=ad","palazzolo");
        //await clientAux.bind(bindcf,bindpassword);

        await client.bind(req.session.user[0],req.session.user[1])
        console.log("bind modifica andat a buon fine ")
    
        for(nameMember of members){
            entry = {
            cn: nameMember,
            objectclass: 'top',
           };
        await client.add("cn="+nameMember+",ou=Studenti,dc=unict,dc=ad", entry);
        }
    }catch(e){
         console.log("errore nell'inserimento dello studente ma previsto se studente già esiste")
    }

    try {

        //await clientAux.bind("cn=admin,ou=Studenti,dc=unict,dc=ad","palazzolo");
        //await clientAux.bind(bindcf,bindpassword);
        
        await client.bind(req.session.user[0],req.session.user[1])
        console.log("bind andat a buon fine ")

        for(nameMember of members){
        const change2 = {
          operation: 'add', // add, delete, replace
          modification: {
            memberOf: "cn="+nameGroup+",ou=Gruppi Locali,dc=unict,dc=ad"
          }
        };

        await client.modify('cn='+nameMember+',ou=Studenti,dc=unict,dc=ad', change2);
        console.log("modifica memberOf ok")
    }
      } catch (e) {
        console.log("Errorre inseriemnto member of",e);
    }



    try {

        //await client.bind("cn=admin,dc=unict,dc=ad","palazzolo");
        //await client.bind(bindcf,bindpassword);
        await client.bind(req.session.user[0],req.session.user[1])
        console.log("bind andat a buon fine ")

        for(nameMember of members){
        const change3 = {
          operation: 'add', // add, delete, replace
          modification: {
            member:"cn="+nameMember+",ou=Studenti,dc=unict,dc=ad"
          }
        };


        await client.modify('cn='+nameGroup+',ou=Gruppi Locali,dc=unict,dc=ad', change3);
        console.log("modifica member  effettuato")
    }
        
      } catch (e) {
        console.log("Errorre inseriemnto member",e);
      }


      console.log("Lavoro finito")
        res.send("Ok")
      } catch (e) {
        console.log(e)
        console.log('Add failed');
      }
}


//api che mi permette di aggiungere member e memberof
const addMemberView = async (req,res)=>{
 

    member = JSON.parse(req.body[1].replace(/\s/g, ''))
    nameGroup = JSON.parse(req.body[0].replace(/\s/g, ''))
    
    
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

    console.log(cnUtente,cnGroup)

    const clientAux= new LdapClient({
        url: serverUrl
    })

    try {

        //await client.bind("cn=admin,dc=unict,dc=ad","palazzolo");
       //await client.bind(bindcf,bindpassword);
       await client.bind(req.session.user[0],req.session.user[1])
        console.log("bind andat a buon fine ")
        console.log("cn="+cnUtente.cnMember+",ou=Studenti,dc=unict,dc=ad")
        
        cfUtente = cnUtente.cnMember.toLowerCase()
         
        const change = {
          operation: 'delete', // add, delete, replace
          modification: {
            member: "cn="+cfUtente+",ou=Studenti,dc=unict,dc=ad"
          }
        };
        console.log(change)

        await client.modify(cnGroup.cnGroup, change);
        console.log("secondo salvataggio effettuato")
            //res.send("Ok")
      } catch (e) {
        console.log("Errorre rimozione member",e);
      }

      try {

        //await clientAux.bind("cn=admin,ou=Studenti,dc=unict,dc=ad","palazzolo");
       //await clientAux.bind(bindcf,bindpassword);
       await clientAux.bind(req.session.user[0],req.session.user[1])
        console.log("bind andat a buon fine ")

        const change2 = {
          operation: 'delete', // add, delete, replace
          modification: {
            memberOf: cnGroup.cnGroup
          }
        };
       
        console.log(change2)
        await clientAux.modify("cn="+cfUtente+",ou=Studenti,dc=unict,dc=ad", change2);
        res.send("Ok")
      } catch (e) {
        console.log("Errorre rimozione member of",e);
      }
}


const newUserView = async (req,res)=>{
    res.render("./newUser")
}
const saveUserView = async (req,res)=>{

    
    entries = req.body
    newUserCn = JSON.parse(entries[0])
    newUserSn = JSON.parse(entries[1])
    newUserTelephone = JSON.parse(entries[2])
    newUserEmail = JSON.parse(entries[3])
    newUserName = JSON.parse(entries[4])
    

    try {
        //await client.bind("cn=admin,dc=unict,dc=ad","palazzolo");
       // await client.bind(bindcf,bindpassword);
       await client.bind(req.session.user[0],req.session.user[1]) 
        console.log("bind andat a buon fine ")

        const entry= {
            objectClass: 'inetOrgPerson',
            cn: newUserCn["cn"],
            sn: newUserSn["sn"],
            telephoneNumber: newUserTelephone["telephoneNumber"],
            mail: newUserEmail["email"],
            givenName: newUserName["givenName"]
        };

        
        console.log(entry)
      
        await client.add("cn="+newUserCn["cn"]+",ou=Studenti Locali,dc=unict,dc=ad", entry);
        console.log("Salvataggio ok")
        res.send("Ok")
      } catch (e) {
        console.log(e)
        console.log('Add failed');
      }
}

const newGroupView = async (req,res)=>{
    res.render("./newGroup")
}

const deleteGroupView = async(req,res)=>{

    entries = req.body;
    cnGroup = JSON.parse(entries[0]);

    try{
        const userSearchBase = "ou=Gruppi Locali,dc=unict,dc=ad";


        await client.bind(req.session.user[0],req.session.user[1]) 
        console.log("bind andat a buon fine ")
        searchOptions = {
            scope: 'sub',
            filter: "cn="+cnGroup["cn"],
            attributes: ["member"],
            timeLimit: 10000
      }

      console.log(searchOptions)

      entries = await client.search(userSearchBase, searchOptions);  //array di oggetti entry
      console.log(entries)

      entry = entries[0]  //prendo il gruppo per prenderne i membri
      for(let i = 1; i<entry.member.length; i++){

        const change2 = {
          operation: 'delete', // add, delete, replace
          modification: {
            memberOf: "cn="+cnGroup["cn"]+",ou=Gruppi Locali,dc=unict,dc=ad"
          }
        };
       
        await client.modify(entry.member[i], change2);
      }


    }catch(e){
      console.log("errore nella cancellazione dei memberOf dei vari utenti",e)
    }

    
    try {
        //await client.bind("cn=admin,dc=unict,dc=ad","palazzolo");
       // await client.bind(bindcf,bindpassword);
        await client.bind(req.session.user[0],req.session.user[1]) 
        console.log("bind andat a buon fine ")

        

        
        console.log(entry)
      
        await client.del("cn="+cnGroup["cn"]+",ou=Gruppi Locali,dc=unict,dc=ad");
        console.log("Rimozione ok")
        res.send("Ok")
      } catch (e) {
        console.log(e)
        console.log('Delete failed');
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
                   saveUserView,
                   newUserView,
                   newGroupView,
                   deleteGroupView} 