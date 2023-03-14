const icons = new Map();
icons.set("Reaction", "fa-bolt");
icons.set("Visual", "fa-eye");
icons.set("Memory", "fa-brain");
icons.set("Verbal", "fa-comment");

// Function that creates a JSON of the scores
const createJson = (rawUrlParams) => {
  let params = new URLSearchParams(rawUrlParams);
  // Create an object that has the total stored in it and holds an array of the raw data
  const json = { rawData: [], totalScore: parseInt(params.get("totalScore")) };
  // Remove the totalScore to get the raw data
  params.delete("totalScore");

  params.forEach((value, key) => {
    json.rawData.push({ category: key, score: parseInt(value) });
  });

  return json;
};

const updateUI = (json) => {
  let list = document.getElementById("summary-list");
  // Clears the list if there's anything inside of it
  list.innerHTML = "";

  let scoreBoard = document.getElementById("score-board");

  // Generate an entry for the raw data
  json.rawData.forEach((element) => {
    list.innerHTML += `
          <li class="summary-card">
            <div class="title">
              <span><i class="fa-solid ${icons.get(element.category)}"></i> ${
      element.category
    }</span>
            </div>
            <div class="score"><span>${element.score}</span> / 100</div>
          </li>
    
    `;
  });
  // Set the socre board to the total Score
  scoreBoard.innerHTML = parseInt(json.totalScore / 4);

  // Check if the percentile field exists in the json and set the percentile to that
  if (json["percentile"]) {
    document.getElementById("percentile").innerHTML = json.percentile;
  }
};

// This function calculates the percentile based on all entries in the localStorage for the application
const getPercentile = (name) => {
  // Creating a set to hold all values and remove duplicate values
  let values = new Set();
  let targetTotal;

  // Get all entries inside the localStorage
  let keys = Object.keys(localStorage);

  // Loop through all keys inside and add the scores to the set
  keys.forEach((key) => {
    let { totalScore } = createJson(localStorage.getItem(key));
    if (key === name) {
      targetTotal = totalScore;
    }
    values.add(totalScore);
  });

  // Create a sorted Array out to the set
  let sortedValues = Array.from(values).sort((a, b) => a - b);

  // Get all the elements below the target value
  let belowScore = sortedValues.slice(
    0,
    sortedValues.indexOf(targetTotal)
  ).length;

  // // If the target value is the only thing that is
  // if (sortedValues.length == 1) {
  //   return 100;
  // }

  // Return the percentile
  return parseInt((belowScore / sortedValues.length) * 100);
};

// Build a URL object of the window location
const url = new URL(window.location.href);

// Get the name from the url
const userName = url.searchParams.get("name");

if (userName) {
  let percentile = getPercentile(userName);
  let savedData = window.localStorage.getItem(userName);
  let json = createJson(savedData);
  json["percentile"] = percentile;
  updateUI(json);
} else {
  fetch("../data.json")
    .then((response) => response.json())
    .then((json) => {
      updateUI(json);
    });
}
