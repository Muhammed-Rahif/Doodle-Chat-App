// Express implement
const express = require('express')
const app = express();
const port = 3000;
const path = require('path')
const session = require('express-session')
const bodyParser = require('body-parser');

// hbs implement
var handlebars = require('express-handlebars').create({ extname: '.hbs' });
app.engine('hbs', handlebars.engine);

// View and view engine setup
app.set('views', path.join(`${__dirname}/views`))
app.set('view engine', 'hbs')

app.use(express.static(`${__dirname}/public/`))

// Express-session middleware
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 } }))

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
    res.render('users/login-page')
})
app.post('/login', (req, res) => {
    let loginData = req.body;
    req.session.userData = loginData;
    res.redirect('/')
})






// Server listening
app.listen(port, () => {
    console.log(`Server started running at port "${port}"`);
})