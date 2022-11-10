const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
m;
//all the middle wares
app.use(cors());
app.use(express.json());
console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);
console.log(process.env.ACCESS_TOKEN_SECRET);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.v3wd6au.mongodb.net/?retryWrites=true&w=majority`;



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).send({message: 'unauthorized access'});
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'Forbidden access'});
        }
        req.decoded = decoded;
        next();
    })
}


async function run() {
    try {
        const serviceCollection = client.db('yummyFood').collection('services');
        const orderCollection = client.db('yummyFood').collection('orders');
        const reviewCollection = client.db('yummyFood').collection('reviews');

        app.post('/jwt', (req, res) =>{
            const user = req.body;
            console.log(user);
            
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30d'})
            
            res.send({token})
        })  

        app.get('/serviceshome', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query).limit(3);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: id };
           
            
            console.log(query);
            const service = await serviceCollection.findOne(query);
            res.send(service);
            
        });

        app.get('/services2/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: id };
           
            
            console.log(query);
            const service = await serviceCollection.findOne(query);
            res.send(service);
            
        });

        app.post('/serviceadd', verifyJWT, async (req, res) => {
            const serviceadd = req.body;
            const result = await serviceCollection.insertOne(serviceadd);
            res.send(result);
        });

 



        app.patch('/reviews/:id1', verifyJWT, async (req, res) => {
            const id = req.params.id1;
            const query = { service: id };
           
            
            console.log(query);
            const cursor = reviewCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
            
            
        })


        // orders api
        app.get('/orders', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            
            if(decoded.email !== req.query.email){
                res.status(403).send({message: 'unauthorized access'})
            }

            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        });

        app.post('/orders', verifyJWT, async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        });

        app.patch('/orders/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const status = req.body.status
            const query = { _id: ObjectId(id) }
            const updatedDoc = {
                $set:{
                    status: status
                }
            }
            const result = await orderCollection.updateOne(query, updatedDoc);
            res.send(result);
        })

        app.delete('/orders/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        })



        // reviews api

        app.get('/Uniquereviews/:id', async (req, res) => {
           
            const id = req.params.id;
            
            let query = { service: id }
        
console.log(query );
          
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });


        app.get('/reviews', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            
            if(decoded.email !== req.query.email){
                res.status(403).send({message: 'unauthorized access'})
            }

            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.post('/reviews', verifyJWT, async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });

        app.patch('/reviews/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const review = req.body;
            const query = { _id: ObjectId(id) }
            const updatedDoc = {
                $set:{
                     review
                }
            }
            const result = await reviewCollection.updateOne(query, updatedDoc);
            res.send(result);
        })

        app.delete('/reviews/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })



    }
    finally {

    }

}

run().catch(err => console.error(err));


app.get('/', (req, res) => {
    res.send('assignment server is running')
})

app.listen(port, () => {
    console.log(`assignment server running on ${port}`);
})