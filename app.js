const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require("socket.io")(server)
const bcrypt = require('bcrypt')
const firebase = require('firebase')
const session = require('express-session')


//const methodOverride = require('method-override')

let User







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
      const UserRef = db.ref("/users"); 


let Username = "";




app.set('view engine','ejs')
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use(express.static(__dirname + '/node_modules/popper.js/dist/'));
app.use(express.static(__dirname + '/node_modules/jquery/dist/'));

app.use(express.urlencoded({ extended: false }))

app.use(session({
    secret : 'secret-key',
    resave : false,
    saveUninitialized: false
}))

const port = process.env.PORT || 3000;

app.get('/sample', (req,res) =>{
    res.render('sample.ejs')
})
app.get('/join',(req,res) => {
 

    //console.log(User.roomid)
    res.render('index.ejs',{'username': Username})
})

app.get('/room',(req,res) => {
    res.render('room.ejs',{'username': Username})
    //res.redirect('/chat')
})

let room =[]
let roomid = []

app.get('/chat',(req,res) => {
    console.log('hiiiii'+ Username)


    res.render('chat2.ejs',{'username': Username})
})

app.get('/login',(req,res) => {

    res.render('login.ejs')
})

app.get('/signup',(req,res) => {
    res.render("signup.ejs")
})

app.post('/signup', async (req, res) => {
    
    UserRef.orderByChild("name").equalTo(req.body.username).once('value').then( async (snapshot)=>  {
        if(snapshot.exists()){
            return res.json({'success': false, 'message': 'username taken'});
            //res.redirect('/signup')
        }
        else{
            try {
                const hashedPassword = await bcrypt.hash(req.body.password, 10)
                const user = {
                  name: req.body.username,
                  password: hashedPassword
                }
                console.log(user)
                UserRef.push(user);
                // UserRef.child(req.body.username).set({})
                
                res.redirect('/login')
              } catch {
                res.redirect('/signup')
              }

        }
    })
    
  })



 app.post('/chat', async (req,res) =>{


    console.log(req.body.username,req.body.password)
    

     UserRef.orderByChild("name").equalTo(req.body.username).once('value').then((snapshot) => {
         if (snapshot.exists()) {
             console.log(snapshot.val())
    //         const data = snapshot.val()
            UserRef.orderByChild("name").equalTo(req.body.username).on("child_added",  function(data) {
                //console.log(data.val().password)
                bcrypt.compare(req.body.password, data.val().password, function(err, response) {
                    if (err){
                        console.log(err);
                    }
                    if (response){
                        Username = data.val().name;
                        res.redirect('/chat')
                    } else {
                        // response is OutgoingMessage object that server response http request
                        return res.json({'success': false, 'message': 'passwords do not match'});
                    }
                    })

            })

        } else {
        console.log("No data available");
        return res.json({'success': false, 'message': 'no such user'});
        }
        }).catch((error) => {
        console.error(error);
        });

   

           
    
    

    
})

// ***********************************************************************************//

const rooms = {};
//const userId = 12

io.on('connection', socket =>{

    
    socket.on("join-room",(data) => {
        console.log('roomid;',data.room)
        socket.join(data.room);
        console.log(data.room,data.user)
        console.log(socket.id)

        console.log(io.sockets.adapter.rooms)
        console.log(io.sockets.adapter.rooms.size)

        // if(io.sockets.adapter.rooms.get(data.room).size > 1){
        //     // io.in(data.room).emit('new-user',data.user);
            
        // }
        socket.to(data.room).emit('new-user');

        // console.log(io.socket.adapter.rooms.length);
        
        console.log(io.sockets.adapter.rooms.get(data.room).size);

        
    })

    socket.on('offer',(data) =>{
        console.log('offer emitted')
        //console.log(data.off)
        //socket.emit('random')
        socket.to(data.room).emit('add-user',{'offer':data.off});
    })

    socket.on('call-answer', (data) =>{
        //console.log(data.ans)
        socket.to(data.room).emit('answer',data.ans)
    })

    socket.on('store-candidate',(data) =>{
        //console.log(candidate)
        socket.to(data.room).emit('add-candidate',data.candidate)
    })

    socket.on('new-candidate',(data) =>{
        socket.to(data.room).emit('peer-candidate',data.candidate)
    })

    socket.on('exit', (data) => {
        socket.to(data.room).emit('peer-left',data.type)

    })

    socket.on('message', (data) => {
        //send message to the same room
        io.to(data.room).emit('createMessage', data.message)
    }); 
})

server.listen(port);