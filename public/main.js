socket = io('/')


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


const roomId = sessionStorage.getItem('current_roomid');
//stun servers
let configuration = {

    iceServers: [
        {urls: "stun:stun.services.mozilla.com"},
        {urls: "stun:stun1.l.google.com:19302"},
      ]
}

//*****************global var**********************//

let localStream;
let peer1 = '';
let peer2 = '';
let creator = false;  //intially creator is set to false




// in the above one, again if creator is not true , peer1 wont be present.
//on getting ice candidates from ceator send it to peer2 and on getting ice candidates from peer2 send it to peer1



function OnICECandidate(event){
    console.log('ice candidate generated')
    if (event.candidate) {

        if(creator){
            console.log("emitted store candidate")
            socket.emit('store-candidate',{'candidate':event.candidate,'room':roomId})
        }
        else{
            console.log("emitted new candidate")
            socket.emit('new-candidate',{'candidate':event.candidate,'room':roomId})
        }
        

    }
}

//on getting media stream from peer add it to remote stream

function OnTrackFunction(event){
    console.log(event.streams[0]);
    console.log(creator);
    document.getElementById('remote-stream').srcObject = event.streams[0];
}



//on starting a call


async function startcall(){
    
    creator = true; //set creator true

    //get the local medai stream and add it to local-stream
    const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
    console.log(stream);
    document.getElementById('local-stream').srcObject = stream
    localStream = stream;

    socket.emit('join-room', {'room':roomId,'user':userId});  // creator joined room
    console.log(configuration)
    peer1 = new RTCPeerConnection(configuration);
    peer1.ontrack = OnTrackFunction; 
    peer1.onicecandidate = OnICECandidate ;
    

    //adding local stream

    
    
    console.log('local stream added')

    localStream.getTracks().forEach(track => peer1.addTrack(track,localStream));

    // define what to do when we start recieving tracks -->
    


}



//on getting answer from remote user set remote description

socket.on('answer',answer =>{
    peer1.setRemoteDescription(JSON.parse(answer))
})

//on new user create offer and set to local description and
//send it to remote peer
socket.on('new-user',function(){

    if(creator){
        console.log("neew user detected")
        peer1.createOffer().then(function(offer) {
            console.log(offer)
            peer1.setLocalDescription(offer);
            socket.emit('offer',{'off':JSON.stringify(offer),'room':roomId})
        })
        .catch(function(err) {
                console.log(err)
        });
    }
    
})

//add ice candidate of remote user

socket.on('peer-candidate',candidate => {
    //console.log('peer-candidate')
    if(creator){
        console.log('recieved ice candidates from peer')
        console.log(candidate)
        var iceCandidate = new RTCIceCandidate(candidate);
        peer1.addIceCandidate(iceCandidate)
        console.log(peer1.iceConnectionState)
    }

})




//***********************************************************************/


//on joining the call


async function joincall(){
    

    
    console.log(configuration)
    peer2 = new RTCPeerConnection(configuration);
    peer2.onicecandidate = OnICECandidate ;
    peer2.ontrack = OnTrackFunction; 
  
    
    //adding local stream

    const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
    console.log(stream);
    document.getElementById('local-stream').srcObject = stream;
    localStream = stream;

    console.log('local stream added - peer')

    localStream.getTracks().forEach(track => peer2.addTrack(track,localStream));

    socket.emit('join-room', {'room':roomId,'user':userId});
    // define what to do when we start recieving tracks -->
    
}





//add ice candidate of host

socket.on('add-candidate',candidate =>{
    if(!creator){
        console.log('recieved ice candidates from host')
        console.log(candidate);
        var iceCandidate = new RTCIceCandidate(candidate);
        peer2.addIceCandidate(iceCandidate)
        console.log('add-candidate')
        console.log(peer2.iceConnectionState)
    }
   
})



//on getting offer set remote description and
//answer the call with local description
socket.on('add-user',(data) =>{
    console.log('add-user')

    if(!creator){
        peer2.setRemoteDescription(JSON.parse(data.offer)).then(function() {
            peer2.createAnswer().then(function(answer) {
                return  peer2.setLocalDescription(answer);
                
              })
              .then(function() {
                  console.log(peer2.localDescription)
                  console.log(peer2)
                  socket.emit('call-answer',{'ans':JSON.stringify(peer2.localDescription),'room': roomId})
                
              })
              .catch(function(err) {
                  console.log(err)
              });
    
        })
    }




})




//*************************************************************************************/
/***************************************************************************************/
/*************************************************************************************/


//is video is playing then disable or if disabled then play 

const playStop = () => {
    console.log('object')
    let enabled = localStream.getVideoTracks()[0].enabled;
    if (enabled) {
      localStream.getVideoTracks()[0].enabled = false;
      setPlayVideo()
    } else {
      setStopVideo()
      localStream.getVideoTracks()[0].enabled = true;
    }
  }

  //change the play video icon

  const setStopVideo = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
  }

  //change the stop video icon
  
  const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
  }


  
  
  /**********************************************************************/

  //if user is muted then enable audio and vice-versa
  
  
  const muteUnmute = () => {
    const enabled = localStream.getAudioTracks()[0].enabled;
    if (enabled) {
      localStream.getAudioTracks()[0].enabled = false;
      setUnmuteButton();
    } else {
      setMuteButton();
      localStream.getAudioTracks()[0].enabled = true;
    }
  }

  //change to unmute icon to mute

  const setMuteButton = () => {
    const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
  }

  //change mute icon to unmute
  
  const setUnmuteButton = () => {
    const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
  }




  /********************************************************************************/

  //when leave meeting is clicked then close the peer connection
  
  
  function leave_meeting(){
      console.log('leave meet')
      if(creator)
      {
          peer1.close();
          socket.emit('exit',{'type': 'host','room':roomId});
      }
      else{
          peer2.close();
          socket.emit('exit',{'type': 'guest','room': roomId});
      }

  }

  socket.on('peer-left', type => {
        if(type === 'host')
            peer2.close();
        else
            peer1.close();
  })



  /**************************************************************/

//Chat during the video call

  msgRef = db.ref('/'+roomId);
// input value
let text = $("input");
// when press enter send message
$('html').keydown(function (e) {
  if (e.which == 13 && text.val().length !== 0) {
    socket.emit('message', {'message':text.val(),'room':roomId,'user':userId});
    const msg = {
      name: userId,
      text: text.val()
    }
    msgRef.push(msg)
    text.val('')
    
  }
});


socket.on("createMessage", (data) => {
  $("ul").append(`<li class="message"><b>${data.user}</b><br/>${data.message}</li>`);
  scrollToBottom()
  
})


const scrollToBottom = () => {
    var d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
  }