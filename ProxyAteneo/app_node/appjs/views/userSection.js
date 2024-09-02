
window.onload= ()=>{

    btn = document.getElementsByClassName("button")
    container = document.getElementById("container")
    searchContainer = document.getElementById("searchContainer")
    queryInput = document.getElementById("queryInput")
    containerUserInfo=document.getElementById("containerUserInfo")
    filterName = document.getElementById("filterName")
    filterSurname = document.getElementById("filterSurname")
    filterCf = document.getElementById("filtercf")
    filterGroup = document.getElementById("filterGroup")
    filterButton = document.getElementById("filterButton")
    filterClearButton = document.getElementById("filterClearButton")
    


    async function f(){


        /* prendo il contenuto del form e  lo metto come parametro della query */

        query = this.queryInput.value

        /*qui dovrei sostituire & se è presente con %26*/
        query = query.replace("&","%26")

        response = await fetch("http://localhost:8083/search?query="+query);
       
        response_mex = await response.json()

        return response_mex;
    }

    btn[0].addEventListener("click", async ()=>{
        
                response =  await f();

                this.container.innerHTML = ""

                console.log(response.length)
                if(response.length == 0){
                mex = document.createElement("div")
                mex.classList = ["entryRow"]
                mex.innerHTML = "Nessun Utente Esistente";
                container.appendChild(mex)

                this.containerUserInfo.style.display = "none"
                this.container.style.display = "block"
                }else{
                for(let i = 0; i<response.length; i++){
                mex = document.createElement("div")
                mex.classList = ["entryRow"]
                mex.setAttribute("id",response[i]["cn"])
                mex.innerHTML = response[i]["sn"] + " &nbsp" + response[i]["givenName"] + " &nbsp" + response[i]["cn"];
                container.appendChild(mex)

                this.containerUserInfo.style.display = "none"
                this.container.style.display = "block"


                mex.addEventListener("click",async ()=>{
                    console.log("utente selezionato: ", event.target.getAttribute("id"))

                    cn = event.target.getAttribute("id")

                    //devo fare la query con cn quell'id
                    query = "cn="+event.target.getAttribute("id")

                    response = await fetch("http://localhost:8083/searchUser?query="+query);
                    
                    response_mex = await response.json();

                    console.log(response_mex)
                    divHiden = document.createElement("div")
                    
                    this.containerUserInfo.innerHTML = ""
                    for(let i = 0; i< response_mex.length; i++){
                        mex = document.createElement("div")
                        mex.classList = ["entryRow"]
                        console.log(response_mex[i].type)
                        if((response_mex[i].type == "cn") || (response_mex[i].type == "MEMBEROFGROUP") || (response_mex[i].type == "sn") || (response_mex[i].type == "givenName")){
                        if(response_mex[i].type == "cn")
                        mex.setAttribute("id",response_mex[i].value)

                        //se il response_mex[i].type = member of metto a capo
                        mex.innerHTML = "<span>"+response_mex[i].type + ":"

                        if(response_mex[i].type == "MEMBEROFGROUP"){
                            //mex.innerHTML = mex.innerHTML + "<br>"
                            for(let j = 0; j< response_mex[i].value.length; j++){
                                if(j != response_mex[i].value.length-1)
                                mex.innerHTML = mex.innerHTML + response_mex[i].value[j] + "<br>  MEMBEROFGROUP: "
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

                       if(response_mex[i].local == true){
                            mex.setAttribute("local",true);
                       }
                        this.containerUserInfo.appendChild(mex)
                    }else{
                        console.log(response_mex[i].type)
                        mex.classList = ["entryRowHidden"]
                        mex.innerHTML = "<span>"+response_mex[i].type + ":"
                        mex.innerHTML = "<span>"+response_mex[i].type + ":"+ response_mex[i].value 
                        mex.innerHTML = mex.innerHTML +  "</span>"
                        divHiden.appendChild(mex)

                    }
                }
                    divHiden.setAttribute("id","othersAttribute")
                    mex = document.createElement("div")
                    mex.classList = ["entryRow"]
                    mex.innerHTML = "<span>  Altri attributi </span>"
                    divHiden.appendChild(mex)
                    containerUserInfo.appendChild(divHiden)

                    divHiden.addEventListener("click", ()=>{
                      mexHiddens = document.getElementsByClassName("entryRowHidden")
                      for(mex of mexHiddens){
                        console.log("mex")
                        if(mex.style.display == "none")
                        mex.style.display = "block"
                    else
                       mex.style.display = "none"
                      }
                   })
                    /*
                    mexBottonOthers = document.createElement("div")
                    mexBottonOthers.classList = ["entryRow"]
                    divHiden.appendChild(mexBottonOthers)
                    mexBottonOthers.innerHtml = "<span> Altri attributi </span>"
                    mexBottonOthers.setAttribute("id","bottonInfo")
                    this.containerUserInfo.appendChild(mexBottonOthers)*/

                    
                    container.style.display = "none"
                    buttonSection = document.createElement("div")
                    buttonSection.style.textAlign = "center" 

                    buttonMod = document.createElement("button")
                    buttonMod.innerHTML = "<img src='./assets/images/pencil.png'>"
                    buttonMod.setAttribute("id","modifyBtn")
                    buttonMod.setAttribute("cn",cn)
                    //al click su questo bottone mi porta su un altra pagina che contiene dettagli utente modificabili
                    buttonMod.addEventListener("click", async ()=>{
                       // await fetch("http://localhost:8083/modifyUser");
                       console.log("ooo");
                       location.href = "http://localhost:8083/modifyUser?cn="+cn
                    })
                    buttonSection.appendChild(buttonMod)

                    buttonSection2 = document.createElement("div")
                    buttonSection2.style.textAlign = "center" 
                    //per aggiungere un utente ad un gruppo locale
                    buttonAdd = document.createElement("button")
                    buttonAdd.innerHTML = "Aggiungi ad Un Gruppo"
                    buttonAdd.setAttribute("id","addGroupBtn")
                    buttonAdd.setAttribute("cn",cn)

                    buttonSection3 = document.createElement("div")
                    buttonSection3.style.textAlign = "center" 
                    let selectGroups = undefined;
                    //al click su questo bottone mi porta su un altra pagina che contiene dettagli utente modificabili
                    buttonAdd.addEventListener("click", async ()=>{
                       // await fetch("http://localhost:8083/modifyUser");
                       console.log("Voglio aggiungere lo studente",cn, "ad un gruppo")

                       //faccio richiesta all api di tutti i gruppi e faccio spuntare option con tutti i gruppi locali
                       //da quel valore faccio post per aggiungere utente a quel gruppo
                       response = await fetch("http://localhost:8083/searchGroups");
       
                       response_mex = await response.json()

                       console.log(response_mex)


                       selectGroups = document.createElement("select")
                       selectGroups.setAttribute("id","selectGroups")
                       selectGroups.setAttribute("name","group")

                       if(response_mex.length == 0){
                        console.log("Nessun gruppo esistete")
                        }else{
                        for(let i = 0; i<response_mex.length; i++){
                        console.log(response_mex[i]["cn"])

                        optionGroup = document.createElement("option")
                        optionGroup.setAttribute("value",response_mex[i]["cn"])
                        optionGroup.innerHTML = response_mex[i]["cn"]
                        selectGroups.appendChild(optionGroup)
                    }

                    buttonSection3.appendChild(selectGroups)


                    /* creo un bottone conferma aggiunta che permette di fare richiesta api per l'aggiunta al gruppo*/
                    buttonConfirm = document.createElement("button")
                    buttonConfirm.innerHTML = "SALVA"

                    this.buttonConfirm.addEventListener("click",async ()=>{

                        info = []

                        info.push('{ "cnGroup": "'+ this.selectGroups.value + '"} ')
                        info.push('{ "cnMember": "'+cn + '"} ')
                    
                        console.log(info)
                        
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

          //QUI IN BASE ALL'ERRORE DO UN ALERT
         if(content=="Ok"){
            alert("Salvataggio Riusctio")
            //location.href = "http://localhost:8083/searchUser?cn="+cn
            //dovrei fare pure location di search User con quelle cose

          }else{
           this.loginError.style.display = "block"
          }


                    })
                    buttonSection3.appendChild(buttonConfirm)
                }})
                    buttonSection2.appendChild(buttonAdd)
                   

                    this.containerUserInfo.appendChild(buttonSection)
                    this.containerUserInfo.appendChild(buttonSection2)
                    this.containerUserInfo.appendChild(buttonSection3)

                    this.containerUserInfo.style.display = "block"

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

this.filterButton.addEventListener("click",()=>{


    /* vado a riempire l'input del filtro per poi poter fare la query */

    //mi prendo l'input dei vari campi e se non è nullo vado a creare il filtro

    another = false;

    nameText = this.filterName.value;
    surnameText = this.filterSurname.value;
    cfText = this.filterCf.value;
    groupText = this.filterGroup.value;

    stringQuery = "";
    queryText = "";
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

    this.queryInput.value = stringQuery

    this.filterName.value = ""
    this.filterSurname.value = ""
    this.filterCf.value = ""
    this.filterGroup.value = ""

})


this.filterClearButton.addEventListener("click",()=>{
    this.queryInput.value = ""
})
}
