const express = require("express")

//const ldap = require("ldapjs")
//const bodyParser  = require('body-parser');
//const cookieParser = require('cookie-parser');
const app = express();

//app.use(express.static("public"))   //questo per farmi tornare la pagina html
//const session = require("express-session")

app.set('view engine', 'ejs');    //setto l'engine ejs 
 
app.set('views', process.cwd() + '/views');

app.use('/', express.static('./views'));
// routes
app.use('/', require('./routes/routes'));

/*crea un middleware che gestisce le sessioni*//*OCCHIO A SECURE
app.use(session({
    name: "LdapCookie",
    secret : '1234567890abcdefghijklmnopqrstuvwxyz',
	resave : false,
	saveUninitialized : true,
	cookie : { secure : false }
}))

app.use(express.json());
app.use(bodyParser.json())
//app.use(cookieParser());*/

app.listen(process.env.PORT)  //la porta dovrebb essere una variabile d'ambiente