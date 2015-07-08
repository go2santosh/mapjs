//////////////////////////////////////////////////////////////////////////////////////////////////////////
// map.js
//
// A JavaScript library to help draw map on HTML5 SVG. Map data is defined in JSON file. 
// Implements functionality to set current and destination locations as well as show shortest path.
//
// Further details available at https://github.com/go2santosh/mapjs
//
// Author: Santosh Sharma
// Version: 1.3
// Creation Date: June 15, 2015
// Revision Date: July 07, 2015
//
// New in verion 1.3
// - replaced HTML5 canvas by HTML5 SVG to improve graphics quality and enable greater flexibility
// - ability to rotate vertical and horizontal
// - reliability improvements
//
// New in version 1.2:
// - Usage flexibility improvements
//
// New in version 1.1:
// - Shortest path efficiency and reliability improvements
// - Dynamic adjustment of region labels to avoid overlapping
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////
var mapJsApi = (function () {

    //default values
    var _BACKGROUND_COLOR = "lightgreen";
    var _SCREEN_SIZE = { x: 0, y: 0, "width": window.innerWidth, "height": window.innerHeight };
    var _POSITION_FLAG_COLOR = "blue";

    //map data
    var _mapData;
    var _originalMapDataJSONString;
    var _MAP_LOCATION = { x: 0, y: 0 };
    var _MAP_SCALE = 1;
    var _MAP_ROTATE = false;
    var _NAVIGATION_POINTS = [];
    var _ORIGINAL_NAVIGATION_POINTS_JSON_STRING;
    var _NAVIGATION_PATH = [];
    var _ORIGINAL_NAVIGATION_PATH_JSON_STRING;

    //graphics helper
    var graphicsHelper = (function () {
        //private members
        var _ways = []; //array of way objects
        var _navigationPaths = [];
        
        //find shortest route from current location to destination location
        function getShortestPath(ways, startLocation, destinationLocation) {
            var path = [];
            _ways = ways;
            if (ways) {
                if (startLocation && destinationLocation) {
                    //find start and end point
                    var startPoint = findNearestWayPoint(startLocation);
                    var endPoint = findNearestWayPoint(destinationLocation);
                    //find all possible navigation paths
                    var routePoints = [];
                    path.push(startLocation);
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
            }
            return path;
        }

        //find nearest access way point
        function findNearestWayPoint(point) {
            var nearestWayPoint = point;
            var minimumDistance = Number.POSITIVE_INFINITY;

            for (var i = 0; i < _ways.length; i++) {
                for (var j = 0; j < _ways[i].points.length; j++) {
                    var wayPoint = _ways[i].points[j];
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

        //find intersacting way
        function findIntersactingWays(point) {
            var intersactingWays = [];
            for (var i = 0; i < _ways.length; i++) {
                if (whetherWayIntersactsAtPoint(_ways[i].points, point)) {
                    intersactingWays.push(_ways[i]);
                }
            }
            return intersactingWays;
        }

        //recursive algorithm to navigation paths
        function findNavigationPaths(currentWayIndex, entryPoint, destinationPoint, wayPoints) {
            //copy the route points array by value to work with recursive calls
            var routePoints = wayPoints.slice();
            //push the entry point into route array
            routePoints.push(entryPoint);
            //start with each way one-by-one
            for (var i = 0; i < _ways.length; i++) {
                //we are interested in the path that intersact at the entry point, but dont want to revisit the same path we just coming from
                if (currentWayIndex != i && whetherWayIntersactsAtPoint(_ways[i].points, entryPoint)) {
                    currentWayIndex = i;
                    //divide the way points array in two parts from the entry point
                    var formerWayPoints = getFormerWayPointsArray(entryPoint, _ways[i].points);
                    var laterWayPoints = getLaterWayPointsArray(entryPoint, _ways[i].points);
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

        //public members
        return {
            //find shortest path
            getShortestPath: function (ways, startLocation, destinationLocation) {
                return getShortestPath(ways, startLocation, destinationLocation);
            },
            //get center point
            getCenterPoint: function (points) {
                var centerPoint;
                if (points && points.length > 0) {
                    centerPoint = { x: 0, y: 0 };
                    var length = points.length;
                    for (var i = 0; i < length; i++) {
                        centerPoint.x += points[i].x / length;
                        centerPoint.y += points[i].y / length;
                    }
                }
                return centerPoint;
            },            
            //rorate points
            rotateClockwise: function (points, maxY) {
                for (var i = 0; i < points.length; i++) {
                    var temp = points[i].y;
                    points[i].y = points[i].x;
                    points[i].x = maxY - temp;
                }
            },            
            //rorate points
            rotateAntiClockwise: function (points, maxX) {
                for (var i = 0; i < points.length; i++) {
                    var temp = points[i].x;
                    points[i].x = points[i].y;
                    points[i].y = maxX - temp;
                }
            }
        };
    })();

    //svg helper
    var svgHelper = (function () {
        //default values
        var _FONT_SIZE = 10;
        var _FONT_NAME = "Verdana";
        var _POLYGON_FILL_COLOR = "pink";
        var _POLYGON_STROKE_COLOR = "brown";
        var _POLYLINE_STROKE_COLOR = "snow";
        var _POLYLINE_STROKE_WIDTH = 4;

        //parent div
        var _parentDiv;

        //svg elements
        var _svg;
        var _svgNS;

        //check whether rects are overlapping
        function isOverlappingRects(rect1, rect2) {
            if ((rect1.left >= rect2.left
                    && rect1.left <= rect2.right
                    && rect1.top >= rect2.top
                    && rect1.top <= rect2.bottom)
                || (rect1.right >= rect2.left
                    && rect1.right <= rect2.right
                    && rect1.bottom >= rect2.top
                    && rect1.bottom <= rect2.bottom)) {
                return true;
            }
            else {
                return false;
            }
        }

        return {
            //PROPERTY DECLARATIONS
            setPolygonFillColor: function (color) { _POLYGON_FILL_COLOR = color; },
            getPolygonFillColor: function () { return _POLYGON_FILL_COLOR; },
            setPolygonStrokeColor: function (color) { _POLYGON_STROKE_COLOR = color; },
            getPolygonStrokeColor: function () { return _POLYGON_STROKE_COLOR; },

            //METHODS DECLARATIONS
            //set parent div
            setParentDiv: function(div){
                _parentDiv = div;
                if (_svg) {
                    var parentOfSVG = _svg.parentNode;
                    parentOfSVG.removeChild(_svg);
                    _parentDiv.appendChild(_svg);
                }
            },
            //initialize
            initialize: function (left, top, width, height) {
                if (_svg) {
                    for (var i = 0; i < _svg.childNodes.length; i++) {
                        _svg.removeChild(_svg.childNodes[i]);
                    }
                    var parentOfSVG = _svg.parentNode;
                    parentOfSVG.removeChild(_svg);
                }
                //create a container div
                var conrainerDiv = document.createElement("div");
                conrainerDiv.setAttribute("style", "position:absolute; top:" + (top > 0 ? top : 0) + "px; left:" + (left > 0 ? left : 0) + "px;");
                if (_parentDiv) {
                    _parentDiv.appendChild(conrainerDiv);
                }
                else {
                    document.body.appendChild(conrainerDiv);
                }
                //create svg
                _svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                _svgNS = _svg.namespaceURI;
                conrainerDiv.appendChild(_svg);
                _svg.setAttribute("width", width);
                _svg.setAttribute("height", height);
                //create filter defs for shadow effect
                var defs = document.createElementNS(_svgNS, 'defs');
                _svg.appendChild(defs);
                var filter = document.createElementNS(_svgNS, 'filter');
                defs.appendChild(filter);
                filter.setAttribute('id', 'f1');
                filter.setAttribute('x', 0);
                filter.setAttribute('y', 0);
                filter.setAttribute('width', '200%');
                filter.setAttribute('height', '200%');
                var feOffset = document.createElementNS(_svgNS, 'feOffset');
                filter.appendChild(feOffset);
                feOffset.setAttribute('result', 'offOut');
                feOffset.setAttribute('in', 'SourceGraphic');
                feOffset.setAttribute('dx', '7');
                feOffset.setAttribute('dy', '7');
                var feColorMatrix = document.createElementNS(_svgNS, 'feColorMatrix');
                filter.appendChild(feColorMatrix);
                feColorMatrix.setAttribute('result', 'matrixOut');
                feColorMatrix.setAttribute('in', 'offOut');
                feColorMatrix.setAttribute('type', 'matrix');
                feColorMatrix.setAttribute('values', '0.2 0 0 0 0 0 0.2 0 0 0 0 0 0.2 0 0 0 0 0 1 0');
                var feGaussianBlur = document.createElementNS(_svgNS, 'feGaussianBlur');
                filter.appendChild(feGaussianBlur);
                feGaussianBlur.setAttribute('result', 'blurOut');
                feGaussianBlur.setAttribute('in', 'matrixOut');
                feGaussianBlur.setAttribute('stdDeviation', '5');
                var feBlend = document.createElementNS(_svgNS, 'feBlend');
                filter.appendChild(feBlend);
                feBlend.setAttribute('in', 'SourceGraphic');
                feBlend.setAttribute('in2', 'blurOut');
                feBlend.setAttribute('mode', 'normal');
            },
            //remove element
            removeElement: function (element) {
                if (element) {
                    var parentElement = element.parentNode;
                    if (parentElement == _svg) {
                        _svg.removeChild(element);
                    }
                }
            },
            //draw text
            drawText: function (value, x, y, fontSize, fontName) {
                //draw text
                var text = document.createElementNS(_svgNS, 'text');
                _svg.appendChild(text);
                var textNode = document.createTextNode(value);
                text.appendChild(textNode);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('alignment-baseline', 'middle');
                text.setAttribute('x', x);
                text.setAttribute('y', y);
                if (fontSize) {
                    text.setAttribute('font-size', fontSize);
                }
                else {
                    text.setAttribute('font-size', _FONT_SIZE);
                }
                if (fontName) {
                    text.setAttribute('font-family', fontName);
                }
                else {
                    text.setAttribute('font-family', _FONT_NAME);
                }
                return text;
            },
            //find all overlapping text nodes 
            findOverlappingTexts: function (text) {
                var texts = [];
                for (var i = 0; i < _svg.childNodes.length; i++) {
                    if (_svg.childNodes[i].nodeName == "text" && _svg.childNodes[i] != text) {
                        if (isOverlappingRects(text.getClientRects()[0], _svg.childNodes[i].getClientRects()[0])) {
                            texts.push(_svg.childNodes[i]);
                        }
                    }
                }
                return texts;
            },
            //draw rectangle
            drawRect: function (x, y, width, height, color, rx, ry) {
                //draw rectangle
                var rect = document.createElementNS(_svgNS, 'rect');
                _svg.appendChild(rect);
                rect.setAttribute('x', x);
                rect.setAttribute('y', y);
                if (rx && ry) {
                    rect.setAttribute('rx', rx);
                    rect.setAttribute('ry', ry);
                }
                rect.setAttribute('width', width);
                rect.setAttribute('height', height);
                rect.setAttribute('fill', color);
                rect.setAttribute('filter', 'url(#f1)');
                return rect;
            },
            //draw polygon
            drawPolygon: function (points, fillColor, borderColor) {
                //draw polygon
                var polygon = document.createElementNS(_svgNS, 'polygon');
                _svg.appendChild(polygon);

                var pointsValue = points[0].x + "," + points[0].y;
                for (var i = 1; i < points.length; i++) {
                    pointsValue += " " + points[i].x + "," + points[i].y;
                }
                polygon.setAttribute("points", pointsValue);
                polygon.style['stroke-width'] = "0.5";
                if (borderColor) {
                    polygon.style['stroke'] = borderColor;
                }
                else {
                    polygon.style['stroke'] = _POLYGON_STROKE_COLOR;
                }
                if (fillColor) {
                    polygon.style['fill'] = fillColor;
                }
                else {
                    polygon.style['fill'] = _POLYGON_FILL_COLOR;
                }

                return polygon;
            },
            //draw polyline
            drawPolyline: function (points, strokeColor, strokeWidth) {
                //draw polyline
                var polyline = document.createElementNS(_svgNS, 'polyline');
                _svg.appendChild(polyline);

                var pointsValue = points[0].x + "," + points[0].y;
                for (var i = 1; i < points.length; i++) {
                    pointsValue += " " + points[i].x + "," + points[i].y;
                }
                polyline.setAttribute("points", pointsValue);
                polyline.style['fill'] = "none";
                if (strokeColor) {
                    polyline.style['stroke'] = strokeColor;
                }
                else {
                    polyline.style['stroke'] = _POLYLINE_STROKE_COLOR;
                }
                if (strokeWidth) {
                    polyline.style['stroke-width'] = strokeWidth;
                }
                else {
                    polyline.style['stroke-width'] = _POLYLINE_STROKE_WIDTH;
                }
                return polyline;
            }
        };
    })();

    //function rotate map
    function rotateMap() {
        if (_mapData) {
            var maxY = _mapData.scale.height * _MAP_SCALE;
            //rotate scale
            var temp = _mapData.scale.width;
            _mapData.scale.width = _mapData.scale.height;
            _mapData.scale.height = temp;
            //rotate regions
            for (var i = 0; i < _mapData.regions.length; i++) {
                graphicsHelper.rotateClockwise(_mapData.regions[i].points, maxY);
            }
            //rotate ways
            for (var i = 0; i < _mapData.ways.length; i++) {
                graphicsHelper.rotateClockwise(_mapData.ways[i].points, maxY);
            }
            //rotate navigation points
            graphicsHelper.rotateClockwise(_NAVIGATION_POINTS, maxY);
            //rotate navigation path
            graphicsHelper.rotateClockwise(_NAVIGATION_PATH, maxY);
        }
    }

    //scale map
    function scaleMap(scale) {
        _MAP_SCALE = scale;

        //scale map data
        if (_originalMapDataJSONString) {
            _mapData = JSON.parse(_originalMapDataJSONString);
            if (_mapData) {
                //scale ways
                for (var i = 0; i < _mapData.ways.length; i++) {
                    scalePoints(_mapData.ways[i].points, scale);
                }
                //scale regions
                for (var i = 0; i < _mapData.regions.length; i++) {
                    scalePoints(_mapData.regions[i].points, scale);
                }
            }
        }

        //scale navigation points
        if (_ORIGINAL_NAVIGATION_POINTS_JSON_STRING) {
            _NAVIGATION_POINTS = JSON.parse(_ORIGINAL_NAVIGATION_POINTS_JSON_STRING);
            if (_NAVIGATION_POINTS) {
                scalePoints(_NAVIGATION_POINTS, scale);
            }
        }

        //scale navigation path
        if (_ORIGINAL_NAVIGATION_PATH_JSON_STRING) {
            _NAVIGATION_PATH = JSON.parse(_ORIGINAL_NAVIGATION_PATH_JSON_STRING);
            if (_NAVIGATION_PATH) {
                scalePoints(_NAVIGATION_PATH, scale);
            }
        }
    }

    //scale points
    function scalePoints(points, scale) {
        if (points) {
            for (var i = 0; i < points.length; i++) {
                points[i].x *= scale;
                points[i].y *= scale;
            }
        }
    }

    //set map location
    function setMapLocation(newLocation) {
        _MAP_LOCATION = newLocation;

        //move map data coordinates
        if (_mapData) {
            //move ways
            for (var i = 0; i < _mapData.ways.length; i++) {
                moveCoordinates(_mapData.ways[i].points, _MAP_LOCATION);
            }
            //move regions
            for (var i = 0; i < _mapData.regions.length; i++) {
                moveCoordinates(_mapData.regions[i].points, _MAP_LOCATION);
            }
        }

        //move navigation points coordinates
        if (_NAVIGATION_POINTS) {
            moveCoordinates(_NAVIGATION_POINTS, _MAP_LOCATION);
        }

        //move navigation path coordinates
        if (_NAVIGATION_PATH) {
            moveCoordinates(_NAVIGATION_PATH, _MAP_LOCATION);
        }
    }

    //move coordinates
    function moveCoordinates(points, newLocation) {
        if (points) {
            //move regions
            for (var i = 0; i < points.length; i++) {
                points[i].x += newLocation.x;
                points[i].y += newLocation.y;
            }
        }
    }

    //draw region
    function drawRegion(region) {
        //draw region boundary and fill
        svgHelper.drawPolygon(region.points, region.color);
    }

    //draw way
    function drawWay(way) {
        //draw polyline
        svgHelper.drawPolyline(way.points);
    }

    //draw navigation path
    function drawNavigationPath(path) {
        //draw polyline
        svgHelper.drawPolyline(path, "orange", 3);
    }

    //draw label
    function drawLabel(text, x, y) {
        //draw text label
        svgHelper.drawText(text, x, y);
    }

    //draw flag
    function drawFlag(point, fillColor, borderColor) {
        //create an array for flag shaped points
        var points = [];
        points.push({ x: point.x, y: point.y }); //p1
        points.push({ x: point.x + 3, y: point.y - 30 }); //p2
        points.push({ x: point.x + 5, y: point.y - 25 }); //p3
        points.push({ x: point.x + 20, y: point.y - 25 }); //p4
        points.push({ x: point.x + 10, y: point.y - 20 }); //p5
        points.push({ x: point.x + 20, y: point.y - 15 }); //p6
        points.push({ x: point.x + 5, y: point.y - 15 }); //p7
        //draw polygon
        svgHelper.drawPolygon(points, fillColor ? fillColor : _POSITION_FLAG_COLOR, borderColor ? borderColor : "snow");
    }

    //process shortest navigation path
    function processShortestNavigationPath() {
        if (_mapData && _NAVIGATION_POINTS && _NAVIGATION_POINTS.length > 1) {
            var path = graphicsHelper.getShortestPath(_mapData.ways, _NAVIGATION_POINTS[0], _NAVIGATION_POINTS[1]);
            _NAVIGATION_PATH = _NAVIGATION_PATH.concat(path);
            for (var i = 2; i < _NAVIGATION_POINTS.length; i++) {
                path = graphicsHelper.getShortestPath(_mapData.ways, _NAVIGATION_POINTS[i - 1], _NAVIGATION_POINTS[i]);
                _NAVIGATION_PATH = _NAVIGATION_PATH.concat(path);
            }
            _ORIGINAL_NAVIGATION_PATH_JSON_STRING = JSON.stringify(_NAVIGATION_PATH);
        }
    }

    //draw map
    function draw() {
        
        //draw map
        if (_mapData) {
            
            //scale map data
            scaleMap(_MAP_SCALE);

            //rotate map
            if (_MAP_ROTATE) {
                rotateMap();
            }
            //initialize svg
            var width = window.innerWidth;
            var height = window.innerHeight;
            if (_mapData.scale) {
                width = _mapData.scale.width * _MAP_SCALE;
                height = _mapData.scale.height * _MAP_SCALE;
            }
            svgHelper.initialize((window.innerWidth - width) / 2,
                (window.innerHeight - height) / 2,
                width,
                height);

            //move map data coordinates to center of window
            //setMapLocation({ x: (window.innerWidth - (_mapData.scale.width * _MAP_SCALE)) / 2, y: 0 });

            //set default values
            if (_mapData.backgroundColor) {
                _BACKGROUND_COLOR = _mapData.backgroundColor;
            }
            if (_mapData.regionColor) {
                svgHelper.setPolygonFillColor(_mapData.regionColor);
            }

            //draw regions
            for (var i = 0; i < _mapData.regions.length; i++) {
                drawRegion(_mapData.regions[i]);
            }

            //draw ways
            for (var i = 0; i < _mapData.ways.length; i++) {
                drawWay(_mapData.ways[i]);
            }

            //draw labels
            for (var i = 0; i < _mapData.regions.length; i++) {
                var labelLocation = graphicsHelper.getCenterPoint(_mapData.regions[i].points);
                var svgText = svgHelper.drawText(_mapData.regions[i].name, labelLocation.x, labelLocation.y);
                var overlappingTexts = svgHelper.findOverlappingTexts(svgText);
                if (overlappingTexts.length > 0) {
                    //if conflict is with just one node then try move the text to below the node 
                    if (overlappingTexts.length == 1) {
                        var rects = overlappingTexts[0].getClientRects();
                        svgText.setAttribute("y", parseInt(svgText.getAttribute("y")) + rects[0].height + 1);
                        //check still overlapping
                        if (svgHelper.findOverlappingTexts(svgText).length > 0) {
                            svgHelper.removeElement(svgText);
                        }
                    }
                    else {
                        svgHelper.removeElement(svgText);
                    }
                }
            }

            //draw navigation path
            if (_NAVIGATION_PATH && _NAVIGATION_PATH.length > 0) {
                drawNavigationPath(_NAVIGATION_PATH);
            }

            //draw navigation points
            if (_NAVIGATION_POINTS && _NAVIGATION_POINTS.length > 0) {
                drawFlag(_NAVIGATION_POINTS[0], "lime");
                if (_NAVIGATION_POINTS.length > 1) {
                    for (var i = 1; i < _NAVIGATION_POINTS.length - 1; i++) {
                        drawFlag(_NAVIGATION_POINTS[i], "blue");
                    }
                    drawFlag(_NAVIGATION_POINTS[_NAVIGATION_POINTS.length - 1], "red");
                }
            }
        }
    }

    return {
        //set parent div
        setParentDiv: function(div){
            svgHelper.setParentDiv(div);
        },
        //set background color
        setBackgroundColor: function (color) {
            _BACKGROUND_COLOR = color;
        },
        //set navigation points
        setNavigationPoints: function (points) {
            _ORIGINAL_NAVIGATION_POINTS_JSON_STRING = JSON.stringify(points);
            _NAVIGATION_POINTS = points;
            //process shortest navigation path
            processShortestNavigationPath();
        },
        //set map data
        setMapData: function (data) {
            //cache map data
            _originalMapDataJSONString = JSON.stringify(data);
            _mapData = data;
        },
        //rotate
        rotate: function () {
            _MAP_ROTATE = !_MAP_ROTATE;
            draw();
        },
        //draw
        draw: function (scale) {
            _MAP_SCALE = scale;
            //draw map
            draw();
        }
    };
})();
