window.onload = ()=>{


    entries = document.getElementsByClassName("entrySpanInfo")
    saveButton = document.getElementById("bottonSave")
    /* lista dei bottoni che servono per rimuovere da member of*/
    deleteMemberOfBtnList = document.getElementsByClassName("deleteMemberOfBtn")
    cn = undefined;
    buttonAddGroup = document.getElementById("addGroupButton")
    selectGroups = document.getElementById("standard-select")
    backButton = document.getElementById("backButton")
    logoutButton = document.getElementById("logoutButton")
    openMenu = document.getElementById("openMenu")
    closeMenu = document.getElementById("closeMenu")
    homeButton = document.getElementById("homeButton")
    usersSectionButton = document.getElementById("usersSectionButton")
    groupsSectionButton = document.getElementById("groupsSectionButton")
    menu = document.getElementById("menu");

    function closemenu(){
      menu.style.top = "-100vh"
  }

  function openmenu(){
      menu.style.top = "17%"
  }



    for(entry of entries){
        if(entry.getAttribute("id") == "cn")   //tra tutte le entries prendo quella che settato id il cn e ad esso setto il cn
            this.cn = entry.innerHTML
    }

    this.saveButton.addEventListener("click", async ()=>{

        modifiedAttributes = []

        for(entry of entries){

            if(entry.getAttribute("id") == "cn")
                this.cn = entry.innerHTML


            if(entry.getAttribute("id")!= "MEMBEROFGROUP") //perche member of li rimuovo con rimuovi
            modifiedAttributes.push('{ "'+ entry.getAttribute("id") +'" : "'+ entry.innerHTML+ '"}')
            //devo mandare all'api quelle entries entry.innerHtml

        }

        
        response = await fetch('http://localhost:8083/modifyUserAttributes', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(modifiedAttributes)
            });

            
            const content = await response.text();
            if(content=="Modifica ok"){
                alert("Modifica utente effettuata")
            }


        })


    for(btn of deleteMemberOfBtnList){
        
        btn.addEventListener("click",async ()=>{
            
            //qui devo fare richiesta quello che modifica member e memberof

            //richiesta di tipo post

            info = []

            // credentials.push('{ "cf": "'+this.codiceFiscaleInput.value+'"} ')
             info.push('{ "cnGroup":"'+ this.event.target.getAttribute("cn")+'"} ')
            // info.push('{ "cnMember":"'+ this.cn.replace(/\s/g, '')+ '"} ')
            info.push('{ "cnMember":"'+ this.cn+ '"} ')

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

        this.buttonAddGroup.addEventListener("click",async ()=>{

            info = []
    
            info.push('{ "cnGroup": "'+ this.selectGroups.value + '"} ')
            info.push('{ "cnMember": "'+this.cn + '"} ')
        
            response = await fetch('http://localhost:8083/addMember', {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(info)
              });
    
              const content = await response.text();
    
              if(content=="Ok"){
                alert("Aggiunta al gruppo riuscita")
              }else{
               this.loginError.style.display = "block"
              }
    })


    this.backButton.addEventListener("click", async ()=>{
      //location.href= "http://localhost:8083/userSection"
      //history.back();
      history.go(-2)
   })


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


  }
       
  


