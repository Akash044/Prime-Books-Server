const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectID;
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const app = express();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ieei5.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
// const uri = 'mongodb+srv://trratul:trratul01759875745@cluster0.c8iza.mongodb.net/polling-db?retryWrites=true&w=majority';
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

const admin = require("firebase-admin");
const serviceAccount = require("./prime-books-auth-firebase-adminsdk-qbt80-f990eeed6c.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.get("/", (req, res) => {
  res.send("server working");
});

client.connect((err) => {
  const collection = client
    .db(process.env.DB_NAME)
    .collection(process.env.DB_COL1);
  const ordersCollection = client
    .db(process.env.DB_NAME)
    .collection(process.env.DB_COL2);

  const userCollection = client.db("polling-db").collection("user");
  const pollCollection = client.db("polling-db").collection("polls");
  const voteCollection = client.db("polling-db").collection("votes");

  app.post("/sign-up", (req, res) => {
    userCollection.insertOne(req.body).then((result) => {
      console.log(result);
      res.send(result.insertedCount > 0);
    });

    console.log(req.body);
    // res.send("coming")
  });

  app.get("/allUsers", (req, res) => {
    userCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/addPoll", (req, res) => {
    pollCollection.insertOne(req.body).then((result) => {
      console.log(result);
      res.send({ isDone: result.insertedCount, pollId: result.insertedId });
    });

    console.log(req.body);
  });

  app.get("/allPolls", (req, res) => {
    pollCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/vote", (req, res) => {
    voteCollection.insertOne(req.body).then((result) => {
      console.log(result);
      res.send(result.insertedCount > 0);
    });

    console.log(req.body);
    // res.send("coming")
  });

  app.get("/allVotes", (req, res) => {
    voteCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  //  ALL BOOKS SECTION START HERE
  // read all books
  app.get("/books", (req, res) => {
    collection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  // read specific book by id
  app.get("/book/:id", (req, res) => {
    collection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      });
  });

  // insert new book
  app.post("/addBook", (req, res) => {
    const bookInfo = req.body;
    collection.insertOne(bookInfo).then((result) => {
      console.log("data added successfully");
      res.send(result);
    });
  });

  //   app.patch("/update/:id", (req, res) => {
  //     collection
  //       .updateOne(
  //         { _id: ObjectId(req.params.id) },
  //         {
  //           $set: {
  //             name: req.body.name,
  //             age: req.body.age,
  //             studyAt: req.body.studyAt,
  //           },
  //         }
  //       )
  //       .then((res) => console.log(res));
  //   });

  //  delete a book
  app.delete("/deleteBook/:id", (req, res) => {
    collection.deleteOne({ _id: ObjectId(req.params.id) }).then((result) => {
      res.send(result.deletedCount > 0);
    });
  });
  // ALL BOOKS SECTION END HERE

  //ORDER SECTION START HERE
  // add order
  app.post("/addOrder", (req, res) => {
    const orderInfo = req.body;
    ordersCollection.insertOne(orderInfo).then((result) => {
      console.log("data added successfully");
      res.send(result);
    });
  });

  // read orders
  app.get("/allOrder/:email", (req, res) => {
    const userIdToken = req.headers.authorization.split(" ")[1];
    admin
      .auth()
      .verifyIdToken(userIdToken)
      .then((decodedToken) => {
        const decodedTokenEmail = decodedToken.email;
        if (req.params.email === decodedTokenEmail) {
          ordersCollection
            .find({ email: req.params.email })
            .toArray((err, documents) => {
              res.send(documents);
            });
        }
      })
      .catch((error) => {});
  });
  // ORDER SECTION END HERE
});
app.listen(process.env.PORT || 8080);
