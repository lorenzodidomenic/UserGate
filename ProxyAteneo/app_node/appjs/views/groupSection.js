window.onload = ()=>{

    nameInput = document.getElementById("filterGroupName");
    buttonFilter = document.getElementById("filterButton")
    buttonFilterClear = document.getElementById("filterClearButton")
    buttonSearch = document.getElementsByClassName("button")
    queryInput = document.getElementById("queryInput")
    container = document.getElementById("container")
    searchContainer = document.getElementById("searchContainer")
    containerGroupInfo=document.getElementById("containerGroupInfo")
    buttonAddGroup = document.getElementById("addGroup")
    addMember = document.getElementById("addMember")
    saveMemberButton = document.getElementById("saveMember")
    dnMember = document.getElementById("dnMember")

    this.buttonFilter.addEventListener("click",()=>{

        if(this.nameInput.value != null){

            this.queryInput.value = "cn="+this.nameInput.value
        }
    })


    //poi aggiungo che al click del bottone funziona come gli utenti
    async function f(){


        /* prendo il contenuto del form e  lo metto come parametro della query */

        query = this.queryInput.value

        /*qui dovrei sostituire & se è presente con %26*/
        query = query.replace("&","%26")

        //la richiesta la devo fare sui gruppi
        response = await fetch("http://localhost:8083/searchGroups?query="+query);
       
        response_mex = await response.json()

        return response_mex;
    }

    this.buttonSearch[0].addEventListener("click", async ()=>{
        
                response =  await f();

                this.container.innerHTML = ""

               
                if(response.length == 0){
                mex = document.createElement("div")
                mex.classList = ["entryRow"]
                mex.innerHTML = "Nessun Gruppo Esistente";
                container.appendChild(mex)

                this.containerUserInfo.style.display = "none"
                this.container.style.display = "block"
                }else{
                for(let i = 0; i<response.length; i++){
                mex = document.createElement("div")
                mex.classList = ["entryRow"]
                mex.setAttribute("id",response[i]["cn"])
                mex.innerHTML =  " &nbsp Gruppo: " + response[i]["cn"];
                container.appendChild(mex)

                this.containerGroupInfo.style.display = "none"
                this.container.style.display = "block"


                mex.addEventListener("click",async ()=>{
                    console.log("gruppo selezionato: ", event.target.getAttribute("id"))

                    cn = event.target.getAttribute("id")

                    //devo fare la query con cn quell'id
                    query = "cn="+event.target.getAttribute("id")

                    //la ricerca su quel gruppo 
                    response = await fetch("http://localhost:8083/searchGroup?query="+query);
                    
                    response_mex = await response.json();

                    console.log(response_mex)
                    
                    this.containerGroupInfo.innerHTML = ""
                    for(let i = 0; i< response_mex.length; i++){
                        mex = document.createElement("div")
                        mex.classList = ["entryRow"]
                        if(response_mex[i].type == "cn")
                        mex.setAttribute("id",response_mex[i].value)

                        //se il response_mex[i].type = member of metto a capo
                        mex.innerHTML = "<span>"+response_mex[i].type + ":"

                        if(response_mex[i].type == "member"){
                            //mex.innerHTML = mex.innerHTML + "<br>"
                            for(let j = 0; j< response_mex[i].value.length; j++){
                                if(j != response_mex[i].value.length-1)
                                mex.innerHTML = mex.innerHTML + response_mex[i].value[j] + "<br> member: "
                                else
                                mex.innerHTML = mex.innerHTML + response_mex[i].value[j] 
                            }
                        }else{
                            mex.innerHTML = "<span>"+response_mex[i].type + ":"+ response_mex[i].value 
                        }
                       mex.innerHTML = mex.innerHTML +  "</span>"//+ "<div> <button id='modifyBtn' type='"+response_mex[i].type+"'><img src='./assets/images/pencil.png'></button> <button id='deleteBtn' ><img src='./assets/images/bin.png'></button> </div>" 

                        /* dovrei creare bottone, metterlo come figlio della riga e settargli gli attributi che mi servono per la modifica
                        buttonSection = document.createElement("div")
                        buttonMod = document.createElement("button")
                        buttonMod.setAttribute("id","modifyBtn")
                        buttonMod.setAttribute("type",response_mex[i].type)
*/
                        this.containerGroupInfo.appendChild(mex)
                    }
                    
                    container.style.display = "none"
                    buttonSection = document.createElement("div")
                    buttonSection.style.textAlign = "center" 
                    buttonMod = document.createElement("button")
                   // buttonMod.innerHTML = "<img src='./assets/images/pencil.png'>"
                    buttonMod.innerHTML = "AGGIUNGI MEMBRO"
                    buttonMod.setAttribute("id","modifyBtn")
                    buttonMod.setAttribute("cn",cn)

                    //al click su questo bottone mi porta su un altra pagina che contiene dettagli utente modificabili
                    buttonMod.addEventListener("click", async ()=>{
                       // await fetch("http://localhost:8083/modifyUser");
                      // location.href = "http://localhost:8083/modifyUser?cn="+cn


                      //fa spuntare input di cn dove permette di aggiungere membro
                      this.addMember.style.display = "block"
                      this.saveMemberButton.setAttribute("cn",buttonMod.getAttribute("cn"))

                      this.saveMemberButton.addEventListener("click",async ()=>{
                        console.log("Voglio aggiungere", this.dnMember.value, "al gruppo", this.event.target.getAttribute("cn"))


                        //faccio richiesta all'api mandandogli il codice fiscale

                        info = []

                       // credentials.push('{ "cf": "'+this.codiceFiscaleInput.value+'"} ')
                        info.push('{ "cnGroup": "'+ this.event.target.getAttribute("cn")+ '"} ')
                        info.push('{ "cnMember": "'+ this.dnMember.value + '"} ')
                    
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
                  
                    })
                    buttonSection.appendChild(buttonMod)
                    this.containerGroupInfo.appendChild(buttonSection)

                    this.containerGroupInfo.style.display = "block"

                    this.queryInput.value = ""
                    /*
                    container.style.display = "none"

                    this.containerUserInfo.innerHTML = ""
                    userInfo = document.createElement("div")

                    userInfo.innerHTML = response_mex

                    containerUserInfo.appendChild(userInfo)

                    
                    */
                })
                }
            }
    }
)


this.buttonAddGroup.addEventListener("click",()=>{

    this.containerGroupInfo.style.display = "none"


    inputNameGroup = document.createElement("input")
    buttonSaveGroup = document.createElement("button")
    buttonSaveGroup.innerHTML = "Salva Gruppo"
    this.inputNameGroup.setAttribute("id","inputNameGroup")
    this.buttonSaveGroup.setAttribute("id","buttonSaveGroup")


    this.buttonSaveGroup.addEventListener("click",async ()=>{
        console.log("Voglio salvare gruppo",this.inputNameGroup.value)

    
        //faccio richiesta all'api che salva il gruppo (lo dovrà salvare sia in mdb che in ldap)


        attributes = [];
        attributes.push('{ "cn": "'+this.inputNameGroup.value+'"} ')
        
        response = await fetch('http://localhost:8083/saveGroup', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(attributes)
          });

          const content = await response.text();
          //console.log(content)


          //lo potrei fare con una nuova richiesta get dove mando il mio cn
         if(content=="Ok"){
            alert("Salvataggio Gruppo Riuscito")
          }else{
           this.loginError.style.display = "block"
          }
    })

    this.searchContainer.appendChild(inputNameGroup)
    this.searchContainer.appendChild(buttonSaveGroup)

    this.container.style.display = "block"


})
}