const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

let seasonalFoodData;
let selectedMonthIndex = 0; // 0 is January in JavaScript
let colorGroupedData;
let colorSections;
let tagsDiv;

const width = window.innerWidth;

function init() {
  // console.log({ seasonalFoodData });
  setInitialSelectedMonth();
  setUpFoodsByColor();
  makeInteractive();
  updateDataWithNewMonthSelection();
}

function setInitialSelectedMonth() {
  const params = new URLSearchParams(document.location.search);
  const month = params.get("month");
  selectedMonthIndex = months.includes(month)
    ? months.indexOf(month)
    : new Date().getMonth();
}

function updateDataWithNewMonthSelection() {
  d3.select("#in-season-this-month").text(months[selectedMonthIndex]);
  d3.select("#selected-month").text(months[selectedMonthIndex]);

  const exampleOutOfSeasonFood = seasonalFoodData.find(
    (d) => d.allMonths[selectedMonthIndex] === "no"
  );
  d3.select("#example-out-of-season").text(exampleOutOfSeasonFood.name);

  tagsDiv
    .selectAll("span.tag")
    .attr("aria-label", (d) =>
      isInSeason(d) ? undefined : `${d.name} (out of season)`
    )
    .attr(
      "class",
      (d) =>
        `tag ${d.mainColor} ${isInSeason(d) ? "in-season" : "out-of-season"}`
    );
}

function setUpFoodsByColor() {
  colorGroupedData = d3
    .groups(seasonalFoodData, (d) => d.mainColor)
    .sort((a, b) => b[1].length - a[1].length);

  colorSections = d3
    .select("#foods-by-color")
    .selectAll("div")
    .data(colorGroupedData)
    .join("div");

  colorSections
    .append("h2")
    .attr("class", "color-heading")
    .text((d) => `${d[0]}`);

  tagsDiv = colorSections.append("div").attr("class", "tags");

  tagsDiv
    .selectAll("div")
    .data((d) => d[1])
    .join("span")
    .attr("aria-label", (d) =>
      isInSeason(d) ? undefined : `${d.name} (out of season)`
    )
    .attr(
      "class",
      (d) =>
        `tag ${d.mainColor} ${isInSeason(d) ? "in-season" : "out-of-season"}`
    )
    .text((d) => d.name);
}

function makeInteractive() {
  makeHideOutOfSeasonCheckboxInteractive();
  makeNextPreviousMonthButtonsInteractive();
}

function makeNextPreviousMonthButtonsInteractive() {
  d3.select("#next").on("click", () => {
    selectedMonthIndex = selectedMonthIndex === 11 ? 0 : selectedMonthIndex + 1;
    setMonthParam(months[selectedMonthIndex]);
    updateDataWithNewMonthSelection();
  });

  d3.select("#previous").on("click", () => {
    selectedMonthIndex = selectedMonthIndex === 0 ? 11 : selectedMonthIndex - 1;
    setMonthParam(months[selectedMonthIndex]);
    updateDataWithNewMonthSelection();
  });
}

function makeHideOutOfSeasonCheckboxInteractive() {
  d3.select("#hide-out-of-season-checkbox").on("click", (e) => {
    d3.select(".viz").classed("hide-out-of-season", e.target.checked);
  });
}

function setMonthParam(newMonth) {
  const url = new URL(location);
  url.searchParams.set("month", newMonth);
  history.pushState({}, "", url);
}

function isInSeason(d) {
  return d.allMonths[selectedMonthIndex] === "yes";
}

function fillNoMonths(d) {
  return d === "yes" ? "yes" : "no";
}

function loadData() {
  const rowConversionFunction = (d) => ({
    name: d.name,
    Jan: fillNoMonths(d.Jan),
    Feb: fillNoMonths(d.Feb),
    Mar: fillNoMonths(d.Mar),
    Apr: fillNoMonths(d.Apr),
    May: fillNoMonths(d.May),
    Jun: fillNoMonths(d.Jun),
    Jul: fillNoMonths(d.Jul),
    Aug: fillNoMonths(d.Aug),
    Sep: fillNoMonths(d.Sep),
    Oct: fillNoMonths(d.Oct),
    Nov: fillNoMonths(d.Nov),
    Dec: fillNoMonths(d.Dec),
    allMonths: [
      fillNoMonths(d.Jan),
      fillNoMonths(d.Feb),
      fillNoMonths(d.Mar),
      fillNoMonths(d.Apr),
      fillNoMonths(d.May),
      fillNoMonths(d.Jun),
      fillNoMonths(d.Jul),
      fillNoMonths(d.Aug),
      fillNoMonths(d.Sep),
      fillNoMonths(d.Oct),
      fillNoMonths(d.Nov),
      fillNoMonths(d.Dec),
    ],
    tags: d.tags,
    colors: d.colour,
    mainColor: d.colour.split(", ")[0],
    source: d.source,
  });

  d3.tsv("./data/seasonal-food-data.tsv", rowConversionFunction)
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
