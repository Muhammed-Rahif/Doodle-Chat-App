// Express implement
const express = require('express')
const app = express();
const port = process.env.PORT || 3000;
const path = require('path')
const session = require('express-session')
const bodyParser = require('body-parser');

// Server listening
const server = app.listen(port, function () {
    console.log(`Listening on port ${port}`);
    console.log(`http://localhost:${port}`);
});

// Socket.io
const io = require('socket.io')(server);

// hbs implement
var handlebars = require('express-handlebars').create({ extname: '.hbs' });
app.engine('hbs', handlebars.engine);

// View and view engine setup
app.set('views', path.join(`${__dirname}/views`))
app.set('view engine', 'hbs')

app.use(express.static(`${__dirname}/public/`))

// Express-session middleware
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 600000 } }))

// Body parser
app.use(bodyParser.urlencoded({ extended: true }))




// All users deatials
var allUsers = [];
function searchUser(userId) {
    for (var i = 0; i < allUsers.length; i++) {
        if (allUsers[i].id === userId) {
            return allUsers[i];
        }
    }
};
function searchUserIndex(userId) {
    for (var i = 0; i < allUsers.length; i++) {
        if (allUsers[i].id === userId) {
            return i;
        }
    }
};
// All rooms details
var allRooms = [];
function searchRoom(roomId) {
    for (var i = 0; i < allRooms.length; i++) {
        if (allRooms[i].roomId === roomId) {
            return allRooms[i];
        }
    }
};
function searchRoomIndex(roomId) {
    for (var i = 0; i < allRooms.length; i++) {
        if (allRooms[i].roomId === roomId) {
            return i;
        }
    }
};




// Routers
app.get('/', (req, res) => {
    let user = req.session.userData
    if (user) {
        res.render(`users/chat-page`, { user })
    } else {
        res.redirect('/login')
    }
})
app.get('/login', (req, res) => {
    let user = req.session.userData
    if (user) {
        res.redirect('/')
    } else {
        res.render('users/login-page')
    }
})
app.post('/login', (req, res) => {
    let loginData = req.body;
    if (loginData.roomName) {
        req.session.userData = loginData;
        res.json('/')
    } else {
        loginData.roomName = searchRoom(loginData.roomId).roomName;
        req.session.userData = loginData;
        res.json('/')
    }
})
app.get('/logout', (req, res) => {
    req.session.userData = null;
    res.redirect('/')
})


app.post('/create-room', (req, res) => {
    let roomData = req.body;
    allRooms.push(roomData);
})
app.post('/getRooms', (req, res) => {
    res.json(allRooms)
})

app.post('/checkRoomPass', (req, res) => {
    let recRoomData = req.body;
    let senRoomData = searchRoom(recRoomData.roomId)
    if ( senRoomData.roomPass===recRoomData.typePass || recRoomData.typePass === 'false') {
        res.json({ loginStatus: true })
    } else {
        res.json({ loginStatus: false })
    }
})

app.post('/if-pass',(req,res)=>{
    let recRoomData = req.body;
    let senRoomData = searchRoom(recRoomData.roomId)
    if (senRoomData.roomPass==='false') {
        res.json({ password:false })
    } else {
        res.json({ password:true })
    }
})

// Socket.io
io.on("connection", function (socket) {
    console.log(`A user connected`);

    socket.on("disconnect", async () => {
        console.log("A user disconnected");
        var userData = await searchUser(socket.id);
        let userIndex = searchUserIndex(userData.id);
        allUsers = allUsers.filter(function (el) {
            return el.id !== socket.id;
        });
        let roomUsers = allUsers.filter((user) => {
            return user.roomId === userData.roomId
        });
        if (roomUsers.length === 0) {
            allRooms = allRooms.filter(function (el) {
                return el.roomId !== userData.roomId;
            });
        } else {
            console.log(`Members count : ${roomUsers.length}`);
        }
        console.log(allUsers);
        io.to(userData.roomId).emit('userDisconnect', userData, roomUsers);
    });

    socket.on("userConnected", (userData) => {
        allUsers.push(userData);
        let roomUsers = allUsers.filter((user) => {
            return user.roomId === userData.roomId
        })
        console.log(allUsers);
        socket.join(userData.roomId);
        io.to(userData.roomId).emit('userConnect', userData, roomUsers);
    });

    socket.on("sendingMsg", (message) => {
        console.log(message);
        io.to(message.roomId).emit('sendMsg', message)
    })
});

