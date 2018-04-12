const router = require('express').Router();
const client = require('../elastic');
const util = require('../utility/function');

/**GET /contact
 * returns all contacts
 * accepts a pageSize and page parameter
 * NOTE -- elasticsearch queries are not working
 */
router.get('/',(req,res)=>{
    pageSize = req.query.pageSize;
    page = req.query.page;
    query = req.query.query

    util.getAll(pageSize,page,query).then(function(result){
        res.status(200).json({result:result.hits});
    })
})


/**
 * POST /contact
 * validates request and then checks if name already exists
 * adds contact if false, returns error otherwise
 */
router.post('/', (req,res)=>{
    name = req.body.name;
    number = req.body.number;
    address = req.body.address;

    if(!util.validate(name,number,address)){
        return res.status(400).json({message:'Please enter proper values'})
    }
    util.findContact(name).then(function(result){
        if(result.hits.total > 0){
            return res.status(400).json({message:"Contact already exists"})
        }
        else{
            util.addContact(name,number,address).then(function(contact){
                return res.status(201).json({message:"Created new contact",body:contact})

            })
        }
    })
})

/**
 * GET /contact/:name
 * validates request
 * and then searches for contact
 */
router.get('/:name', (req,res)=>{
    name = req.params.name;

    if(!util.validate(name)){
        return res.status(400).json({message:'Please enter a proper name'})
    }
    util.findContact(name).then(function(result){
        if(result.hits.total == 0){
            return res.status(400).json({message:"No contact with matching name"})
        }
        else{
            return res.status(200).json(result.hits.hits[0]._source)
        }
    })
})

/**
 * DELETE /contact/:name
 * validates request and then searches for contact
 * deletes contact if contact exists, returns error otherwise
 */
router.delete('/:name', (req,res)=>{
    name = req.params.name;

    if(!util.validate(name)){
       return res.status(400).json({message:'Please enter a proper name'})
    }
    util.findContact(name).then(function(result){
        if(result.hits.total == 0){
            return res.status(400).json({message:"no contact with matching name"})
        }
        else{
            contactId = result.hits.hits[0]._id;
            util.deleteContact(contactId).then(function(contact){
                return res.status(200).json({message:'deleted contact',body:contact})
            })
        }
    })
})

/**
 * PUT /contact/:name
 * validates request and then checks if contact exists
 * returns error if not, otherwise checks that updated name does not already exist
 * updates contact if everything is fine
 */
router.put('/:name', (req,res)=>{
    name = req.params.name
    newName = req.body.name;
    number = req.body.number;
    address = req.body.address;

    if(!util.validate(newName,number,address)){
        return res.status(400).json({message:'Please enter proper values'});
    }
    util.findContact(name).then(function(result){
        if(result.hits.total == 0){
            return res.status(400).json({message:"no contact with matching name"});
        }
        if(newName != name){
            util.findContact(newName).then(function(result2){
                if(result2.hits.total > 0){
                    return res.status(400).json({message:newName + " is already a contact"});
                }
            })
        }
        contactId = result.hits.hits[0]._id
        util.updateContact(newName,number,address,contactId).then(function(contact){
            return res.status(200).json({message:'updated contact',body:contact});
        })

    })
})

module.exports = router;