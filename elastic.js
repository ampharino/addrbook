
const elasticsearch = require('elasticsearch');
const config = require('./config/connection');
const Contact = require('./models/contact');


//connect to the elasticsearch db
const client = new elasticsearch.Client({
    host:config.elastic_connection,
    log:'info'
});


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


/**
 *  Check connection to cluster and then initialize database
*/
client.ping({requestTimeout: 30000},function (err){
        if(err){
            console.log("elasticsearch cluster is down")
        }
        else {
            indexExists().then(function (exists) {
                if (exists) {
                    console.log("index already exists")
                }
                else {
                    initIndex().then(function (success) {
                        console.log("created index", success);
                        setMapping().then(function (resp){
                            console.log(resp);
                        })
                    }).catch(function(err){})
                }
            })
        }
})

module.exports = client;