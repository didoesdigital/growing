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

const regionMap = {
  "Australia": "AU",
  "Queensland": "Qld",
  "Northern Territory": "NT",
  "Victoria": "Vic",
  "Tasmania": "Tas",
  "New South Wales": "NSW",
  "Western Australia": "WA",
  "South Australia": "SA",
};

const regionClimateZoneMap = {
  "Australia": "2",
  "Queensland": "3",
  "Northern Territory": "4",
  "Victoria": "2",
  "Tasmania": "1",
  "New South Wales": "2",
  "Western Australia": "2",
  "South Australia": "2",
};

const defaultSelectedFoods = {
  "AU": [
    "Lettuces",
    "Peas",
    "Zucchini",
    "Capsicums",
    "Chillies",
    "Radishes",
    "Strawberries",
    "Tomatoes",
    "Oranges",
    "Bananas",
    "Pineapples",
    "Eggplants",
    "Ginger",
    "Cauliflowers",
  ],
  "Vic": [
    "Lettuces",
    "Peas",
    "Zucchini",
    "Capsicums",
    "Chillies",
    "Radishes",
    "Strawberries",
    "Tomatoes",
    "Oranges",
    "Mangoes",
    "Blueberries",
    "Eggplants",
    "Shallots",
    "Cauliflowers",
  ],
  "Qld": [
    "Lettuces",
    "Peas",
    "Zucchini",
    "Capsicums",
    "Chillies",
    "Radishes",
    "Strawberries",
    "Tomatoes",
    "Oranges",
    "Pineapples",
    "Blueberries",
    "Eggplants",
    "Ginger",
    "Cauliflowers",
  ],
  "SA": [
    "Lettuces",
    "Peas",
    "Zucchini",
    "Feijoa",
    "Loquats",
    "Raspberries",
    "Strawberries",
    "Tomatoes",
    "Oranges",
    "Grapefruit",
    "Lemons",
    "Eggplants",
    "Quinces",
    "Horseradish",
  ],
  "WA": [
    "Lettuces",
    "Peas",
    "Zucchini",
    "Capsicums",
    "Cherries",
    "Radishes",
    "Strawberries",
    "Tomatoes",
    "Oranges",
    "Bananas",
    "Mangoes",
    "Eggplants",
    "Mushrooms",
    "Potatoes",
  ],
  "NSW": [
    "Lettuces",
    "Peas",
    "Zucchini",
    "Capsicums",
    "Chillies",
    "Strawberries",
    "Tomatoes",
    "Oranges",
    "Pineapples",
    "Blueberries",
    "Eggplants",
    "Ginger",
    "Cauliflowers",
    "Mandarins",
  ],
  "Tas": [
    "Apples",
    "Avocados",
    "Crocodile melons",
    "Cherries",
    "Ricoto chillies",
    "Medlars",
    "Blackberries",
    "Capsicums",
    "Maschua",
    "Apricots",
    "Blackcurrants",
    "Black winter truffles",
    "Chives",
    "Parsnips",
  ],
  "NT": [
    "Capsicums",
    "Star fruit",
    "Durian",
    "Grapefruit",
    "Jackfruit",
    "Lemons",
    "Mangoes",
    "Papaya",
    "Passion fruits",
    "Pineapples",
    "Dragonfruit",
    "Rambutan",
    "Sweet potatoes",
    "Tomatoes",
  ],
};

const favouriteFoods = {
  "AU": new Set(defaultSelectedFoods["AU"]),
  "Vic": new Set(defaultSelectedFoods["Vic"]),
  "Qld": new Set(defaultSelectedFoods["Qld"]),
  "SA": new Set(defaultSelectedFoods["SA"]),
  "WA": new Set(defaultSelectedFoods["WA"]),
  "NSW": new Set(defaultSelectedFoods["NSW"]),
  "Tas": new Set(defaultSelectedFoods["Tas"]),
  "NT": new Set(defaultSelectedFoods["NT"]),
};

const defaultTooltipText = "Graphic by @DiDoesDigital";

const minimumFavouriteFoods = 3;
const maximumFavouriteFoods = 20;

const radialTextDurationInSec = 0.5;
const radialTextDurationInMs = radialTextDurationInSec * 1000;
const oneMonthRotationInDegrees = 360 / 12;
const halfMonthAngleInRadians = Math.PI / 12;
const firstStartAngleRotationInRadians = -halfMonthAngleInRadians;

const localStoragePrefix = "ddd-seasonality-";
const favouritesStorage = "favourites";

const defaultSelectedRegion = "Australia";
const monthParam = "month";
const regionParam = "region";
const regionStorage = `${regionParam}`;
let seasonalFoodData = [];
let previousSelectedMonthIndex = 0; // 0 is January in JavaScript
let selectedMonthIndex = 0; // 0 is January in JavaScript
/** This is a spaced region name e.g. "New South Wales" */
let selectedRegionName = `${defaultSelectedRegion}`;
let colorGroupedData;
let colorSections;
let tagsDiv;
let tagsSpans;
let radialVizRotation = 0;
let showOnlyFavourites = false;

const dialog = document.querySelector("dialog");

function init() {
  setInitialSelectedMonth();
  setInitialSelectedRegion();
  setUpFoodsByColorTags();
  // setUpRadialViz(); // so far we handle everything in updateData… functions
  makeInteractive();
  getFavouritesFromLocalStorage();
  updateDataWithNewMonthSelection();
  updateDataWithRegionSelection();
  preventTabFocusMovingRadialViz();
}

function preventTabFocusMovingRadialViz() {
  const radialVizSelection = d3.select(".radial-viz-detail-wrapper");
  const radialVizElement = document.querySelector(".radial-viz-detail-wrapper");
  radialVizSelection.on("scroll", function () {
    radialVizElement.scrollTo({ top: 0 });
  });
}

function setInitialSelectedMonth() {
  const params = new URLSearchParams(document.location.search);
  const urlMonth = params.get(monthParam);
  if (months.includes(urlMonth)) {
    previousSelectedMonthIndex = months.indexOf(urlMonth);
    selectedMonthIndex = months.indexOf(urlMonth);
    radialVizRotation = -oneMonthRotationInDegrees * selectedMonthIndex;
    return;
  }

  previousSelectedMonthIndex = new Date().getMonth();
  selectedMonthIndex = new Date().getMonth();
  radialVizRotation = -oneMonthRotationInDegrees * selectedMonthIndex;
}

function setInitialSelectedRegion() {
  getSelectedRegionFromURLParams() ||
    getSelectedRegionFromLocalStorage() ||
    getSelectedRegionFromBrowser() ||
    setRegionToDefault();

  // We use a non-breaking space in the text so that "New" is not separated from "South Wales":
  d3.selectAll(".selected-region-name").text(
    ` in ${selectedRegionName.replaceAll(" ", " ")}`
  );
}

function getSelectedRegionFromURLParams() {
  const params = new URLSearchParams(document.location.search);
  const regionFromURL = params.get(regionParam);
  const spacedRegion = regionFromURL
    ? mapDashifiedRegionToSpacedRegion(regionFromURL)
    : null;
  if (regionFromURL && regionMap[spacedRegion]) {
    selectedRegionName = spacedRegion;
    setLocalStorageItem(regionStorage, selectedRegionName);
    const selectedRegionRadio = d3.select(
      `input[name="region"]#${regionFromURL}`
    );
    selectedRegionRadio.property("checked", true);
    return true;
  }
}

function getSelectedRegionFromLocalStorage() {
  const localStorageRegion = getLocalStorageItem(regionStorage);
  if (localStorageRegion && regionMap[localStorageRegion]) {
    selectedRegionName = localStorageRegion;
    const dashifiedRegion =
      mapSpacedRegionToDashifiedRegion(selectedRegionName);
    replaceURLParam(regionParam, dashifiedRegion);
    const selectedRegionRadio = d3.select(
      `input[name="region"]#${dashifiedRegion}`
    );
    selectedRegionRadio.property("checked", true);
    return true;
  }
}

function getSelectedRegionFromBrowser() {
  const browserCheckedRegionRadio = d3.selectAll(
    'input[name="region"]:checked'
  );
  if (!browserCheckedRegionRadio.empty()) {
    selectedRegionName = mapDashifiedRegionToSpacedRegion(
      browserCheckedRegionRadio.attr("id")
    );
    return true;
  }
}

function setRegionToDefault() {
  selectedRegionName = `${defaultSelectedRegion}`;
  const selectedRegionRadio = d3.select(
    `input[name="region"]#${mapSpacedRegionToDashifiedRegion(
      selectedRegionName
    )}`
  );
  selectedRegionRadio.property("checked", true);
  return true;
}

function mapDashifiedRegionToSpacedRegion(dashifiedRegion) {
  return dashifiedRegion.replaceAll("-", " ");
}

function mapSpacedRegionToDashifiedRegion(spacedRegion) {
  return spacedRegion.replaceAll(" ", "-");
}

function getFavouritesFromLocalStorage() {
  const localStorageFavourites = getLocalStorageItem(favouritesStorage);
  if (localStorageFavourites !== null) {
    try {
      const parsedLocalStorageFavourites = JSON.parse(localStorageFavourites);
      const defaultRegionKeys = Object.keys(defaultSelectedFoods);

      const containsValidRegions = Object.keys(
        parsedLocalStorageFavourites
      ).every((region) => defaultRegionKeys.includes(region));

      if (!containsValidRegions) {
        throw new Error("Invalid regions in localStorage");
      }

      for (const region in parsedLocalStorageFavourites) {
        const parsedRegionFavourites = parsedLocalStorageFavourites[region];

        // Check if all the local storage food names are legit food names:
        for (let i = 0; i < parsedRegionFavourites.length; i++) {
          const food = parsedRegionFavourites[i];
          const foundFood = seasonalFoodData.findIndex((d) => d.name === food);
          if (foundFood === -1) {
            throw new Error(
              `Invalid food in localStorage: "${food}" in "${region}"`
            );
          }
        }
        // Note: I'm going to take my chances that local storage food names for a specific region exist in the seasonalFoodData *for that region*
      }

      for (const region in parsedLocalStorageFavourites) {
        if (
          parsedLocalStorageFavourites[region].length >=
            minimumFavouriteFoods &&
          parsedLocalStorageFavourites[region].length <= maximumFavouriteFoods
        ) {
          favouriteFoods[region] = new Set(
            parsedLocalStorageFavourites[region]
          );
        } else {
          console.error(
            `Weird number of favourite foods in localStorage for "${region}". Probably too many.`
          );
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  d3.selectAll(".js-favourites-selected-counter").text(
    favouriteFoods[regionMap[selectedRegionName]].size
  );
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
        d[1].filter((d) => d.region === regionMap[selectedRegionName]),
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

  updateTagsWithFavouritesSelection();
}

function updateDataWithNewMonthSelection() {
  d3.selectAll(".in-season-this-month").text(months[selectedMonthIndex]);
  d3.select("#planting-month").text(`in ${months[selectedMonthIndex]}`);
  d3.select("#gardenate-link").attr(
    "href",
    getGardenateLink(selectedMonthIndex, selectedRegionName)
  );

  updateTagsWithMonthSelection();
  updateRadialVizWithMonthSelection();
}

function updateRadialVizWithMonthSelection() {
  updateRadialDetailVizWithRegionSelection();
  updateRadialOverviewVizWithRegionSelection();
}

function updateTagsWithMonthSelection() {
  d3.select("#selected-month").text(months[selectedMonthIndex]);

  const exampleOutOfSeasonFood = seasonalFoodData.find(
    (d) => d.allMonthsSeasonality[selectedMonthIndex] === "no"
  );
  d3.select("#example-out-of-season").text(exampleOutOfSeasonFood.name);

  tagsDiv
    .selectAll(".tag")
    .attr("aria-label", (d) =>
      isInSeason(d) ? undefined : `${d.name} (out of season)`
    )
    .attr("aria-pressed", (d) => isFavourite(d))
    .attr("class", getFoodTagClasses);
}

function updateDataWithRegionSelection() {
  d3.select("#gardenate-link").attr(
    "href",
    getGardenateLink(selectedMonthIndex, selectedRegionName)
  );
  updateTagsWithRegionSelection();
  updateRadialDetailVizWithRegionSelection();
  updateRadialOverviewVizWithRegionSelection();
}

function updateRadialOverviewVizWithRegionSelection() {
  const width = 1200;
  const height = width;
  const innerRadius = 60;
  const outerRadius = height * 0.5 - 45;

  const sortedColors = [
    "green",
    "red",
    "orange",
    "purple",
    "yellow",
    "brown",
    "white",
  ]; // determined by colorGroupedData.map(d => d[0]);

  const selectedFoodData = showOnlyFavourites
    ? getCuratedFoodDataForRegion(seasonalFoodData)
    : getAllFoodDataForRegion(seasonalFoodData);

  const longFoodMonthsData = getRadialVizFoodMonthsData(
    selectedFoodData,
    months
  ).sort(
    // Sort aesthetically so that January shows the most in-season foods together
    (a, b) =>
      sortedColors.indexOf(a.mainColor) - sortedColors.indexOf(b.mainColor) ||
      d3.descending(a.inSeason, b.inSeason) ||
      months.indexOf(a.month) - months.indexOf(b.month)
  );

  const angleAccessorMonths = (d) => d.month;
  const angleScaleMonths = d3
    .scaleBand()
    .domain(months)
    .range([
      firstStartAngleRotationInRadians,
      2 * Math.PI + firstStartAngleRotationInRadians,
    ]);

  const colorSortedFoodNames = Array.from(
    new Set(longFoodMonthsData.map((d) => d.name))
  );

  const radiusAccessorFoods = (d) => colorSortedFoodNames.indexOf(d.name);
  const radiusScaleFoods = d3
    .scaleLinear()
    .domain([0, colorSortedFoodNames.length])
    .range([outerRadius, innerRadius]);

  const arcGenerator = d3
    .arc()
    .innerRadius((d) => radiusScaleFoods(radiusAccessorFoods(d) + 1))
    .outerRadius((d) => radiusScaleFoods(radiusAccessorFoods(d)))
    .startAngle((d) => angleScaleMonths(angleAccessorMonths(d)))
    .endAngle(
      (d) =>
        angleScaleMonths(angleAccessorMonths(d)) + angleScaleMonths.bandwidth()
    )
    .padRadius(innerRadius);

  const svg = d3.select(
    ".radial-viz-overview-wrapper .radial-viz-overview__svg"
  );
  svg.attr("viewBox", `0 0 ${width} ${height}`);
  const innerCircle = svg
    .select("g.circle-group")
    .attr("role", "presentation")
    .selectAll("circle.inner-circle")
    .data([null])
    .join("circle")
    .attr("role", "presentation")
    .attr("id", "inner-circle")
    .attr("class", "inner-circle")
    .attr("cx", width * 0.5)
    .attr("cy", height * 0.5)
    .attr("r", innerRadius)
    .style("fill", "#F2F1F4")
    .style("stroke", "none")
    .attr("role", "presentation");

  const foodArcs = svg
    .select(".food-arcs")
    .attr("tabindex", "0")
    .attr("role", "list")
    .attr("transform", `translate(${width * 0.5}, ${height * 0.5})`)
    .attr("aria-label", "Foods in season by month");

  const tooltip = d3.select(".radial-viz-overview .radial-viz-tooltip-content");

  svg.on("mouseleave focusout", () => {
    tooltip.text(defaultTooltipText);
  });

  const foodMonthArc = foodArcs
    .selectAll("g.food-arc-group")
    .data(longFoodMonthsData, (d) => getArcID(d, "overview"))
    .join(
      (enter) =>
        enter
          .append("g")
          .attr("class", "food-arc-group")
          .attr("tabindex", (d) =>
            months.indexOf(d.month) === selectedMonthIndex ? "0" : null
          )
          .attr("role", (d) =>
            d.month === selectedMonthIndex ? "listitem" : "presentation"
          )
          .attr("aria-hidden", (d) =>
            d.month === selectedMonthIndex ? null : true
          )
          .attr("aria-label", (d) =>
            d.month === selectedMonthIndex
              ? getPlainEnglishInSeasonText(d)
              : null
          )
          .call((g) =>
            g
              .append("path")
              .attr("role", "presentation")
              .attr("id", (d) => getArcID(d, "overview"))
              .attr("d", arcGenerator)
              .style("stroke", (d) =>
                d.mainColor
                  ? getCSSColorFromFoodColor(d.mainColor)[1]
                  : "var(--food-unknown-fill)"
              )
              .style("fill", (d) =>
                d.mainColor
                  ? getCSSColorFromFoodColor(d.mainColor)[0]
                  : "#949494"
              )
              .style("stroke-opacity", (d) =>
                d.inSeason ? 1 : "var(--outOfSeasonStrokeOpacity)"
              )
              .style("fill-opacity", (d) =>
                d.inSeason ? 1 : "var(--outOfSeasonFillOpacity)"
              )
          )
          .on("touchmove mousemove focus", (_evt, d) => {
            const tooltipText = getPlainEnglishInSeasonText(d);
            tooltip.text(tooltipText);
          }),
      (update) => {
        update
          .attr("tabindex", (d) =>
            months.indexOf(d.month) === selectedMonthIndex ? "0" : null
          )
          .attr("role", (d) =>
            months.indexOf(d.month) === selectedMonthIndex
              ? "listitem"
              : "presentation"
          )
          .attr("aria-hidden", (d) =>
            months.indexOf(d.month) === selectedMonthIndex ? null : true
          )
          .attr("aria-label", (d) =>
            months.indexOf(d.month) === selectedMonthIndex
              ? getPlainEnglishInSeasonText(d)
              : null
          );

        update
          .select("path")
          .attr("d", arcGenerator)
          .style("stroke", (d) =>
            d.mainColor
              ? getCSSColorFromFoodColor(d.mainColor)[1]
              : "var(--food-unknown-fill)"
          )
          .style("fill", (d) =>
            d.mainColor
              ? getCSSColorFromFoodColor(d.mainColor)[0]
              : "var(--food-unknown-fill)"
          )
          .style("stroke-opacity", (d) =>
            d.inSeason ? 1 : "var(--outOfSeasonStrokeOpacity)"
          )
          .style("fill-opacity", (d) =>
            d.inSeason ? 1 : "var(--outOfSeasonFillOpacity)"
          );

        return update;
      },
      (exit) => {
        exit.remove();
        return exit;
      }
    );

  const monthLabelsGroup = svg
    .select("g.month-labels")
    .attr("transform", `translate(${width * 0.5}, ${height * 0.5})`)
    .attr("role", "presentation");

  const monthLabels = monthLabelsGroup
    .selectAll("text.month-label")
    .data(months)
    .join("text")
    .attr("class", "month-label")
    .attr("role", "presentation")
    .attr("aria-hidden", true)
    .attr("x", 0)
    .attr("y", -outerRadius - 10)
    .attr("text-anchor", "middle")
    .text((d) => d.slice(0, 3))
    .style("transform", (d, i) => {
      const angle = angleScaleMonths(d) + halfMonthAngleInRadians;
      return `rotate(${(angle * 180) / Math.PI}deg)`;
    });
}

function updateRadialDetailVizWithRegionSelection() {
  const width = 1400;
  const height = width;
  const innerRadius = 260;
  const outerRadius = height * 0.5 - 15;

  const sortedColors = [
    "green",
    "red",
    "orange",
    "purple",
    "yellow",
    "brown",
    "white",
  ]; // determined by colorGroupedData.map(d => d[0]);

  const selectedFoodData = getCuratedFoodDataForRegion(seasonalFoodData);

  const longFoodMonthsData = getRadialVizFoodMonthsData(
    selectedFoodData,
    months
  ).sort(
    // Sort it so that the reading order makes sense: first, starting from the outside arc and the selected month at the top, read all its foods by color and by name alphabetically, then next calendar month and so on
    (a, b) =>
      months.indexOf(a.month) - months.indexOf(b.month) ||
      sortedColors.indexOf(a.mainColor) - sortedColors.indexOf(b.mainColor) ||
      a.name.localeCompare(b.name)
  );

  const angleAccessorMonths = (d) => d.month;
  const angleScaleMonths = d3
    .scaleBand()
    .domain(months)
    .range([
      firstStartAngleRotationInRadians,
      2 * Math.PI + firstStartAngleRotationInRadians,
    ]);

  const colorSortedFoodNames = Array.from(
    new Set(longFoodMonthsData.map((d) => d.name))
  );

  const radiusAccessorFoods = (d) => colorSortedFoodNames.indexOf(d.name);
  const radiusScaleFoods = d3
    .scaleLinear()
    .domain([0, colorSortedFoodNames.length])
    .range([outerRadius, innerRadius]);

  const arcGenerator = d3
    .arc()
    .innerRadius((d) => radiusScaleFoods(radiusAccessorFoods(d)))
    .outerRadius((d) => radiusScaleFoods(radiusAccessorFoods(d) + 1))
    .startAngle((d) => angleScaleMonths(angleAccessorMonths(d)))
    .endAngle(
      (d) =>
        angleScaleMonths(angleAccessorMonths(d)) + angleScaleMonths.bandwidth()
    )
    .padRadius(innerRadius);

  const rotateWrapper = d3.select(".radial-viz-detail__svg-rotate-wrapper");
  rotateWrapper.style("transform", `rotate(${getRotation()}deg)`);

  const svg = d3.select(".radial-viz-detail-wrapper .radial-viz-detail__svg");
  svg.attr("width", width).attr("height", width);

  const foodArcs = svg
    .select(".food-arcs")
    .attr("tabindex", "0")
    .attr("role", "list")
    .attr("transform", `translate(${width * 0.5}, ${height * 0.5})`)
    .attr("aria-label", "Foods in season by month");

  const tooltip = d3.select(".radial-viz-detail .radial-viz-tooltip-content");

  svg.on("mouseleave focusout", () => {
    tooltip.text(defaultTooltipText);
  });

  const foodMonthArc = foodArcs
    .selectAll("g.food-arc-group")
    .data(longFoodMonthsData, (d) => getArcID(d, "detail"))
    .join(
      (enter) =>
        enter
          .append("g")
          .attr("class", "food-arc-group")
          .attr("tabindex", (d) => (isMonthInView(d.month) ? "0" : null))
          .attr("role", (d) =>
            isMonthInView(d.month) ? "listitem" : "presentation"
          )
          .attr("aria-hidden", (d) => (isMonthInView(d.month) ? null : true))
          .attr("aria-label", (d) =>
            isMonthInView(d.month) ? getPlainEnglishInSeasonText(d) : null
          )
          .on("focus", (_evt, d) => {
            const tooltipText = getPlainEnglishInSeasonText(d);
            if (isMonthInView(d.month)) {
              tooltip.text(tooltipText);
            } else {
              tooltip.text("");
            }
          })
          .call((g) =>
            g
              .append("path")
              .attr("role", "presentation")
              .attr("id", (d) => getArcID(d, "detail"))
              .attr("d", arcGenerator)
              .style("stroke", (d) =>
                d.mainColor
                  ? getCSSColorFromFoodColor(d.mainColor)[1]
                  : "var(--food-unknown-fill)"
              )
              .style("fill", (d) =>
                d.mainColor
                  ? getCSSColorFromFoodColor(d.mainColor)[0]
                  : "#949494"
              )
              .style("stroke-opacity", (d) =>
                d.inSeason ? 1 : "var(--outOfSeasonStrokeOpacity)"
              )
              .style("fill-opacity", (d) =>
                d.inSeason ? 1 : "var(--outOfSeasonFillOpacity)"
              )
              .on("touchmove mousemove", (_evt, d) => {
                const tooltipText = getPlainEnglishInSeasonText(d);
                if (isMonthInView(d.month)) {
                  tooltip.text(tooltipText);
                } else {
                  tooltip.text("");
                }
              })
          )
          .call((g) => {
            g.append("text")
              .attr("role", "presentation")
              .attr("aria-hidden", true)
              .attr("dy", "1em")
              .style("opacity", (d) =>
                d.month === months[selectedMonthIndex] ? 1 : 0
              )
              .append("textPath")
              .attr("class", (d) =>
                d.inSeason ? "" : `out-of-season ${d.mainColor}`
              )
              .attr("paint-order", "stroke")
              .attr("startOffset", (d) =>
                getStartOffset(d, radiusScaleFoods, radiusAccessorFoods)
              )
              .attr("text-anchor", "middle")
              .attr("href", (d) => `#${getArcID(d, "detail")}`)
              .text((d) =>
                getShortName(d, radiusScaleFoods, radiusAccessorFoods)
              );
          }),
      (update) => {
        update
          .attr("tabindex", (d) => (isMonthInView(d.month) ? "0" : null))
          .attr("role", (d) =>
            isMonthInView(d.month) ? "listitem" : "presentation"
          )
          .attr("aria-hidden", (d) => (isMonthInView(d.month) ? null : true))
          .attr("aria-label", (d) =>
            isMonthInView(d.month) ? getPlainEnglishInSeasonText(d) : null
          );

        update
          .select("path")
          .attr("d", arcGenerator)
          .style("stroke", (d) =>
            d.mainColor
              ? getCSSColorFromFoodColor(d.mainColor)[1]
              : "var(--food-unknown-fill)"
          )
          .style("fill", (d) =>
            d.mainColor
              ? getCSSColorFromFoodColor(d.mainColor)[0]
              : "var(--food-unknown-fill)"
          )
          .style("stroke-opacity", (d) =>
            d.inSeason ? 1 : "var(--outOfSeasonStrokeOpacity)"
          )
          .style("fill-opacity", (d) =>
            d.inSeason ? 1 : "var(--outOfSeasonFillOpacity)"
          );

        update.select("title").text((d) => getPlainEnglishInSeasonText(d));

        update
          .select("text")
          .transition()
          .ease(d3.easeLinear)
          .duration(radialTextDurationInMs)
          .delay((d) =>
            d.month === months[selectedMonthIndex]
              ? radialTextDurationInMs * 0.25
              : 0
          )
          .style("opacity", (d) =>
            d.month === months[selectedMonthIndex] ? 1 : 0
          );

        update
          .select("text textPath")
          .attr("class", (d) =>
            d.inSeason ? "" : `out-of-season ${d.mainColor}`
          )
          .attr("paint-order", "stroke")
          .attr("startOffset", (d) =>
            getStartOffset(d, radiusScaleFoods, radiusAccessorFoods)
          )
          .attr("text-anchor", "middle")
          .attr("href", (d) => `#${getArcID(d, "detail")}`)
          .text((d) => getShortName(d, radiusScaleFoods, radiusAccessorFoods));
        return update;
      },
      (exit) => {
        exit.remove();
        return exit;
      }
    );
}

function getStartOffset(d, radiusScaleFoods, radiusAccessorFoods) {
  const thisArcInnerRadius = radiusScaleFoods(radiusAccessorFoods(d) + 1);
  const thisArcOuterRadius = radiusScaleFoods(radiusAccessorFoods(d));
  const oneMonthOuterCircumference = (2 * Math.PI * thisArcOuterRadius) / 12;
  const oneMonthInnerCircumference = (2 * Math.PI * thisArcInnerRadius) / 12;
  const leftEdge = thisArcOuterRadius - thisArcInnerRadius;
  const rightEdge = leftEdge;

  const startPoint = oneMonthOuterCircumference / 2;
  const totalLength =
    oneMonthOuterCircumference +
    rightEdge +
    oneMonthInnerCircumference +
    leftEdge;

  const startOffset = (startPoint / totalLength) * 100;
  return `${startOffset.toFixed(2)}%`;
}

function getRotation() {
  let monthIndexDelta = previousSelectedMonthIndex - selectedMonthIndex;
  const isDecToJanRotation = monthIndexDelta > 1;
  const isJanToDecRotation = monthIndexDelta < -1;

  if (isDecToJanRotation) {
    monthIndexDelta = monthIndexDelta - 12;
  }

  if (isJanToDecRotation) {
    monthIndexDelta = monthIndexDelta + 12;
  }

  radialVizRotation =
    radialVizRotation + monthIndexDelta * oneMonthRotationInDegrees;

  return radialVizRotation;
}

function getShortName(d, radiusScaleFoods, radiusAccessorFoods) {
  const thisArcOuterRadius = radiusScaleFoods(radiusAccessorFoods(d));
  const oneMonthOuterCircumference = (2 * Math.PI * thisArcOuterRadius) / 12;
  if (oneMonthOuterCircumference > 200) {
    return d.name;
  }

  const charLimit = 18;
  return `${d.name.slice(0, charLimit)}${d.name.length > charLimit ? "…" : ""}`;
}

function updateTagsWithRegionSelection() {
  colorSections = d3
    .select("#foods-by-color")
    .selectAll("div.color-section")
    .data(
      colorGroupedData.map((d) => [
        d[0],
        d[1].filter((d) => d.region === regionMap[selectedRegionName]),
      ])
    );

  colorSections
    .select(".tags")
    .selectAll(".tag")
    .data(
      (d) => d[1],
      (d) => `${d.name}`
    )
    .join(
      (enter) =>
        enter
          .append("button")
          .attr("type", "button")
          .attr("aria-label", (d) =>
            isInSeason(d) ? undefined : `${d.name} (out of season)`
          )
          .attr("aria-pressed", (d) => isFavourite(d))
          .attr("class", getFoodTagClasses)
          .text((d) => d.name)
          .on("click", toggleFoodSelection),
      (update) =>
        update
          .attr("aria-label", (d) =>
            isInSeason(d) ? undefined : `${d.name} (out of season)`
          )
          .attr("aria-pressed", (d) => isFavourite(d))
          .attr("class", getFoodTagClasses),
      (exit) => exit.remove()
    );
}

function updateTagsWithFavouritesSelection() {
  colorSections
    .select(".tags")
    .selectAll(".tag")
    .data(
      (d) => d[1],
      (d) => `${d.name}`
    )
    .join(
      (enter) =>
        enter
          .append("button")
          .attr("type", "button")
          .attr("aria-label", (d) =>
            isInSeason(d) ? undefined : `${d.name} (out of season)`
          )
          .attr("aria-pressed", (d) => isFavourite(d))
          .attr("class", getFoodTagClasses)
          .text((d) => d.name)
          .on("click", toggleFoodSelection),
      (update) =>
        update
          .attr("aria-label", (d) =>
            isInSeason(d) ? undefined : `${d.name} (out of season)`
          )
          .attr("aria-pressed", (d) => isFavourite(d))
          .attr("class", getFoodTagClasses),
      (exit) => exit.remove()
    );
}

function toggleFoodSelection(_foodButtonClickEvent, foodData) {
  previousSelectedMonthIndex = selectedMonthIndex;
  const didUpdateFavouriteFoodsSelection =
    maybeUpdateFavouriteFoodsSelection(foodData);
  if (didUpdateFavouriteFoodsSelection) {
    updateSelectedFoodsInLocalStorage();
    updateTagsWithFavouritesSelection();
    updateRadialDetailVizWithRegionSelection();
    updateRadialOverviewVizWithRegionSelection();
    d3.selectAll(".js-favourites-selected-counter").text(
      favouriteFoods[regionMap[selectedRegionName]].size
    );
  }
}

function getFoodTagClasses(d) {
  return `tag prevent-double-tap-zoom ${d.mainColor} ${
    isInSeason(d) ? "in-season" : "out-of-season"
  } ${isFavourite(d) ? "favourite" : ""}`;
}

function isFavourite(d) {
  return favouriteFoods[regionMap[selectedRegionName]].has(d.name);
}

function maybeUpdateFavouriteFoodsSelection(food) {
  if (isFavourite(food)) {
    if (
      favouriteFoods[regionMap[selectedRegionName]].size <=
      minimumFavouriteFoods
    ) {
      dialog.showModal();
      d3.select(".dialog-text").text(
        `You need at least ${minimumFavouriteFoods} favourite food${
          minimumFavouriteFoods === 1 ? "" : "s"
        } or the visualisation will look funny.`
      );
      return false;
    }
    favouriteFoods[regionMap[selectedRegionName]].delete(food.name);
  } else {
    if (
      favouriteFoods[regionMap[selectedRegionName]].size >=
      maximumFavouriteFoods
    ) {
      dialog.showModal();
      d3.select(".dialog-text").text(
        `You can't pick more than ${maximumFavouriteFoods} favourite foods or the visualisation will get too crowded.`
      );
      return false;
    }
    favouriteFoods[regionMap[selectedRegionName]].add(food.name);
  }

  return true;
}

function updateSelectedFoodsInLocalStorage() {
  setLocalStorageItem(
    favouritesStorage,
    JSON.stringify(favouriteFoods, (_key, value) =>
      value instanceof Set ? [...value] : value
    )
  );
}

function makeInteractive() {
  makeRegionInteractive();
  makeHideOutOfSeasonCheckboxInteractive();
  makeShowOnlyFavouritesCheckboxInteractive();
  makeNextPreviousMonthButtonsInteractive();
  makeDialogInteractive();
  makeSeasonalFoodTraitsWiggle();

  window.addEventListener(
    "popstate",
    function (event) {
      setInitialSelectedMonth();
      setInitialSelectedRegion();
      updateDataWithRegionSelection();
      updateDataWithNewMonthSelection();
    },
    false
  );
}

function makeDialogInteractive() {
  const handleDialogClick = (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  };
  dialog.addEventListener("click", handleDialogClick);

  const closeButton = d3.select("dialog button");
  closeButton.on("click", () => {
    dialog.close();
  });
}

function makeSeasonalFoodTraitsWiggle() {
  d3.selectAll(".seasonal-food-traits li").on("click", function () {
    let thisTrait = d3.select(this);
    thisTrait.classed("wiggle", true);
    setTimeout(() => {
      thisTrait.classed("wiggle", false);
    }, 300);
  });

  d3.selectAll(".seasonal-food-traits li").on("dblclick", function () {
    if (window.getSelection) {
      const selection = window.getSelection();
      selection.removeAllRanges();
    }

    let thisTrait = d3.select(this);
    thisTrait.classed("bigger-wiggle", true);
    setTimeout(() => {
      thisTrait.classed("bigger-wiggle", false);
    }, 600);
  });
}

function makeNextPreviousMonthButtonsInteractive() {
  d3.select(".next-button").on("click", () => {
    previousSelectedMonthIndex = selectedMonthIndex;
    selectedMonthIndex = selectedMonthIndex === 11 ? 0 : selectedMonthIndex + 1;
    pushMonthParam(months[selectedMonthIndex]);
    updateDataWithNewMonthSelection();
  });

  d3.select(".previous-button").on("click", () => {
    previousSelectedMonthIndex = selectedMonthIndex;
    selectedMonthIndex = selectedMonthIndex === 0 ? 11 : selectedMonthIndex - 1;
    pushMonthParam(months[selectedMonthIndex]);
    updateDataWithNewMonthSelection();
  });
}

function makeHideOutOfSeasonCheckboxInteractive() {
  const browserCheckedState = d3
    .select("#hide-out-of-season-checkbox")
    .property("checked");
  d3.select(".tags-viz").classed("hide-out-of-season", browserCheckedState);

  d3.select("#hide-out-of-season-checkbox").on("click", (e) => {
    d3.select(".tags-viz").classed("hide-out-of-season", e.target.checked);
  });
}

function makeShowOnlyFavouritesCheckboxInteractive() {
  const browserCheckedState = d3
    .select("#show-only-favourites-checkbox")
    .property("checked");

  d3.selectAll(".js-maximum-favourite-foods").text(maximumFavouriteFoods);

  showOnlyFavourites = browserCheckedState;

  d3.select("#show-only-favourites-checkbox").on("click", (e) => {
    showOnlyFavourites = e.target.checked;
    updateRadialOverviewVizWithRegionSelection();
  });
}

function makeRegionInteractive() {
  const regionRadio = d3.selectAll('input[name="region"]');
  regionRadio.on("change", (e) => {
    previousSelectedMonthIndex = selectedMonthIndex;
    const dashifiedRegion = e.target.id;
    selectedRegionName = mapDashifiedRegionToSpacedRegion(dashifiedRegion);
    pushRegionParam(dashifiedRegion);
    setLocalStorageItem(regionStorage, selectedRegionName);
    updateDataWithRegionSelection();

    // We use a non-breaking space in the text so that "New" is not separated from "South Wales":
    d3.selectAll(".selected-region-name").text(
      ` in ${selectedRegionName.replaceAll(" ", " ")}`
    );
  });
}

function getPlainEnglishInSeasonText(d) {
  return `${d.name}${getVarietiesText(d.varieties)} are ${
    d.inSeason ? "" : "not "
  }in season in ${d.month}`;
}

function getVarietiesText(varieties) {
  if (!varieties) return "";

  const varietiesArray = varieties.split(",").map((v) => v || "various");
  if (varietiesArray.length === 1) return ` (${varieties})`;
  if (varietiesArray.length === 2) return ` (${varietiesArray.join(" and ")})`;
  if (varietiesArray.length > 2) {
    const lastVariety = varietiesArray.pop();
    return ` (${varietiesArray.join(", ")}, and ${lastVariety})`;
  }
}

function pushMonthParam(newMonth) {
  pushURLParam(monthParam, newMonth);
}

function pushRegionParam(newRegion) {
  pushURLParam(regionParam, newRegion);
}

function pushURLParam(param, value) {
  const url = new URL(location);
  url.searchParams.set(param, value);
  history.pushState({}, "", url);
}

function replaceURLParam(param, value) {
  const url = new URL(location);
  url.searchParams.set(param, value);
  history.replaceState({}, "", url);
}

function setLocalStorageItem(key, value) {
  try {
    window.localStorage.setItem(`${localStoragePrefix}${key}`, value);
  } catch (e) {
    console.error(e);
  }
}

function getLocalStorageItem(key) {
  try {
    return window.localStorage.getItem(`${localStoragePrefix}${key}`);
  } catch (e) {
    console.error(e);
  }
}

/**
 * Generates an arc ID based on the provided data and overview or detail flag.
 * @param {Object} d - The data object.
 * @param {("overview" | "detail")} overviewOrDetailLabel - A label for "overview" or "detail" viz.
 * @returns {string} The generated arc ID.
 */
function getArcID(d, overviewOrDetailLabel) {
  return `${overviewOrDetailLabel}-arc-${d.name
    .replaceAll(")", "-")
    .replaceAll("(", "-")
    .replaceAll(" ", "-")}-${d.month}`;
}

function isInSeason(d) {
  return d.allMonthsSeasonality[selectedMonthIndex] !== "no";
}

function fillNoMonths(foodMonthSeasonalityLabel) {
  const inSeasonLabels = ["yes", "be quick", "peak"];
  // const outOfSeasonLabels = ["no", "maybe", "frozen", "frozen and be quick", ""];
  return inSeasonLabels.includes(foodMonthSeasonalityLabel) ? "yes" : "no";
}

function getGardenateLink(selectedMonthIndex, selectedRegionName) {
  const url = new URL("https://www.gardenate.com/");
  url.searchParams.set("month", `${selectedMonthIndex + 1}`);
  url.searchParams.set("zone", regionClimateZoneMap[selectedRegionName] ?? "2");
  return url.href;
}

const colorMap = {
  "Apples": "red, green",
  "Apples (green)": "green",
  "Apples (red)": "red",
  "Apricots": "orange",
  "Artichokes": "green",
  "Asian greens": "green",
  "Asparagus": "green",
  "Avocados": "green",
  "Autumn/Winter micro greens": "green, purple, red",
  "Bananas": "yellow, white",
  "Beans": "green",
  "Bean shoots": "white",
  "Beans (broad)": "green",
  "Beans (bush)": "green, yellow",
  "Beans (butter)": "brown, white, yellow, green",
  "Beans (flat)": "green",
  "Beans (green)": "green",
  "Beans (purple)": "purple",
  "Beans (runner)": "green",
  "Beans (snake)": "green",
  "Beans (string)": "green",
  "Beetroots": "purple",
  "Berries": "red, blue, purple",
  "Blackberries": "purple, black",
  "Blackcurrants": "purple, black",
  "Black winter truffles": "purple, black",
  "Blood oranges": "orange, red",
  "Blueberries": "purple, black",
  "Bok choy": "green",
  "Boysenberries": "purple, black, red",
  "Bramble berries": "purple, black, red",
  "Breadfruit": "green",
  "Broccoflowers": "green",
  "Broccoli": "green",
  "Broccolini": "green",
  "Brussels sprouts": "green",
  "Cabbages": "green",
  "Calamansi": "orange",
  "Capsicums": "red, green, yellow",
  "Carrots": "orange",
  "Cauliflowers": "white",
  "Cauliflowers (baby)": "white",
  "Celeriac": "brown",
  "Celery": "green",
  "Cherries": "red",
  "Chestnuts": "brown",
  "Chillies": "red",
  "Chinese cabbage": "green",
  "Chicory": "green, red, white",
  "Chinese spinach": "green",
  "Chives": "green",
  "Chokos": "green",
  "Choy sum": "green",
  "Citron melons": "green, orange",
  "Cocoa": "brown",
  "Coconuts": "brown, white",
  "Corn": "yellow, orange, red, purple", // Assuming this means dent corn or flint corn…
  "Corn (baby)": "yellow",
  "Corn (fresh)": "yellow",
  "Crocodile melons": "green, orange",
  "Cucumbers": "green",
  "Cumquats": "orange",
  "Currants": "red",
  "Custard apples": "green, white",
  "Daikons": "white",
  "Dates": "brown, red",
  "Durian": "green, yellow",
  "Dragonfruit": "red, pink, white",
  "Edible flowers": "purple, yellow, red, white, orange, green",
  "Eggplants": "purple",
  "Endives": "yellow, white",
  "Eschallots": "green",
  "Feijoa": "green, yellow",
  "Fennel": "green, white",
  "Finger limes": "green",
  "Figs": "purple, red",
  "Garlic": "white",
  "Garlic chives": "green",
  "Ginger": "brown",
  "Gooseberries": "green, red",
  "Grapefruit": "yellow, red",
  "Grapes": "purple, green",
  "Grapes (green)": "green",
  "Grapes (red)": "red",
  "Greengages": "green",
  "Guavas": "green, red",
  "Honeydew melons": "green, yellow",
  "Horseradish": "brown",
  "Jackfruit": "green, yellow",
  "Jerusalem artichokes": "green",
  "Kale": "green",
  "Kales (baby)": "green",
  "Kales (flat)": "green",
  "Kales (curly)": "green",
  "Kales (purple)": "purple",
  "Kohlrabi": "green, purple",
  "Kiwifruit": "brown, green",
  "Kiwiberries": "green",
  "Leeks": "green",
  "Lemons": "yellow",
  "Lettuces": "green",
  "Lettuces (head)": "green",
  "Lettuces (salad mix)": "green, purple",
  "Lettuces (mizuna)": "green, purple",
  "Limes": "green",
  "Loganberries": "red",
  "Loquats": "orange",
  "Lychees": "red, white",
  "Mandarins": "orange",
  "Mangoes": "yellow",
  "Mangosteens": "purple, white",
  "Maschua": "yellow, white, purple, orange",
  "Micro greens mix": "green, purple",
  "Medlars": "orange",
  "Melons": "green, red, orange",
  "Mulberries": "purple, black, red",
  "Mushrooms": "brown",
  "Mushrooms (lions mane)": "white",
  "Mushrooms (nameko)": "orange",
  "Mushrooms (nicola)": "brown, white",
  "Mushrooms (oyster)": "brown, white",
  "Mushrooms (pink oyster)": "red",
  "Mushrooms (shimeji)": "white, brown",
  "Mushrooms (shitake)": "brown, white",
  "Mushrooms (woodear)": "brown, orange",
  "Nashi": "brown, white",
  "NZ Yams/Oca": "red, orange, yellow",
  "Nectarines": "red, yellow",
  "Okra": "green, white",
  "Olives": "brown, green",
  "Onions": "brown, red, white",
  "Onions (brown)": "brown",
  "Onions (ailsa craig)": "brown",
  "Onions (green)": "green, white",
  "Spring onions": "green, white, purple",
  "Onions (red)": "red",
  "Onions (white)": "white",
  "Oranges": "orange",
  "Papaya": "orange",
  "Parsnips": "white",
  "Passion fruits": "purple, orange",
  "Pawpaws": "green, orange",
  "Peaches": "orange",
  "Peacherines": "orange",
  "Pears": "green, white",
  "Peas (bush)": "green",
  "Peas (green)": "green",
  "Peas (sugar snap)": "green",
  "Peas (snow)": "green",
  "Peas (tendrils)": "green",
  "Peas": "green",
  "Pepinos": "green",
  "Persimmons": "orange",
  "Pineapples": "yellow",
  "Plums": "purple",
  "Pomegranates": "red",
  "Pomelo": "orange, green, red, yellow",
  "Prickly pears": "red, green, orange",
  "Potatoes": "white",
  "Pumpkins (QLD blue)": "orange",
  "Pumpkins (butternut)": "orange",
  "Pumpkins (golden nuggets)": "orange",
  "Pumpkins (grey)": "orange",
  "Pumpkins (jap)": "orange",
  "Pumpkins (jarrahdale)": "orange",
  "Pumpkins": "orange",
  "Quinces": "yellow",
  "Radishes": "red",
  "Radicchio": "red",
  "Rainbow chard": "green, red, yellow, orange",
  "Rambutan": "red, white",
  "Raspberries": "red",
  "Rhubarbs": "red, green",
  "Ricoto chillies": "red, green, orange",
  "Rockmelons": "orange",
  "Rocket": "green",
  "Rosella": "red",
  "Salad": "green",
  "Silverbeet": "green",
  "Shallots": "brown",
  "Snow peas": "green",
  "Spinach": "green",
  "Spinach (baby)": "green",
  "Spring onions": "green",
  "Spring/Summer micro greens": "green, purple, red",
  "Sprouts": "green",
  "Sprouts (alfalfa)": "green",
  "Sprouts (fenugreek)": "white, brown",
  "Sprouts (lentil)": "brown, white, green",
  "Sprouts (sunflower)": "green",
  "Sprouts (wheatgrass)": "green",
  "Squash": "yellow",
  "Star fruit": "yellow",
  "Strawberries": "red",
  "Swedes": "purple, white",
  "Sweet corn": "yellow",
  "Sweet potatoes": "orange",
  "Tamarillo": "red, orange",
  "Tangelos": "orange",
  "Tangerines": "orange",
  "Taro": "brown, white",
  "Tayberries": "red",
  "Tomatoes": "red",
  "Tomatillos": "green",
  "Tomatoes (cherry)": "red",
  "Tomatoes (field)": "red",
  "Tomatoes (heirloom)": "red, purple, orange, yellow",
  "Tomatoes (heritage)": "red, purple, orange, yellow",
  "Tomatoes (large)": "red",
  "Tomatoes (medium)": "red",
  "Tomatoes (roma)": "red",
  "Tomatoes (snacking)": "red, orange",
  "Tomatoes (truss)": "red",
  "Turnips": "purple, white, brown",
  "Vanilla": "brown",
  "Watercress": "green",
  "Wasabi": "green",
  "Wasabi flowers": "white, green",
  "Watermelons": "green, red",
  "Witlof": "white",
  "Wombok": "green, white",
  "Yams": "orange, white, brown, red",
  "Youngberries": "purple, black, red",
  "Zucchini": "green",
  "Zucchini flowers": "yellow",

  "Almonds": "brown, white",
  "Chestnuts": "brown, white",
  "Hazelnuts": "brown",
  "Pecans": "brown",
  "Pistachios": "green, brown",
  "Walnuts": "brown",
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

function getCSSColorFromFoodColor(colorName) {
  switch (colorName) {
    case "red":
      return ["var(--food-red-fill)", "var(--food-red-stroke)"];
    case "brown":
      return ["var(--food-brown-fill)", "var(--food-brown-stroke)"];
    case "purple":
      return ["var(--food-purple-fill)", "var(--food-purple-stroke)"];
    case "yellow":
      return ["var(--food-yellow-fill)", "var(--food-yellow-stroke)"];
    case "green":
      return ["var(--food-green-fill)", "var(--food-green-stroke)"];
    case "orange":
      return ["var(--food-orange-fill)", "var(--food-orange-stroke)"];
    case "white":
      return ["var(--food-white-fill)", "var(--food-white-stroke)"];
    default:
      return ["#949494", "#fff"];
  }
}

function getAllFoodDataForRegion(seasonalFoodData) {
  const selectedRegionAbbr = regionMap[selectedRegionName];
  const selectedFoodsInRegion = seasonalFoodData.filter(
    (d) => d.region === selectedRegionAbbr
  );

  if (selectedFoodsInRegion.length < favouriteFoods[selectedRegionAbbr].size) {
    const missingFoods = [...favouriteFoods[selectedRegionAbbr]].filter(
      (food) => !selectedFoodsInRegion.map((d) => d.name).includes(food)
    );
    console.error({ missingFoods });
    throw new Error(
      "Some foods are missing from the selected region's list of foods. Check favouriteFoods."
    );
  }

  return selectedFoodsInRegion;
}

function getCuratedFoodDataForRegion(seasonalFoodData) {
  const selectedRegionAbbr = regionMap[selectedRegionName];
  const selectedFoodsInRegion = seasonalFoodData
    .filter((d) => d.region === selectedRegionAbbr)
    .filter((d) => isFavourite(d));

  if (selectedFoodsInRegion.length < favouriteFoods[selectedRegionAbbr].size) {
    const missingFoods = [...favouriteFoods[selectedRegionAbbr]].filter(
      (food) => !selectedFoodsInRegion.map((d) => d.name).includes(food)
    );
    console.error({ missingFoods });
    throw new Error(
      "Some foods are missing from the selected region's list of foods. Check favouriteFoods."
    );
  }

  return selectedFoodsInRegion;
}

function getRadialVizFoodMonthsData(selectedFoodData, months) {
  const longFoodMonthsData = selectedFoodData.flatMap((row) => {
    return months.map((month) => {
      return {
        name: row.name,
        month,
        inSeason: row[month.slice(0, 3)] !== "no",
        varieties: row.allMonthsVarieties[months.indexOf(month)],
        mainColor: row.mainColor,
        // tags: row.tags,
        // sources: row.sources,
      };
    });
  });

  return longFoodMonthsData;
}

const isMonthInView = (datumMonth) => {
  const datumMonthIndex = months.indexOf(datumMonth);
  const isPreviousMonth =
    selectedMonthIndex !== 0
      ? datumMonthIndex === selectedMonthIndex - 1
      : datumMonthIndex === 11;
  if (isPreviousMonth) return true;

  const isCurrentMonth = datumMonthIndex === selectedMonthIndex;
  if (isCurrentMonth) return true;

  const isNextMonth =
    selectedMonthIndex !== 11
      ? datumMonthIndex === selectedMonthIndex + 1
      : datumMonthIndex === 0;
  if (isNextMonth) return true;

  return false;
};

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
    allMonthsSeasonality: [
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
    allMonthsVarieties: ["", "", "", "", "", "", "", "", "", "", "", ""],
    tags: d.tags,
    colors: getColors(d.name),
    mainColor: getMainColor(d.name),
    sources: d.sources,
  });

  d3.tsv("./data/seasonal-food-data.tsv", rowConversionFunction)
    .then((data) => {
      const foodRows = {};
      for (const foodRow of data) {
        const key = `${foodRow.name}-${foodRow.region}`; // -${foodRow.sources}`;

        if (!foodRows[key]) {
          foodRows[key] = foodRow;

          foodRows[key].allMonthsVarieties = foodRow.allMonthsSeasonality.map(
            (seasonality) => (seasonality === "yes" ? foodRow.variety : "")
          );
        } else {
          foodRows[key].allMonthsSeasonality = combineSeasonalityArrays(
            foodRows[key].allMonthsSeasonality,
            foodRow.allMonthsSeasonality
          );

          foodRows[key].allMonthsVarieties = combineVarietiesArrays(
            foodRows[key].allMonthsVarieties,
            foodRow.allMonthsSeasonality,
            foodRow.variety
          );

          for (const month of months) {
            if (foodRow[month.slice(0, 3)] === "yes") {
              foodRows[key][month.slice(0, 3)] = "yes";
            }
          }
        }
      }

      seasonalFoodData = Object.values(foodRows).filter((food) =>
        ["fruit", "vegetable"].includes(food.tags)
      );
    })
    .then(() => {
      setTimeout(init(), 0);
    });
}

/**
 *
 * @param {("yes" | "no")[]} previousMonthsSeasonality
 * @param {("yes" | "no")[]} currentMonthsSeasonality
 * @returns {("yes" | "no")[]}
 */
function combineSeasonalityArrays(
  previousMonthsSeasonality,
  currentMonthsSeasonality
) {
  return previousMonthsSeasonality.map((month, i) => {
    return month === "yes" || currentMonthsSeasonality[i] === "yes"
      ? "yes"
      : "no";
  });
}

/**
 *
 * @param {string[]} previousMonthsVarieties - e.g. ["", "Granny Smith", "Granny Smith", ""]
 * @param {string[]} currentMonthsSeasonality - e.g. ["no", "yes", "no", "yes"]
 * @param {string} currentVariety - e.g. "Pink Lady"
 * @returns {string[]} - e.g. ["", "Granny Smith,Pink Lady", "Granny Smith", "Pink Lady"]
 */
function combineVarietiesArrays(
  previousMonthsVarieties,
  currentMonthsSeasonality,
  currentVariety
) {
  return previousMonthsVarieties.map((previousVarieties, i) => {
    if (currentMonthsSeasonality[i] === "no") {
      return previousVarieties;
    }

    if (previousVarieties === "") {
      return currentVariety;
    }

    return previousVarieties + `,${currentVariety}`;
  });
}

function updateCopyright() {
  const copy = d3.select("#copyright");
  const currentYear = new Date().getFullYear();
  copy.text(currentYear > 2024 ? `–${currentYear}` : "");
}

updateCopyright();
loadData();
