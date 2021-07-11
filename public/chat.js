
function createUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
     var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
     return v.toString(16);
  });
}

let  user = userId


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
  /*take room name and room id as input and create/join room */


   const participantRef = db.ref("/paricipant/"+user+"/room");

   const createRoomFrm = document.getElementById("create-room");
   const createRoomInput = document.getElementById("create-room-id")
   const joinRoomFrm = document.getElementById("join-room");
   const joinRoomId = document.getElementById("join-room-id")
   const joinRoomName = document.getElementById("join-room-name")


   
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



const msgScreen = document.getElementById("chat-messages");
const msgForm = document.getElementById("messageForm");
const msgInput = document.getElementById("msg-input");
const msgBtn = document.getElementById("msg-btn");






//to store data in the msgs folder by creating a reference in database



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
  
    //load messages
    const msg = `<div class="message">
  <p class="meta">${name}</p>
  <p class="text">
    ${text}
  </p>
</div>`
  
    
  
    msgScreen.innerHTML += msg; //add the <li> message to the chat window
  
    //auto scroll to bottom
    document.getElementById("chat-messages").scrollTop = document.getElementById("chat-messages").scrollHeight;
  }

  


  /******************************************************************************* */
  /* load the rooms on page load in which the user already exists */
/***************************************************************************** */

   let body = document.getElementById("body")


   
   body.addEventListener('onload',addrooms)

   function addrooms(){
     console.log('tum gadhi ho')
     let count = 0;
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

   

  



  





  



