const express = require("express");
const router = express.Router();

const Tourist = require("../models/Tourist");   // ⭐ ADD THIS

const { registerTourist, loginTourist, updateLocation } =
require("../controllers/touristController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", registerTourist);
router.post("/login", loginTourist);

router.put("/update-location", authMiddleware, updateLocation);

/* GET ALL TOURISTS */

router.get("/all", async (req,res)=>{

const tourists = await Tourist.find();

res.json(tourists);

});

/* SOS ALERT */
router.put("/sos", authMiddleware, async (req,res)=>{

const tourist = await Tourist.findById(req.user.id);

tourist.isEmergency = true;
tourist.riskStatus = "Danger";

await tourist.save();

res.json({message:"SOS Alert Sent 🚨"});

});


module.exports = router;