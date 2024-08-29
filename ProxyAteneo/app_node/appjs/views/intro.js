window.onload = ()=>{

    userSection = document.getElementById("usersSection")
    groupSection = document.getElementById("groupsSection")


    this.userSection.addEventListener("click", ()=>{
        location.href = "http://localhost:8083/userSection"
    })


    this.groupSection.addEventListener("click", ()=>{
        location.href = "http://localhost:8083/groupSection"
    })


    
}