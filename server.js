const elasticsearch = require('elasticsearch');
const config = require('./config/connection');
const client = new elasticsearch.Client({
    host:config.elastic_connection,
    log:'trace'
})

client.ping({
    requestTimeout: 30000,
}, function (error) {
    if (error) {
        console.error('elasticsearch cluster is down!');
    } else {
        console.log('All is well');
    }
});