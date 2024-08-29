const express = require("express")
const ldap = require("ldapjs")


const app = express();

const serverUrl = 'ldap://127.0.0.1:389';
const bindDN = 'cn=DDMLNZ03B03F943C,ou=Studenti,dc=unict,dc=ad';
const bindPassword = 'Palazzolo3';


//creo client ad uno spcifico ldap server
const client = ldap.createClient({
    url: serverUrl,
});  

client.on('connectError', (err) => {
    // handle connection error
    console.log("errooooor",err)
  })
  

client.bind(bindDN,bindPassword, (error)=>{

    if(error){
        console.error("Failed to bind",error);
        return;
    }
    console.log("Successfully connected to the ldap proxy")
})

//all'arrivo di questa richiesta faccio richiesta 
//al server ldap
app.get("/", (req,res)=>{

    const userName ='DDMLNZ03B03F943C';
    const userSearchBase = "dc=unict,dc=ad";
    const userdn = "cn=DDMLNZ03B03F943C,ou=Studenti,dc=unict,dc=ad";

    const searchOptions = {
        scope: 'sub',
        filter: 'cn=DDMLNZ03B03F943C',

        //da ora in poi lavoro su memmber of in locale
       //filter: 'carLicense=VALID',
        
       attributes: ['dn','sn','cn','carLicense']
    }

    let userExist = false;

    client.search(userSearchBase,searchOptions, (error,response)=>{

        if(error){
            console.log("Errore nella ricerca")
        }

        response.on('searchEntry', (entry)=>{
            console.log("User found")
            userExist = true;
            const attributes = entry.attributes;
            response = ""
            attributes.forEach((attribute) => {
                const values = Array.isArray(attribute.values) ? attribute.values : [attribute.values];
                console.log(attribute.type + ": " + values.join(", "));

                response = response + "<br>" + attribute.type + ": " + values.join(", ")
            });

            res.send(response)
        })

        response.on("error" , (error)=>{
            console.log('Errore errore',error)
        })

        response.on("end", ()=>{
            if(userExist){
                console.log("finish")
            }else{
                console.log("no")
            }
        })
    })
})


app.listen(8082)