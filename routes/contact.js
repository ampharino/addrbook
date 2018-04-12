const router = require('express').Router();
const client = require('../elastic');

function addContact(req){
    return client.index({
        index:'addressbook',
        type:'contact',
        body:{
            name:req.body.name,
            number:req.body.number,
            address:req.body.address
        }
    })
}


router.post('/', (req,res)=>{
    addContact(req)
        .then(function(contact){
            res.status(201).json(contact);
        })
})


module.exports = router;