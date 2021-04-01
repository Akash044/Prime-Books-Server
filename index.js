const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const cors = require('cors')
const ObjectId = require('mongodb').ObjectID;


const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://process.env.DB_USER:process.env.DB_PASS@cluster0.ieei5.mongodb.net/process.env.DB_NAME?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());
app.use(cors())

// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
   res.send('hello world');
})

client.connect(err => {
   const collection = client.db("primeBooksDB").collection("books");
   const ordersCollection = client.db("primeBooksDB").collection("orders");
   console.log("successfully connected")

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
   app.post('/addbook', (req, res) => {
      const bookInfo = req.body;
      collection.insertOne(bookInfo)
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

   //  delete a book
   app.delete('/deleteBook/:id', (req, res) => {
      console.log(req.params.id)
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
            res.send("successfully");
         })
   })

   // read orders
   app.get('/allOrder/:email', (req, res) => {
      console.log(req.params.email);
      ordersCollection.find({email: req.params.email })
         .toArray((err, documents) => {
            res.send(documents);
         })
   })
   // ORDER SECTION END HERE



});


app.listen(8080, () => console.log('Listening to port 8080'));