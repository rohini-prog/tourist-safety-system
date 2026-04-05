const API = "https://tourist-safety-system-27zy.onrender.com/api/tourist";

/* ================= REGISTER ================= */

async function register() {

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const passport = document.getElementById("passport").value;
  const mobile = document.getElementById("mobile").value;
  const emergencyContact = document.getElementById("emergencyContact").value;

  try {

    const res = await fetch(API + "/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name,
        email,
        password,
        passport,
        mobile,
        emergencyContact
      })
    });

    const data = await res.json();

    console.log(data);

    if (res.ok) {

      alert("Registration Successful ✅");

      // ✅ SHOW DIGITAL ID CARD
      document.getElementById("idCard").style.display = "block";
      document.getElementById("cardName").innerText = name;
      document.getElementById("cardPassport").innerText = passport;
      document.getElementById("cardDigital").innerText =
        data.digitalID || "Generated";

      // ✅ REDIRECT AFTER 2 SECONDS
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);

    } else {
      alert(data.message || "Registration failed ❌");
    }

  } catch (error) {
    console.error(error);
    alert("Server error ❌");
  }
}

/* ================= LOGIN ================= */

async function login() {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {

    const res = await fetch(API + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    console.log(data); // debug

    if (res.ok) {
      alert("Login Successful ✅");

      // save token
      localStorage.setItem("token", data.token);

      // 🔥 REDIRECT
      window.location.href = "dashboard.html";

    } else {
      alert(data.message);
    }

  } catch (error) {
    console.error(error);
    alert("Login failed ❌");
  }
}

/* ================= MULTILINGUAL ================= */

const translations = {
  en: {
    dashboardTitle: "Smart Tourist Dashboard",
    mapTitle: "Tourist Location Map",
    digitalId: "Digital Tourist ID",
    verified: "Verified",
    safety: "Safety Status",
    safe: "Safe",
    tracking: "Location Tracking",
    active: "Active",
    update: "Update Location",
    sos: "SOS Emergency"
  },
  hi: {
    dashboardTitle: "स्मार्ट पर्यटक डैशबोर्ड",
    mapTitle: "पर्यटक स्थान मानचित्र",
    digitalId: "डिजिटल पर्यटक आईडी",
    verified: "सत्यापित",
    safety: "सुरक्षा स्थिति",
    safe: "सुरक्षित",
    tracking: "स्थान ट्रैकिंग",
    active: "सक्रिय",
    update: "स्थान अपडेट करें",
    sos: "आपातकालीन सहायता"
  }
};

function changeLanguage(lang) {
  if (document.getElementById("dashboardTitle"))
    document.getElementById("dashboardTitle").innerText = translations[lang].dashboardTitle;

  if (document.getElementById("mapTitle"))
    document.getElementById("mapTitle").innerText = translations[lang].mapTitle;

  if (document.getElementById("digitalIdLabel"))
    document.getElementById("digitalIdLabel").innerText = translations[lang].digitalId;

  if (document.getElementById("digitalStatus"))
    document.getElementById("digitalStatus").innerText = translations[lang].verified;

  if (document.getElementById("safetyLabel"))
    document.getElementById("safetyLabel").innerText = translations[lang].safety;

  if (document.getElementById("safetyStatus"))
    document.getElementById("safetyStatus").innerText = translations[lang].safe;

  if (document.getElementById("trackingLabel"))
    document.getElementById("trackingLabel").innerText = translations[lang].tracking;

  if (document.getElementById("trackingStatus"))
    document.getElementById("trackingStatus").innerText = translations[lang].active;

  if (document.getElementById("updateBtn"))
    document.getElementById("updateBtn").innerText = translations[lang].update;

  if (document.getElementById("sosBtn"))
    document.getElementById("sosBtn").innerText = translations[lang].sos;
}

/* ================= MAP ================= */

let map;
let marker;

function loadMap(lat = 17.3850, lng = 78.4867) {

  console.log("Map loading...");

  map = L.map('map').setView([lat, lng], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);

  marker = L.marker([lat, lng]).addTo(map)
    .bindPopup("Tourist Current Location")
    .openPopup();

  // Danger zone
  L.circle([17.3950, 78.4950], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.4,
    radius: 1000
  }).addTo(map).bindPopup("⚠ Restricted Area");

  console.log("Map loaded successfully ✅");
}

/* ================= GEO-FENCE ================= */

function checkGeoFence(lat, lng) {
  const dangerLat = 17.3950;
  const dangerLng = 78.4950;
  const radius = 0.01;

  if (Math.abs(lat - dangerLat) < radius && Math.abs(lng - dangerLng) < radius) {
    alert("⚠ Warning! You are entering a restricted area!");
    triggerSOS();
  }
}

/* ================= LOCATION ================= */

async function updateLocation() {

  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const token = localStorage.getItem("token");

    await fetch(API + "/update-location", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ latitude: lat, longitude: lng })
    });

    if (marker) {
      marker.setLatLng([lat, lng]);
      map.setView([lat, lng], 13);
    }

    checkGeoFence(lat, lng);

  }, () => {
    alert("Unable to get location");
  });
}

/* ================= SOS ================= */

async function triggerSOS() {
  const token = localStorage.getItem("token");

  await fetch(API + "/sos", {
    method: "PUT",
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  alert("🚨 Emergency Alert Sent!");
}

/* ================= GET RESPONSE ================= */

async function getTouristData() {
  const token = localStorage.getItem("token");

  const res = await fetch(API + "/profile", {
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  const data = await res.json();

  document.getElementById("adminResponse").innerText =
    "Response: " + (data.response || "Waiting...");
}

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {

  console.log("Page Loaded ✅");

  const savedLang = localStorage.getItem("lang") || "en";
  changeLanguage(savedLang);

  if (document.getElementById("map")) {
    loadMap();
  }

});

async function markSafe() {

  const token = localStorage.getItem("token");

  await fetch(API + "/resolve", {
    method: "PUT",
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  alert("✅ Issue marked as resolved");

  // refresh UI
  getTouristData();
}
