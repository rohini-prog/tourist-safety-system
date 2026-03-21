const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const touristRoutes = require("./routes/touristRoutes");
const { touristChain } = require("./blockchain/blockchain");

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Test route
app.get("/", (req, res) => {
    res.send("Smart Tourist Safety Backend Running");
});

// ✅ Blockchain route
app.get("/blockchain", (req, res) => {
    res.json(touristChain.chain);
});
mongoose.connection.on("connected", () => {
    console.log("MongoDB Connected ✅");
});
// ✅ Tourist API routes
app.use("/api/tourist", touristRoutes);

// ✅ MongoDB connection + start server
mongoose.set("strictQuery", true);

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected ✅");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} 🚀`);
        });

    } catch (error) {
        console.error("MongoDB Error ❌:", error);
    }
};

startServer();