//////////////////////////////////////////////////////////////////////////////////////////////////////////
// Author: Santosh Sharma
// Version: 1.0
// Creation Date: June 15, 2015
// Revision Date: June 24, 2015
// Description: A JavaScript library to help draw map on HTML5 canvas.
// Map data can be defined in JSON file. 
// Implements functionality to set current and destination locations as well as show shortest path.
///////////////////////////////////////////////////////////////////////////////////////////////////////////

var mapJsApi = (function () {
    //private members
    var scale = { x:400, y: 300 };

    var cachedMapData;
    var currentLocation = null;
    var destinationLocation = null;
    var navigationPaths = [];

    var mapJsCanvas = document.getElementById("mapJsCanvas");

    //initialize canvas
    if (mapJsCanvas.getContext) {
        var mapJsContext = mapJsCanvas.getContext("2d");
        mapJsCanvas.width = scale.x;
        mapJsCanvas.height = scale.y;
        mapJsCanvas.style.position = "absolute";
        mapJsCanvas.style.left = (mapJsCanvas.parentElement.clientWidth - mapJsCanvas.width) / 2 + "px";
    }
    else {
        //Canvas not supported
        alert("This browser doesnot support this feature.");
    }

    //convert map's x to scaled x
    function getScaledX(x) {
        return x * (mapJsCanvas.width / scale.x);
    }

    //convert map's y to scaled y
    function getScaledY(y) {
        return y * (mapJsCanvas.height / scale.y);
    }

    //show location indicator on map
    function showLocation(location, color) {
        if (location) {
            var radius = 5;
            var height = 15;
            mapJsContext.beginPath();
            mapJsContext.moveTo(getScaledX(location.x), getScaledY(location.y));
            mapJsContext.lineTo(getScaledX(location.x) + radius, getScaledY(location.y) - height);
            mapJsContext.arc(getScaledX(location.x), getScaledY(location.y) - height, radius, 0, 60, true);
            mapJsContext.closePath();
            if (color) {
                mapJsContext.strokeStyle = color;
            }            
            mapJsContext.lineWidth = "3";
            mapJsContext.stroke();
        }
    }

    //find shortest route from current location to destination location
    function getShortestPath() {
        var shortestPath = { points: [], distance: Number.POSITIVE_INFINITY };
        if (currentLocation && destinationLocation) {
            var routePoints = [];
            var processingWays = [];
            //find all possible navigation paths
            navigationPaths = [];
            findNavigationPaths(-1, currentLocation, destinationLocation, routePoints, processingWays);
            //find shortest navigation path
            for (var i = 0; i < navigationPaths.length; i++) {
                if (navigationPaths[i].distance < shortestPath.distance) {
                    shortestPath = navigationPaths[i];
                }
            }
        }
        return shortestPath.points;
    }

    //recursive algorithm to navigation paths
    function findNavigationPaths(currentWayIndex, entryPoint, destinationPoint, wayPoints) {
        //copy the route points array by value to work with recursive calls
        var routePoints = wayPoints.slice();
        //push the entry point into route array
        routePoints.push(entryPoint);
        //find all the ways that intersact at the entry point
        for (var i = 0; i < cachedMapData.ways.length; i++) {
            //we are interested in the path that intersact at the entry point, but dont want to revisit the same path we just coming from
            if (currentWayIndex != i && whetherWayIntersactsAtPoint(cachedMapData.ways[i].points, entryPoint)) {
                currentWayIndex = i;
                //divide the way points array in two parts from the entry point
                var formerWayPoints = getFormerWayPointsArray(entryPoint, cachedMapData.ways[i].points);
                var laterWayPoints = getLaterWayPointsArray(entryPoint, cachedMapData.ways[i].points);
                //we need to reverse the first part array so that to navigate correctly
                var reversedFormerWayPoints = formerWayPoints.reverse();
                //recursively traverse the former array points
                traversePoints(currentWayIndex, entryPoint, destinationPoint, routePoints, laterWayPoints);
                //recursively traverse the later array points
                traversePoints(currentWayIndex, entryPoint, destinationPoint, routePoints, reversedFormerWayPoints);
            }
        }
    }

    //function to traverse way points, used in recursive algorithm to find navigation paths
    function traversePoints(currentWayIndex, entryPoint, destinationPoint, wayPoints, newPoints) {
        //copy the route points array by value to work with recursive calls
        var routePoints = wayPoints.slice();
        var traverseWayPoints = newPoints.slice();
        if (traverseWayPoints.length > 0) {
            //traverse the array points one by one
            for (var j = 0; j < traverseWayPoints.length; j++) {
                if (traverseWayPoints[j].x == destinationPoint.x && traverseWayPoints[j].y == destinationPoint.y) {
                    //push the point into route array
                    routePoints.push(traverseWayPoints[j]);
                    //if the point being traversed is the destination point then stop with success
                    var routeLength = calculateRouteLength(routePoints);
                    navigationPaths.push({ "points": routePoints, "distance": routeLength });
                    return;
                }
                else {
                    if (whetherWayIntersactsAtPoint(routePoints, traverseWayPoints[j]) == false) {
                        //push the point into route array
                        routePoints.push(traverseWayPoints[j]);
                        //go to step 1 taking the point being traversed as starting point
                        findNavigationPaths(currentWayIndex, traverseWayPoints[j], destinationPoint, routePoints)
                    }
                }
            }
        }
    }

    //check whether way intersacts at the entry point
    function whetherWayIntersactsAtPoint(wayPoints, point) {
        for (var i = 0; i < wayPoints.length; i++) {
            if (wayPoints[i].x == point.x && wayPoints[i].y == point.y) {
                return true;
            }
        }
        return false;
    }
    
    //return the former part of the divided way points array from the entry point
    function getFormerWayPointsArray(entryPoint, wayPoints) {
        var formerWayPoints = [];
        for (var i = 0; i < wayPoints.length; i++) {
            if (wayPoints[i].x == entryPoint.x && wayPoints[i].y == entryPoint.y) {
                return formerWayPoints;
            }
            else {
                formerWayPoints.push(wayPoints[i]);
            }
        }
        return formerWayPoints;
    }

    //return the later part of the divided way points array from the entry point
    function getLaterWayPointsArray(entryPoint, wayPoints) {
        var laterWayPoints = [];
        for (var i = 0; i < wayPoints.length; i++) {
            if (wayPoints[i].x == entryPoint.x && wayPoints[i].y == entryPoint.y) {
                for (var j = i + 1; j < wayPoints.length; j++) {
                    laterWayPoints.push(wayPoints[j]);
                }
            }
        }
        return laterWayPoints;
    }

    //calculate route length
    function calculateRouteLength(routePoints) {
        var routeLength = 0;
        for (var i = 1; i < routePoints.length; i++) {
            routeLength = routeLength + Math.sqrt((routePoints[i].x - routePoints[i - 1].x) * (routePoints[i].x - routePoints[i - 1].x)
                + (routePoints[i].y - routePoints[i - 1].y) * (routePoints[i].y - routePoints[i - 1].y));
        }
        return routeLength;
    }

    //calculate center point
    function getCenterPoint(points) {
        var point = { x: 0, y: 0 };
        for (var i = 0; i < points.length; i++) {
            point.x = point.x + points[i].x;
            point.y = point.y + points[i].y;
        }
        point.x = point.x / points.length;
        point.y = point.y / points.length;
        return point;
    }

    //public members
    return {
        //point property
        Point: function (x, y) {
            return { x: x, y: y };
        },
        //region property
        Region: function (name, points, color) {
            return {
                name: name,
                points: points,
                color: color
            };
        },
        //set scale
        setScale: function (width, height) {
            scale.x = width;
            scale.y = height;
        },
        //resize method
        resize: function (width, height) {
            mapJsCanvas.width = width;
            mapJsCanvas.height = height;
            mapJsCanvas.style.left = (mapJsCanvas.parentElement.clientWidth - mapJsCanvas.width) / 2 + "px";
            if (cachedMapData) {
                this.drawMap(cachedMapData);
                this.drawRouteToDestinationLocation();
            }
        },
        //redraw method
        redraw: function () {
            this.resize(mapJsCanvas.width, mapJsCanvas.height);
        },
        //background color
        backgroundColor: function (color) {
            mapJsContext.fillStyle = color;
            mapJsContext.fillRect(0, 0, mapJsCanvas.width, mapJsCanvas.height);
        },
        //drawRect method
        drawArc: function (points) {
            if (points) {
                if (points.length > 0) {
                    mapJsContext.beginPath();
                    mapJsContext.moveTo(getScaledX(points[0].x), getScaledY(points[0].y));
                    for (var i = 1; i < points.length; i++) {
                        mapJsContext.lineTo(getScaledX(points[i].x), getScaledY(points[i].y));
                    }
                    mapJsContext.lineWidth = "3";
                    mapJsContext.strokeStyle = "orange";
                    mapJsContext.stroke();
                }
            }
        },
        //drawRegion
        drawRegion: function (region) {
            var points = region.points;
            if (points.length > 0) {
                mapJsContext.beginPath();
                mapJsContext.lineJoin = "round";
                mapJsContext.moveTo(getScaledX(points[0].x), getScaledY(points[0].y));
                for (var i = 1; i < points.length; i++) {
                    mapJsContext.lineTo(getScaledX(points[i].x), getScaledY(points[i].y));
                }
                mapJsContext.closePath();
                mapJsContext.strokeStyle = "snow";
                mapJsContext.lineWidth = "0.5";
                mapJsContext.stroke();
                mapJsContext.fillStyle = region.color;
                mapJsContext.shadowColor = "snow";
                mapJsContext.shadowBlur = "2";
                mapJsContext.shadowOffsetX = "1";
                mapJsContext.shadowOffsetY = "1";
                mapJsContext.fill();
            }
        },
        //draw text
        drawText: function (point, text) {
            mapJsContext.fillStyle = "black";
            mapJsContext.font = "10px Arial";
            mapJsContext.fillText(text, getScaledX(point.x), getScaledY(point.y));
        },
        //draw map
        drawMap: function (mapData) {
            cachedMapData = mapData;
            if (mapData) { //proceed only if map data contains something
                if (mapData.scale) {//set map scale if available
                    this.setScale(mapData.scale.width, mapData.scale.height);
                }

                //set background color
                this.backgroundColor(mapData.backgroundColor);

                //draw regions
                if (mapData.regions) {//draw regions if available
                    for (var i = 0; i < mapData.regions.length; i++) {
                        this.drawRegion(mapData.regions[i]);
                    }
                }

                //draw ways
                if (mapData.ways) {
                    mapJsContext.strokeStyle = "ivory";
                    mapJsContext.lineCap = "round";
                    mapJsContext.lineWidth = "4";
                    for (var i = 0; i < mapData.ways.length; i++) {
                        if (mapData.ways[i].points.length > 1) {
                            mapJsContext.beginPath();
                            mapJsContext.moveTo(getScaledX(mapData.ways[i].points[0].x), getScaledY(mapData.ways[i].points[0].y));
                            for (var j = 1; j < mapData.ways[i].points.length; j++) {
                                mapJsContext.lineTo(getScaledX(mapData.ways[i].points[j].x), getScaledY(mapData.ways[i].points[j].y));
                            }
                            mapJsContext.stroke();
                        }
                    }
                }

                //draw notes
                if (mapData.nodes) {
                    for (var i = 0; i < mapData.nodes.length; i++) {
                        this.drawText(mapData.nodes[i].point, mapData.nodes[i].name);
                    }
                }
            }
        },
        //set current location
        setCurrentLocation: function (point) {
            if (!currentLocation) {
                currentLocation = { "x": 0, "y": 0 };
            }
            currentLocation = point;
            showLocation(currentLocation, "green");
        },
        //set destination location
        setDestinationLocation: function (point) {
            if (!destinationLocation) {
                destinationLocation = { "x": 0, "y": 0 };
            }
            destinationLocation = point;
            showLocation(destinationLocation, "red");
        },
        //get route to destination position
        drawRouteToDestinationLocation: function () {
            var routePoints = getShortestPath();
            this.drawArc(routePoints);
            showLocation(currentLocation, "green");
            showLocation(destinationLocation, "red");
        }
    };
})();
