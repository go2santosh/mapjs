//////////////////////////////////////////////////////////////////////////////////////////////////////////
// map.js
//
// A JavaScript library to help draw map on HTML5 canvas. Map data is defined in JSON file. 
// Implements functionality to set current and destination locations as well as show shortest path.
//
// Further details available at https://github.com/go2santosh/mapjs
//
// Author: Santosh Sharma
// Version: 1.1
// Creation Date: June 15, 2015
// Revision Date: June 28, 2015
//
// New in version 1.1:
// - Shortest path efficiency and reliability improvements
// - Dynamic adjustment of region labels to avoid overlapping
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////

var mapJsApi = (function () {
    //private members
    var labelFontName = "Arial";

    var scale = { x: 400, y: 300 };
    var mapData;
    var currentLocation = null;
    var destinationLocation = null;
    var navigationPaths = [];
    var accomodatedLabels = [];
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

    //background color
    function setBackgroundColor(color) {
        mapJsContext.fillStyle = color;
        mapJsContext.fillRect(0, 0, mapJsCanvas.width, mapJsCanvas.height);
    }

    //set scale
    function setScale(width, height) {
        scale.x = width;
        scale.y = height;
    }

    //convert map's x to scaled x
    function getScaledX(x) {
        return x * (mapJsCanvas.width / scale.x);
    }

    //convert map's y to scaled y
    function getScaledY(y) {
        return y * (mapJsCanvas.height / scale.y);
    }

    //drawRect method
    function drawArc(points) {
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
    }

    //drawRegion
    function drawRegion(region) {
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
    }

    //draw text
    function drawText(point, text) {
        mapJsContext.fillStyle = "black";
        mapJsContext.font = "10px Arial";
        mapJsContext.fillText(text, getScaledX(point.x), getScaledY(point.y));
    }

    //draw label
    function accomodateLabel(point, size, color, text) {
        //find label's width
        var labelWidth = mapJsContext.measureText(text).width;

        //create label object with center aligned point
        var label = {
            point: { "x": getScaledX(point.x) - labelWidth / 2, "y": getScaledY(point.y) + size / 2 },
            size: size,
            color: color,
            text: text,
            isAdjusted: false
        };

        //if label width is crossing canvas's left edge then move the label to right
        if (label.point.x < 0) {
            label.point.x = 0;
        }

        //if label width is crossing canvas's right edge then move the label to left
        if ((label.point.x + labelWidth) > mapJsCanvas.width) {
            label.point.x = label.point.x - (label.point.x + labelWidth - mapJsCanvas.width);
        }

        mapJsContext.font = size + "px " + labelFontName;
        if (accomodatedLabels.length > 0) {
            //get overlapping labels
            var overlappingLabels = getOverlappingLabels(label);
            if (overlappingLabels.length > 0) {
                //try moving down label 
                label.point.y = label.point.y + label.size;
                var overlappingLabelsAfterMoveDown = getOverlappingLabels(label);
                if (overlappingLabelsAfterMoveDown.length > 0) {
                    //try moving up the label
                    label.point.y = label.point.y - (2 * label.size);
                    var overlappingLabelsAfterMoveUp = getOverlappingLabels(label);
                    if (overlappingLabelsAfterMoveUp.length > 0) {
                        //reduce size to 20% if still overlapping
                        label.size = label.size * 0.8;
                    }
                }
            }
        }
        accomodatedLabels.push(label);
        mapJsContext.fillStyle = color;
        mapJsContext.font = label.size + "px " + labelFontName;
        mapJsContext.fillText(text, label.point.x, label.point.y);
    }

    //get overlapping labels
    function getOverlappingLabels(label) {
        var overlappingLabels = [];

        //find width of the label
        mapJsContext.font = label.size + "px " + labelFontName;
        var labelWidth = mapJsContext.measureText(label.text).width;

        //find four corner points for the label
        var pointLB = { "x": label.point.x, "y": label.point.y };
        var pointLU = { "x": pointLB.x, "y": pointLB.y - label.size };
        var pointRU = { "x": pointLU.x + labelWidth, "y": pointLU.y };
        var pointRL = { "x": pointRU.x, "y": pointRU.y + label.size };

        //search for overlaping labels in accomodatedLabels
        for (var i = 0; i < accomodatedLabels.length; i++) {
            var accomodatedLabel = accomodatedLabels[i];
            //find width of accomodated label
            mapJsContext.font = accomodatedLabel.size + "px " + labelFontName;
            var accomodatedLabelWidth = mapJsContext.measureText(accomodatedLabel.text).width;
            //find four corner points for the accomodated label
            var accomodatedLabelPointLB = { "x": accomodatedLabel.point.x, "y": accomodatedLabel.point.y };;
            var accomodatedLabelPointLU = { "x": accomodatedLabelPointLB.x, "y": accomodatedLabelPointLB.y - accomodatedLabel.size };
            var accomodatedLabelPointRU = { "x": accomodatedLabelPointLU.x + accomodatedLabelWidth, "y": accomodatedLabelPointLU.y };
            var accomodatedLabelPointRL = { "x": accomodatedLabelPointRU.x, "y": accomodatedLabelPointRU.y + accomodatedLabel.size };
            //find out whether any of the lable's corner points falles under the area covered by accomodated label's coner points
            if ((pointLB.x > accomodatedLabelPointLU.x && pointLB.x < accomodatedLabelPointRL.x
                 && pointLB.y >= accomodatedLabelPointLU.y && pointLB.y <= accomodatedLabelPointRL.y)
                ||
                (pointLU.x >= accomodatedLabelPointLU.x && pointLU.x <= accomodatedLabelPointRL.x
                 && pointLU.y >= accomodatedLabelPointLU.y && pointLU.y <= accomodatedLabelPointRL.y)
                ||
                (pointRU.x >= accomodatedLabelPointLU.x && pointRU.x <= accomodatedLabelPointRL.x
                 && pointRU.y >= accomodatedLabelPointLU.y && pointRU.y <= accomodatedLabelPointRL.y)
                ||
                (pointRL.x > accomodatedLabelPointLU.x && pointRL.x < accomodatedLabelPointRL.x
                 && pointRL.y > accomodatedLabelPointLU.y && pointRL.y < accomodatedLabelPointRL.y)) {
                overlappingLabels.push(accomodatedLabel);
            }
        }
        return overlappingLabels;
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
        var path = [];
        if (currentLocation && destinationLocation) {
            //find start and end point
            var startPoint = findNearestWayPoint(currentLocation);
            var endPoint = findNearestWayPoint(destinationLocation);
            //find all possible navigation paths
            var routePoints = [];
            path.push(currentLocation);
            navigationPaths = [];
            if (calculateDistance(startPoint, endPoint) != 0) {
                findNavigationPaths(-1, startPoint, endPoint, routePoints);
            }
            if (navigationPaths.length > 0) {
                //find shortest navigation path
                var shortestPath = { points: [], distance: Number.POSITIVE_INFINITY };
                for (var i = 0; i < navigationPaths.length; i++) {
                    if (navigationPaths[i].distance < shortestPath.distance) {
                        shortestPath = navigationPaths[i];
                    }
                }
                for (var j = 0; j < shortestPath.points.length; j++) {
                    path.push(shortestPath.points[j]);
                }
            }
            else {
                path.push(startPoint);
                path.push(endPoint);
            }
            path.push(destinationLocation);
        }
        return path;
    }

    //find intersacting way
    function findIntersactingWays(point) {
        var intersactingWays = [];
        for (var i = 0; i < mapData.ways.length; i++) {
            if (whetherWayIntersactsAtPoint(mapData.ways[i].points, point)) {
                intersactingWays.push(mapData.ways[i]);
            }
        }
        return intersactingWays;
    }

    //find nearest access way point
    function findNearestWayPoint(point) {
        var nearestWayPoint = point;
        var minimumDistance = Number.POSITIVE_INFINITY;

        for (var i = 0; i < mapData.ways.length; i++) {
            for (var j = 0; j < mapData.ways[i].points.length; j++) {
                var wayPoint = mapData.ways[i].points[j];
                if (point.x == wayPoint.x && point.y == wayPoint.y) {
                    //the point is right on the way, so just return this point
                    return wayPoint;
                }
                else {
                    //find the distance between the point and this wayPoint
                    var distance = Math.sqrt((point.x - wayPoint.x) * (point.x - wayPoint.x)
                        + (point.y - wayPoint.y) * (point.y - wayPoint.y));
                    if (distance < minimumDistance) {
                        minimumDistance = distance;
                        nearestWayPoint = wayPoint;
                    }
                }
            }
        }
        return nearestWayPoint;
    }

    //recursive algorithm to navigation paths
    function findNavigationPaths(currentWayIndex, entryPoint, destinationPoint, wayPoints) {
        //copy the route points array by value to work with recursive calls
        var routePoints = wayPoints.slice();
        //push the entry point into route array
        routePoints.push(entryPoint);
        //start with each way one-by-one
        for (var i = 0; i < mapData.ways.length; i++) {
            //we are interested in the path that intersact at the entry point, but dont want to revisit the same path we just coming from
            if (currentWayIndex != i && whetherWayIntersactsAtPoint(mapData.ways[i].points, entryPoint)) {
                currentWayIndex = i;
                //divide the way points array in two parts from the entry point
                var formerWayPoints = getFormerWayPointsArray(entryPoint, mapData.ways[i].points);
                var laterWayPoints = getLaterWayPointsArray(entryPoint, mapData.ways[i].points);
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
        //do not proceed if this route distance is larger than any already found path
        var routeLength = calculateRouteLength(routePoints);
        if (isDistanceLargerThanAnyKnownWay(routeLength)) {
            return;
        }
        var traverseWayPoints = newPoints.slice();
        if (traverseWayPoints.length > 0) {
            //traverse the array points one by one
            for (var j = 0; j < traverseWayPoints.length; j++) {
                if (traverseWayPoints[j].x == destinationPoint.x && traverseWayPoints[j].y == destinationPoint.y) {
                    //push the point into route array
                    routePoints.push(traverseWayPoints[j]);
                    routeLength = calculateRouteLength(routePoints);
                    //if the point being traversed is the destination point then stop with success
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
        
    //check whether given distance is larger than any known path
    function isDistanceLargerThanAnyKnownWay(routeLength) {
        for (var i = 0; i < navigationPaths.length; i++) {
            if (navigationPaths[i].distance < routeLength) {
                return true;
            }
        }
        return false;
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
            routeLength = routeLength + calculateDistance(routePoints[i], routePoints[i - 1]);
        }
        return routeLength;
    }

    //calculate distance
    function calculateDistance(point1, point2) {
        return Math.sqrt((point1.x - point2.x) * (point1.x - point2.x)
                + (point1.y - point2.y) * (point1.y - point2.y));
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
        //resize method
        resize: function (width, height) {
            mapJsCanvas.width = width;
            mapJsCanvas.height = height;
            mapJsCanvas.style.left = (mapJsCanvas.parentElement.clientWidth - mapJsCanvas.width) / 2 + "px";
            if (mapData) {
                this.drawMap(mapData);
                this.drawRouteToDestinationLocation();
            }
        },
        //redraw method
        redraw: function () {
            this.resize(mapJsCanvas.width, mapJsCanvas.height);
        },
        //draw map
        drawMap: function (data) {
            mapData = data;
            if (mapData) { //proceed only if map data contains something
                if (mapData.scale) {//set map scale if available
                    setScale(mapData.scale.width, mapData.scale.height);
                }

                //set background color
                setBackgroundColor(mapData.backgroundColor);

                //draw regions
                if (mapData.regions) {//draw regions if available
                    for (var i = 0; i < mapData.regions.length; i++) {
                        drawRegion(mapData.regions[i]);
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

                //draw region labels
                accomodatedLabels = [];
                if (mapData.regions) {
                    for (var i = 0; i < mapData.regions.length; i++) {
                        //find center point
                        var point = getCenterPoint(mapData.regions[i].points);
                        accomodateLabel(point, 10, "black", mapData.regions[i].name);
                    }
                }

                /*
                //draw nodes
                if (mapData.nodes) {
                    for (var i = 0; i < mapData.nodes.length; i++) {
                        drawText(mapData.nodes[i].point, mapData.nodes[i].name);
                    }
                }
                */
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
            drawArc(routePoints);
            showLocation(currentLocation, "green");
            showLocation(destinationLocation, "red");
        }
    };
})();
