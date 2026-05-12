let members = [];
let editIndex = null;

let barChart, radarChart, pieChart, lineChart;

/* ---------------- STORAGE ---------------- */

function saveData() {
  localStorage.setItem("pfra_data", JSON.stringify(members));
}

function loadData() {
  const data = localStorage.getItem("pfra_data");
  members = data ? JSON.parse(data) : [];
}

/* ---------------- CORE LOGIC ---------------- */

function total(m) {
  return m.cardio + m.strength + m.core + m.waist;
}

function category(score) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Satisfactory";
  if (score >= 75) return "Marginal";
  return "Unsat";
}

/* ---------------- CRUD ---------------- */

function saveFromForm() {
  const m = {
    name: name.value.trim(),
    gender: gender.value,
    age: +age.value,
    unit: unit.value.trim(),
    flight: flight.value.trim(),
    cardio: +cardio.value,
    strength: +strength.value,
    core: +core.value,
    waist: +waist.value
  };

  if (!m.name || isNaN(m.age)) return alert("Invalid input");

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

  name.value = m.name;
  gender.value = m.gender;
  age.value = m.age;
  unit.value = m.unit;
  flight.value = m.flight;
  cardio.value = m.cardio;
  strength.value = m.strength;
  core.value = m.core;
  waist.value = m.waist;
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
    tbody.innerHTML += `
      <tr>
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
      </tr>
    `;
  });
}

/* ---------------- FILTERS ---------------- */

function applyFilters() {
  const u = unitFilter.value;
  const f = flightFilter.value;

  const filtered = members.filter(m =>
    (!u || m.unit === u) &&
    (!f || m.flight === f)
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

  kpiBox.innerHTML = `
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

  barChart = new Chart(barChartCanvas, {
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

  radarChart = new Chart(radarChartCanvas, {
    type: "radar",
    data: {
      labels: ["Cardio","Strength","Core","Waist"],
      datasets: [{
        label: "Avg",
        data: [
          avg(data,"cardio"),
          avg(data,"strength"),
          avg(data,"core"),
          avg(data,"waist")
        ],
        borderColor: "#3b82f6"
      }]
    }
  });

  const cats = {Excellent:0,Satisfactory:0,Marginal:0,Unsat:0};
  data.forEach(m=>cats[m.category]++);

  pieChart = new Chart(pieChartCanvas, {
    type: "pie",
    data: {
      labels: Object.keys(cats),
      datasets: [{
        data: Object.values(cats),
        backgroundColor:["#22c55e","#3b82f6","#facc15","#ef4444"]
      }]
    }
  });

  lineChart = new Chart(lineChartCanvas, {
    type: "line",
    data: {
      labels: names,
      datasets: [{
        label:"Score",
        data: data.map(m=>m.total),
        borderColor:"#3b82f6"
      }]
    }
  });
}

function avg(data,key){
  return data.length
    ? data.reduce((a,b)=>a+b[key],0)/data.length
    : 0;
}

/* ---------------- UTILS ---------------- */

function clearForm() {
  [name,age,unit,flight,cardio,strength,core,waist]
    .forEach(i=>i.value="");
  gender.selectedIndex = 0;
}

/* ---------------- INIT ---------------- */

function renderAll(){
  renderTable();
  renderCharts();
  updateKPIs();
  updateFilters();
}

function updateFilters(){
  const units = [...new Set(members.map(m=>m.unit))];
  const flights = [...new Set(members.map(m=>m.flight))];

  unitFilter.innerHTML = `<option value="">All Units</option>` +
    units.map(u=>`<option>${u}</option>`).join("");

  flightFilter.innerHTML = `<option value="">All Flights</option>` +
    flights.map(f=>`<option>${f}</option>`).join("");
}

/* ---------------- START ---------------- */

loadData();
renderAll();