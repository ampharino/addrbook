
const elasticsearch = require('elasticsearch');
const config = require('./config/connection');
const Contact = require('./models/contact');


//connect to the elasticsearch db
const client = new elasticsearch.Client({
    host:config.elastic_connection,
    log:'info'
})


//helper functions to reduce callback hell
function deleteIndex() {
    return client.indices.delete({index: 'addressbook'});
}
function initIndex() {
    return client.indices.create({index: 'addressbook'});
}
function indexExists() {
    return client.indices.exists({index: 'addressbook'});
}


/**
 *  Check connection to cluster and then initialize database
*/
client.ping({requestTimeout: 30000},function (err){
        if(err){
            console.log("elasticsearch cluster is down")
        }
        else{
            console.log("elasticsearch cluster is up")
            indexExists().then(function (exists){
                if(exists){
                    console.log("Deleting existing index")
                    return deleteIndex();
                }
            }).then(function () {
                initIndex().then(function (success){
                    if(success){
                        console.log("created index",success);
                        client.indices.putMapping(Contact,
                            function(err,res,status){
                                if(err){
                                console.log(err);
                            }
                            })
                    }
                    else{
                        console.log("error creating index");
                    }
                })
            })
        }
    })

module.exports = client;