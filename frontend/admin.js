const API = "https://tourist-safety-system-27zy.onrender.com/api/tourist";
const translations = {
  en: {
    title: "Live Tourist Tracking Map",
    total: "Total Tourists",
    active: "Active Tourists",
    safe: "Safe Tourists",
    sos: "SOS Alerts"
  },
  hi: {
    title: "पर्यटक ट्रैकिंग मानचित्र",
    total: "कुल पर्यटक",
    active: "सक्रिय पर्यटक",
    safe: "सुरक्षित पर्यटक",
    sos: "आपातकालीन अलर्ट"
  },
  te: {
    title: "పర్యాటక ట్రాకింగ్ మ్యాప్",
    total: "మొత్తం పర్యాటకులు",
    active: "సక్రియ పర్యాటకులు",
    safe: "సురక్షిత పర్యాటకులు",
    sos: "అత్యవసర హెచ్చరికలు"
  }
};
function changeLanguage(lang) {
  document.getElementById("title").innerText = translations[lang].title;
  document.getElementById("totalTouristsLabel").innerText = translations[lang].total;
  document.getElementById("activeTouristsLabel").innerText = translations[lang].active;
  document.getElementById("safeTouristsLabel").innerText = translations[lang].safe;
  document.getElementById("sosAlertsLabel").innerText = translations[lang].sos;
}
console.log(translations.hi.title);
let map;
let markers = [];
let emergencyAlertShown = false;
let isTyping = false;

// LOAD MAP
function loadAdminMap(){

map = L.map('adminMap').setView([17.3850,78.4867],10);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
maxZoom:19
}).addTo(map);

// GEO FENCE DANGER ZONES
const dangerZones = [
[17.400,78.500],
[17.420,78.470],
[17.360,78.520],
[17.380,78.450]
];

dangerZones.forEach(zone => {

L.circle(zone,{
color:"red",
fillColor:"#f03",
fillOpacity:0.3,
radius:1000
}).addTo(map).bindPopup("Restricted Area 🚨");

});

}

loadAdminMap();


// LOAD TOURIST DATA
async function loadAdminData(){

const res = await fetch(API + "/all");
const tourists = await res.json();

document.getElementById("totalTourists").innerText = tourists.length;

let active = 0;
let safe = 0;
let sos = 0;

const tableBody = document.querySelector("#touristTable tbody");
tableBody.innerHTML = "";

// CLEAR OLD MARKERS
markers.forEach(m => map.removeLayer(m));
markers = [];

tourists.forEach(t => {

if(t.isEmergency && !emergencyAlertShown){
alert("🚨 Emergency Tourist Detected!");
emergencyAlertShown = true;
}

if(t.location){

active++;

const marker = L.marker([
t.location.latitude,
t.location.longitude
]).addTo(map);

marker.bindPopup(`
<b>${t.name}</b><br>
Status: ${t.isEmergency ? "🚨 Emergency" : t.riskStatus}<br>

${
  t.isEmergency
    ? `
      <input 
  id="msg-${t._id}" 
  placeholder="Enter response" 
  style="width:120px; margin-top:5px;"
  onfocus="isTyping = true"
  onblur="isTyping = false"
/><br>

      <button onclick="resolveUser('${t._id}')">
        Resolve
      </button>
    `
    : `Response: ${t.adminResponse || "None"}`
}
`);
markers.push(marker);

}

if(t.riskStatus === "Safe"){
safe++;
}

if(t.isEmergency){
sos++;
}

const row = `
<tr>
<td>${t.name}</td>
<td>${t.passport}</td>
<td>${t.isEmergency ? "🚨 Emergency" : t.riskStatus}</td>
<td>${t.location ? "Available" : "Unknown"}</td>
</tr>
`;

tableBody.innerHTML += row;

});

document.getElementById("activeTourists").innerText = active;
document.getElementById("safeCount").innerText = safe;
document.getElementById("sosCount").innerText = sos;

}

loadAdminData();

async function resolveUser(id) {
  try {

    const responseText = document.getElementById(`msg-${id}`).value;

    if (!responseText) {
      alert("Please enter response");
      return;
    }

    const res = await fetch(`${API}/resolve/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        response: responseText
      })
    });

    const data = await res.json();

    alert("✅ Tourist marked safe");

    loadAdminData(); // refresh

  } catch (error) {
    console.error(error);
  }
}
document.getElementById("languageSelect").addEventListener("change", function () {
  changeLanguage(this.value);
});
// AUTO REFRESH EVERY 5 SECONDS
setInterval(()=>{
  if(!isTyping){
    loadAdminData();
  }
},5000);
