// Express implement
const express = require('express')
const app = express();
const port = 3000;
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




// Routers
app.get('/', (req, res) => {
    let user = req.session.userData
    if (user) {
        res.render(`users/chat-home`, { user })
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
    req.session.userData = loginData;
    res.redirect('/')
})
app.get('/logout', (req, res) => {
    req.session.userData = null;
    res.redirect('/')
})



// Socket.io
io.on("connection", function (socket) {
    console.log(`A user connected`);

    // All users deatials
    var allUsers = [];
    function searchUser(userId){
        for (var i=0; i < allUsers.length; i++) {
            if (allUsers[i].id === userId) {
                return allUsers[i];
            }
        }
    };

    socket.on("disconnect",async () => {
        console.log("A user disconnected");
        var userData = await searchUser(socket.id);
        io.emit('userDisconnect', userData.name);
    });
    
    socket.on("userConnected",(userData)=>{
        allUsers.push(userData);
        io.emit('userConnect', userData);
    });

    
});

