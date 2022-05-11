const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


// middleware 
app.use(cors());
app.use(express.json());


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authoraizetion;
    console.log(authHeader);
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' });
    }
    const token = authHeader.split(' ')[1];
    console.log(token);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fcoza.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('prefume-warehouse').collection('perfumes');
        const userReview = client.db('prefume-warehouse').collection('review');


        //genarate token
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '3d'
            });
            res.send({ accessToken });
        })

        //products api
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        //API for get products by ID
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) }
            console.log(query)
            const products = await productCollection.findOne(query);
            res.send(products);
        });

        // Add products API 
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        });

        // Update Poructs API 
        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: { ...data },
            };
            const result = await productCollection.updateOne(filter, updateDoc, options)
            console.log('updated')
            res.json(result)
        })

        // Delete Product API 
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        });

        //Get user By email Address
        app.get('/userAedded', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (decodedEmail === email) {
                const query = { email: email };
                const cursor = productCollection.find(query);
                const products = await cursor.toArray();
                res.send(products);
            }
            else {
                res.status(403).send({ message: 'Forbidden Access' })
            }

        });

        app.delete('/userAedded/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        });

        // Get User Review API
        app.get('/review', async (req, res) => {
            const query = {};
            const cursor = userReview.find(query);
            const products = await cursor.toArray();
            res.send(products);

        });

        //post review from client side
        app.post('/review', async (req, res) => {
            const newProduct = req.body;
            const result = await userReview.insertOne(newProduct);
            res.send(result);
        });

    } finally {

    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Server Running')
})
app.listen(port, () => {
    console.log('server running')
})

