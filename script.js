const $ = (id) => document.getElementById(id);
const money = n => new Intl.NumberFormat("en-BD", {
  style:"currency", currency:"BDT", maximumFractionDigits:0
}).format(Math.max(0, Math.round(n)));

function val(id){ return Number($(id).value) || 0; }

function calculateBudget(e){
  e.preventDefault();

  const salary = val("salary");
  if(salary <= 0){
    alert("Please enter a valid monthly income.");
    $("salary").focus();
    return;
  }

  const members = Math.max(1, val("members"));
  const students = val("students");
  const children = val("children");
  const area = $("area").value;
  const housing = $("housing").value;
  const transport = $("transport").value;

  // Starting ratios are intentionally adjustable. They are not official rules.
  const areaFactor = area === "dhaka" ? 1.15 : area === "city" ? 1.0 : 0.78;
  const householdFactor = Math.min(1.55, 0.72 + members * 0.18);

  let rent = val("rent");
  if(housing !== "rent") rent = 0;

  let food = salary * 0.22 * householdFactor * areaFactor;
  let education = val("education");
  if(education === 0 && students > 0) education = salary * (0.035 + students * 0.012);

  let transportRate = {public:.055,bike:.07,car:.14,mixed:.10,none:.025}[transport];
  let transportCost = salary * transportRate;

  let utilities = salary * (members > 4 ? .065 : .055);
  let health = val("health") || salary * (members > 3 ? .045 : .03);
  let personal = salary * (children > 0 ? .035 : .05);
  let emergency = salary * (members > 2 ? .055 : .08);
  let investment = salary * .04;
  let savings = salary * .08;
  let loan = val("loan");
  let other = val("other");

  // Housing gets a 25% target, but the user's actual rent is respected.
  let housingCost = rent || salary * .18;
  if(housing === "own") housingCost = salary * .04;
  if(housing === "family") housingCost = salary * .03;

  const raw = {Housing:housingCost, Food:food, Education:education, Transport:transportCost,
    Utilities:utilities, Health:health, Personal:personal, "Emergency Fund":emergency,
    Savings:savings, Investment:investment, "Loan / EMI":loan, Other:other};

  let total = Object.values(raw).reduce((a,b)=>a+b,0);

  // If recommendations exceed income, reduce flexible buckets first.
  if(total > salary){
    const excess = total - salary;
    const flexible = ["Personal","Investment","Savings","Emergency Fund","Food"];
    flexible.forEach(k=>{
      const cut = Math.min(raw[k] * .65, excess);
      raw[k] -= cut;
      total -= cut;
    });
  }

  let remaining = salary - total;

  // Put positive remainder into savings; negative remainder is a warning.
  if(remaining > 0) raw.Savings += remaining;
  total = Object.values(raw).reduce((a,b)=>a+b,0);
  remaining = salary - total;

  const debtRatio = loan / salary;
  const saveRatio = (raw.Savings + raw.Investment + raw["Emergency Fund"]) / salary;
  const housingRatio = raw.Housing / salary;
  let score = 55;
  score += Math.min(20, saveRatio * 80);
  score += housingRatio <= .30 ? 8 : -8;
  score += debtRatio <= .15 ? 8 : debtRatio <= .30 ? 2 : -12;
  score += students && education > salary*.20 ? -5 : 3;
  score += remaining >= -1 ? 4 : -8;
  score = Math.max(0, Math.min(100, Math.round(score)));

  renderBudget(raw, salary);
  $("score").textContent = score;
  $("scoreBadge").textContent = `${score}/100`;
  $("scoreBar").style.width = `${score}%`;

  let scoreText = score >= 80 ? "Excellent — your plan has strong saving capacity."
    : score >= 65 ? "Good — a few adjustments can make the plan stronger."
    : score >= 50 ? "Fair — focus on controlling fixed costs and building savings."
    : "Needs attention — reduce non-essential spending and prioritize stability.";
  $("scoreText").textContent = scoreText;

  $("summary").textContent =
    `${money(salary)} monthly income · ${members} household member${members>1?"s":""} · ${area === "dhaka" ? "Dhaka / major city" : area === "city" ? "other city" : "rural / village"}`;

  const actions = [];
  if(saveRatio < .15) actions.push("Target at least 10–20% of income for savings/emergency goals, if your essential costs allow it.");
  else actions.push("Your saving allocation is healthy. Keep an emergency reserve separate from daily spending.");
  if(housingRatio > .30) actions.push("Housing is above the usual planning target of about 30% of income; consider lowering rent when practical.");
  if(debtRatio > .30) actions.push("Loan/EMI is high relative to income. Avoid taking new debt until the ratio improves.");
  else if(loan > 0) actions.push("Keep EMI payments on schedule and avoid using new debt for lifestyle purchases.");
  if(students > 0) actions.push("Keep education spending protected, but compare school/coaching/transport costs annually.");
  if(score < 65) actions.push("Build a starter emergency fund first; a longer-term target can be several months of essential expenses.");
  if($("goal").value === "business") actions.push("For a business goal, create a separate capital fund so it does not consume emergency savings.");
  if($("goal").value === "vehicle") actions.push("For a bike/car goal, include fuel, maintenance, registration and insurance in the total ownership cost.");
  $("actions").innerHTML = actions.map(x=>`<li>✓ ${x}</li>`).join("");

  $("results").classList.remove("hidden");
  $("results").scrollIntoView({behavior:"smooth", block:"start"});
}

function renderBudget(data, salary){
  const labels = Object.keys(data);
  $("budgetGrid").innerHTML = labels.map(label=>{
    const amount = data[label];
    const pct = salary ? Math.round(amount/salary*100) : 0;
    return `<div class="budget-item">
      <div class="label">${label}</div>
      <div class="amount">${money(amount)}</div>
      <div class="pct">${pct}% of income</div>
    </div>`;
  }).join("");
}

$("plannerForm").addEventListener("submit", calculateBudget);

$("housing").addEventListener("change", ()=>{
  $("rent").disabled = $("housing").value !== "rent";
  if($("housing").value !== "rent") $("rent").value = 0;
});
$("rent").disabled = $("housing").value !== "rent";

$("themeBtn").addEventListener("click", ()=>{
  document.body.classList.toggle("dark");
  $("themeBtn").textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
  localStorage.setItem("bdsp-theme", document.body.classList.contains("dark") ? "dark" : "light");
});
if(localStorage.getItem("bdsp-theme")==="dark"){
  document.body.classList.add("dark");
  $("themeBtn").textContent="☀️";
}
$("printBtn").addEventListener("click", ()=>window.print());
$("year").textContent = new Date().getFullYear();
