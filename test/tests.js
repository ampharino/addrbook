const util = require('../utility/function');
const client = require('../elastic');
const Contact = require('../models/contact');
const assert = require('assert');

function deleteIndex() {
    return client.indices.delete({index: 'addressbook'});
}
function initIndex() {
    return client.indices.create({index: 'addressbook'});
}
function indexExists() {
    return client.indices.exists({index: 'addressbook'});
}
function setMapping() {
    return client.indices.putMapping(Contact);
}

describe('Storage/retrieval tests', ()=> {
    before((done) => {
        deleteIndex().then(function(deleted) {
            if(deleted){
                initIndex().then(function(created) {
                    if(created){
                        console.log("created index")
                        setMapping().then(function(mapping){done();})
                    }
                    else{
                        console.log("error creating index")
                        done();
                    }
                })
            }
            else {
                console.log("error deleting");
                done();
            }
        })
    })
    describe('validation tests', ()=>{
        it('should return false when name is undefined',()=>{
            assert.equal(false,util.validate(undefined,"217-721-0925"));
        })
        it('should return false when name.length > 20', ()=>{
            assert.equal(false,util.validate("mynameissupersupersupersupersupersuperlong"));
        })
        it('should return true when name is provided', ()=>{
            assert.equal(true,util.validate("ampharin ongvises","217-721-0925"));
        })
        it('should return true when just name is provided', ()=>{
            assert.equal(true,util.validate("ampharin ongvises"));
        })
    })
    describe('db tests', ()=>{
        it('should successfully create a new contact', (done)=>{
            util.addContact("parin1").then(function(add){
                assert.equal("created",add.result)
                done();
            })
        })
        it('should find exactly one match', (done)=>{
            util.addContact("parin2").then(function(add){
                util.findContact("parin2").then(function(find){
                    assert.equal(1,find.hits.total)
                    done();
                })
            })
        })
        it('should return no match', (done)=>{
            util.findContact("thisnamedoesntexist").then(function(find){
                assert.equal(0,find.hits.total);
                done();
            })
        })
        it('should delete contact',(done)=>{
            util.addContact("parin3").then(function(add){
                util.findContact("parin3").then(function(find){
                    util.deleteContact(find.hits.hits[0]._id).then(function(deleted){
                        assert.equal("deleted",deleted.result)
                        done();
                    })
                })
            })
        })
        it('should update contact', (done)=>{
            util.addContact("parin4").then(function(add){
                util.findContact("parin4").then(function(find){
                    util.updateContact("parin4","111-111-111",{},find.hits.hits[0]._id).then(function(updated){
                        assert.equal("updated",updated.result)
                        done();
                    })
                })
            })
        })
    })
})


