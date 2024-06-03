const express = require("express");

const multer = require('multer')

const storageConfig = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'files');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storageConfig });

const route = express.Router();

const db = require("../database/database");

const mongodb = require("mongodb");

const ObjectId = mongodb.ObjectId;


route.get('/home', function (req, res) {
  res.render('home')
})

route.get('/', function (req, res) {
  res.redirect('/home')
})





route.get('/back', function (req, res) {
  res.redirect('/')
})

route.get('/studentlogin', async function (req, res) {
  res.render('studentlogin', { error: null })
})

route.post('/studentdashboard', async function (req, res) {
  const data = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  }

  const logindata = await db.getdb().collection('studentdetail').find({ email: data.email, password: data.password }).toArray()
  if (logindata.length > 0) {
    let totalod=0;
  for (const noofod of logindata[0].od)
  {
    totalod=totalod+Number(noofod.numberofod)
  }
  console.log(totalod)
    res.render('studentdashboard', { detail: logindata[0],totalod:totalod })
  }
  else {
    res.render('studentlogin', { error: "wrong email and password" })
  }
})

route.get('/teacherlogin', async function (req, res) {
  res.render('teacherlogin', { error: null })
})

route.post('/teacherdashboard', async function (req, res) {
  const data = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  }
  const logindata = await db.getdb().collection('teacherlogin').find({ email: data.email, password: data.password }).toArray()
  console.log(logindata)
  if (logindata.length > 0) {
    const logindata2=await db.getdb().collection('studentdetail').find().toArray()
    console.log(logindata2)
    let totalod=0
    for(const od of logindata2)
    {
      totalod+=od.od.length
    }
    console.log(totalod)
    res.render('teacherdashboard',{totalod:totalod,data:logindata2})
  }
  else {
    res.render('teacherlogin', { error: "wrong email and password" })
  }
})

route.get('studentdashboard', async function (req, res) {
  const logindata = await db.getdb().collection('studentdetail').find({},).toArray()
})

route.get('/odform', function (req, res) {
  res.render('odform',{error:null})
})

route.get('/studentdashboard', function (req, res) {
  res.render('studentdashboard')
})

route.post('/dashboard', upload.single('Screenshot'), async function (req, res) {
  let totalod=0;
  const oddetail = {
    _id:Math.random().toString(36).substring(2, 10),
    name: req.body.studentName,
    dept: req.body.department,
    year: req.body.year,
    semester: req.body.semester,
    section: req.body.section,
    numberofod:req.body.numberofod,
    collegename: req.body.collegename,
    mentorname: req.body.mentorname,
    eventname: req.body.eventname,
    filepath: req.file.path,
    odstatus:{
      _id:Math.random().toString(36).substring(2, 10),
      classadvisor:"pending",
      dih:"pending",
      hod:"pending",
      ih:"pending",
      curd:"pending"
    }
  }
  const logindata = await db.getdb().collection('studentdetail').find({ name: req.body.studentName }).toArray()
  totalod=totalod+oddetail.numberofod
  for (const noofod of logindata[0].od)
  {
    totalod=Number(totalod)+Number(noofod.numberofod)
  }
  console.log(totalod)
  if (totalod>7)
  {
    res.render('odform',{error:"you cannot apply od as your total number of od is more than 7"})
    return;
  }
  const updatedata=await db.getdb().collection('studentdetail').updateOne({ _id: new ObjectId(logindata[0]._id) }, { $push: {od:oddetail} })
  const logindata1 = await db.getdb().collection('studentdetail').find({ name: req.body.studentName }).toArray()
  // numberod=logindata1[0].od[0].numberofod;
  console.log(logindata1)
  totalod=0
  for (const noofod of logindata1[0].od)
  {
    totalod=Number(totalod)+Number(noofod.numberofod)
  }
  console.log(totalod)
  console.log(logindata1[0])
  res.render('studentdashboard', { detail: logindata1[0],totalod:Number(totalod)})
})

route.get('/studentdetail/:id',async function(req,res){
  const id=req.params.id.replace(/:/g, '')
  const data= await db.getdb().collection('studentdetail').findOne({"od._id":req.params.id.replace(/:/g, '')},{od:true})
  const oddata=data.od;
  console.log(oddata)
  let displayoddata;
  for (let i = 0; i < oddata.length; i++) {
    if (oddata[i]._id === id) {
        displayoddata=oddata[i]
    }
}
console.log(displayoddata)
  res.render('studentdetail',{detail:displayoddata})
})


route.get('/approval/:id',async function(req,res){
  const id=req.params.id.replace(/:/g, '')
  const data= await db.getdb().collection('studentdetail').findOne({"od._id":req.params.id.replace(/:/g, '')},{od:true})
  const oddata=data.od;
  let displayoddata;
  for (let i = 0; i < oddata.length; i++) {
    if (oddata[i]._id === id) {
        displayoddata=oddata[i]
    }
}
console.log(displayoddata)
  res.render('approval',{status1:displayoddata})
})



route.post('/approval1/:id',async function(req,res){
  const status=req.body.approvalstatus
  const id=req.params.id.replace(/:/g, '')
  
if (status==='approved'){
  await db.getdb().collection('studentdetail').updateOne({"od._id":id},{$set:{"od.$.odstatus.classadvisor":"approved"}})
}
else if(status==='disapproved'){
  await db.getdb().collection('studentdetail').updateOne({"od._id":id},{$set:{"od.$.odstatus.classadvisor":"disapproved"}})
}
const data= await db.getdb().collection('studentdetail').findOne({"od._id":req.params.id.replace(/:/g, '')},{od:true})
  const oddata=data.od;
  let displayoddata;
  for (let i = 0; i < oddata.length; i++) {
    if (oddata[i]._id === id) {
        displayoddata=oddata[i]
    }
}
console.log(displayoddata)
  res.redirect('/approval/:'+id)
})
route.post('/approval2/:id',async function(req,res){
  const status=req.body.approvalstatus
  const id=req.params.id.replace(/:/g, '')
  
if (status==='approved'){
  await db.getdb().collection('studentdetail').updateOne({"od._id":id},{$set:{"od.$.odstatus.dih":"approved"}})
}
else if(status==='disapproved'){
  await db.getdb().collection('studentdetail').updateOne({"od._id":id},{$set:{"od.$.odstatus.dih":"disapproved"}})
}
const data= await db.getdb().collection('studentdetail').findOne({"od._id":req.params.id.replace(/:/g, '')},{od:true})
  const oddata=data.od;
  let displayoddata;
  for (let i = 0; i < oddata.length; i++) {
    if (oddata[i]._id === id) {
        displayoddata=oddata[i]
    }
}
console.log(displayoddata)
  res.redirect('/approval/:'+id)
})
route.post('/approval3/:id',async function(req,res){
  const status=req.body.approvalstatus
  const id=req.params.id.replace(/:/g, '')
  
if (status==='approved'){
  await db.getdb().collection('studentdetail').updateOne({"od._id":id},{$set:{"od.$.odstatus.hod":"approved"}})
}
else if(status==='disapproved'){
  await db.getdb().collection('studentdetail').updateOne({"od._id":id},{$set:{"od.$.odstatus.hod":"disapproved"}})
}
const data= await db.getdb().collection('studentdetail').findOne({"od._id":req.params.id.replace(/:/g, '')},{od:true})
  const oddata=data.od;
  let displayoddata;
  for (let i = 0; i < oddata.length; i++) {
    if (oddata[i]._id === id) {
        displayoddata=oddata[i]
    }
}
console.log(displayoddata)
  res.redirect('/approval/:'+id)
})

route.post('/approval4/:id',async function(req,res){
  const status=req.body.approvalstatus
  const id=req.params.id.replace(/:/g, '')
  
if (status==='approved'){
  await db.getdb().collection('studentdetail').updateOne({"od._id":id},{$set:{"od.$.odstatus.ih":"approved"}})
}
else if(status==='disapproved'){
  await db.getdb().collection('studentdetail').updateOne({"od._id":id},{$set:{"od.$.odstatus.ih":"disapproved"}})
}
const data= await db.getdb().collection('studentdetail').findOne({"od._id":req.params.id.replace(/:/g, '')},{od:true})
  const oddata=data.od;
  let displayoddata;
  for (let i = 0; i < oddata.length; i++) {
    if (oddata[i]._id === id) {
        displayoddata=oddata[i]
    }
}
console.log(displayoddata)
  res.redirect('/approval/:'+id)
})

route.post('/approval5/:id',async function(req,res){
  const status=req.body.approvalstatus
  const id=req.params.id.replace(/:/g, '')
  
if (status==='approved'){
  await db.getdb().collection('studentdetail').updateOne({"od._id":id},{$set:{"od.$.odstatus.curd":"approved"}})
}
else if(status==='disapproved'){
  await db.getdb().collection('studentdetail').updateOne({"od._id":id},{$set:{"od.$.odstatus.curd":"disapproved"}})
}
const data= await db.getdb().collection('studentdetail').findOne({"od._id":req.params.id.replace(/:/g, '')},{od:true})
  const oddata=data.od;
  let displayoddata;
  for (let i = 0; i < oddata.length; i++) {
    if (oddata[i]._id === id) {
        displayoddata=oddata[i]
    }
}
console.log(displayoddata)
  res.redirect('/approval/:'+id)
})
module.exports = route;