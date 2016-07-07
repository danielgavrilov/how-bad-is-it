var year1ModuleNames = {
  "COMP101P": "Principles of Programming",
  "COMP102P": "Theory I",
  "COMP103P": "Object-Oriented Programming",
  "COMP104P": "Theory II",
  "COMP105P": "Robotics Programming",
  "ENGS101P": "Integrated Engineering",
  "ENGS102P": "Design & Professional Skills",
  "MATH6301": "Discrete Mathematics for Computer Scientists",
  "Raw Year Average": "" 
};

var year2ModuleNames = {
  "CEGE201M": "Aerospace Design and Aerodynamics",
  "COMP201P": "Networking and Concurrency",
  "COMP202P": "Logic and Database Theory", 
  "COMP203P": "Software Engineering and Human Computer Interaction", 
  "COMP204P": "Systems Engineering I", 
  "COMP205P": "Systems Engineering II",
  "COMP206P": "Mathematics and Statistics", 
  "COMP207P": "Compilers", 
  "COMP209P": "Cognitive Systems and Intelligent Technologies",
  "Comp7008": "Entrepreneurship: Theory and Practice",
  "ELEC210P": "Connected Systems",
  "LCFR6001": "French Level 1",
  "LCFR6003": "French Level 3",
  "LCGE6001": "German Level 1",
  "LCGE6002": "German Level 2",
  "LCJA6001": "Japanese Level 1",
  "LCJA6005": "Japanese Level 5",
  "LCMA6001": "Mandarin Level 1",
  "LCMA6003": "Mandarin Level 3",
  "MSIN6001B": "Understanding Management",
  "MSIN7008": "Entrepreneurship: Theory and Practice",
  "MSIN716P": "Management Accounting for Engineers",
  "STAO6002": "",
  "Year Average": ""
};


function tryParseFloats(obj) {
  for (var key in obj) {
    var value = parseFloat(obj[key]);
    if (!isNaN(value)) obj[key] = value;
  }
  return obj;
}

function removeEmptyStrings(obj) {
  for (var key in obj) {
    if (obj[key] === "") delete obj[key];
  }
  return obj;
}

function substringMatcher(strs) {
  return function findMatches(q, cb) {
    var matches, substringRegex;
 
    // an array that will be populated with substring matches
    matches = [];
 
    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');
 
    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        matches.push(str);
      }
    });
 
    cb(matches);
  };
}

function render(year, moduleNames){
  d3.csv("data/bsc" + year + ".csv", function(err, BSc) {
    d3.csv("data/meng" + year + ".csv", function(err, MEng) {

      var modules = _.keys(moduleNames);
      var data = BSc.concat(MEng);

      data.forEach(removeEmptyStrings);
      data.forEach(tryParseFloats);

      var formatCount = d3.format(",.0f");

      var margin = {top: 10, right: 10, bottom: 50, left: 10},
          width = 500 - margin.left - margin.right,
          height = 200 - margin.top - margin.bottom;

      var root = d3.select("#content" + year);

      var x = d3.scale.linear()
          .domain([0, 100])
          .range([0, width]);

      var histogram = d3.layout.histogram()
          .bins(x.ticks(10));

      var y = d3.scale.linear()
          .range([height, 0]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

      var moduleSVGs = root.selectAll("div")
          .data(modules)
        .enter()
          .append("div")
          .attr("class", "module")
        .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      moduleSVGs.append("text")
          .attr("class", "module-code")
          .attr("dy", "1.5em")
          .attr("y", height + 17)
          .attr("x", width / 2)
          .attr("text-anchor", "middle")
          .text(function(d) {
            if(moduleNames[d]){
              return d + ": " + moduleNames[d].toUpperCase();
            } else {
              return d;
            } 
          });

      var bar = moduleSVGs.selectAll(".bar")
          .data(function(module) {
            return histogram(_(data).pluck(module).compact().value()) 
          })
        .enter().append("g");

      var allData = bar.map(function(bars) { return d3.selectAll(bars).data() });
      y.domain([0, d3.max(allData, function(d) { return d3.max(d, function(d) { return d.y }); })]);

      bar.attr("class", "bar")
          .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

      bar.append("rect")
          .attr("x", 1)
          .attr("width", function(data) { return x(data.dx) - 1; })
          .attr("height", function(d) { return height - y(d.y); });

      bar.append("text")
          .attr("dy", ".375em")
          .attr("y", function(d) { 
            if (y(d.y) > height - 15) return -9;
            else return 9;
          })
          .style("fill", function(d) {
            if (y(d.y) > height - 15) return "black";
            else return "white";
          })
          .attr("x", function(d) { return x(d.dx) / 2 })
          .attr("text-anchor", "middle")
          .text(function(d) { return formatCount(d.y); });

      moduleSVGs.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      // $('#search .typeahead').typeahead({
      //   hint: true,
      //   highlight: true,
      //   minLength: 1
      // },
      // {
      //   name: 'candidate-number',
      //   source: substringMatcher(_.pluck(data, "Student Candidate Number"))
      // });
      
    });
  });

}

render(1, year1ModuleNames);
render(2, year2ModuleNames);
