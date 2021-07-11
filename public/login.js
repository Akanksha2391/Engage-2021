const loginbtn = document.getElementById("login-btn");
   const loginInput = document.getElementById("username");
   const loginfrm = document.getElementById("login-form");
   
   

   
   
   loginfrm.addEventListener('submit', getUser);
   
   function getUser(e) {
     console.log('got the mssg')
     console.log(e)
     e.preventDefault();
     const text = loginInput.value;
    
     console.log(text)
   
       if(!text.trim()) return alert('Please enter username'); //no msg submitted
       loginInput.value = "";
       
   }