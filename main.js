mapboxgl.accessToken = 'pk.eyJ1IjoiYXJvc2VuYmx1bSIsImEiOiJjbGpzN3FwNW8wbTRzM2Zxbm9zOGEzeW1xIn0.dL-P0gJKRwXKC721cBqEbA';


// dimensions related
const windowWidth = $(window).width();
const windowHeight = $(window).height();

$(window).resize(function () {
  if (
    windowWidth != $(window).width() ||
    windowHeight != $(window).height()
  ) {
    location.reload();
    return;
  }
});

let isSmallScreen = false;

if (windowWidth <= 700) {
  isSmallScreen = true;
}

const userAgent = navigator.userAgent.toLowerCase();

// let is_iPad = navigator.userAgent.match(/iPad/i) != null;
const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);

if(!isSmallScreen){
    let sidebarHeight = $("#sidebar").height();
    $(".chartWrapper").css("height",sidebarHeight)
}

let width = $(".chartWrapper").width();
let height = $(".chartWrapper").height();

let activeCategories = ['Solutions & Politics', 'Habitability & Hospitability', 'Justice & Ethics', 'Earth System Science', 'Solutions & Economics', 'Indigenous Knowledge']
let allCategories = ['Solutions & Politics', 'Habitability & Hospitability', 'Justice & Ethics', 'Earth System Science', 'Solutions & Economics', 'Indigenous Knowledge']

let tooltip = floatingTooltip('circleTooltip', 240, 10);
let clicked = false;
let isZoomed = false;
let brushing = false; // to make sure tooltip won't show up when brushing
let searched = false;
let currentProjection = "PQ";


// Prepare our physical space
const svg = d3
  .select("#chart1")
  .append("svg")
  .attr("width", width)
  .attr("height", height)

let projection = d3.geoPeirceQuincuncial()
  .fitSize([width, height], {
    type: "Sphere"
  })
  .precision(0.1)
  .scale((width) / 2 / Math.PI * 0.75)

if (isSmallScreen) {
  projection = d3.geoPeirceQuincuncial()
    .fitSize([width, height], {
      type: "Sphere"
    })
    .precision(0.1)
    .scale((width) / 2 / Math.PI * 0.9)
}

let path = d3.geoPath().projection(projection);

const projection2 = d3.geoNaturalEarth1();
const path2 = d3.geoPath(projection2);


const colorScale = d3.scaleOrdinal()
  .range(["#d69a07", "#db311b", "#71918a", "#c9bc11", "#39603d", "#305d77"]);

let brush = d3.brush()
  .on('brush', brushMove)
  .on("end", brushEnd);

let brushExtent;
let brushedSufficient = true; //check if dragged area big enough

let transformed;
let transformedLevel = 1;

let ids;


const zoom = d3.zoom()
  .scaleExtent([1, Infinity])
  .translateExtent([
    [0, 0],
    [width, height]
  ])
  .extent([
    [0, 0],
    [width, height]
  ])
  .on("zoom", zoomed)
  .on("end", zoomEnd);


function brushMove(e) {
  if (searched) {

    d3.selectAll(".brush").style("opacity", 0);
    d3.selectAll(".selection").style("display", "none");
    d3.selectAll(".handle").style("display", "none");

  } else {
    d3.selectAll(".brush").style("opacity", 1);
    d3.selectAll(".selection").style("display", "inherit");
    d3.selectAll(".handle").style("display", "inherit");

    brushing = true;
    tooltip.hideTooltip();

    svg.selectAll(".selection").attr("stroke-width", 2 / transformedLevel).attr("stroke", "white").attr("stroke-dasharray", `${12 / transformedLevel},${6 / transformedLevel}`).attr("fill", "none")

    //update brush extent
    brushExtent = e.selection;
    //update points style within the rect
    svg.selectAll("circle.point")
      .attr("fill", d => isInBrushExtent(d) ? 'white' : colorScale(d.Category))
      .raise(); // in order to be able to hover

    //check brush extent to see if it's big enough to brush
    brushedSufficient = isSufficient();
  }
}

function isSufficient() { // make sure user can't zoom by clicking
  return brushExtent[1][0] - brushExtent[0][0] > 1 && brushExtent[1][1] - brushExtent[0][1] > 1;
}

function isInBrushExtent(d) {
  if (currentProjection === "NE") {
    return brushExtent &&
      projection2([d.Longitude, d.Latitude])[0] >= brushExtent[0][0] &&
      projection2([d.Longitude, d.Latitude])[0] <= brushExtent[1][0] &&
      projection2([d.Longitude, d.Latitude])[1] >= brushExtent[0][1] &&
      projection2([d.Longitude, d.Latitude])[1] <= brushExtent[1][1];

  } else {
    return brushExtent &&
      projection([d.Longitude, d.Latitude])[0] >= brushExtent[0][0] &&
      projection([d.Longitude, d.Latitude])[0] <= brushExtent[1][0] &&
      projection([d.Longitude, d.Latitude])[1] >= brushExtent[0][1] &&
      projection([d.Longitude, d.Latitude])[1] <= brushExtent[1][1];
  }
}

function brushEnd() {

  brushing = false;

  d3.selectAll(".point").style("stroke", "#808080")

  //get the four corner coordinates
  const x0 = brushExtent[0][0];
  const x1 = brushExtent[1][0];
  const y0 = brushExtent[0][1];
  const y1 = brushExtent[1][1];


  if (brushedSufficient) {

    const x = -(x0 + x1) / 2;
    const y = -(y0 + y1) / 2;
    let k = 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height);
    if (k > 130) { k = 130 };
    transformedLevel = k;

    if (!searched) { //disable zoom after search
      svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomTransform(30, 30, 1)
          .translate(width / 2, height / 2)
          .scale(k)
          .translate(x, y),
      )
    }
  }
}

function zoomEnd() {
  d3.select(".selection").style("display", "none");
  d3.selectAll(".handle").style("display", "none");
  $("#resetZoom").addClass("active");
}

function zoomed(e) {

  tooltip.hideTooltip();
  clicked = false;

  d3.selectAll(".selection").style("display", "none");
  d3.selectAll(".handle").style("display", "none");
  d3.select("#intro").style("display", "none");


  if (e.transform.k > 10) { //load more detailed geojson when more zoomed in
    d3.selectAll(".land2").style("display", "block");
    d3.selectAll(".land").style("display", "none");
  } else {
    d3.selectAll(".land2").style("display", "none");
    d3.selectAll(".land").style("display", "block");
  }

  isZoomed = true;

  const transform = e.transform; //k,x,y
  transformed = transform;

  svg.selectAll('path')
    .attr('transform', transform)
    .attr("stroke-width", 1 / transform.k)

  svg.selectAll("circle")
    .attr('transform', transform)
    .attr('r', 5.5 / transform.k)
    .attr("stroke-width", isZoomed ? 1 / transform.k : 1)
    .attr("fill", d => colorScale(d.Category))
    .style("opacity", d => function () {
      if (ids.includes(d.Id)) {
        if (activeCategories.includes(d.Category)) {
          return 1
        } else {
          return 0
        }
      } else {
        return 0
      }
    })

  svg.select('.brush')
    .attr('transform', transform)
    .attr("stroke-width", isZoomed ? 1 / transform.k : 1);
}

function resetZoom() {
  d3.selectAll(".point").style("stroke", "#808080")
  tooltip.hideTooltip();
  clicked = false;
  transformedLevel = 1;
  isZoomed = false;
  svg.transition()
    .duration(750)
    .call(zoom.transform, d3.zoomIdentity)
    .on("end", function () {
      $("#resetZoom").removeClass("active");
    })
}

$(".explore").on("click", function () {
  $(".infopanel-wrapper").css("display", "none");
  $(".infopanel-overlay").css("display", "none");
  if (!isSmallScreen) {
    $("#sidebar").css("display", "inherit");
  } else {
    $("#topBar").css("display", "inherit");
  }
})

$("body").on("click", function () {
  $(".infopanel-wrapper").css("display", "none");
  $(".infopanel-overlay").css("display", "none");
  if (!isSmallScreen) {
    $("#sidebar").css("display", "inherit");
  } else {
    $("#topBar").css("display", "inherit");
  }
})

$("#reset").on("click", function () {
  resetZoom();
  enableToggle();
  searched = false;
  d3.selectAll(".overlay").style("cursor", "crosshair");
  resetPoints(data);
  $("#reset").removeClass("active"); //make button unclickable
  $("#search-bar").val("");
})

$('input:radio[name="setProjection"]').change(function () {
  currentProjection = $(this).val();
  updateProjection();
});

const worldmap = d3.json("./data/land1.geojson");
const worldmapDetailed = d3.json("./data/land2.geojson"); //0.055 simplify is the max
const points = d3.csv("./data/mapData.csv");
const individuals = d3.csv("./data/individualsData.csv");
//IPSA & Earth4All are drawn twice, because of the data

let data;
let dataIndividuals

Promise.all([worldmap, points, worldmapDetailed, individuals]).then(function (values) {

  if (isSmallScreen) {
    $("#mapButton").on("click", function () {
      $("#sidebar").css("display", "none");
      $("#mapButton").css("display", "none");
      $("#menu").css("display", "inherit");
    })

    $("#menu").on("click", function () {
      $("#sidebar").css("display", "inherit");
      $("#mapButton").css("display", "inherit");
      $("#menu").css("display", "none");
      if (windowWidth <= 700) {
        const searchformWidth = $("#search-bar").width();
        $(".output").css("width", searchformWidth + 20);
      }
    })


  } else {


    let sidebarWidth = $("#sidebar").width();
    let sidebarHeight = $("#sidebar").height();

    $("#individualsPanel").css("margin-left", sidebarWidth + 1);
    $("#aboutPanel").css("margin-left", sidebarWidth + 1);
    $("#individualsPanel").css("min-height", Math.max(sidebarHeight, $(window).height()));
    $("#aboutPanel").css("min-height", Math.max(sidebarHeight, $(window).height()));

  }

  $("#individualsPanel .close").on("click", function () {
    $("#individualsPanel").css("display", "none");
  })

  $("#aboutPanel .close").on("click", function () {
    $("#aboutPanel").css("display", "none");
  })

  $("#thinkers").on("click", function () {
    tooltip.hideTooltip();
    $("#individualsPanel").css("display", "block");
    $("#aboutPanel").css("display", "none");
    if (isSmallScreen) {
      let sidebarHeight = $("#sidebar").height();
      $("#individualsPanel").css("width", "100vw");
      $("#individualsPanel").css("z-index", 1002);
      $("#individualsPanel").css("height", sidebarHeight);
    } else {
      $("#individualsPanel").css("width", "350px");
    }
  })

  $("#about").on("click", function () {
    tooltip.hideTooltip();
    $("#aboutPanel").css("display", "block");
    $("#individualsPanel").css("display", "none");
    if (isSmallScreen) {
      let sidebarHeight = $("#sidebar").height();
      $("#aboutPanel").css("width", "100vw");
      $("#aboutPanel").css("z-index", 1002);
      $("#aboutPanel").css("height", sidebarHeight);
    } else {
      $("#aboutPanel").css("width", "350px");
    }
  })


  $("#filterArrow").on("click", function () {
    $("#toggleWrapper").toggleClass("none", "show");
    if ($(this).hasClass("active")) {
      $(this).removeClass("active");
    } else {
      $(this).addClass("active");
    }
  })

  $("#projectionArrow").on("click", function () {
    $("#projectionWrapper").toggleClass("none", "show");
    if ($(this).hasClass("active")) {
      $(this).removeClass("active");
    } else {
      $(this).addClass("active");
    }
  })


  function addIndividuals() {

    dataIndividuals.forEach((d) => {
      let fill = colorScale(d.Category);
      $(".individualList").append(
        `<li>
          <a href="#">
            <div class="title">${d.Name}</div>
            <div class="arrow"><img src="./img/chevron-right.svg"></div>
          </a>
          <ul class="accordion">
            <br>
            <span class="focusarea" style='background-color:${fill} '> ${d.Category}: ${d.Focus}</span>
            <p class="work">${d.Work}</p>
            <span class="website"><a href='${d.Contact_site}' target='_blank'>Website&nbsp;&nbsp;<img src="./img/website.svg" /></a></span>
            <br><br>
          </ul>
         </li>`
      )
    })

    $(".individualList li").click(function (event) {
      event.preventDefault();

      if ($(this).hasClass("active")) {
        $(".individualList li").removeClass("active");
        $(this).removeClass("active");

      } else {
        $(".individualList li").removeClass("active");
        $(this).addClass("active");
      }
    });

    $('.accordion .website').click(function (event) {
      event.stopPropagation();
    });
  }

  projection2.fitSize([width, height], values[0]);
  data = values[1].filter(d => d.Latitude !== "-" && d.Latitude !== "");
  dataIndividuals = values[3];

  addIndividuals()

  let $terms;
  let $return = [];

  // populate searchterms
  let organization = data.map(function (obj) {
    return obj.Organization;
  });

  organization = organization.filter(function (v, i) {
    return organization.indexOf(v) == i;
  });

  let location = data.map(function (obj) {
    return obj.Location;
  });

  location = location.filter(function (v, i) {
    return location.indexOf(v) == i;
  });

  $terms = [...organization, ...location].sort();

  let focus = data.map(function (obj) {
    return obj.Focus;
  });
  focus = focus.filter(function (v, i) {
    return focus.indexOf(v) == i;
  });

  let categories = data.map(function (obj) {
    return obj.Category;
  });
  categories = categories.filter(function (v, i) {
    return categories.indexOf(v) == i;
  });

  let type = data.map(function (obj) {
    return obj.Type;
  });
  type = type.filter(function (v, i) {
    return type.indexOf(v) == i;
  });

  colorScale.domain(categories);

  //this part is to remove the weird artifacts (horizontal lines above and below the map)
  // draw first map just to get the bbox of the land
  svg.selectAll("path.land")
    .data(values[0].features)
    .join("path")
    .attr("class", "land")
    .attr("id", "land")
    .attr("d", path);

  const bbox = d3.select("#land").node().getBBox();

  // add a clipping path the show the central part of the map (move 3 down from top and 3 up from bottom)
  svg.append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("x", bbox.x)
    .attr("y", bbox.y + 3)
    .attr("width", bbox.width)
    .attr("height", bbox.height - 6);

  // now remove the land we drew
  svg.selectAll("path.land").remove();

  // and redraw it using the clipping mask
  svg.selectAll("path.land")
    .data(values[0].features)
    .join("path")
    .attr("class", "land")
    .attr("fill", "#d9cdc2")
    .attr("stroke", "#808080")
    .attr("d", path)
    .attr("clip-path", "url(#clip)");

  // for more detailed areas on zoom
  svg.selectAll("path.land2")
    .data(values[2].features)
    .join("path")
    .attr("class", "land2")
    .attr("fill", "#d9cdc2")
    .attr("stroke", "#808080")
    .attr("d", path)
    .attr("clip-path", "url(#clip)")
    .attr("display", "none")

  //need to come before points
  svg.append("g")
    .attr("class", "brush")
    .call(brush);

  // draw points
  svg.selectAll("circle.point")
    .data(data)
    .join("circle")
    .attr("class", "point")
    .attr("id", d => "id" + d.Id)
    .attr("cx", d => currentProjection === "NE" ? projection2([+d.Longitude, +d.Latitude])[0] : projection([+d.Longitude, +d.Latitude])[0])
    .attr("cy", d => currentProjection === "NE" ? projection2([+d.Longitude, +d.Latitude])[1] : projection([+d.Longitude, +d.Latitude])[1])
    .attr("stroke-width", 1)
    .attr("stroke", "#808080")
    .attr("r", 5.5)
    .attr("fill", d => colorScale(d.Category))
    .style("opacity", d => activeCategories.includes(d.Category) ? 1 : 0)
    .style("display", d => activeCategories.includes(d.Category) ? "inherit" : "none")
    .on("mouseover", function (e, d) {
      $("#aboutPanel").css("display", "none");
      $("#individualsPanel").css("display", "none");
      if (!brushing && !isSmallScreen) {
        d3.selectAll(".point").style("stroke", "#808080")
        d3.select(this).style("stroke", "black")
        showDetail(e, d);
      }
    })
    .on("mouseout", function (e, d) {
      if (clicked == false) {
        d3.selectAll(".point").style("stroke", "#808080")
      }
      hideDetail(d)
    })
    .on("click", function (e, d) {
      $("#aboutPanel").css("display", "none");
      $("#individualsPanel").css("display", "none");
      d3.selectAll(".point").style("stroke", "#808080")
      d3.select(this).style("stroke", "black")
      clicked = true;
      if (isSmallScreen) {
        showDetail(e, d);
      }
    }).on("touchend", function (e, d) {
      d3.selectAll(".point").style("stroke", "#808080")
      d3.select(this).style("stroke", "black")
      clicked = true;
      if (isSmallScreen || isTablet) {
        showDetail(e, d);
      }
    })

  $("#resetZoom").click(resetZoom);

  function strInArray(str, strArray) {
    for (var j = 0; j < strArray.length; j++) {
      if ((strArray[j].toLowerCase()).match(str.toLowerCase()) && $return.length < 5) {
        var $h = strArray[j].replace(str, "<strong>" + str + "</strong>");
        $return.push(
          '<li class="prediction-item"><span class="prediction-text">' +
          $h +
          "</span></li>"
        );
      }
    }
  }

  function nextItem(kp) {
    if ($(".focus").length > 0) {
      var $next = $(".focus").next(),
        $prev = $(".focus").prev();
    }

    if (kp == 38) {
      // Up

      if ($(".focus").is(":first-child")) {
        $prev = $(".prediction-item:last-child");
      }

      $(".prediction-item").removeClass("focus");
      $prev.addClass("focus");
    } else if (kp == 40) {
      // Down

      if ($(".focus").is(":last-child")) {
        $next = $(".prediction-item:first-child");
      }

      $(".prediction-item").removeClass("focus");
      $next.addClass("focus");
    }
  }

  populateSearch();

  function populateSearch() {

    $(function () {
      $("#search-bar").keydown(function (e) {
        $key = e.keyCode;
        if ($key == 38 || $key == 40) {
          nextItem($key);
          return;
        }

        setTimeout(function () {
          var $search = $("#search-bar").val();
          $return = [];

          strInArray($search, $terms);

          if ($search == "" || !$("input").val) {
            $(".output").html("").slideUp();
          } else {
            $(".output").html($return).slideDown();
          }

          $(".prediction-item").on("click", function () {

            searched = true;
            disableToggle();
            $("#individualsPanel").css("display", "none");
            $("#aboutPanel").css("display", "none");
            d3.selectAll(".overlay").style("cursor", "inherit")

            $text = $(this).find("span").text();
            resetFilters();
            filterPoints(values[1], $text);
            $("#reset").addClass("active"); //make button clickable

            $(".output").slideUp(function () {
              $(this).html("");
            });
            $("#search-bar").val($text);

          });

          $(".prediction-item:first-child").addClass("focus");
        }, 50);
      });
    });
  }

  $("#search-bar").focus(function () {
    if ($(".prediction-item").length > 0) {
      $(".output").slideDown();
    }

    $("#searchform").submit(function (e) {
      e.preventDefault();
      $text = $(".focus").find("span").text();
      $(".output").slideUp();
      $("#search-bar").val($text);
      $("input").blur();
    });
  });

  $("#search-bar").blur(function () {
    if ($(".prediction-item").length > 0) {
      $(".output").slideUp();
    }
  });

}); // end promise

function disableToggle() {
  $('input:radio[name="toggle"]').attr('disabled', 'disabled');
  $('input:radio[name="toggle2"]').attr('disabled', 'disabled');
  $('input:radio[name="toggle3"]').attr('disabled', 'disabled');
  $('input:radio[name="toggle4"]').attr('disabled', 'disabled');
  $('input:radio[name="toggle5"]').attr('disabled', 'disabled');
  $('input:radio[name="toggle6"]').attr('disabled', 'disabled');

  // $(".toggle__pointer").css("background-color", "#777777");
  $(".toggle__pointer").css("opacity", "0.7");
  $(".toggle").css("opacity", "0.3");
  $(".toggle2").css("opacity", "0.3");
  $(".toggle3").css("opacity", "0.3");
  $(".toggle4").css("opacity", "0.3");
  $(".toggle5").css("opacity", "0.3");
  $(".toggle6").css("opacity", "0.3");

}

function enableToggle() {
  $('input:radio').removeAttr("disabled");
  $(".toggle__pointer").css("opacity", "1");
  $(".toggle").css("opacity", "1");
  $(".toggle2").css("opacity", "1");
  $(".toggle3").css("opacity", "1");
  $(".toggle4").css("opacity", "1");
  $(".toggle5").css("opacity", "1");
  $(".toggle6").css("opacity", "1");
}


function createFilterStatus(filterName, layerOnName, statusString) {
  document.getElementById(filterName).addEventListener('change', function (e) {
    //remove popup
    clicked = false;
    d3.selectAll(".point").style("stroke", "#808080");
    tooltip.hideTooltip();

    if (e.target.value === layerOnName) {
      if (activeCategories.indexOf(statusString) == -1) {
        activeCategories.push(statusString)
      }

      // redraw using d3 here

      d3.selectAll("circle.point")
        .transition().duration(300)
        .style("opacity", d => activeCategories.includes(d.Category) ? 1 : 0).style("display", d => activeCategories.includes(d.Category) ? "inherit" : "none")


    } else {
      if (activeCategories.indexOf(statusString) !== -1) {
        var index = activeCategories.indexOf(statusString);
        activeCategories.splice(index, 1);
      }

      // redraw using d3 here
      d3.selectAll("circle.point")
        .transition().duration(300)
        .style("opacity", d => activeCategories.includes(d.Category) ? 1 : 0)
        .style("display", d => activeCategories.includes(d.Category) ? "inherit" : "none")
    }
  });

}

createFilterStatus('filter1', 'layer1On', 'Solutions & Politics')
createFilterStatus('filter2', 'layer2On', 'Habitability & Hospitability')
createFilterStatus('filter3', 'layer3On', 'Justice & Ethics')
createFilterStatus('filter4', 'layer4On', 'Earth System Science')
createFilterStatus('filter5', 'layer5On', 'Solutions & Economics')
createFilterStatus('filter6', 'layer6On', 'Indigenous Knowledge')

function filterPoints(data, term) {

  tooltip.hideTooltip();
  clicked = false;
  let filteredData = data.filter(d => d.Organization === term || d.Location === term);

  ids = filteredData.map(a => a.Id);

  let lat = filteredData[0].Latitude;
  let lon = filteredData[0].Longitude;

  if (term === "Australia") {
    lat = -26.463777;
    lon = 134.347707;
  } // create a mapping function for the locations

  if (term === "USA") {
    lat = 41.094497;
    lon = -99.032502;
  }

  const x = currentProjection === "NE" ? projection2([lon, lat])[0] : projection([lon, lat])[0];
  const y = currentProjection === "NE" ? projection2([lon, lat])[1] : projection([lon, lat])[1];
  let k = 10;

  if (term === "Australia" || term === "USA") {
    k = 5;
  }

  svg.transition().duration(750).call(
    zoom.transform,
    d3.zoomTransform(30, 30, 1)
      .translate(width / 2, height / 2)
      .scale(k)
      .translate(-x, -y),
  )

  // d3.selectAll(".selection").attr("stroke-width", 2 / transformedLevel)

  d3.selectAll("circle.point")
    .style("opacity", d => ids.includes(d.Id) ? 1 : 0)
    .style("display", d => ids.includes(d.Id) ? "inherit" : "none")
}

function resetPoints(data) {
  tooltip.hideTooltip();
  clicked = false;
  // resetFilters();
  svg.selectAll("circle.point")
    .data(data)
    .join("circle")
    .attr("class", "point")
    .attr("cx", d => currentProjection === "NE" ? projection2([d.Longitude, d.Latitude])[0] : projection([d.Longitude, d.Latitude])[0])
    .attr("cy", d => currentProjection === "NE" ? projection2([d.Longitude, d.Latitude])[1] : projection([d.Longitude, d.Latitude])[1])
    .attr("r", 5.5)
    .attr("stroke-width", isZoomed ? 1 / transformedLevel : 1)
    .attr("stroke", "#808080")
    .attr("fill", d => colorScale(d.Category))
    .style("opacity", d => activeCategories.includes(d.Category) ? 1 : 0)
    .style("display", d => activeCategories.includes(d.Category) ? "inherit" : "none")
    .on("mouseover", function (e, d) {
      if (!brushing && !isSmallScreen) {
        d3.selectAll(".point").style("stroke", "#808080")
        d3.select(this).style("stroke", "black")
        showDetail(e, d);
      }
    })
    .on("mouseout", function (e, d) {
      if (clicked == false) {
        d3.selectAll(".point").style("stroke", "#808080")
      }
      hideDetail(d)
    })
    .on("click", function (e, d) {
      d3.selectAll(".point").style("stroke", "#808080")
      d3.select(this).style("stroke", "black")
      clicked = true;

      if (isSmallScreen) {
        showDetail(e, d);
      }
    })

}


function resetFilters() {
  activeCategories = ['Solutions & Politics', 'Habitability & Hospitability', 'Justice & Ethics', 'Earth System Science', 'Solutions & Economics', 'Indigenous Knowledge'];

  $("#layer1On").prop("checked", true);
  $("#layer1Off").prop("checked", false);
  $("#layer2On").prop("checked", true);
  $("#layer2Off").prop("checked", false);
  $("#layer3On").prop("checked", true);
  $("#layer3Off").prop("checked", false);
  $("#layer4On").prop("checked", true);
  $("#layer4Off").prop("checked", false);
  $("#layer5On").prop("checked", true);
  $("#layer5Off").prop("checked", false);
  $("#layer6On").prop("checked", true);
  $("#layer6Off").prop("checked", false);
}

$("#tooltipPanel .close").on("click", function () {
  $("#tooltipPanel").css("display", "none")
})

function showDetail(e, d) {

  let fill = colorScale(d.Category)

  if (isSmallScreen) {

    $("#tooltipPanel").css("display", "inherit")
    $("#organization").html(d.Organization);
    $("#address").html(d.Contact_address);
    $("#mission").html(d.Mission);
    $("#website").html(`<span class="website"><a href='${d.Contact_site}' target='_blank'>Website →</a></span>`);
    $("#focus").html(`<span class="focusarea" style='background-color:${fill} '> ${d.Focus} </span>`);

    let map = new mapboxgl.Map({
      container: 'mapMobile', // container element id
      style:  'mapbox://styles/arosenblum/cljsa3auw019701qyftm23etd',
      center: [d.Longitude, d.Latitude], // initial map center in [lon, lat]
      zoom: 15
    });

    let marker = new mapboxgl.Marker()
      .setLngLat([d.Longitude, d.Latitude])
      .addTo(map);

  } else {

    svg.select(`#id${d.Id}`).raise();
    let content = `<h4> ${d.Organization} </h4>
  <div class="mapWrapper">
    <div id="map"></div>
  </div>
  <span class="website"><a href='${d.Contact_site}' target='_blank'>Website&nbsp;&nbsp;<img src="./img/website.svg" /></a></span>
  <p class="address">${d.Contact_address}</p>
  <span class="focusarea" style='background-color:${fill} '> ${d.Focus} </span>
  <p class="mission"> ${d.Mission} </p>
  <span class="close">Close&nbsp;&nbsp;✕</span>`;

    tooltip.showTooltip(isSmallScreen, content, e);

    let map = new mapboxgl.Map({
      container: 'map', // container element id
      style: 'mapbox://styles/arosenblum/cljsa3auw019701qyftm23etd',
      center: [d.Longitude, d.Latitude], // initial map center in [lon, lat]
      zoom: 15
    });

    let marker = new mapboxgl.Marker()
      .setLngLat([d.Longitude, d.Latitude])
      .addTo(map);

    d3.selectAll(".tooltip .close").on("click", function () {
      tooltip.hideTooltip();
      clicked = false;
      d3.selectAll(".point").style("stroke", "#808080")
    })
  }
}

function hideDetail(d) {
  if (!clicked) {
    tooltip.hideTooltip(); // remove if want tooltip to stay open
    clicked = false;
  }
}


function updateProjection() {

  resetZoom();

  if (currentProjection === "NE") {

    // and redraw it using the clipping mask
    d3.selectAll("path.land")
      .attr("fill", "transparent")
      .attr("stroke", "transparent")
      .transition().duration(700)
      .attr("fill", "#d9cdc2")
      .attr("stroke", "#808080")
      .attr("d", path2)
      .attr("clip-path", "none");

    // for more detailed areas on zoom
    d3.selectAll("path.land2")
      .attr("d", path2)
      .attr("clip-path", "none")
      .attr("display", "none")

    // draw points
    d3.selectAll("circle.point")
      .transition().duration(700)
      .attr("cx", d => projection2([+d.Longitude, +d.Latitude])[0])
      .attr("cy", d => projection2([+d.Longitude, +d.Latitude])[1])


  } else {

    // and redraw it using the clipping mask
    d3.selectAll("path.land")
      .attr("fill", "transparent")
      .attr("stroke", "transparent")
      .transition().duration(700)
      .attr("d", path)
      .attr("fill", "#d9cdc2")
      .attr("stroke", "#808080")
      .attr("clip-path", "url(#clip)")

    // for more detailed areas on zoom
    d3.selectAll("path.land2")
      .attr("d", path)
      .attr("clip-path", "url(#clip)")
      .attr("display", "none")


    // draw points
    d3.selectAll("circle.point")
      .transition().duration(700)
      .attr("cx", d => projection([+d.Longitude, +d.Latitude])[0])
      .attr("cy", d => projection([+d.Longitude, +d.Latitude])[1])

  }
}
