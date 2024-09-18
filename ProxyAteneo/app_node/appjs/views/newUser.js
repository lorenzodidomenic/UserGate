window.onload = ()=>{


    nameInput = document.getElementById("nameInput")
    telephoneInput = document.getElementById("telephoneInput")
    surnameInput = document.getElementById("surnameInput")
    emailInput = document.getElementById("emailInput")
    saveButton = document.getElementById("bottonSave")
    openMenu = document.getElementById("openMenu")
    closeMenu = document.getElementById("closeMenu")
    homeButton = document.getElementById("homeButton")
    usersSectionButton = document.getElementById("usersSectionButton")
    groupsSectionButton = document.getElementById("groupsSectionButton")
    menu = document.getElementById("menu");
    logoutButton = document.getElementById("logoutButton")


    this.saveButton.addEventListener("click", async ()=>{

        console.log("voglio salvare nuovo utente ", this.nameInput.innerHTML, this.telephoneInput.innerHTML, this.surnameInput.innerHTML,this.emailInput.innerHTML)


        attributes = [];
        attributes.push('{ "cn": "'+this.nameInput.innerHTML+'"} ')
        attributes.push('{ "sn": "'+this.surnameInput.innerHTML+'"} ')
        attributes.push('{ "telephoneNumber": "'+this.telephoneInput.innerHTML+'"} ')
        attributes.push('{ "email": "'+this.emailInput.innerHTML+'"} ')
        attributes.push('{ "givenName": "'+this.nameInput.innerHTML+'"} ')

        response = await fetch('http://localhost:8083/saveUser', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(attributes)
          });

          
          const content = await response.text();
          if(content=="Ok"){
            alert("Salvataggio Nuovo Utente Riuscito")
          }else{
             alert("Errore")
          }
              
    })


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
}