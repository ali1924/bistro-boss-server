const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());

// MongoDB
const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bg5p3bd.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const database = client.db("bistroDb");
        const menuCollection = database.collection("menu");
        const reviewsCollection = client.db("bistroDb").collection('reviews');
        const cartsCollection = client.db("bistroDb").collection('carts');
        const usersCollection = client.db("bistroDb").collection('users');

        //users  related api
        // get all user data
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        })
        // post api for user login or sign up
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const query = { email: user.email };
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exist' });
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })
        // delete user data
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })
        // make admin from user data
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role:'admin',
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
        })
        // menu related apis
        // get all menu data
        app.get('/menu', async (req, res) => {
            const cursor = menuCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        // get all reviews data
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // add cart collection

        // get some data for email query
        app.get('/carts', async (req, res) => {
            const email = req.query.email;
            // console.log('email',email)
            if (!email) {
                res.send([]);
            }
            const query = { email: email };
            const result = await cartsCollection.find(query).toArray();
            res.send(result);
        })

        // delete single cart data using delete api
        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { _id: new ObjectId(id) };
            const result = await cartsCollection.deleteOne(query);
            res.send(result);
        })
        // post single data
        app.post('/carts', async (req, res) => {
            const item = req.body;
            // console.log(item);
            const result = await cartsCollection.insertOne(item);
            res.send(result)
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (rea, res) => {
    res.send('Bistro boss server is running');
})
app.listen(port, () => {
    console.log(`Bistro boss server is running on port :${port}`)
})