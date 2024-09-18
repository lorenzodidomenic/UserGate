
window.onload= ()=>{

    btn = document.getElementById("buttonSearch")
    container = document.getElementById("container")
    searchContainer = document.getElementById("searchContainer")
    queryInput = document.getElementById("queryInput")
    containerUserInfo = document.getElementById("containerUserInfo")
    filterName = document.getElementById("filterName")
    filterSurname = document.getElementById("filterSurname")
    filterCf = document.getElementById("filtercf")
    filterGroup = document.getElementById("filterGroup")
    filterButton = document.getElementById("filterButton")
    filterClearButton = document.getElementById("filterClearButton")
    openMenu = document.getElementById("openMenu")
    closeMenu = document.getElementById("closeMenu")
    homeButton = document.getElementById("homeButton")
    usersSectionButton = document.getElementById("usersSectionButton")
    groupsSectionButton = document.getElementById("groupsSectionButton")
    menu = document.getElementById("menu");
    logoutButton = document.getElementById("logoutButton")
    containerUsers = document.getElementById("container-users")
    groupType = document.getElementById("groupType")


    async function f(){

        /* prendo il contenuto del form e  lo metto come parametro della query */
        query = this.queryInput.value
        /*qui dovrei sostituire & se è presente con %26*/
        query = query.replace("&","%26")
        response = await fetch("http://localhost:8083/search?query="+query);

        /*
        testo = await response.text()
        if(testo != null){
          console.log(testo)
          if(testo == "Ricerca troppo ampia")
            alert("Ricerca troppo ampia. Restringi il filtro")
          return undefined;
        }else{*/
        status = await response.status
        console.log(status)

        if(status == 402){
          alert("Ricerca troppo ampia. Restringi il filtro")
          return undefined;
        }

        response_mex = await response.json()
        return response_mex;
       // }
    }

    btn.addEventListener("click", async ()=>{
        
                response =  await f();

                //this.container.innerHTML = ""

                if(response == undefined)
                  return;
                
                if(response.length == 0){  //se non arriva nessun utente
                mex = document.createElement("div")
                mex.classList = ["entryRowNoResult"]
                mex.innerHTML = "Nessun utente corrisponde a questa ricerca";
                container.appendChild(mex)
                this.containerUserInfo.style.display = "none"
                this.container.style.display = "block"

                }else{
                
                container.innerHTML = ""
                bodyTable = document.getElementById("bodyTable")
                bodyTable.innerHTML = ""
                for(let i = 0; i<response.length; i++){

                /*  VECCHIO LAYOUT
                mex = document.createElement("div")
                mex.classList = ["entryRow"]
                mex.setAttribute("id",response[i]["cn"])
                mex.innerHTML = response[i]["sn"] + " &nbsp" + response[i]["givenName"] + " &nbsp" + response[i]["cn"];
                container.appendChild(mex)
                */

                
                
                tr = document.createElement("tr")
                tr.innerHTML = '\
                <td>\
                <img src="./assets/images/account.png" alt>\
                <a href="#" class="user-link">'+response[i]["sn"]+'&nbsp'+response[i]["givenName"]+'</a>\
                </td>\
                <td>\
                '+response[i]["cn"]+'\
                </td>\
                <td>\
                <a href="#" ><span class="__cf_email__" data-cfemail="c0ada1b2acafae80a2b2a1aea4afeea3afad">'+response[i]["mail"]+'</span></a>\
                </td>';

                td = document.createElement("td")  /* dato contiene i bottoni*/
                td.setAttribute("style","width: 20%;")
                aButtonInfo = document.createElement("a")
                aButtonInfo.setAttribute("href","#")
                aButtonInfo.classList = ["table-link","infoButton"]
                aButtonInfo.setAttribute("cn",response[i]["cn"])
                aButtonInfo.innerHTML = '<span class="fa-stack" cn="'+response[i]["cn"]+'" >\
               <i class="fa fa-square fa-stack-2x" cn="'+response[i]["cn"]+'" ></i>\
               <i class="fa fa-search-plus fa-stack-1x fa-inverse" cn="'+response[i]["cn"]+'" ></i>\
               </span>'
   
                aButtonEdit = document.createElement("a")
                aButtonEdit.setAttribute("href","#")
                aButtonEdit.classList = ["table-link","editButton"]
                aButtonEdit.setAttribute("cn",response[i]["cn"])
                aButtonEdit.innerHTML = '<span class="fa-stack" cn="'+response[i]["cn"]+'" >\
               <i class="fa fa-square fa-stack-2x" cn="'+response[i]["cn"]+'" ></i>\
               <i class="fa fa-pencil fa-stack-1x fa-inverse" cn="'+response[i]["cn"]+'" ></i>\
               </span>'

                  

               // vado alla pagina di modifica utente
               this.aButtonEdit.addEventListener("click", ()=>{
                location.href = "http://localhost:8083/modifyUser?cn="+event.target.getAttribute("cn")
               })
         
          
                this.containerUserInfo.style.display = "none"
               
              // this.container.style.display = "block"

                
                this.aButtonInfo.addEventListener("click",async ()=>{

                this.containerUsers.style.display = "none"


                cn = event.target.getAttribute("cn")

                //devo fare la query con cn q
                query = "cn="+event.target.getAttribute("cn")
                response = await fetch("http://localhost:8083/searchUser?query="+query);
                response_mex = await response.json();


                this.containerUserInfo.innerHTML = ""
                divHiden = document.createElement("div")
                for(let i = 0; i< response_mex.length; i++){


                    mex = document.createElement("div")
                   // mex.classList = ["entryRow"] vecchio layout
                    
                   if((response_mex[i].type == "cn") || (response_mex[i].type == "MEMBEROFGROUP") || (response_mex[i].type == "sn") || (response_mex[i].type == "givenName")){
                    if(response_mex[i].type == "cn")
                        mex.setAttribute("id",response_mex[i].value)

                    if(response_mex[i].type != "MEMBEROFGROUP"){
                    mex.innerHTML =  '<div class="row">\
                    <div class="col-sm-3">\
                      <h6 class="mb-0" style="font-size: 29px;text-transform: uppercase;margin-bottom: 3px;">'+response_mex[i].type+'</h6>\
                    </div>\
                    <div class="col-sm-9 text-secondary">\
                     ' + response_mex[i].value+' \
                    </div>\
                  </div>\
                  <hr></hr>'
                  if(response_mex[i].local == true){  /// qui metto regola alla riga del background
                    mex.setAttribute("local",true);
               }
                  this.containerUserInfo.appendChild(mex)
                    }
                    

                  if(response_mex[i].type == "MEMBEROFGROUP"){
                    //mex.innerHTML = mex.innerHTML + "<br>"
                    for(let j = 0; j< response_mex[i].value.length; j++){
                        mex.innerHTML = mex.innerHTML + '<div class="row">\
                <div class="col-sm-3">\
                  <h6 class="mb-0" style="font-size: 29px;text-transform: uppercase;margin-bottom: 3px;">'+response_mex[i].type+'</h6>\
                </div>\
                <div class="col-sm-9 text-secondary"><span class="user-subhead">\
                  '+response_mex[i].value[j]+'\
                </span></div>\
              </div>\
              <hr></hr>'
              if(response_mex[i].local == true){  /// qui metto regola alla riga del background
                mex.setAttribute("local",true);
              }
              this.containerUserInfo.appendChild(mex)
                    }
                }
               }else{
                        mex.innerHTML =  '<div class="row hidden" style="display:none">\
                        <div class="col-sm-3">\
                          <h6 class="mb-0" style="font-size: 29px;text-transform: uppercase;margin-bottom: 3px;">'+response_mex[i].type+'</h6>\
                        </div>\
                        <div class="col-sm-9 text-secondary">\
                         ' + response_mex[i].value+' \
                        </div>\
                      </div>\
                      <hr></hr>'
                      divHiden.appendChild(mex)
                }
              }
               
              divHiden.style.display = "none"  //divHiden è il div che contiene tutti i mew nascosti, è a sua volta nascosto
              containerUserInfo.appendChild(divHiden)
                


              divDiscoverHiden = document.createElement("div")  //dviDiscoverHiden è il div che contiene la scritta Altri Attributi
              divDiscoverHiden.style.cursor = "pointer"
              mex2 = document.createElement("div")
              mex2.innerHTML = '<div class="row">\
                                <div class="col-sm-3">\
                                <h6 class="mb-0" style="font-size: 29px;text-transform: uppercase;margin-bottom: 3px;">ALTRI ATTRIBUTI</h6>\
                                </div>\
                                <div class="col-sm-9 text-secondary"> \
                                </div>\
                                </div>\
                                <hr></hr>'
              divDiscoverHiden.appendChild(mex2)
              divDiscoverHiden.addEventListener("click",()=>{
                    if(this.divHiden.style.display =="none")
                    this.divHiden.style.display = "block"
                    else
                    this.divHiden.style.display = "none"

                    mexHiddens = document.getElementsByClassName("hidden")
                    for(mex of mexHiddens){
                      if(mex.style.display == "none")
                      mex.style.display = "block"
                 }
                })
                this.containerUserInfo.appendChild(divDiscoverHiden)

                



               backButton = document.createElement("div")
               backButton.innerHTML = '<a href="#" class="table-link" id="backButton">\
               <span class="fa-stack" >\
               <i class="fa fa-square fa-stack-2x"></i>\
               <i class="fa fa-arrow-left fa-stack-1x fa-inverse"></i></span>\
               </a>'
               backButton.addEventListener("click", async ()=>{
                this.containerUserInfo.style.display = "none"
                this.containerUsers.style.display = "block"
             })
               this.containerUserInfo.appendChild(backButton)

               mexButtonEdit = document.createElement("div")
               mexButtonEdit.innerHTML = '<a href="#" class="table-link editButton" id="editButton">\
               <span class="fa-stack" >\
               <i class="fa fa-square fa-stack-2x"></i>\
               <i class="fa fa-pencil fa-stack-1x fa-inverse"></i>\
               </span>\
               </a>'
               mexButtonEdit.addEventListener("click", async ()=>{
                location.href = "http://localhost:8083/modifyUser?cn="+cn
               })
               this.containerUserInfo.appendChild(mexButtonEdit)



              this.containerUserInfo.style.display = "block"  //finite tutte le impostazioni mostr info utente
               
               })
                
            this.aButtonEdit.addEventListener("click", ()=>{
              location.href = "http://localhost:8083/modifyUser?cn="+event.target.getAttribute("cn")
          })
       
            
             td.appendChild(this.aButtonInfo)
             td.appendChild(this.aButtonEdit)
             tr.appendChild(td)
             bodyTable.appendChild(tr)
                }
            }
    }
)

this.filterButton.addEventListener("click",()=>{


    /* vado a riempire l'input del filtro per poi poter fare la query */

    //mi prendo l'input dei vari campi e se non è nullo vado a creare il filtro

    another = false;

    nameText = this.filterName.value ?? undefined;
    surnameText = this.filterSurname.value ?? undefined;
    cfText = this.filterCf.value ?? undefined;
    groupText = this.filterGroup.value ?? undefined;

    stringQuery = "";
    queryText = "";

    if(nameText == "")
      nameText = undefined;
    if(surnameText == "")
      surnameText = undefined
    if(cfText == "")
      cfText = undefined
    if(groupText == "")
      groupText = undefined

    

    counterUndefined = 0; 
    if(nameText != undefined)
      counterUndefined++;
    if(surnameText != undefined)
      counterUndefined++;
    if(cfText != undefined)
      counterUndefined ++
    if(groupText != undefined)
      counterUndefined++;
    
    if(counterUndefined == 1){
      if(nameText != undefined)
        stringQuery = "(givenName="+nameText+"*)"
      else if(surnameText != undefined)
        stringQuery = "(sn="+surnameText+"*)"
      else if(cfText != undefined)
        stringQuery = "(cn="+cfText+"*)"
      else if(groupText != undefined){
        if(this.groupType.value == "local")
        stringQuery = "(memberOf=cn="+groupText+",ou=Gruppi Locali,dc=unict,dc=ad)"
        else
        stringQuery = "(memberOf=cn="+groupText+",ou=Gruppi Studenti,dc=unict,dc=ad)"
      }
    }else{
        /* se è più di uno*/
        stringQuery = "(&"
        if(nameText != undefined)
        stringQuery += "(givenName="+nameText+"*)"
        if(surnameText != undefined)
        stringQuery += "(sn="+surnameText+"*)"
        if(cfText != undefined)
        stringQuery += "(cn="+cfText+"*)"
       if(groupText != undefined){
        if(this.groupType.value == "local")
        stringQuery += "(memberOf=cn="+groupText+",ou=Gruppi Locali,dc=unict,dc=ad)"
        else
        stringQuery += "(memberOf=cn="+groupText+",ou=Gruppi Studenti,dc=unict,dc=ad)"
       }


       stringQuery = stringQuery + ")"
    }

    /*
    if((nameText != null) && (nameText!="")){
        stringQuery = "(givenName="+nameText+"*)"
        another = true;
    }

    if((surnameText!=null)&&(surnameText!="")){
        if(another){
            stringQuery = "(&(sn="+surnameText+"*)"+stringQuery+")"
        }
        else{
            stringQuery = "sn="+surnameText+"*"
        }
    }

    if((cfText != null)&&(cfText!="")){
        if(another){
            stringQuery = "(&(cn="+cfText+"*)"+stringQuery+")"
        }
        else{
            stringQuery = "cn="+cfText+"*"
        }
    }

    if((groupText != null) && (groupText != "")){
        if(another){
            stringQuery = "(&(memberof= cn="+groupText+",ou=Gruppi Locali,dc=unict,dc=ad)"+stringQuery+")"
        }
        else{
            stringQuery = "memberOf=cn="+groupText+",ou=Gruppi Locali,dc=unict,dc=ad"
        }
    }
*/
    this.queryInput.value = stringQuery

    this.filterName.value = ""
    this.filterSurname.value = ""
    this.filterCf.value = ""
    this.filterGroup.value = ""
    counterUndefined = 0;

})


this.filterClearButton.addEventListener("click",()=>{
    this.queryInput.value = ""
})
}

function closemenu(){
  menu.style.top = "-100vh"
}

function openmenu(){
  menu.style.top = "17%"
}

this.openMenu.addEventListener("click",()=>{
    openmenu()
}
)

this.closeMenu.addEventListener("click",()=>{
closemenu()
}
)

this.homeButton.addEventListener("click",()=>{
  location.href = "http://localhost:8083/intro"
})

this.usersSectionButton.addEventListener("click",()=>{
  location.href = "http://localhost:8083/userSection"
})

this.groupsSectionButton.addEventListener("click",()=>{
  location.href = "http://localhost:8083/groupSection"
})

this.logoutButton.addEventListener("click", async ()=>{

  //mando richiesta di logout con le mie credenziali
  response = await fetch('http://localhost:8083/logout', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        withCredentials: true
      },
      body: ""
    });

  
    const content = await response.text();

   if(content=="logout Ok"){
    location.href = "http://localhost:8083/"
    }else{
     alert("Logout non riuscito")
    }
})




