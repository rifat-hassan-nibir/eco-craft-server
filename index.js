const express = require("express");
const cors = require("cors");
require("dotenv").config();
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
    // await client.connect();

    const allCraftsCollection = client.db("artAndCraftDB").collection("juteAndWoodenCrafts");
    const subCategoriesCollection = client.db("artAndCraftDB").collection("subCategories");

    // Get art and craft items
    app.get("/all-items", async (req, res) => {
      const cursor = allCraftsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get sub-categories
    app.get("/sub-categories", async (req, res) => {
      const cursor = subCategoriesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get all data under single sub-category data
    app.get("/sub-category/:name", async (req, res) => {
      const name = req.params.name;
      console.log(name);
      const query = { subcategory_name: name };
      const result = await allCraftsCollection.find(query).toArray();
      res.send(result);
    });

    // Get data with email and customization both
    app.get("/customization/:email/:selectedOption", async (req, res) => {
      const email = req.params.email;
      const selectedOption = req.params.selectedOption;
      console.log(email, selectedOption);
      const query = { $and: [{ user_email: email }, { customization: selectedOption }] };
      const result = await allCraftsCollection.find(query).toArray();
      res.send(result);
    });

    // Add art and craft items
    app.post("/add-craft-item", async (req, res) => {
      const artAndCraftItems = req.body;
      const result = await allCraftsCollection.insertOne(artAndCraftItems);
      res.send(result);
    });

    // Get single item data with id
    app.get("/craft-item-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allCraftsCollection.findOne(query);
      res.send(result);
    });

    // Get all item data with email
    app.get("/my-art-and-craft-list/:email", async (req, res) => {
      const email = req.params.email;
      const query = { user_email: email };
      const result = await allCraftsCollection.find(query).toArray();
      res.send(result);
    });

    // Update single item data with id
    app.patch("/update-item/:id", async (req, res) => {
      const id = req.params.id;
      const item = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedItem = {
        $set: {
          image_url: item.image_url,
          item_name: item.item_name,
          subcategory_name: item.subcategory_name,
          short_description: item.short_description,
          price: item.price,
          rating: item.rating,
          customization: item.customization,
          processing_time: item.processing_time,
          stock_status: item.stock_status,
        },
      };

      const result = await allCraftsCollection.updateOne(filter, updatedItem);
      res.send(result);
    });

    // Delete my craft item using id
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allCraftsCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
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
