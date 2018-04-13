const client = require('../elastic');

let functions = {}

functions.getAll = (pageSize=10,page=1,query={})=>{
    return client.search({
        index:'addressbook',
        type:'contact',
        size:pageSize,
        from: (page-1) * pageSize,
        body:{
            query:{
                match_all:query
            }
        }
    })

}
functions.addContact = (name,number="",address={})=>{
    return client.index({
        index:'addressbook',
        type:'contact',
        refresh:'true',
        body:{
            name:name,
            number:number,
            address:{
                street:address.street,
                city:address.city,
                state:address.state,
                zipcode:address.zipcode,
                country:address.country
            }
        }
    })
}

functions.findContact = (name) =>{
    return client.search({
        index:'addressbook',
        type:'contact',
        body:{
            query:{
                match:{
                    name:name
                }
            }
        }
    })
}

functions.deleteContact = (contactId)=>{
    return client.delete({
        index:'addressbook',
        type:'contact',
        id:contactId
    })
}

functions.updateContact = (name,number="",address={},contactId) =>{
    return client.index({
        index: 'addressbook',
        type: 'contact',
        refresh:'true',
        id: contactId,
        body: {
            name: name,
            number: number,
            address:{
                street:address.street,
                city:address.city,
                state:address.state,
                zipcode:address.zipcode,
                country:address.country
            }
        }
    })
}

functions.validate = (name,number,address={})=>{
    if(name == "" || name == undefined || name.length > 20){
        return false;
    }
    if(number && number.length > 50){
        return false;
    }
    if(address){
        if(address.street && address.street.length > 100){
            return false;
        }
        if(address.city && address.city.length > 100){
            return false;
        }
        if(address.zipcode && address.zipcode.length > 20){
            return false;
        }
        if(address.state && address.state.length > 50){
            return false;
        }
        if(address.country && address.country.length > 50){
            return false;
        }
    }
    return true;
}

module.exports = functions;
