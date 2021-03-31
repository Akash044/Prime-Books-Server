const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const ObjectId = require('mongodb').ObjectID;


const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://Akash_Hossain:akash044@cluster0.ieei5.mongodb.net/organicdb?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());

// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
   res.sendFile(__dirname + '/index.html');
})

client.connect(err => {
   const collection = client.db("organicdb").collection("products");
   console.log("successfully connected")


   // read data from mongodb
   app.get('/users', (req, res) => {
      collection.find({})
         .toArray((err, documents) => {
            res.send(documents);
         })
   })

   app.get('/user/:id', (req, res) => {
      collection.find({ _id: ObjectId(req.params.id) })
         .toArray((err, documents) => {
            res.send(documents[0]);
         })
   })

   // insert element in mongodb
   app.post('/addUser', (req, res) => {
      const studentInfo = req.body;
      collection.insertOne(studentInfo)
         .then(result => {
            console.log("data added successfully");
            res.redirect("/");
         })
   })
   app.patch('/update/:id', (req, res) => {
      collection.updateOne({ _id: ObjectId(req.params.id) },
         {
            $set: { name: req.body.name, age: req.body.age, studyAt: req.body.studyAt }
         })
         .then(res => console.log(res))
   })

   //  delete an item
   app.delete('/delete/:id', (req, res) => {
      console.log(req.params.id)
      collection.deleteOne({ _id: ObjectId(req.params.id) })
         .then(result => 
            {
               res.send(result.deletedCount > 0);
            })
   })



});


app.listen(8080, () => console.log('Listening to port 8080'));