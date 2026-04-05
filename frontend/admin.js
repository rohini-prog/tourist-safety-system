const API = "https://tourist-safety-system-27zy.onrender.com/api/tourist";

/* ================= LANGUAGE ================= */

const translations = {
  en: {
    title: "Tourist Safety Control",
    total: "Total Tourists",
    active: "Active Tourists",
    safe: "Safe Tourists",
    sos: "SOS Alerts"
  },
  hi: {
    title: "पर्यटक सुरक्षा नियंत्रण",
    total: "कुल पर्यटक",
    active: "सक्रिय पर्यटक",
    safe: "सुरक्षित पर्यटक",
    sos: "आपातकालीन अलर्ट"
  },
  te: {
    title: "పర్యాటక భద్రత నియంత్రణ",
    total: "మొత్తం పర్యాటకులు",
    active: "సక్రియ పర్యాటకులు",
    safe: "సురక్షిత పర్యాటకులు",
    sos: "అత్యవసర హెచ్చరికలు"
  }
};

const savedLang = localStorage.getItem("lang") || "en";
changeLanguage(savedLang);

function changeLanguage(lang) {
  document.getElementById("title").innerText = translations[lang].title;
  document.getElementById("totalTouristsLabel").innerText = translations[lang].total;
  document.getElementById("activeTouristsLabel").innerText = translations[lang].active;
  document.getElementById("safeTouristsLabel").innerText = translations[lang].safe;
  document.getElementById("sosAlertsLabel").innerText = translations[lang].sos;
}

/* ================= GLOBAL ================= */

let map;
let markers = [];
let emergencyAlertShown = false;
let isTyping = false;

/* ================= LOAD MAP ================= */

function loadAdminMap() {

  map = L.map('adminMap').setView([17.3850, 78.4867], 10);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);

  // Danger zones
  const dangerZones = [
    [17.400, 78.500],
    [17.420, 78.470],
    [17.360, 78.520],
    [17.380, 78.450]
  ];

  dangerZones.forEach(zone => {
    L.circle(zone, {
      color: "red",
      fillColor: "#f03",
      fillOpacity: 0.3,
      radius: 1000
    }).addTo(map).bindPopup("Restricted Area 🚨");
  });

  // 🔥 IMPORTANT FIX
  setTimeout(() => {
    map.invalidateSize();
  }, 500);
}

loadAdminMap();

/* ================= LOAD DATA ================= */

async function loadAdminData() {

  const res = await fetch(API + "/all");
  const tourists = await res.json();

  document.getElementById("totalTourists").innerText = tourists.length;

  let active = 0;
  let safe = 0;
  let sos = 0;

  const tableBody = document.querySelector("#touristTable tbody");
  tableBody.innerHTML = "";

  // Clear markers
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  tourists.forEach(t => {

    if (t.isEmergency && !emergencyAlertShown) {
      alert("🚨 Emergency Tourist Detected!");
      emergencyAlertShown = true;
    }

    if (t.location) {

      active++;

      const marker = L.marker([
        t.location.latitude,
        t.location.longitude
      ]).addTo(map);

      const inputId = "msg_" + t._id;

      marker.bindPopup(`
        <b>${t.name}</b><br>
        Status: ${t.isEmergency ? "🚨 Emergency" : t.riskStatus}<br><br>

        ${
          t.isEmergency
            ? `
              <input 
                id="${inputId}" 
                placeholder="Enter response"
                style="width:120px; margin-top:5px;"
                onfocus="isTyping = true"
                onblur="isTyping = false"
              /><br><br>

              <button onclick="sendResponse('${t._id}', '${inputId}')">
                Send
              </button>

              <button onclick="resolveUser('${t._id}')">
                Resolve
              </button>
            `
            : `Response: ${t.response || "None"}`
        }
      `);

      markers.push(marker);
    }

    if (t.riskStatus === "Safe") safe++;
    if (t.isEmergency) sos++;

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

/* ================= SEND RESPONSE ================= */

async function sendResponse(touristId, inputId) {

  const message = document.getElementById(inputId).value;

  if (!message) {
    alert("Enter message first");
    return;
  }

  await fetch(API + "/send-response/" + touristId, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message })
  });

  alert("Message sent ✅");
}

/* ================= RESOLVE ================= */

async function resolveUser(id) {
  try {

    const responseText = document.getElementById(`msg_${id}`).value;

    if (!responseText) {
      alert("Please enter response");
      return;
    }

    await fetch(`${API}/resolve/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        response: responseText
      })
    });

    alert("✅ Tourist marked safe");

    loadAdminData();

  } catch (error) {
    console.error(error);
  }
}

/* ================= LANGUAGE CHANGE ================= */

document.getElementById("languageSelect").addEventListener("change", function () {
  const lang = this.value;
  localStorage.setItem("lang", lang);
  changeLanguage(lang);
});

/* ================= AUTO REFRESH ================= */

setInterval(() => {
  if (!isTyping) {
    loadAdminData();
  }
}, 5000);
