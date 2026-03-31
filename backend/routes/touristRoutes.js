const express = require("express");
const router = express.Router();

const Tourist = require("../models/Tourist");   // ⭐ ADD THIS

const { registerTourist, loginTourist, updateLocation,triggerSOS, getProfile } =
require("../controllers/touristController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", registerTourist);
router.post("/login", loginTourist);

router.put("/update-location", authMiddleware, updateLocation);
router.get("/profile",authMiddleware,getProfile);

/* GET ALL TOURISTS */

router.get("/all", async (req, res) => {
    try {
        const tourists = await Tourist.find().select("-password");
        res.json(tourists);
    } catch (error) {
        console.error("ERROR FETCHING TOURISTS:", error);
        res.status(500).json({ error: error.message });
    }
});

/* SOS ALERT */
router.put("/sos", authMiddleware, async (req,res)=>{

const tourist = await Tourist.findById(req.user.id);

tourist.isEmergency = true;
tourist.riskStatus = "Danger";

await tourist.save();

res.json({message:"SOS Alert Sent 🚨"});

});
/* RESOLVE EMERGENCY + ADMIN RESPONSE */
router.put("/resolve/:id", async (req, res) => {
  try {
    const tourist = await Tourist.findById(req.params.id);

    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // 🧑‍✈️ Admin message
    const { response } = req.body;

    tourist.adminResponse = response || "Issue resolved";

    // ✅ Update status
    tourist.isEmergency = false;
    tourist.riskStatus = "Safe";
    tourist.safetyScore = 100;

    await tourist.save();

    res.json({
      message: "Tourist marked safe ✅",
      adminResponse: tourist.adminResponse
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
