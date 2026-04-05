const express = require("express");
const router = express.Router();

const Tourist = require("../models/Tourist");

const {
  registerTourist,
  loginTourist,
  updateLocation,
  triggerSOS,
  getProfile
} = require("../controllers/touristController");

const authMiddleware = require("../middleware/authMiddleware");

// ================= AUTH =================
router.post("/register", registerTourist);
router.post("/login", loginTourist);

// ================= TOURIST =================
router.put("/update-location", authMiddleware, updateLocation);
router.get("/profile", authMiddleware, getProfile);

// ================= GET ALL TOURISTS (ADMIN) =================
router.get("/all", async (req, res) => {
  try {
    const tourists = await Tourist.find().select("-password");
    res.json(tourists);
  } catch (error) {
    console.error("ERROR FETCHING TOURISTS:", error);
    res.status(500).json({ error: error.message });
  }
});

// ================= SOS ALERT =================
router.put("/sos", authMiddleware, async (req, res) => {
  try {
    const tourist = await Tourist.findById(req.user.id);

    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    tourist.isEmergency = true;
    tourist.riskStatus = "Danger";

    await tourist.save();

    res.json({ message: "SOS Alert Sent 🚨" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================= ADMIN SEND MESSAGE =================
router.post("/send-response/:id", async (req, res) => {
  try {

    const tourist = await Tourist.findById(req.params.id);

    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    const { message } = req.body;

    // 💬 Save admin message
    tourist.response = message;

    await tourist.save();

    res.json({
      message: "Message sent successfully",
      response: tourist.response
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================= TOURIST RESOLVE EMERGENCY =================
router.put("/resolve", authMiddleware, async (req, res) => {
  try {

    const tourist = await Tourist.findById(req.user.id);

    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // ✅ Mark safe
    tourist.isEmergency = false;
    tourist.riskStatus = "Safe";
    tourist.safetyScore = 100;

    tourist.response = "Issue resolved ✅";

    await tourist.save();

    res.json({
      message: "Issue resolved successfully",
      riskStatus: tourist.riskStatus
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
