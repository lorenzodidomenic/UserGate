window.onload = ()=>{
     

    //prendo le credenziali inserite dall'utente (codice fiscale e password ) e le mando al server
    codiceFiscaleInput = document.getElementById("codiceFiscaleInput")
    passwordInput = document.getElementById("passwordInput")
    loginButton = document.getElementById("loginButton")
    loginError = document.getElementById("LoginError")


    console.log(this.loginButton)
    this.loginButton.addEventListener("click", async ()=>{
       
      
     

        credentials = [];
        credentials.push('{ "cf": "'+this.codiceFiscaleInput.value+'"} ')
        credentials.push('{ "password": "'+this.passwordInput.value+'"} ')
        
        response = await fetch('http://localhost:8083/login', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              withCredentials: true
            },
            body: JSON.stringify(credentials)
          });

        
          const content = await response.text();
     
          console.log(response)
          console.log(response.headers)
          console.log(document.cookie)
          
          //lo potrei fare con una nuova richiesta get dove mando il mio cn
         if(content=="login Ok"){
          console.log("aaaa")
          location.href = "http://localhost:8083/intro"
          }else{
           this.loginError.style.display = "block"
          }


        //faccio una richiesta Api al server mandando questi valori e se bind con successo vado alla seconda pagina senno spunta errore
    })


}