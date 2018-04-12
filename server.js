
const express = require('express');
const bodyParser = require('body-parser');
const contact = require('./routes/contact')

const client = require('./elastic');
const app = express();

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json());

app.use('/api/contact',contact);
app.listen(3000, () => console.log('Server running on port 3000'))

