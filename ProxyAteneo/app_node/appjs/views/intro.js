window.onload = ()=>{

    userSection = document.getElementById("usersSection")
    groupSection = document.getElementById("groupsSection")
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


    this.userSection.addEventListener("click", ()=>{
        location.href = "http://localhost:8083/userSection"
    })


    this.groupSection.addEventListener("click", ()=>{
        location.href = "http://localhost:8083/groupSection"
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