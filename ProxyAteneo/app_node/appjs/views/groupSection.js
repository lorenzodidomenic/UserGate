window.onload = ()=>{

    nameInput = document.getElementById("filterGroupName");
    buttonFilter = document.getElementById("filterButton")
    buttonFilterClear = document.getElementById("filterClearButton")
    buttonSearch = document.getElementById("buttonSearch")
    queryInput = document.getElementById("queryInput")
    containerGroups = document.getElementById("container-groups")
    searchContainer = document.getElementById("searchContainer")
    containerGroupInfo=document.getElementById("containerGroupInfo")
    buttonAddGroup = document.getElementById("addGroup")
    buttonAddUser = document.getElementById("addUser")
    addMember = document.getElementById("addMember")
    saveMemberButton = document.getElementById("saveMember")
    dnMember = document.getElementById("dnMember")
   
    homeButton = document.getElementById("homeButton")
    usersSectionButton = document.getElementById("usersSectionButton")
    groupsSectionButton = document.getElementById("groupsSectionButton")
    logoutButton = document.getElementById("logoutButton")

    this.buttonFilter.addEventListener("click",()=>{

        if(this.nameInput.value != null){

            this.queryInput.value = "cn="+this.nameInput.value
        }
    })


    //poi aggiungo che al click del bottone funziona come gli utenti
    async function f(){

        /* prendo il contenuto del form e  lo metto come parametro della query */
        query = this.queryInput.value
        query = query.replace("&","%26")
        response = await fetch("http://localhost:8083/searchGroups?query="+query);
        response_mex = await response.json()
        return response_mex;
    }

    this.buttonSearch.addEventListener("click", async ()=>{
        
                response =  await f();

                //this.container.innerHTML = ""

                
               
                if(response.length == 0){
                mex = document.createElement("div")
                mex.classList = ["entryRow"]
                mex.innerHTML = "Nessun Gruppo Esistente";
                container.appendChild(mex)
                this.containerGroupInfo.style.display = "none"
                this.containerGroups.style.display = "block"
                }else{
                container.innerHTML = ""
                bodyTable = document.getElementById("bodyTable")
                bodyTable.innerHTML = ""
                for(let i = 0; i<response.length; i++){
                  /*
                mex = document.createElement("div")
                mex.classList = ["entryRow"]
                mex.setAttribute("id",response[i]["cn"])
                mex.innerHTML =  " &nbsp Gruppo: " + response[i]["cn"];
                container.appendChild(mex)*/

                this.containerGroupInfo.style.display = "none"
                this.containerGroups.style.display = "block"


                tr = document.createElement("tr")
                tr.innerHTML = '\
                <td>\
                 <img src="./assets/images/group-users.png" alt>\
                 <a href="#" class="user-link">'+response[i]["cn"]+'</a>\
                 </td>\
                <td style="width: 20%;">';
               
                td = document.createElement("td")
                td.setAttribute("style","width: 20%;")
                aButton = document.createElement("a")
                aButton.setAttribute("href","#")
                aButton.classList = ["table-link","infoButton"]
                aButton.setAttribute("cn",response[i]["cn"])
                aButton.innerHTML = '<span class="fa-stack" cn="'+response[i]["cn"]+'" >\
                <i class="fa fa-square fa-stack-2x" cn="'+response[i]["cn"]+'" ></i>\
                <i class="fa fa-search-plus fa-stack-1x fa-inverse" cn="'+response[i]["cn"]+'" ></i>\
                </span>'
                
               
          this.aButton.addEventListener("click",async (event)=>{
          
          this.containerGroups.style.display = "none"

          console.log("utente selezionato: ", event.target.getAttribute("cn"))

          cn = event.target.getAttribute("cn")

          //devo fare la query con cn quell'id
          query = "cn="+event.target.getAttribute("cn")

          response = await fetch("http://localhost:8083/searchGroup?query="+query);
          
          response_mex = await response.json();

          this.containerGroupInfo.innerHTML = ""
         
          for(let i = 0; i< response_mex.length; i++){

              mex = document.createElement("div")
            
              if(response_mex[i].type == "cn")
                  mex.setAttribute("id",response_mex[i].value)


              if(response_mex[i].type == "member"){
                //mex.innerHTML = mex.innerHTML + "<br>"
                for(let j = 0; j< response_mex[i].value.length; j++){
                  if(response_mex[i].value[j].length >0){
                  mex = document.createElement("div")
                  mex.innerHTML =  '<div class="row">\
                  <div class="col-sm-3">\
                    <h6 class="mb-0" style="font-size: 29px;text-transform: uppercase;margin-bottom: 3px;">'+response_mex[i].type+'</h6>\
                  </div>\
                  <div class="col-sm-9 text-secondary">\
                   ' + response_mex[i].value[j]+'  \
                  <button class="deleteMemberOfBtnForStyle" style="border: none; background-color: white; cursor: pointer"> <img src="./assets/images/delete.png" class="deleteMemberOfBtn" cnMember="'+response_mex[i].value[j]+'"> </button>\
                  </div>\
                </div>\
                <hr></hr>'
                this.containerGroupInfo.appendChild(mex)
                  }
                }

            }else{
              mex.innerHTML =  '<div class="row">\
              <div class="col-sm-3">\
                <h6 class="mb-0" style="font-size: 29px;text-transform: uppercase;margin-bottom: 3px;">'+response_mex[i].type+'</h6>\
              </div>\
              <div class="col-sm-9 text-secondary">\
               ' + response_mex[i].value+' \
              </div>\
            </div>\
            <hr></hr>'
            this.containerGroupInfo.appendChild(mex)}
              //this.containerGroupInfo.appendChild(mex)
          }
         
        
       
         mexButton = document.createElement("div")
         mexButton.innerHTML =  '<a href="#" class="table-link">\
                        <span class="fa-stack">\
                        <i class="fa fa-square fa-stack-2x"></i>\
                        <i class="fa fa-arrow-left fa-stack-1x fa-inverse"></i></span>\
                        </a><hr>'
        
         mexButton.addEventListener("click", async ()=>{
          // await fetch("http://localhost:8083/modifyUser");
          this.containerGroupInfo.style.display = "none"
          this.containerGroups.style.display = "block"
         //history.back();
       })
         this.containerGroupInfo.appendChild(mexButton)

         
         mexButtonEdit = document.createElement("div")
         /*
         mexButtonEdit.innerHTML =  '<div class="row">\
         <div class="col-sm-12">\
           <a class="btn btn-info href="#" "><input type="text" id="inputNewMember" placeholder="CF NUOVO MEMBRO"><button id="btnAddMember" cn="'+cn+'">AGGIUNGI MEMBRO</button></a>\
         </div>\
         </div>'*/
         mexButtonEdit.innerHTML =  '<div class="row">\
         <div class="col-sm-12">\
           <a class="btn btn-info href="#" "><input type="text" id="inputNewMember" placeholder="CF NUOVO MEMBRO" style="border: none; outline: none;"> <a href="#" class="table-link editButton" id="btnAddMember" cn="'+cn+'">AGGIUNGI</a>\
         </div>\
         </div>'
       
        
         this.containerGroupInfo.appendChild(mexButtonEdit)

        deleteButton = document.createElement("div")
        deleteButton.innerHTML = '<hr><div class="row"><div class="col-sm-12"><a class="btn btn-info href="#" style="margin-top: 3rem" ><a href="#" class="table-link editButton" id="btnDeleteGroup" style="background-color: red">ELIMINA GRUPPO</a></div></div><hr>'
        this.containerGroupInfo.appendChild(deleteButton)

        /* invoco l'API che permette l'eliminazione di quel gruppo */
        deleteButton.addEventListener("click", async ()=>{
          console.log("voglio eliminare il gruppo "+ cn)

          attributes = [];
          attributes.push('{ "cn": "'+cn+'"} ')

          response = await fetch('http://localhost:8083/deleteGroup', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(attributes)
          });

          
          const content = await response.text();
          if(content=="Ok"){
            alert("Eliminazione gruppo ok")
          }else{
             alert("Errore")
          }

        })

         buttonAddMember = document.getElementById("btnAddMember")
         inputNewMember = document.getElementById("inputNewMember")
         this.buttonAddMember.addEventListener("click", async ()=>{
          
                       info = []

                       // credentials.push('{ "cf": "'+this.codiceFiscaleInput.value+'"} ')
                        info.push('{ "cnGroup": "'+cn+ '"} ')
                        info.push('{ "cnMember": "'+ this.inputNewMember.value + '"} ')
                    
                        response = await fetch('http://localhost:8083/addMember', {
                            method: 'POST',
                            headers: {
                              'Accept': 'application/json',
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(info)
                          });

                          const content = await response.text();
                          //console.log(content)
                
                
                          //lo potrei fare con una nuova richiesta get dove mando il mio cn
                         if(content=="Ok"){
                            alert("Salvataggio Membership Riuscito")
                          }else{
                           this.loginError.style.display = "block"
                          }
         })

          this.containerGroupInfo.style.display = "block"
            //prendo tutti i bottoni di tipo member of delete

      deleteMemberOfBtnList = document.getElementsByClassName("deleteMemberOfBtn")

      for(btn of deleteMemberOfBtnList){
        console.log("aaa")
        btn.addEventListener("click",async ()=>{
            
            //qui devo fare richiesta quello che modifica member e memberof

            //richiesta di tipo post

            info = []

            cnMember = this.event.target.getAttribute("cnMember").split(",")[0]
            cnMember = cnMember.split("=")[1]
            
            // credentials.push('{ "cf": "'+this.codiceFiscaleInput.value+'"} ')
            // info.push('{ "cnGroup": "cn='+this.cn.replace(/\s/g, '')+',ou=Gruppi Locali,dc=unict,dc=ad"} ')
            info.push('{ "cnGroup": "cn='+this.cn +',ou=Gruppi Locali,dc=unict,dc=ad"} ')
             info.push('{ "cnMember":"'+cnMember+ '"} ')
            
         
             response = await fetch('http://localhost:8083/modifyMembership', {
                 method: 'POST',
                 headers: {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json'
                 },
                 body: JSON.stringify(info)
               });

               const content = await response.text();
              
     
               
               //lo potrei fare con una nuova richiesta get dove mando il mio cn
              if(content=="Ok"){
                 alert("Rimozione dal gruppo riuscita")
               }else{
                this.loginError.style.display = "block"
               }
           })
        }

      })

      td.appendChild(aButton)
      tr.appendChild(td)
      bodyTable.appendChild(tr)


      this.containerGroupInfo.style.display = "none"
      this.container.style.display = "block"
        
                }
            }
    })

/* vado nella pagina di aggiunta dei gruppi */
this.buttonAddGroup.addEventListener("click",()=>{
  location.href = "http://localhost:8083/newGroup"
})

this.buttonAddUser.addEventListener("click",  ()=>{
  location.href = "http://localhost:8083/newUser"
})

this.filterClearButton.addEventListener("click",()=>{
  this.queryInput.value = ""
})

this.homeButton.addEventListener("click",()=>{
  location.href = "http://localhost:8083/intro"
})

this.usersSectionButton.addEventListener("click",()=>{
  location.href = "http://localhost:8083/userSection"
})

this.groupsSectionButton.addEventListener("click",()=>{
  location.href = "http://localhost:8083/groupSection"
})
}


menu = document.getElementById("menu");
openMenu = document.getElementById("openMenu")
closeMenu = document.getElementById("closeMenu")
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