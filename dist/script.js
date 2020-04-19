console.clear();
Promise.all([
d3.json("https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json"),
d3.json("https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json")]).

then(([education, counties]) => {

  const dataEdu = education.map(x => [x.area_name, x.bachelorsOrHigher, x.fips, x.state]);

  const svgHeight = 600;
  const svgWidth = 900;

  const brewer = ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'];

  const maxEdu = d3.max(dataEdu, x => x[1]);
  const minEdu = d3.min(dataEdu, x => x[1]);

  const gap = (maxEdu - minEdu) / (brewer.length - 1);

  const colorDomain = [minEdu, minEdu + gap, minEdu + gap * 2, minEdu + gap * 3, minEdu + gap * 4, minEdu + gap * 5, minEdu + gap * 6, minEdu + gap * 7, maxEdu];

  const color = d3.scaleThreshold().
  domain(colorDomain).
  range(brewer);



  const svg = d3.select("svg").
  attr("height", svgHeight).
  attr("width", "100%");

  const tooltip = d3.tip().
  attr("id", "tooltip").
  html(x => {

    const filterd = dataEdu.filter(y => y[2] === x.id);
    d3.select("#tooltip").attr("data-education", filterd[0][1]);

    return `Area:${filterd[0][0]} <br> Bachelors:${filterd[0][1]}% <br> Fips:${filterd[0][2]} <br> State:${filterd[0][3]}`;

  });

  svg.call(tooltip);

  const path = d3.geoPath();

  const map = d3.select("svg").
  append("g").
  selectAll("path").
  data(topojson.feature(counties, counties.objects.counties).features).
  join("path").
  attr("d", path).
  attr("fill", x => color(dataEdu.filter(y => y[2] === x.id)[0][1])).
  attr("class", "county").
  attr("data-fips", x => dataEdu.filter(y => y[2] === x.id)[0][2]).
  attr("data-education", x => dataEdu.filter(y => y[2] === x.id)[0][1]).
  on('mouseover', tooltip.show).
  on('mouseout', tooltip.hide);

  const description = svg.append("g").
  attr("id", "description").
  append("text").
  text("Us education values in percentage").
  attr("x", svgWidth / 3).
  attr("y", 50);

  const rect = 25;

  const legendScale = d3.scaleBand().
  domain(colorDomain).
  range([0, rect * colorDomain.length]);

  const legendAxis = d3.axisBottom(legendScale).
  tickFormat(d3.format(".1f"));

  const legend = svg.append("g").
  attr("id", "legend");

  legend.selectAll("rect").
  data(colorDomain.slice(0, colorDomain.length - 1)).
  enter().
  append("rect").
  attr("x", (x, i) => i * rect + rect / 2 + svgWidth * 2 / 3).
  attr("y", 50 - rect).
  attr("height", rect).
  attr("width", rect).
  attr("fill", x => color(x));


  legend.append("g").
  attr("transform", "translate(" + svgWidth * 2 / 3 + "," + 50 + ")").
  call(legendAxis);

});