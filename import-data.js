const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const fs = require('fs');
const path = require('path');

const connectionString = 'mongodb+srv://admin:Molly%4025477@cluster0.n2xtrhf.mongodb.net/?appName=Cluster0';

async function importData() {
  const client = await MongoClient.connect(connectionString);
  const database = client.db('techtango');
  
  // Read JSON files
  const studentsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'students.json'), 'utf8'));
  const teachersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'teachers.json'), 'utf8'));
  
  try {
    // Clear existing data (optional - remove if you want to keep existing data)
    await database.collection('studentdetail').deleteMany({});
    await database.collection('teacherlogin').deleteMany({});
    
    // Import students data
    const studentResult = await database.collection('studentdetail').insertMany(studentsData);
    console.log(`Inserted ${studentResult.insertedCount} students`);
    
    // Import teachers data
    const teacherResult = await database.collection('teacherlogin').insertMany(teachersData);
    console.log(`Inserted ${teacherResult.insertedCount} teachers`);
    
    console.log('Data imported successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await client.close();
  }
}

importData();
