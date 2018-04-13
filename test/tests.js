const util = require('../utility/function');
const client = require('../elastic');
const Contact = require('../models/contact');
const assert = require('assert');
const server = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();

chai.use(chaiHttp);

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

before((done) => {
    deleteIndex().then(function(deleted) {
        if(deleted){
            initIndex().then(function(created) {
                    setMapping().then(function(mapping){done();})
            }).catch(function(err){})
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
            assert.equal("created",add.result);
            done();
        })
    })
    it('should find exactly one match', (done)=>{
        util.addContact("parin2").then(function(add){
            util.findContact("parin2").then(function(find){
                assert.equal(1,find.hits.total);
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
                    assert.equal("deleted",deleted.result);
                    done();
                })
            })
        })
    })
    it('should update contact', (done)=>{
        util.addContact("parin4").then(function(add){
            util.findContact("parin4").then(function(find){
                util.updateContact("parin4","111-111-111",{},find.hits.hits[0]._id).then(function(updated){
                    assert.equal("updated",updated.result);
                    done();
                })
            })
        })
    })
})


describe('route/endpoint tests',() =>{
    describe('POST /contact', () =>{
        it('should fail attempting to create contact that already exists', (done)=>{
            util.addContact("parin").then(function(add){
                chai.request(server)
                    .post('/api/contact')
                    .send({name:'parin1'})
                    .end((err,res)=>{
                        res.should.have.status(400);
                        res.body.should.be.a('object');
                        assert.equal("Contact already exists",res.body.message);
                        done();
                    })
            })
        })
        it('should fail when creating a contact without a name', (done)=>{
            chai.request(server)
                .post('/api/contact')
                .send({name:""})
                .end((err,res)=>{
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    assert.equal("Please enter proper values",res.body.message);
                    done();
                })
        })
        it('should create a new contact', (done)=>{
            chai.request(server)
                .post('/api/contact')
                .send({name:"newcontact"})
                .end((err,res)=>{
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    assert.equal("Created new contact",res.body.message);
                    done();
                })
        })
    })

    describe('GET /contact/:name', () =>{
        it('should return a contact', (done)=>{
            util.addContact("test1").then(function(add){
                chai.request(server)
                    .get('/api/contact/test1')
                    .end((err,res)=>{
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        assert.equal("Found contact",res.body.message);
                        done();
                    })
            })
        })
        it('should fail to return a contact', (done)=>{
            chai.request(server)
                .get('/api/contact/idontexist')
                .end((err,res)=>{
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    assert.equal("No contact with matching name",res.body.message);
                    done();
                })
        })
    })

    describe('DELETE /contact/:name', () =>{
        it('should fail to delete contact', (done)=>{
            chai.request(server)
                .delete('/api/contact/idontexist')
                .end((err,res)=>{
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    assert.equal("No contact with matching name",res.body.message);
                    done();
                })
        })
        it('should delete a contact', (done)=>{
            util.addContact("test2").then(function(add){
                chai.request(server)
                    .delete('/api/contact/test2')

                    .end((err,res)=>{
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        assert.equal("deleted contact",res.body.message);
                        done();
                    })
            })
        })
    })

    describe('PUT /contact/:name', () =>{
        it('should fail to update contact', (done)=>{
            chai.request(server)
                .put('/api/contact/idontexist')
                .send({name:'test2',number:'111'})
                .end((err,res)=>{
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    assert.equal("No contact with matching name",res.body.message);
                    done();
                })
        })
        it('should fail to update contact when new name already exists', (done)=>{
            let promises = []
            promises.push(util.addContact("test3"));
            promises.push(util.addContact("test4"));
            Promise.all(promises).then(function(){
                chai.request(server)
                    .put('/api/contact/test3')
                    .send({name:'test4',number:'911'})
                    .end((err,res)=>{
                        res.should.have.status(400);
                        res.body.should.be.a('object');
                        assert.equal("test4 is already a contact",res.body.message);
                        done();
                    })
            })
        })
        it('should update contact', (done)=>{
            util.addContact('test5').then(function(add){
                chai.request(server)
                    .put('/api/contact/test5')
                    .send({name:'test5',number:'911'})
                    .end((err,res)=>{
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        assert.equal("updated contact",res.body.message);
                        done();
                    })
            })
        })
    })


})






