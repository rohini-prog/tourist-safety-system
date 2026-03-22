const API="https://tourist-safety-system-27zy.onrender.com/api/tourist";

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
/* LOGIN */

async function login(){

const email=document.getElementById("email").value;
const password=document.getElementById("password").value;

const res=await fetch(API+"/login",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({email,password})
});

const data=await res.json();

localStorage.setItem("token",data.token);
console.log(data.token)
window.location.href="dashboard.html";

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
