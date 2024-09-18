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
         modifyMembershipView,
         saveUserView,
         newUserView,
         newGroupView,
         deleteGroupView,
         logoutView} = require('../controllers/controller');  //prendo la view dal controller
const ldap = require("ldapjs")
const bodyParser  = require('body-parser');
//const cookieParser = require('cookie-parser');
const session = require('express-session');


// Use sessions in the app

router.use(session({
    name: "LdapCookie",
    secret : '1234567890abcdefghijklmnopqrstuvwxyz',
	resave : false,
	saveUninitialized : true,
	cookie : { secure : false }
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
router.get("/newUser",newUserView)
router.post("/saveUser",saveUserView)
router.get("/newGroup",newGroupView)
router.get("/search", searchView);
router.get("/searchUser", userInfoView)
router.post("/modifyUserAttributes",modifyUserInfoView);
router.get("/searchGroups", searchGroupsView);
router.get("/searchGroup", groupInfoView)
router.post("/saveGroup",saveGroupView)
router.post("/modifyMembership",modifyMembershipView)
router.post("/deleteGroup",deleteGroupView)
router.post("/logout",logoutView)
   

module.exports = router;