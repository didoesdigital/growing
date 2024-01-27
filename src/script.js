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

const defaultSelectedRegion = "Australia";
let seasonalFoodData;
let selectedMonthIndex = 0; // 0 is January in JavaScript
let selectedRegion = `${defaultSelectedRegion}`;
let colorGroupedData;
let colorSections;
let tagsDiv;
let tagsSpans;

const regionMap = {
  "Australia": "AU",
  "Queensland": "Qld",
};

const width = window.innerWidth;

function init() {
  setInitialSelectedMonth();
  setInitialSelectedRegion();
  setUpFoodsByColorTags();
  makeInteractive();
  updateDataWithNewMonthSelection();
  updateDataWithRegionSelection();
}

function setInitialSelectedMonth() {
  const params = new URLSearchParams(document.location.search);
  const month = params.get("month");
  selectedMonthIndex = months.includes(month)
    ? months.indexOf(month)
    : new Date().getMonth();
}

function setInitialSelectedRegion() {
  const params = new URLSearchParams(document.location.search);
  const region = params.get("region");
  if (region && regionMap[region]) {
    selectedRegion = region;
    const selectedRegionRadio = d3.select(
      `input[name="region"]#${selectedRegion}`
    );
    selectedRegionRadio.property("checked", true);
  } else {
    const browserCheckedRegionRadio = d3.selectAll(
      'input[name="region"]:checked'
    );
    if (!browserCheckedRegionRadio.empty()) {
      selectedRegion = browserCheckedRegionRadio.attr("id");
    } else {
      selectedRegion = `${defaultSelectedRegion}`;
      const selectedRegionRadio = d3.select(
        `input[name="region"]#${selectedRegion}`
      );
      selectedRegionRadio.property("checked", true);
    }
  }
}

function setUpFoodsByColorTags() {
  colorGroupedData = d3
    .groups(seasonalFoodData, (d) => d.mainColor)
    .sort((a, b) => b[1].length - a[1].length);

  colorSections = d3
    .select("#foods-by-color")
    .selectAll("div")
    .data(
      colorGroupedData.map((d) => [
        d[0],
        d[1].filter((d) => d.region === regionMap[selectedRegion]),
      ])
    )
    .join("div")
    .attr("id", (d) => `${d[0]}-section`)
    .attr("class", (d) => `color-section`);

  colorSections
    .append("h2")
    .attr("class", "color-heading")
    .text((d) => `${d[0]}`);

  tagsDiv = colorSections
    .append("div")
    .attr("class", "tags")
    .attr("id", (d) => `${d[0]}-tags`);
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

function updateDataWithRegionSelection() {
  colorSections = d3
    .select("#foods-by-color")
    .selectAll("div.color-section")
    .data(
      colorGroupedData.map((d) => [
        d[0],
        d[1].filter((d) => d.region === regionMap[selectedRegion]),
      ])
    );

  colorSections
    .select(".tags")
    .selectAll("span.tag")
    .data(
      (d) => d[1],
      (d) => `${d.name}`
    )
    .join(
      (enter) =>
        enter
          .append("span")
          .attr("aria-label", (d) =>
            isInSeason(d) ? undefined : `${d.name} (out of season)`
          )
          .attr(
            "class",
            (d) =>
              `tag ${d.mainColor} ${
                isInSeason(d) ? "in-season" : "out-of-season"
              }`
          )
          .text((d) => d.name),
      (update) =>
        update
          .attr("aria-label", (d) =>
            isInSeason(d) ? undefined : `${d.name} (out of season)`
          )
          .attr(
            "class",
            (d) =>
              `tag ${d.mainColor} ${
                isInSeason(d) ? "in-season" : "out-of-season"
              }`
          ),
      (exit) => exit.remove()
    );
}

function makeInteractive() {
  makeRegionInteractive();
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
  const browserCheckedState = d3
    .select("#hide-out-of-season-checkbox")
    .property("checked");
  d3.select(".viz").classed("hide-out-of-season", browserCheckedState);

  d3.select("#hide-out-of-season-checkbox").on("click", (e) => {
    d3.select(".viz").classed("hide-out-of-season", e.target.checked);
  });
}

function makeRegionInteractive() {
  const regionRadio = d3.selectAll('input[name="region"]');
  regionRadio.on("change", (e) => {
    const region = e.target.id;
    selectedRegion = region;
    updateDataWithRegionSelection();
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

const colorMap = {
  "Apples": "red, green",
  "Apples (Green)": "green",
  "Apples (Red)": "red",
  "Apricots": "orange",
  "Artichoke": "green",
  "Asian greens": "green",
  "Asparagus": "green",
  "Avocado": "green",
  "Banana": "yellow, white",
  "Beans": "green",
  "Beans (broad)": "green",
  "Beans (flat)": "green",
  "Beans (green)": "green",
  "Beetroot": "purple",
  "Berries": "red, blue, purple",
  "Blackberries": "purple, black",
  "Blueberries": "purple, black",
  "Breadfruit": "green",
  "Broccoflower": "green",
  "Broccoli": "green",
  "Brussels sprouts": "green",
  "Cabbage": "green",
  "Capsicum": "red, green, yellow",
  "Carrot": "orange",
  "Cauliflower": "white",
  "Celeriac": "brown",
  "Celery": "green",
  "Cherries": "red",
  "Chillies": "red",
  "Chinese cabbage": "green",
  "Chinese spinach ": "green",
  "Choko": "green",
  "Coconuts": "brown, white",
  "Cucumber": "green",
  "Cumquats": "orange",
  "Currants": "red",
  "Custard apples": "green, white",
  "Daikon": "white",
  "Dates": "brown, red",
  "Dragonfruit": "red, pink, white",
  "Eggplant": "purple",
  "Endive": "yellow, white",
  "Eschallot": "green",
  "Fennel": "green, white",
  "Figs": "purple, red",
  "Garlic": "white",
  "Ginger": "brown",
  "Gooseberries": "green, red",
  "Grapefruit": "yellow, red",
  "Grapes": "purple, green",
  "Grapes (green)": "green",
  "Grapes (red)": "red",
  "Guava": "green, red",
  "Honeydew melon": "green, yellow",
  "Kale": "green",
  "Kiwifruit": "brown, green",
  "Leek": "green",
  "Lemons": "yellow",
  "Lettuce": "green",
  "Limes": "green",
  "Loganberries": "red",
  "Lychees": "red, white",
  "Mandarin": "orange",
  "Mangoes": "yellow",
  "Mangosteen": "purple, white",
  "Melons": "green, red, orange",
  "Mushrooms": "brown",
  "Nashi": "brown, white",
  "Nectarine": "red, yellow",
  "Okra": "green, white",
  "Olives": "brown, green",
  "Onions": "brown, red, white",
  "Onions (brown)": "brown",
  "Onions (red)": "red",
  "Onions (white)": "white",
  "Oranges": "orange",
  "Papaya": "orange",
  "Parsnip": "white",
  "Passion fruit": "purple, orange",
  "Pawpaw": "green, orange",
  "Peaches": "orange",
  "Pears": "green, white",
  "Peas": "green",
  "Persimmons": "orange",
  "Pineapple": "yellow",
  "Plums": "purple",
  "Pomegranate": "red",
  "Potato": "white",
  "Pumpkin": "orange",
  "Pumpkin (butternut)": "orange",
  "Pumpkin (jap)": "orange",
  "Quince": "yellow",
  "Radish": "red",
  "Rambutan": "red, white",
  "Raspberries": "red",
  "Rhubarb": "red",
  "Rockmelons": "orange",
  "Rosella": "red",
  "Silverbeet": "green",
  "Snow peas": "green",
  "Spinach": "green",
  "Spring onions": "green",
  "Sprouts": "green",
  "Squash": "yellow",
  "Star fruit": "yellow",
  "Strawberries": "red",
  "Swede": "purple, white",
  "Sweet corn": "yellow",
  "Sweet potato": "orange",
  "Tamarillo": "red, orange",
  "Tangelo": "orange",
  "Taro": "brown, white",
  "Tomato": "red",
  "Watercress": "green",
  "Witlof": "white",
  "Zucchini": "green",
};

function getColors(name) {
  const colors = colorMap[name];
  if (!colors) {
    throw new Error(`Couldn't find colors for ${name}. Check colorMap.`);
  }
  return colors;
}

function getMainColor(name) {
  const colors = getColors(name);
  return colors.split(", ")[0];
}

function loadData() {
  const rowConversionFunction = (d) => ({
    name: d.name,
    variety: d.variety,
    region: d.region,
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
    colors: getColors(d.name),
    mainColor: getMainColor(d.name),
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
