const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const touristRoutes = require("./routes/touristRoutes");
const { touristChain } = require("./blockchain/blockchain");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/touristSafety")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Test route
app.get("/", (req, res) => {
    res.send("Smart Tourist Safety Backend Running");
});

// Blockchain route
app.get("/blockchain", (req,res)=>{
    res.json(touristChain.chain);
});

// Tourist API routes
app.use("/api/tourist", touristRoutes);

// Start server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});