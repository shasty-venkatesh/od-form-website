const mongodb=require('mongodb');

const MongoClient=mongodb.MongoClient;


let database;
async function connect(){
    const client=await MongoClient.connect('mongodb://127.0.0.1:27017')
    database=client.db('techtango')
}
function getdb(){
 if(!database)
 {
    throw{message:'database is not connection to blog'}
 }
 else{
    return database;
 }
}


module.exports={
    connect:connect,
    getdb:getdb
}