//data model for 'contact' document type
const Contact = {
    index: 'addressbook',
    type: 'contact',
    body:{
        properties:{
            name:{type:"text"},
            number:{type:"text"},
            address:{type:"text"}
        }
    }
}

module.exports = Contact;