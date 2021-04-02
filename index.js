const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const app = express();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ieei5.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))

client.connect(err => {
   const collection = client.db(process.env.DB_NAME).collection(process.env.DB_COL1);
   const ordersCollection = client.db(process.env.DB_NAME).collection(process.env.DB_COL2);

   //  ALL BOOKS SECTION START HERE
   // read all books
   app.get('/books', (req, res) => {
      collection.find({})
         .toArray((err, documents) => {
            res.send(documents);
         })
   })
   // read specific book by id
   app.get('/book/:id', (req, res) => {
      collection.find({ _id: ObjectId(req.params.id) })
         .toArray((err, documents) => {
            res.send(documents[0]);
         })
   })

   // insert new book
   app.post('/addBook', (req, res) => {
      const bookInfo = req.body;
      collection.insertOne(bookInfo)
         .then(result => {
            console.log("data added successfully");
            res.send(result);
         })
   })

   app.patch('/update/:id', (req, res) => {
      collection.updateOne({ _id: ObjectId(req.params.id) },
         {
            $set: { name: req.body.name, age: req.body.age, studyAt: req.body.studyAt }
         })
         .then(res => console.log(res))
   })

   //  delete a book
   app.delete('/deleteBook/:id', (req, res) => {
      collection.deleteOne({ _id: ObjectId(req.params.id) })
         .then(result => 
            {
               res.send(result.deletedCount > 0);
            })
   })
   // ALL BOOKS SECTION END HERE

   //ORDER SECTION START HERE
   // add order
   app.post('/addOrder', (req, res) => {
      const orderInfo = req.body;
      ordersCollection.insertOne(orderInfo)
         .then(result => {
            console.log("data added successfully");
            res.send(result);
         })
   })

   // read orders
   app.get('/allOrder/:email', (req, res) => {
      ordersCollection.find({email: req.params.email })
         .toArray((err, documents) => {
            res.send(documents);
         })
   })
   // ORDER SECTION END HERE
});
app.listen(process.env.PORT || 8080);