// Global variables
var width,
	height,
	map,
	projection,
	path;

function init() {
	setMap();
	loadData();
}

function setMap() {
	// Set width and height of map
	width = document.getElementById("mapid").clientWidth;
	height = window.innerHeight;

	// Create SVG object that contains map
    map = d3.select("#mapid").append( "svg" )
			.attr( "width", width)
			.attr( "height", height)
			.append("g");
}

function loadData() {
	d3.queue()
	.defer(d3.json, "data/gallery_roads_topo.json")
	.defer(d3.csv, "data/gallery_ownership_data.csv")
	.await(processData);
}

function processData(error, roadsFile, infoFile) {
	if (error) throw error;
	else {
		// roadsFile: topojson with roads data
		// infoFile: csv with information on each gallery
		drawMap(roadsFile, infoFile);
	}
}

function drawMap(roadsFile, infoFile) {
	// Turn lat/lon coordinates into screen coordinates
	// Question: mercator projection seems more accurate, but what are benefits of albers projection?
	projection = d3.geoMercator().fitSize([width, height], topojson.mesh(roadsFile, roadsFile.objects.roads));
	path = d3.geoPath().projection(projection);

	// Draw roads on map
    var roads = map.append("g");
	roads.append("path")
		.datum(topojson.mesh(roadsFile, roadsFile.objects.roads))
		.attr("class", "road")
		.attr("d", path)
		.attr("fill", "transparent")
		.attr("stroke", "black")
		.attr("stroke-width", 0.50);

	addGalleries(infoFile);
}

function addGalleries (infoFile) {
	// Add pins for galleries
	var points = map.append("g");
	points.selectAll("circle")
		.data(infoFile)
		.enter()
		.append("circle")
		.attr("cx", function(d) {return projection([Number(d.Longitude), Number(d.Latitude)])[0];})
		.attr("cy", function(d) {return projection([Number(d.Longitude), Number(d.Latitude)])[1];})
		.attr("opacity", 10)
		.attr("stroke", "#999")
		.attr("stroke-width", 2)
		.attr("r", 6)
		.attr("fill", "yellow");

	var selectedPoints = map.append("g");
	selectedPoints.selectAll("circle")
		.data(infoFile)
		.enter()
		.append("circle")
		.attr("cx", function(d) {return projection([Number(d.Longitude), Number(d.Latitude)])[0];})
		.attr("cy", function(d) {return projection([Number(d.Longitude), Number(d.Latitude)])[1];})
		.attr("opacity", 0.0)
		.attr("r", 7)
		.attr("fill", "#999")
		.on("mouseover", function () {
			if (d3.select(this).attr('opacity') == 0) {
				d3.select(this).attr('opacity', 0.8);
			}
		})
		.on("mouseout", function () {
			if (d3.select(this).attr('opacity') == 0.8) {
				d3.select(this).attr('opacity', 0);
			}
		})
		.on("click", function(d) {
			selectedPoints.selectAll("circle").attr('opacity', 0);
			d3.select(this).attr('opacity', 0.85);
			d3.select("#info1")
				.text(d.Gallery_Name);
			d3.select("#info2")
				.text(d.Gallery_Address);
			d3.select("#info3")
				.text(d.Gallerist);
			d3.select("#info4")
				.text(d.Owner_Name);
			d3.select("#streetView")
				.attr("src", d.Street_View);
			console.log(d.Street_View);
		});
}

window.onload = init();