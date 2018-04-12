
const express = require('express');
const bodyParser = require('body-parser');
const contact = require('./routes/contact');
const port = require('./config/connection').port_number;

const client = require('./elastic');
const app = express();

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json());

app.use('/api/contact',contact);
app.listen(port, () => console.log('Server running on port ' + port))

