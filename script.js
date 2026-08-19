const $ = id => document.getElementById(id);


function num(id){

  return Number($(id).value) || 0;

}


function money(value){

  return "৳" + Math.round(value).toLocaleString("en-BD");

}


/* ============================
   HOUSING
============================ */

const housingRadios =
document.querySelectorAll(
  'input[name="housing"]'
);


function updateHousing(){

  const selected =
  document.querySelector(
    'input[name="housing"]:checked'
  ).value;


  const rentBox =
  $("rentBox");

  const rentInput =
  $("rent");


  if(selected === "rent"){

    rentBox.classList.remove("hidden");

    rentInput.disabled = false;

  }

  else{

    rentBox.classList.add("hidden");

    rentInput.disabled = true;

    rentInput.value = "";

  }

}


housingRadios.forEach(radio => {

  radio.addEventListener(
    "change",
    updateHousing
  );

});


updateHousing();



/* ============================
   CALCULATOR
============================ */

$("plannerForm").addEventListener(
  "submit",
  function(event){

    event.preventDefault();


    const salary =
    num("salary");


    if(salary <= 0){

      alert(
        "Please enter your monthly salary."
      );

      return;

    }


    const members =
    Math.max(1,num("members"));


    const earners =
    Math.max(1,num("earners"));


    const children =
    num("children");


    const students =
    num("students");


    const education =
    num("education");


    const location =
    $("location").value;


    const transport =
    $("transport").value;


    const housing =
    document.querySelector(
      'input[name="housing"]:checked'
    ).value;


    const rent =
    housing === "rent"
    ? num("rent")
    : 0;


    const health =
    num("health");


    const loan =
    num("loan");


    const other =
    num("other");



    /* ============================
       LOCATION FACTOR
    ============================ */

    let locationFactor = 1;

    if(location === "dhaka")
      locationFactor = 1.15;

    if(location === "rural")
      locationFactor = 0.78;



    /* ============================
       HOUSING
    ============================ */

    let housingCost = 0;


    if(housing === "rent"){

      housingCost =
      rent > 0
      ? rent
      : salary * .20;

    }


    if(housing === "own"){

      housingCost =
      salary * .045;

    }


    if(housing === "family"){

      housingCost =
      salary * .025;

    }



    /* ============================
       FOOD
    ============================ */

    let food =
    salary *
    .19 *
    (0.65 + members * .18) *
    locationFactor;


    food =
    Math.min(
      food,
      salary * .35
    );



    /* ============================
       UTILITIES
    ============================ */

    let utilities =
    salary *
    (members >= 5 ? .065 : .05);



    /* ============================
       TRANSPORT
    ============================ */

    const transportRates = {

      walk:.02,

      public:.055,

      bike:.075,

      car:.15,

      mixed:.105

    };


    let transportCost =
    salary *
    transportRates[transport];



    /* ============================
       EDUCATION
    ============================ */

    let educationCost =
    education;


    if(
      students > 0 &&
      educationCost === 0
    ){

      educationCost =
      salary *
      (
        .035 +
        students * .012
      );

    }



    /* ============================
       HEALTH
    ============================ */

    let healthCost =
    health;


    if(healthCost === 0){

      healthCost =
      salary *
      (
        members >= 4
        ? .04
        : .025
      );

    }



    /* ============================
       PERSONAL
    ============================ */

    let personal =
    salary *
    (
      members === 1
      ? .07
      : .045
    );



    /* ============================
       BASIC EXPENSES
    ============================ */

    let basicExpenses =

      housingCost +

      food +

      utilities +

      transportCost +

      educationCost +

      healthCost +

      personal +

      loan +

      other;



    /* ============================
       AUTO FINANCIAL ALLOCATION
    ============================ */

    let available =
    salary - basicExpenses;


    let emergency = 0;

    let savings = 0;

    let investment = 0;



    /*
      IMPORTANT:

      User doesn't enter these.

      System generates them
      automatically.
    */


    if(available > 0){

      emergency =
      available * .35;

      savings =
      available * .40;

      investment =
      available * .25;

    }



    /* ============================
       IF EXPENSE TOO HIGH
    ============================ */

    if(available < 0){

      const deficit =
      Math.abs(available);


      personal =
      Math.max(
        0,
        personal - deficit
      );


      basicExpenses =

        housingCost +

        food +

        utilities +

        transportCost +

        educationCost +

        healthCost +

        personal +

        loan +

        other;


      available =
      salary - basicExpenses;


      if(available > 0){

        emergency =
        available * .35;

        savings =
        available * .40;

        investment =
        available * .25;

      }

    }



    /* ============================
       FINAL BUDGET
    ============================ */

    const budget = {

      "🏠 Housing":
      housingCost,

      "🍚 Food":
      food,

      "🎓 Education":
      educationCost,

      "🚍 Transport":
      transportCost,

      "💡 Utilities":
      utilities,

      "🏥 Health":
      healthCost,

      "👕 Personal":
      personal,

      "💳 Loan / EMI":
      loan,

      "🧾 Other":
      other,

      "🚨 Emergency Fund":
      emergency,

      "💰 Savings":
      savings,

      "📈 Investment":
      investment

    };



    renderBudget(
      budget,
      salary
    );



    /* ============================
       FINANCIAL SCORE
    ============================ */

    const savingRatio =
    (
      emergency +
      savings +
      investment
    ) / salary;


    const debtRatio =
    loan / salary;


    const housingRatio =
    housingCost / salary;


    let score = 50;


    if(savingRatio >= .25)
      score += 25;

    else if(savingRatio >= .15)
      score += 18;

    else if(savingRatio >= .08)
      score += 10;

    else
      score -= 5;


    if(housingRatio <= .30)
      score += 10;

    else
      score -= 8;


    if(debtRatio <= .15)
      score += 10;

    else if(debtRatio <= .30)
      score += 3;

    else
      score -= 15;


    if(
      basicExpenses <=
      salary
    )
      score += 5;

    else
      score -= 10;


    score =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(score)
      )
    );



    $("score").textContent =
    score;


    $("scoreBig").textContent =
    score;


    $("scoreBar").style.width =
    score + "%";



    let scoreText;


    if(score >= 80){

      scoreText =
      "Excellent! Your income has a strong balance between expenses and future planning.";

    }

    else if(score >= 65){

      scoreText =
      "Good. Your finances are reasonably balanced with some room for improvement.";

    }

    else if(score >= 50){

      scoreText =
      "Fair. Focus on reducing unnecessary expenses and increasing savings.";

    }

    else{

      scoreText =
      "Needs attention. Your essential expenses are putting pressure on your income.";

    }


    $("scoreText").textContent =
    scoreText;



    /* ============================
       SUMMARY
    ============================ */

    let familyText;


    if(members === 1){

      familyText =
      "Solo";

    }

    else{

      familyText =
      `Family of ${members}`;

    }


    $("summary").textContent =

      `${money(salary)} monthly income · ` +

      `${familyText} · ` +

      `${students} student${students !== 1 ? "s" : ""}`;



    /* ============================
       ACTIONS
    ============================ */

    const actions = [];


    if(emergency > 0){

      actions.push(
        `🚨 Keep ${money(emergency)} monthly for your emergency fund.`
      );

    }


    if(savings > 0){

      actions.push(
        `💰 Save ${money(savings)} every month before discretionary spending.`
      );

    }


    if(investment > 0){

      actions.push(
        `📈 You can allocate around ${money(investment)} toward long-term investment goals.`
      );

    }


    if(housingRatio > .30){

      actions.push(
        "🏠 Housing is taking more than 30% of income. Consider lowering rent if possible."
      );

    }


    if(debtRatio > .30){

      actions.push(
        "💳 Your EMI is high compared with your income. Avoid taking new unnecessary debt."
      );

    }


    if(students > 0){

      actions.push(
        "🎓 Keep education spending protected and review school/coaching costs regularly."
      );

    }


    if(savingRatio < .10){

      actions.push(
        "⚠️ Your automatic future allocation is low. Try to reduce flexible expenses."
      );

    }


    $("actions").innerHTML =
    actions
    .map(
      action =>
      `<li>${action}</li>`
    )
    .join("");


    $("results")
    .classList
    .remove("hidden");


    $("results")
    .scrollIntoView({
      behavior:"smooth"
    });

  }
);



/* ============================
   RENDER BUDGET
============================ */

function renderBudget(
  budget,
  salary
){

  $("budgetGrid").innerHTML = "";


  Object.entries(budget)
  .forEach(
    ([name,amount]) => {

      const percentage =
      salary > 0
      ? Math.round(
          amount / salary * 100
        )
      : 0;


      const card =
      document.createElement("div");


      card.className =
      "budget-item";


      card.innerHTML = `

        <small>${name}</small>

        <h3>
          ${money(amount)}
        </h3>

        <span>
          ${percentage}% of income
        </span>

      `;


      $("budgetGrid")
      .appendChild(card);

    }
  );

}



/* ============================
   DARK MODE
============================ */

$("themeBtn")
.addEventListener(
  "click",
  () => {

    document.body
    .classList
    .toggle("dark");


    const dark =
    document.body
    .classList
    .contains("dark");


    $("themeBtn")
    .textContent =
    dark ? "☀️" : "🌙";


    localStorage
    .setItem(
      "bd-theme",
      dark ? "dark" : "light"
    );

  }
);



if(
  localStorage
  .getItem("bd-theme")
  === "dark"
){

  document.body
  .classList
  .add("dark");


  $("themeBtn")
  .textContent =
  "☀️";

}



/* ============================
   PRINT
============================ */

$("printBtn")
.addEventListener(
  "click",
  () => window.print()
);



/* YEAR */

$("year")
.textContent =
new Date().getFullYear();
