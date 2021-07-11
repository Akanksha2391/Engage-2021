
function createUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
     var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
     return v.toString(16);
  });
}

let  user = sessionStorage.getItem('username')


var firebaseConfig = {
  apiKey: "AIzaSyAErXkZ-Cb9QlTLEIx5H8NNPBdOuRiioZU",
  authDomain: "teams-clone-33d91.firebaseapp.com",
  databaseURL: "https://teams-clone-33d91-default-rtdb.firebaseio.com",
  projectId: "teams-clone-33d91",
  storageBucket: "teams-clone-33d91.appspot.com",
  messagingSenderId: "788053874720",
  appId: "1:788053874720:web:5a27599e15aea872c00445",
  measurementId: "G-170FRLT612"
  };
  // Initialize Firebase
   firebase.initializeApp(firebaseConfig);
   const db = firebase.database();

   let current_roomid
   let roomids = []



   // ************************************************************************/
   const participantRef = db.ref("/paricipant/"+user+"/room");

   //console.log(participantRef)
   
   
   const createRoomFrm = document.getElementById("create-room");
   const createRoomInput = document.getElementById("create-room-id")
   const joinRoomFrm = document.getElementById("join-room");
   const joinRoomId = document.getElementById("join-room-id")
   const joinRoomName = document.getElementById("join-room-name")

   console.log(createRoomFrm)
   console.log("hiii create a room u idiot")

   
   createRoomFrm.addEventListener('submit', createRoom);


   function createRoom(e)
   {
    console.log('got the create room request')
    console.log(e)
    e.preventDefault();
    const text = createRoomInput.value;
    console.log(text)
  
      if(!text.trim()) return alert('Please enter room name'); //no msg submitted

      const roomid = createUUID();
      const msg = {
        room: text,
        roomid : roomid
      }
      console.log(msg)
  
      participantRef.push(msg);
      createRoomInput.value = "";

   }

   joinRoomFrm.addEventListener('submit',joinRoom)

   function joinRoom(e){
    console.log('got the join room request')
    console.log(e)
    e.preventDefault();
    const id = joinRoomId.value;
    const roomname = joinRoomName.value;
    console.log(id,roomname)
  
      if(!roomname.trim()) return alert('Please enter room name '); 
      if(!id.trim()) return alert('Please enter room id ');//no msg submitted

      //const roomid = createUUID();
      const msg = {
        room: roomname,
        roomid : id
      }
      console.log(msg)
  
      participantRef.orderByChild("roomid").equalTo(id).once('value').then( async (snapshot)=>  {
      
        if(!snapshot.exists()){
          participantRef.push(msg);
        }
      })

      createRoomInput.value = "";

   }



 

  /***********************************************************************************/


//let user_name = 'ak';
const msgScreen = document.getElementById("chat-messages");
const msgForm = document.getElementById("messageForm");
const msgInput = document.getElementById("msg-input");
const msgBtn = document.getElementById("msg-btn");

console.log('hii from chat.js')
console.log(user)





//to store data in the msgs folder by creating a reference in database


let name="akku";
// function init() {
//   name = prompt("Please enter your name");
// }
// document.addEventListener('DOMContentLoaded', init);


msgForm.addEventListener('submit',sendMessage);

let msgRef



function sendMessage(e){
   
    console.log('got the mssg')
    console.log(e)
    e.preventDefault();
    const text = msgInput.value;
    console.log(text)
  
      if(!text.trim()) return alert('Please type a message'); //no msg submitted
      const msg = {
          name: user,
          text: text
      };
  
      msgRef.push(msg);
      msgInput.value = "";
  }

  


  const updateMsgs = data =>{
    console.log(data.val())
    const {name, text} = data.val(); //get name and text
    console.log(name)
  
    //load messages, display on left if not the user's name. Display on right if it is the user.
    const msg = `<div class="message">
  <p class="meta">${name}</p>
  <p class="text">
    ${text}
  </p>
</div>`
  
    
    
    
    // const msg = `<li class="${dataName == name ? "msg my": "msg"}"><span class = "msg-span">
    //   <i class = "name">${name}: </i>${text}
    //   </span>
    // </li>`
  
    msgScreen.innerHTML += msg; //add the <li> message to the chat window
  
    //auto scroll to bottom
    document.getElementById("chat-messages").scrollTop = document.getElementById("chat-messages").scrollHeight;
  }

  


  /******************************************************************************* */


  // const loginbtn = document.getElementById("login-btn");
  //  const loginInput = document.getElementById("username");
  //  const loginfrm = document.getElementById("login-form");
   
   
  //  let user = "";
   
   
  //  loginfrm.addEventListener('submit', getUser);
   
  //  function getUser(e) {
  //    console.log('got the mssg')
  //    console.log(e)
  //    //e.preventDefault();
  //    const text = loginInput.value;
  //    user = text;
  //    console.log(text)
   
  //      if(!text.trim()) return alert('Please enter username'); //no msg submitted
  //      loginInput.value = "";
       
  //  }

   /***************************************************************************** */

   let body = document.getElementById("body")


   
   body.addEventListener('onload',addrooms)

   function addrooms(){
     console.log('tum gadhi ho')
     let count = 0;
    //participantRef = db.ref('/paricipant/'+userId+'/room');
    participantRef.once('value', (snapshot) => {
        const data = snapshot.val();
      console.log(data)
        for(let x in data){
            let y = data[x]
                {
                  const text = `<li><button class = "room-list" onclick = loadchat(${count}) >${y['room']}:</button>
                  <span>${y['roomid']}</span>
                  </li>
                  <hr> `

                  roomids.push(y['roomid'])

                  document.getElementById("rooms").innerHTML += text;
                  count +=1;
                    
                }
                // if(z==='roomid'){
                //     roomid.push(y[z])
                // }
            
        }
        //console.log(room)
      });
   }

   function loadchat(x){


    while (msgScreen.hasChildNodes()) {  
      msgScreen.removeChild(msgScreen.firstChild);
    }
     console.log(x)
    current_roomid = roomids[x];
    sessionStorage.setItem('current_roomid',current_roomid);
    
   
    msgRef = db.ref('/'+current_roomid); 
    msgRef.on('child_added', updateMsgs);
    document.getElementById('join').style.visibility = 'visible';
    document.getElementById('room').style.visibility = 'visible';

   }


   /************************************************************8 */

   document.getElementById('logout-form').addEventListener('submit',clearstorage)

   function clearstorage()
   {
    console.log('clearing session') 
    sessionStorage.clear();
   }
   document.getElementById('create-room-btn').addEventListener('click',()=>{
     location.reload();
   })
   $('#join-room-btn').click(function() {
   $('#joinRoom').modal('hide');
   })

   

  



  





  



