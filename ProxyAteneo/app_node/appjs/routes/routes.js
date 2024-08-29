const express = require("express")
const router = express.Router();
const  { modifyUserView,
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
         modifyMembershipView} = require('../controllers/controller');  //prendo la view dal controller
const ldap = require("ldapjs")
const bodyParser  = require('body-parser');
//const cookieParser = require('cookie-parser');
const session = require('express-session');


// Use sessions in the app
router.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

router.use(express.json())
router.use(bodyParser.json())
//router.use(cookieParser());

router.get("/",indexView)
router.get("/modifyUser",modifyUserView)  //setto le rotte
router.post("/login",loginView)
router.get("/intro",introView)
router.get("/userSection",userSectionView)
router.get("/groupSection",groupSectionView)
router.post("/addMember",addMemberView);

//QUESTE VARIABILI D'AMBIENTE
const serverUrl = 'ldap://10.0.200.20:389';   //indirizzo ip del container col server ldap

/*
const bindDN = 'cn=DDMLNZ03B03F943C,ou=Studenti,dc=unict,dc=ad';  //credenziali di autenticazione (potrei mettere admin)
const bindPassword = 'Palazzolo3';  //èpassword autenticazione
*/

response_message = ""

class User{
    sn;
    givenName;
    cn;

    constructor(sn,givenName,cn){
        this.sn = sn;
        this.givenName = givenName;
        this.cn = cn;
    }
}

class Attribute{
    type;
    value;

    constructor(type,value){
        this.type = type;
        this.value = value;
    }
}

router.get("/search", searchView);
    
router.get("/searchUser", userInfoView)

router.post("/modifyUserAttributes",modifyUserInfoView);

router.get("/searchGroups", searchGroupsView);

router.get("/searchGroup", groupInfoView)

router.post("/saveGroup",saveGroupView)

router.post("/modifyMembership",modifyMembershipView)
   

module.exports = router;