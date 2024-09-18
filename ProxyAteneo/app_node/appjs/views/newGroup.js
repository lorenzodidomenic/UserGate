window.onload = ()=>{



    inputNameGroup = document.getElementById("nameInput")
    cardBody = document.getElementById("card-body")
    bottonNewUser = document.getElementById("bottonNewUser")
    buttonSaveGroup = document.getElementById("bottonSave")
    openMenu = document.getElementById("openMenu")
    closeMenu = document.getElementById("closeMenu")
    homeButton = document.getElementById("homeButton")
    usersSectionButton = document.getElementById("usersSectionButton")
    groupsSectionButton = document.getElementById("groupsSectionButton")
    menu = document.getElementById("menu");
    logoutButton = document.getElementById("logoutButton")

    this.bottonNewUser.addEventListener("click", ()=>{

        newRow = document.createElement("div")
        newRow.setAttribute("class","row")
        newRow.innerHTML = '<div class="col-sm-3"><h6 class="mb-0">CF UTENTE</h6></div><div class="col-sm-9 text-secondary CfMember" contenteditable="true" aria-placeholder="nome" style="border: none; outline: none"></div>';

        cardBody.appendChild(newRow);
    })


    this.buttonSaveGroup.addEventListener("click", async ()=>{

        console.log("Voglio salvare gruppo",inputNameGroup.innerHTML)

       
        //faccio richiesta all'api che salva il gruppo (lo dovrà salvare sia in mdb che in ldap)

        membersInput = document.getElementsByClassName("CfMember")
        members = []

        attributes = [];
        attributes.push('{ "cn": "'+this.inputNameGroup.innerHTML+'"}')
        for(memberInput of membersInput){
            attributes.push('{ "member": "'+memberInput.innerHTML+'"}')
        }
        console.log(attributes)
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
           /* inputNameGroup.remove();
            buttonSaveGroup.remove();
            this.buttonAddUser.style.display ="inline-block"
            this.buttonAddGroup.style.display ="inline-block"
            this.buttonBack.remove();*/
          }else{
            alert("Errore nel salvataggio")
           /*this.loginError.style.display = "block"
            this.buttonAddUser.style.display ="inline-block"
            this.buttonAddGroup.style.display ="inline-block"
            this.buttonBack.remove();
           inputNameGroup.remove();
      buttonSaveGroup.remove();*/
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