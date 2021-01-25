// Express implement
const express = require('express')
const app = express();
const port = 3000;
const path = require('path')

// hbs implement
var handlebars = require('express-handlebars').create({ extname: '.hbs' });
app.engine('hbs', handlebars.engine);

// View and view engine setup
app.set('views', path.join(`${__dirname}/views`))
app.set('view engine', 'hbs')

app.use(express.static(`${__dirname}/public/`))




// Routers

app.get('/', (req, res) => {
    res.render(`users/chat-home`)
})





// Server listening
app.listen(port, () => {
    console.log(`Server started running at port "${port}"`);
})