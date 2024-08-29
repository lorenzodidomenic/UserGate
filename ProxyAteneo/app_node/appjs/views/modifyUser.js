window.onload = ()=>{


    entries = document.getElementsByClassName("entrySpanInfo")
    saveButton = document.getElementById("saveBtn")
    /* lista dei bottoni che servono per rimuovere da member of*/
    deleteMemberOfBtnList = document.getElementsByClassName("deleteMemberOfBtn")
    cn = undefined;

    for(entry of entries){
        if(entry.getAttribute("id") == "cn")
            this.cn = entry.innerHTML
    }

    this.saveButton.addEventListener("click", async ()=>{

        modifiedAttributes = []

        for(entry of entries){
            if(entry.getAttribute("id") == "cn")
                this.cn = entry.getAttribute("id")


            if(entry.getAttribute("id")!= "MEMBEROFGROUP") //perche member of li rimuovo con rimuovi
            modifiedAttributes.push('{ "'+ entry.getAttribute("id") +'" : "'+ entry.innerHTML+ '"}')
            //devo mandare all'api quelle entries entry.innerHtml

        }

        

        console.log(modifiedAttributes)

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
        console.log(btn)
        btn.addEventListener("click",async ()=>{
            console.log("Ho premuto uno dei bottoni rimuovi")
            console.log(this.event.target.getAttribute("cn"))
            

            //qui devo fare richiesta quello che modifica member e memberof

            //richiesta di tipo post

            info = []

            // credentials.push('{ "cf": "'+this.codiceFiscaleInput.value+'"} ')
             info.push('{ "cnGroup": "'+ this.event.target.getAttribute("cn")+ '"} ')
             info.push('{ "cnMember": "'+ this.cn+ '"} ')
         
             response = await fetch('http://localhost:8083/modifyMembership', {
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
                 alert("Salvataggio Gruppo Riuscito")
               }else{
                this.loginError.style.display = "block"
               }
           })
        }
    }
       
  
