let seasonalFoodData;

const width = window.innerWidth;

function init() {
  console.log({seasonalFoodData});
}

function loadData() {
  d3.json(
    "./data/seasonal-food-data.json"
    // , (d) => {
    //   return {
    //     // ...: d.,
    //     name: d.Name,
    //   };
    // }
  )
    .then((data) => {
      seasonalFoodData = data;
    })
    .then(() => {
      setTimeout(init(), 0);
    });
}

function updateCopyright() {
  const copy = d3.select("#copyright");
  const currentYear = new Date().getFullYear();
  copy.text(currentYear > 2024 ? `–${currentYear}` : "");
}

updateCopyright();
loadData();
