const express = require("express")
const ldap = require("ldapjs")
const bodyParser  = require('body-parser');
//const cookieParser = require('cookie-parser');
const app = express();

//app.use(express.static("public"))   //questo per farmi tornare la pagina html


app.set('view engine', 'ejs');    //setto l'engine ejs 
 
app.set('views', process.cwd() + '/views');

app.use('/', express.static('./views'));
// routes
app.use('/', require('./routes/routes'));

app.use(express.json());
app.use(bodyParser.json())
//app.use(cookieParser());

app.listen(8082)  //la porta dovrebb essere una variabile d'ambiente