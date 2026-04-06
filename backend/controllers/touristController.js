const Tourist = require("../models/Tourist");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Block, touristChain } = require("../blockchain/blockchain");


// ================= REGISTER TOURIST =================
exports.registerTourist = async (req, res) => {

try {

const { name, email, password, passport, mobile, emergencyContact } = req.body;

const existingTourist = await Tourist.findOne({ email });

if (existingTourist) {
return res.status(400).json({ message: "Email already registered" });
}

const hashedPassword = await bcrypt.hash(password, 10);

// generate digital tourist ID
const digitalID = Math.random().toString(16).substr(2,10);

// -------- BLOCKCHAIN BLOCK --------
const newBlock = new Block(
touristChain.chain.length,
Date.now(),
{
name,
passport,
digitalID
}
);

touristChain.addBlock(newBlock);

// -------- SAVE TOURIST --------
const tourist = new Tourist({
name,
email,
password: hashedPassword,
passport,
mobile,
emergencyContact,
digitalID
});

await tourist.save();

res.status(201).json({
message: "Tourist Registered Successfully",
digitalID
});

} catch (error) {
res.status(500).json({ error: error.message });
}

};



// ================= LOGIN =================
exports.loginTourist = async (req, res) => {

try {

const { email, password } = req.body;

const tourist = await Tourist.findOne({ email });

if (!tourist) {
return res.status(400).json({ message: "Tourist not found" });
}

const isMatch = await bcrypt.compare(password, tourist.password);

if (!isMatch) {
return res.status(400).json({ message: "Invalid credentials" });
}

const token = jwt.sign(
{ id: tourist._id },
"SECRET_KEY",
{ expiresIn: "1d" }
);

res.json({
message: "Login successful",
token
});

} catch (error) {
res.status(500).json({ error: error.message });
}

};



// ================= UPDATE LOCATION =================
exports.updateLocation = async (req, res) => {

try {

const { latitude, longitude } = req.body;

const tourist = await Tourist.findById(req.user.id);

if (!tourist) {
return res.status(404).json({ message: "Tourist not found" });
}
    


// -------- AI MOVEMENT ANALYSIS --------

let riskStatus = "Safe";

if (tourist.location) {

const prevLat = tourist.location.latitude;
const prevLng = tourist.location.longitude;

// distance
const distance = Math.sqrt(
Math.pow(latitude - prevLat, 2) +
Math.pow(longitude - prevLng, 2)
);

// time difference (seconds)
const timeDiff = (Date.now() - tourist.updatedAt) / 1000;

// speed
const speed = distance / timeDiff;

console.log("Distance:", distance);
console.log("Speed:", speed);

// 🚨 ANOMALY 1: No movement
if (distance < 0.00005) {
    riskStatus = "Warning";
}

// Ignore unrealistic large jumps (manual testing / teleport)
if (distance > 1) {
    console.log("Ignoring large jump (manual test)");
} else {

    // 🚨 ANOMALY 2: Sudden jump
    if (distance > 0.05) {
        riskStatus = "Danger";
    }

    // 🚨 ANOMALY 3: High speed
    if (speed > 0.01) {
        riskStatus = "Danger";
    }

}

// 🚨 ANOMALY 3: High speed
if (speed > 0.01) {
    riskStatus = "Danger";
}

}


// -------- GEO FENCING --------

const dangerZones = [

{ lat:17.400, lng:78.500, radius:0.05 },
{ lat:17.420, lng:78.470, radius:0.05 },
{ lat:17.360, lng:78.520, radius:0.05 },
{ lat:17.380, lng:78.450, radius:0.05 }

];

dangerZones.forEach(zone => {

const distance =
Math.sqrt(
Math.pow(latitude - zone.lat,2) +
Math.pow(longitude - zone.lng,2)
);

if(distance < zone.radius){
riskStatus = "Danger";
}

});
let safetyScore = 100;

if (riskStatus === "Warning") safetyScore = 70;
if (riskStatus === "Danger") safetyScore = 40;

tourist.safetyScore = safetyScore;
tourist.riskStatus  = riskStatus;


// -------- SAVE LOCATION --------

tourist.location = { latitude, longitude };
tourist.updatedAt = Date.now();

await tourist.save();

res.json({
message: "Location updated successfully",
riskStatus: tourist.riskStatus,
safetyScore: tourist.safetyScore,
});

} catch (error) {

res.status(500).json({ error: error.message });

}

};

exports.getProfile = async (req, res) => {
  try {

    const tourist = await Tourist.findById(req.user.id);

    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    res.json({
      name: tourist.name,
      riskStatus: tourist.riskStatus,
      safetyScore: tourist.safetyScore,
      response: tourist.response   // 👈 VERY IMPORTANT
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= SOS EMERGENCY =================
exports.triggerSOS = async (req, res) => {

try {

const tourist = await Tourist.findById(req.user.id);

if (!tourist) {
return res.status(404).json({ message: "Tourist not found" });
}

tourist.isEmergency = true;
tourist.riskStatus = "Danger";

await tourist.save();

res.json({
message: "Emergency alert sent",
tourist
});

} catch (error) {

res.status(500).json({ error: error.message });

}

};
// ================= ADMIN SEND RESPONSE =================
exports.sendResponse = async (req, res) => {
  try {

    const { touristId, message } = req.body;

    const tourist = await Tourist.findById(touristId);

    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // ✅ Save admin message
    tourist.response = message;

    await tourist.save();

    res.json({
      message: "Response sent successfully"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// ================= RESOLVE EMERGENCY =================
exports.resolveEmergency = async (req, res) => {
  try {

    const tourist = await Tourist.findById(req.user.id);

    if (!tourist) {
      return res.status(404).json({ message: "Tourist not found" });
    }

    // ✅ Change status
    tourist.isEmergency = false;
    tourist.riskStatus = "Safe";
    tourist.safetyScore = 100;

    // optional message
    tourist.response = "Issue resolved ✅";

    await tourist.save();

    res.json({
      message: "Marked as Safe",
      riskStatus: tourist.riskStatus
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
