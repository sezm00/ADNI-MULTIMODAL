const { MongoClient, ServerApiVersion } = require('mongodb');

// MongoDB Atlas connection URI
// Replace <db_password> with your actual database password
const uri = "mongodb+srv://admin:alzheimerproject2@finance.nyj8xw4.mongodb.net/alzheimer-care?retryWrites=true&w=majority&appName=finance";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToMongoDB() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    
    console.log("✅ Pinged your deployment. You successfully connected to MongoDB!");
    
    return client;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    throw error;
  }
}

async function closeMongoDB() {
  try {
    // Ensures that the client will close when you finish/error
    await client.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
  }
}

// Export the functions and client
module.exports = {
  connectToMongoDB,
  closeMongoDB,
  client
};

// Run the connection if this file is executed directly
if (require.main === module) {
  connectToMongoDB()
    .then(() => {
      console.log("Connection test successful!");
      return closeMongoDB();
    })
    .catch(console.dir);
}
