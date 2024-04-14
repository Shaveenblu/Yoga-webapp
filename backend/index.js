const express = require('express')
const app = express()
const cors = require('cors')

//2w0rLVzDdumt1zBj

//can be add any port 5000,3000
const port = process.env.PORT || 3000;
const stripe = require("stripe")(process.env.PAYMENT_SECRET);
const jwt = require('jsonwebtoken')
require('dotenv').config()

app.use(cors())
app.use(express.json())

// verify tokens

const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization
    if(!authorization){
        return res.status(401).send({message: 'invalid token'})
    }
    const token = authorization.split(' ')[1]
    jwt.verify(token, process.env.ASSER_SECRET, (err, decoded) => {
        if(err){
            return res.status(403).send({message: 'Forbidden'})
        }
        req.decoded = decoded
        next()
    })
}



const { MongoClient, ServerApiVersion,ObjectId, Transaction } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@yoga-master.6vuumkl.mongodb.net/?retryWrites=true&w=majority&appName=yoga-master`;

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

    //create db connection
    const database = client.db("yoga-master")
    const usersCollection = database.collection("users")
    const classesCollection = database.collection("classes")
    const cartCollection = database.collection("cart")
    const paymentCollection = database.collection("payments")
    const enrolledCollection = database.collection("enrolled")
    const appliedCollection = database.collection("applied")

    app.post('/api/set-token',async(req,res)=> {
        const user = req.body
        const token = jwt.sign(user, process.env.ASSER_SECRET, {
            expiresIn: '24h'
        })
        res.send(token)
  })

    // middleware for admin and instructor
    const verifyAdmin = async(req, res, next) => {
        const email = req.decoded.email
        const query = { email: email }
        const user = await usersCollection.findOne(query)
        if(user.role === 'admin'){
            next()
        } else {
            return res.status(403).send({message: 'Forbidden access'})
        }
    }

    const verifyInstructor = async(req, res, next) => {
        const email = req.decoded.email
        const query = { email: email }
        const user = await usersCollection.findOne(query)
        if(user.role === 'instructor'){
            next()
        } else {
            return res.status(403).send({message: 'Unauthorized access'})
        }
    }
    // routes for users
    app.post('/new-user',async(req,res)=> {
        const newUser = req.body
        const result = await usersCollection.insertOne(newUser)
        res.send(result)
    })

    app.get('/users',async(req,res)=> {
        const result = await usersCollection.find({}).toArray()
        res.send(result)
    })

    app.get('/users/:id',async(req,res) => {
        const id = req.params.id
        const query = {_id: new ObjectId(id)}
        const result = await usersCollection.findOne(query)
        res.send(result)
    })

    app.get('/user/:email',verifyJWT,async(req,res)=> {
        const email = req.params.email
        const query = { email: email }
        const result = await usersCollection.findOne(query)
        res.send(result)
    })

    app.delete('/delete-user/:id',verifyJWT,verifyAdmin,async(req,res)=> {
        const id = req.params.id
        const query = {_id: new ObjectId(id)}
        const result = await usersCollection.deleteOne(query)
        res.send(result)
    })
    app.put('/update-user/:id',verifyJWT,verifyAdmin,async(req,res)=> {
        const id = req.params.id
        const updatedUser = req.body
        const filter = {_id: new ObjectId(id)}
        const options = { upsert: true }
        const updatedDoc = {
            $set: {
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.option,
                address: updatedUser.address,
                about: updatedUser.about,
                photoUrl: updatedUser.photoUrl,
                skills: updatedUser.skills ? updatedUser.skills : null
            }
        }
        const result = await usersCollection.updateOne(filter, updatedDoc, options)
        res.send(result)
    })



// classes routes
     app.post('/new-class',verifyJWT,verifyInstructor,async (req,res) => {
         const newClass = req.body;
         //newClass.availableSeats = parseInt(newClass.availableSeats)
         const result = await classesCollection.insertOne(newClass)
            res.send(result)
     })
     app.get('/classes',async (req,res) => {
        const query = { status : 'approved'}
        const result = await classesCollection.find().toArray()
        res.send(result)
    })
    app.get('/classes/:email',verifyJWT,verifyInstructor,async(req,res)=>{
        const email = req.params.email;
        const query = {InstructorMail : email}
        const result = await classesCollection.find().toArray();
        res.send(result)
    })

    //average classes
    app.get('/classes-manage', async(req,res) => {
        res.send(result)
    })


    //update classes
    app.patch('/change-status/:id',verifyJWT,verifyAdmin, async(req,res) =>{
        const id = req.params.id
        const status = req.body.status
        const why = req.body.Why
        const filter = {_id: new ObjectId(id)}
        const options = { upsort: true}
        const updateDoc = {
            $set: {
                status: status,
                Why: why,
            },
        }
        const result = await classesCollection.updateOne(filter, updateDoc, options)
        res.send(result)
    })

    app.get('/approved-classes' ,async(req,res)=>{
        const query = { status: 'approved' }
        const result = await classesCollection.find(query).toArray()
        res.send(result)
    })

    // get single details
    app.get('/class/:id',async(req,res)=> {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await classesCollection.findOne(query)
        res.send(result)
    })

    // update class details
    app.put('/update-class/:id',verifyJWT,verifyInstructor,async(req,res) => {
        const id = req.params.id;
        const updateClass = req.body
        const filter = {_id: new ObjectId(id)}
        const options = { upsort:true }
        const updateDoc = {
            $set: {
                name: updateClass.name,
                description: updateClass.description,
                price: updateClass.price,
                Enrolled: parseInt(updateClass.availableSeats),
                videolink: updateClass.videoLink,
                status: 'pending'
            }
        }
        const result = await classesCollection.updateOne(filter, updateDoc, options)
        res.send(result)

    })

    // Cart routes
    app.post('/add-to-cart',verifyJWT,async(req,res)=>{
        const newCartItem = req.body
        const result = await cartCollection.insertOne(newCartItem)
        res.send(result)
    })

    // get cart items
    app.get('/cart-item/:id',verifyJWT,async(req,res) => {
        const id = req.params.id
        const email = req.body.email
        const query = {
            classId: id,
            usermail: email,
        }
        const projection = { classId: 1 }
        const result = await cartCollection.findOne(query, {projection: projection})
        res.send(result)
    })

    // cart info by userid
    app.get('/cart/:email',verifyJWT,async(req,res)=> {
        const email = req.params.email
        const query = { usermail:email }
        const projection = {classId: 1}
        const carts = await cartCollection.find(query, {projection: projection})
        const classIds = carts.map((cart) => new ObjectId(cart.classId))
        const query2 = {_id: {$in: classIds}}
        const result = await cartCollection.find(query2).toArray()
        res.send(result)
    })

    app.delete('/delete-cart-item/:id',verifyJWT,async(req,res) => {
        const id = req.params.id
        const query = {classId:id}
        const result = await cartCollection.deleteOne(query)
        res.send(result)
    })

    // Payment routes
    app.post("/create-payment-intent", async (req, res) => {
        const { price } = req.body;
        const amount = parseInt(price) * 100;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "usd",
            payment_method_type: ["card"],
        })
            res.send({
                clientSecret: paymentIntent.client_secret
            })

        })

    app.post('/payment-info',verifyJWT,async(req,res)=> {
        const paymentInfo = req.body
        const classesId = paymentInfo.classesId
        const userEmail = paymentInfo.userEmail
        const singleClassId = req.query.classId
            let query
            if(singleClassId){
                query = {classesId: singleClassId, usermail: userEmail}
            }else {
                query = {classId: {$in: classesId}, usermail: userEmail}
            }

            const classesQuery = {_id: {$in: classesId.map(id=> new ObjectId(id))}}
            const classes = await classesCollection.find(classesQuery).toArray()
            const newEnrolledData = {
                userEmail: userEmail,
                classId: singleClassId.map(id=> new ObjectId(id)),
                transactionId: paymentInfo.transactionId
            }

            const updatedDoc = {
                $set: {
                    totalEnrolled: classes.reduce((total, current) => total + current.totalEnrolled, 0)+ 1 || 0,
                    availableSeats: classes.reduce((total,current) => total + current.availableSeats, 0)-1 || 0
                }
            }

            const updatedResult = await classesCollection.updateMany(classQuery, updatedDoc, {upsort: true})
            const enrolledResult = await enrolledCollection.insertOne(newEnrolledData)
            const deletedResult = await cartCollection.deleteMany(query)
            const paymentResult = await paymentCollection.insertOne(paymentInfo)

            res.send({paymentResult, deletedResult, enrolledResult, updatedResult})
            
    })

    // payment history
    app.get('/payment-history/:email',async(req,res) => {
        const email = req.params.email
        const query = { userEmail: email }
        const result = await paymentCollection.find(query).sort({date: -1}).toArray()
        res.send(result)
   
    })

    // payment history length
    app.get('/payment-history-length/:email',async(req,res)=> {
        const email = req.params.email
        const query = { userEmail: email}
        const total = await paymentCollection.countDocuments(query).sort({date: -1}).to
        res.send(total)
    })
    
    // enrollment routes
    app.get('/popular-classes',async(req,res) => {
        const result = await classesCollection.find().sort({totalEnrolled: -1}).limit(6).toArray()
        res.send(result)
    })

    app.get('/popular-instructors',async(req,res) => {
        const pipeline = [{
            $group: {
                _id: '$instructorEmail',
                totalEnrolled: {$sum: "$totalEnrolled"}
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "email",
                as: "instructor"
            }
        },
        {
            $project: {
                _id: 0,
                instructor: {
                    $arrayElement: ['$instructor',0]
                },
                totalEnrolled: 1
            },
        },
        {
            $sort: {
                totalEnrolled: -1
            }
        },
        {
            $limit: 6
        }
    ]

    const result = await classesCollection.aggregate(pipeline).toArray()
    res.send(result)
    })

    app.get('/admin-stats',verifyJWT,verifyAdmin,async(req,res) => {
        const approvedClasses = ((await classesCollection.find({status: 'approved'})).toArray()).length
        const pendingClasses = ((await classesCollection.find({status: 'pending'})).toArray()).length
        const instructors = ((await usersCollection.find({role: 'instructor'})).toArray()).length
        const totalClasses = (await classesCollection.find().toArray()).length

        const result = {
            approvedClasses,
            pendingClasses,
            instructors,
            totalClasses
        }

        res.send(result)
    })

    // get all instructor
    app.get('/instructors',async(req,res) => {
        const result  = await usersCollection.find({role: 'instructor'}).toArray()
        res.send(result)
    })

    app.get('/enrolled-classes/:email',verifyJWT,async(req,res) => {
        const email = req.params.email
        const query = { userEmail: email}
        const pipeline = [
            {
                $match: query
            },
            {
                $lookup: {
                    from: 'classes',
                    localField: 'classesID',
                    foreignField: '_id',
                    as: 'class'
                }
            },
            {
                $unwind: '$classes'
            }, 
            {
                $lookup: {
                    from: 'users',
                    localStorage: 'classes.instructorEmail',
                    foreignField: '_id',
                    as: 'instructor'
                }
            },
            {
                $project: {
                    _id: 0,
                    instructor: {
                        $arrayElement: ["$instructor", 0]
                    },
                    classes: 1
                }
            }
        ]

        const result = await enrolledCollection.aggregate(pipeline).toArray()
        res.send(result)
    })

    // applied for isntructor
    app.post('/ass-instructor',async(req,res)=> {
        const data = req.body
        const result = await appliedCollection.insertOne(data)
        res.send(result)
    })

    // get applied instructors
    app.get('/applied-instructors/:email',async(req,res)=> {
        const email = req.params.email
        const result = await appliedCollection.findOne({email})
        res.send(result)
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World!')
})
      
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
      
