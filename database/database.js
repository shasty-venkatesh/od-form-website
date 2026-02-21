const mongodb=require('mongodb');

const MongoClient=mongodb.MongoClient;


let database;
async function connect(){
    const client=await MongoClient.connect('mongodb+srv://admin:Molly%4025477@cluster0.n2xtrhf.mongodb.net/?appName=Cluster0')
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
