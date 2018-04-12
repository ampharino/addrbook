//data model for 'contact' document type
const Contact = {
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
}

module.exports = Contact;