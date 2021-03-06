# addrbook
RESTful API for an address book with an Elasticsearch data store

## How to run:
1. Clone the repository by running `git clone https://github.com/ampharino/addrbook.git`
2. `cd addrbook` and then install required packages via `npm install`
3. Run `npm start` to start the server. The port and elasticsearch cluster can be configured in `config/connection.js`
4. Run `npm test` to run mocha unit tests. 

## Misc.
I recommend making requests to the server via Postman. Requests should be made to `localhost:PORT/api/contact`

Contacts have the following mapping: 

```
    index: 'addressbook',
    type: 'contact',
    body:{
        properties:{
            name:{type:"text"},
            number:{type:"text"},
            address:{
                properties:{
                    street:{type:'text'},
                    city:{type:'text'},
                    state:{type:'text'},
                    zipcode:{type:'text'},
                    country:{type:'text'}
                }
            }
        }
    }
```

The only required field is `name`
