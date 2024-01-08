let TODOData;

const width = window.innerWidth;

function init() {
}

function loadData() {
  // const rowConversionFunction = ({
  // }) => ({
  // });
  // d3.csv("./data/TODO.csv", rowConversionFunction)
  //   .then((data) => {
  //     TODOData = data;
  //   })
  //   .then(() => {
  //     setTimeout(init(), 0);
  //   });
}

function updateCopyright() {
  const copy = d3.select("#copyright");
  const currentYear = new Date().getFullYear();
  copy.text(currentYear > 2024 ? `–${currentYear}` : "");
}

updateCopyright();
loadData();

