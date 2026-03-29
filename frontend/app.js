const API="https://tourist-safety-system-27zy.onrender.com/api/tourist";
const savedLang = localStorage.getItem("lang") || "en";
changeLanguage(savedLang);
const translations = {
  en: {
    loginTitle: "Login",
    loginBtn: "Login"
  },
  hi: {
    loginTitle: "लॉगिन",
    loginBtn: "लॉगिन करें"
  }const API = "https://tourist-safety-system-27zy.onrender.com/api/tourist";

/* ================= MULTILINGUAL ================= */

const translations = {
en: {
loginTitle: "Login",
loginBtn: "Login",
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
loginTitle: "लॉगिन",
loginBtn: "लॉगिन करें",
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
},
te: {
loginTitle: "లాగిన్",
loginBtn: "లాగిన్ చేయండి",
dashboardTitle: "స్మార్ట్ పర్యాటక డాష్‌బోర్డ్",
mapTitle: "పర్యాటక స్థానం మ్యాప్",
digitalId: "డిజిటల్ పర్యాటక ID",
verified: "ధృవీకరించబడింది",
safety: "భద్రత స్థితి",
safe: "సురక్షితం",
tracking: "స్థానం ట్రాకింగ్",
active: "సక్రియ",
update: "స్థానం నవీకరించండి",
sos: "అత్యవసర సహాయం"
}
};

function changeLanguage(lang) {
if (document.getElementById("loginTitle"))
document.getElementById("loginTitle").innerText = translations[lang].loginTitle;

if (document.getElementById("loginBtn"))
document.getElementById("loginBtn").innerText = translations[lang].loginBtn;

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

/* Load language + map */
document.addEventListener("DOMContentLoaded", () => {
const savedLang = localStorage.getItem("lang") || "en";
changeLanguage(savedLang);

if (document.getElementById("map")) {
loadMap();
}
});

/* ================= REGISTER ================= */

async function register() {
const name = document.getElementById("name").value;
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;
const passport = document.getElementById("passport").value;
const mobile = document.getElementById("mobile").value;
const emergencyContact = document.getElementById("emergencyContact").value;

const res = await fetch(API + "/register", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ name, email, password, passport, mobile, emergencyContact })
});

const data = await res.json();

if (data.digitalID) {
document.getElementById("idCard").style.display = "block";
document.getElementById("cardName").innerText = name;
document.getElementById("cardPassport").innerText = passport;
document.getElementById("cardDigital").innerText = data.digitalID;

```
setTimeout(() => {
  window.location.href = "login.html";
}, 3000);
```

} else {
alert(data.message);
}
}

/* ================= LOGIN ================= */

async function login() {
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const res = await fetch(API + "/login", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ email, password })
});

const data = await res.json();

if (data.token) {
localStorage.setItem("token", data.token);
window.location.href = "dashboard.html";
} else {
alert(data.message);
}
}

/* ================= ADMIN LOGIN ================= */

function adminLogin() {
const email = document.getElementById("adminEmail").value;
const password = document.getElementById("adminPassword").value;

if (email === "[admin@gmail.com](mailto:admin@gmail.com)" && password === "admin123") {
window.location.href = "admin.html";
} else {
alert("Invalid Admin Credentials");
}
}

/* ================= SOS ================= */

async function triggerSOS() {
const token = localStorage.getItem("token");

await fetch(API + "/sos", {
method: "PUT",
headers: { "Authorization": "Bearer " + token }
});

alert("🚨 Emergency Alert Sent!");
}

/* ================= MAP ================= */

let map;
let marker;

function loadMap(lat = 17.3850, lng = 78.4867) {
map = L.map('map').setView([lat, lng], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
maxZoom: 19
}).addTo(map);

marker = L.marker([lat, lng]).addTo(map)
.bindPopup("Tourist Current Location")
.openPopup();

// Danger Zone
L.circle([17.3950, 78.4950], {
color: 'red',
fillColor: '#f03',
fillOpacity: 0.4,
radius: 1000
}).addTo(map).bindPopup("⚠ Restricted Area");
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

/* ================= LOCATION UPDATE ================= */

async function updateLocation() {
if (!navigator.geolocation) {
alert("Geolocation not supported");
return;
}

navigator.geolocation.getCurrentPosition(async (position) => {
const lat = position.coords.latitude;
const lng = position.coords.longitude;

```
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
```

}, () => {
alert("Unable to retrieve location");
});
}
,
  te: {
    loginTitle: "లాగిన్",
    loginBtn: "లాగిన్ చేయండి"
  }
};
function changeLanguage(lang) {
  document.getElementById("loginTitle").innerText = translations[lang].loginTitle;
  document.getElementById("loginBtn").innerText = translations[lang].loginBtn;
}
const savedLang = localStorage.getItem("lang") || "en";
changeLanguage(savedLang);

/* REGISTER */

async function register(){

const name=document.getElementById("name").value;
const email=document.getElementById("email").value;
const password=document.getElementById("password").value;
const passport=document.getElementById("passport").value;
const mobile=document.getElementById("mobile").value;
const emergencyContact=document.getElementById("emergencyContact").value;

const res = await fetch("https://tourist-safety-system-27zy.onrender.com/api/tourist/register",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
name,
email,
password,
passport,
mobile,
emergencyContact
})
});

const data = await res.json();

if(data.digitalID){

// Show Digital ID Card
document.getElementById("idCard").style.display="block";
document.getElementById("cardName").innerText=name;
document.getElementById("cardPassport").innerText=passport;
document.getElementById("cardDigital").innerText=data.digitalID;

// Redirect after 3 seconds
setTimeout(()=>{
window.location.href="login.html";
},3000);

}else{
alert(data.message);
}

}


async function login(){

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

try {

const res = await fetch(API + "/login", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ email, password })
});

console.log("Response:", res);

const data = await res.json();
console.log("Data:", data);

// ✅ Check success
if (data.token) {

localStorage.setItem("token", data.token);
console.log("Token saved:", data.token);

// redirect after success
window.location.href = "dashboard.html";

} else {

alert(data.message || "Login failed");

}

} catch (error) {

console.error("Login error:", error);
alert("Something went wrong");

}

}

















function adminLogin(){

const email = document.getElementById("adminEmail").value;
const password = document.getElementById("adminPassword").value;

if(email === "admin@gmail.com" && password === "admin123"){

alert("Admin Login Successful");

window.location.href = "admin.html";

}else{

alert("Invalid Admin Credentials");

}

}

/* SOS */

async function triggerSOS(){

const token = localStorage.getItem("token");

const res = await fetch("https://tourist-safety-system-27zy.onrender.com/api/tourist/sos",{
method:"PUT",
headers:{
"Authorization":"Bearer "+token
}
});

console.log(token)
console.log(res)

alert("🚨 Emergency Alert Sent!");

}
let map;
let marker;

function loadMap(lat=17.3850, lng=78.4867){

map = L.map('map').setView([lat,lng],13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom:19
}).addTo(map);

marker = L.marker([lat,lng]).addTo(map)
.bindPopup("Tourist Current Location")
.openPopup();
}
function loadMap(lat = 17.3850, lng = 78.4867){

map = L.map('map').setView([lat,lng],13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom:19
}).addTo(map);


function checkGeoFence(lat, lng){

const dangerLat = 17.400;
const dangerLng = 78.500;
const radius = 0.01;   // zone detection range

const distance = Math.sqrt(
Math.pow(lat - dangerLat,2) +
Math.pow(lng - dangerLng,2)
);

if(distance < radius){

alert("⚠ WARNING: You are entering a restricted area!");

triggerSOS(); // automatically send emergency alert

}

}

/* Tourist marker */

marker = L.marker([lat,lng]).addTo(map)
.bindPopup("Tourist Current Location")
.openPopup();

/* Geo-Fence Danger Zone */

var dangerZone = L.circle([17.3950, 78.4950],{
color: 'red',
fillColor: '#f03',
fillOpacity: 0.4,
radius: 1000
}).addTo(map);

dangerZone.bindPopup("⚠ Restricted Area");

}
function checkGeoFence(lat,lng){

const dangerLat = 17.3950;
const dangerLng = 78.4950;
const radius = 0.01;

if(Math.abs(lat-dangerLat) < radius && Math.abs(lng-dangerLng) < radius){

alert("⚠ Warning! You are entering a restricted area!");

triggerSOS();

}

}async function updateLocation(){

if(!navigator.geolocation){
alert("Geolocation is not supported by this browser");
return;
}

navigator.geolocation.getCurrentPosition(async function(position){

const lat = position.coords.latitude;
const lng = position.coords.longitude;

const token = localStorage.getItem("token");

await fetch(API + "/update-location",{
method:"PUT",
headers:{
"Content-Type":"application/json",
"Authorization":"Bearer " + token
},
body: JSON.stringify({
latitude: lat,
longitude: lng
})
});

if(marker){
marker.setLatLng([lat,lng]);
map.setView([lat,lng],13);
}

setInterval(()=>{
    updateLocation();
},10000);

/* GEO-FENCE CHECK */
checkGeoFence(lat,lng);
console.log("Location Updated Successfully");

}, function(error){

alert("Unable to retrieve location");

});

}
