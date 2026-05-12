let members = [];
let editIndex = null;

let barChart, radarChart, pieChart, lineChart;

/* ---------------- INIT ---------------- */

loadData();
renderAll();

/* ---------------- STORAGE ---------------- */

function saveData() {
  localStorage.setItem("pfra_data", JSON.stringify(members));
}

function loadData() {
  const data = localStorage.getItem("pfra_data");
  members = data ? JSON.parse(data) : [];
}

/* ---------------- CORE ---------------- */

function total(m) {
  return m.cardio + m.strength + m.core + m.waist;
}

function category(score) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Satisfactory";
  if (score >= 75) return "Marginal";
  return "Unsat";
}

/* ---------------- FORM ---------------- */

function saveFromForm() {

  const m = {
    name: document.getElementById("name").value.trim(),
    gender: document.getElementById("gender").value,
    age: parseInt(document.getElementById("age").value),

    unit: document.getElementById("unit").value.trim(),
    flight: document.getElementById("flight").value.trim(),

    cardio: parseFloat(document.getElementById("cardio").value),
    strength: parseFloat(document.getElementById("strength").value),
    core: parseFloat(document.getElementById("core").value),
    waist: parseFloat(document.getElementById("waist").value)
  };

  if (
    !m.name ||
    isNaN(m.age) ||
    isNaN(m.cardio) ||
    isNaN(m.strength) ||
    isNaN(m.core) ||
    isNaN(m.waist)
  ) {
    alert("Please fill all fields correctly");
    return;
  }

  m.total = total(m);
  m.category = category(m.total);

  if (editIndex !== null) {
    members[editIndex] = m;
    editIndex = null;
  } else {
    members.push(m);
  }

  saveData();
  renderAll();
  clearForm();
}

/* ---------------- EDIT / DELETE ---------------- */

function editMember(i) {
  const m = members[i];
  editIndex = i;

  document.getElementById("name").value = m.name;
  document.getElementById("gender").value = m.gender;
  document.getElementById("age").value = m.age;
  document.getElementById("unit").value = m.unit;
  document.getElementById("flight").value = m.flight;
  document.getElementById("cardio").value = m.cardio;
  document.getElementById("strength").value = m.strength;
  document.getElementById("core").value = m.core;
  document.getElementById("waist").value = m.waist;
}

function deleteMember(i) {
  members.splice(i, 1);
  saveData();
  renderAll();
}

/* ---------------- TABLE ---------------- */

function renderTable(data = members) {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  data.forEach((m, i) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${m.name}</td>
      <td>${m.unit}</td>
      <td>${m.flight}</td>
      <td>${m.cardio}</td>
      <td>${m.strength}</td>
      <td>${m.core}</td>
      <td>${m.waist}</td>
      <td>${m.total}</td>
      <td>
        <button onclick="editMember(${i})">Edit</button>
        <button onclick="deleteMember(${i})">X</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

/* ---------------- FILTERS ---------------- */

function applyFilters() {
  const unit = document.getElementById("unitFilter").value;
  const flight = document.getElementById("flightFilter").value;

  const filtered = members.filter(m =>
    (!unit || m.unit === unit) &&
    (!flight || m.flight === flight)
  );

  renderTable(filtered);
  renderCharts(filtered);
  updateKPIs(filtered);
}

/* ---------------- KPIs ---------------- */

function updateKPIs(data = members) {

  const count = data.length || 1;

  const avg = data.reduce((a,b)=>a+b.total,0)/count;
  const pass = (data.filter(m=>m.total>=80).length/count)*100;
  const elite = (data.filter(m=>m.total>=90).length/count)*100;

  document.getElementById("kpiBox").innerHTML = `
    <h2>KPIs</h2>
    <p>Avg Score: ${avg.toFixed(1)}</p>
    <p>Pass Rate: ${pass.toFixed(1)}%</p>
    <p>Elite Rate: ${elite.toFixed(1)}%</p>
    <p>Total Members: ${data.length}</p>
  `;
}

/* ---------------- CHARTS ---------------- */

function renderCharts(data = members) {

  const names = data.map(m=>m.name);

  barChart?.destroy();
  radarChart?.destroy();
  pieChart?.destroy();
  lineChart?.destroy();

  barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: names,
      datasets: [{
        label: "Total",
        data: data.map(m=>m.total),
        backgroundColor: "#3b82f6"
      }]
    }
  });

  radarChart = new Chart(document.getElementById("radarChart"), {
    type: "radar",
    data: {
      labels: ["Cardio","Strength","Core","Waist"],
      datasets: [{
        label: "Avg",
        data: ["cardio","strength","core","waist"].map(k =>
          data.length ? data.reduce((a,b)=>a+b[k],0)/data.length : 0
        ),
        borderColor: "#3b82f6"
      }]
    }
  });

  const cats = {Excellent:0,Satisfactory:0,Marginal:0,Unsat:0};
  data.forEach(m=>cats[m.category]++);

  pieChart = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: Object.keys(cats),
      datasets: [{
        data: Object.values(cats),
        backgroundColor:["#22c55e","#3b82f6","#facc15","#ef4444"]
      }]
    }
  });

  lineChart = new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels: names,
      datasets: [{
        label: "Total Score",
        data: data.map(m=>m.total),
        borderColor:"#3b82f6"
      }]
    }
  });
}

/* ---------------- UTIL ---------------- */

function clearForm() {
  ["name","age","unit","flight","cardio","strength","core","waist"]
    .forEach(id => document.getElementById(id).value = "");
  document.getElementById("gender").selectedIndex = 0;
}

/* ---------------- RENDER ALL ---------------- */

function renderAll() {
  renderTable();
  renderCharts();
  updateKPIs();
}