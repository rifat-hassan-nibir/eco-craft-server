require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.okheupy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const allCraftsCollection = client.db("artAndCraftDB").collection("juteAndWoodenCrafts");

    // Get art and craft items
    app.get("/all-items", async (req, res) => {
      const cursor = allCraftsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Add art and craft items
    app.post("/add-craft-item", async (req, res) => {
      const artAndCraftItems = req.body;
      console.log(artAndCraftItems);
      const result = await allCraftsCollection.insertOne(artAndCraftItems);
      res.send(result);
    });

    // Get single item data with id using fetch
    app.get("/craft-item-details/:id", async (req, res) => {
      const id = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await allCraftsCollection.findOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running fine");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
