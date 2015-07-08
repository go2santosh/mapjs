# mapjs
A JavaScript library to help draw map on HTML5 canvas. Map data is defined in JSON file. Implements functionality to set current and destination locations as well as show shortest path.

### Getting Started
Download the map.js file and include in your HTML.
For example, 
```
<script src="js/map.js"></script>
```

This library is implemented using JavaScript module pattern. Variable name that holds the modle is - "mapJsApi".

This library is build upon HTML SVG. Therefore first start with defining a container div in your HTML as illustrated below:
```
<div id="mapContainer"></div>
```

Please note - use of container div is optional, but this option would be helpful in customization of positioning of map anywhere in HTML as per application's need. Following code snapshot illustrates use of container div for map:
```
var parentDiv = document.getElementById("mapContainer");
mapJsApi.setParentDiv(parentDiv);
```

Map data is defined in JSON format. This allows easiest way to create, store, and retrieve complex map. This map library is best suitable for indoor maps. Consider creating saperate JSON map data for different parts of a building. For example, if a building has two or more floors then create saperate JSOD map data for each floor. Further, it would be good idea if a very large floor can be seperated into different regions each defined using seperate JSON map data.  

Following is a sample JSON map data:
```
{
    "backgroundColor": "DarkSeaGreen",
    "regionColor": "PaleGoldenRod",
    "wayColor": "orange",
    "labelFontName": "Arial",
    "labelFontSize": 10,
    "scale": { "width": 260, "height": 800 },
    "ways": [
        {
            "name": "Outer Cicular Path",
            "points": [
                { "x": 40, "y": 12 },
                { "x": 100, "y": 12 },
                { "x": 100, "y": 78 },
                { "x": 130, "y": 78 },
                { "x": 160, "y": 78 },
                { "x": 160, "y": 12 },
                { "x": 220, "y": 12 },
                { "x": 220, "y": 78 },
                { "x": 220, "y": 90 },
                { "x": 220, "y": 130 },
                { "x": 220, "y": 170 },
                { "x": 220, "y": 186 },
                { "x": 220, "y": 250 },
                { "x": 220, "y": 290 },
                { "x": 220, "y": 366 },
                { "x": 220, "y": 390 },
                { "x": 220, "y": 410 },
                { "x": 220, "y": 434 },
                { "x": 220, "y": 550 },
                { "x": 220, "y": 600 },
                { "x": 160, "y": 600 },
                { "x": 160, "y": 666 },
                { "x": 206, "y": 666 },
                { "x": 206, "y": 700 },
                { "x": 206, "y": 754 },
                { "x": 170, "y": 754 },
                { "x": 130, "y": 754 },
                { "x": 90, "y": 754 },
                { "x": 40, "y": 754 },
                { "x": 40, "y": 710 },
                { "x": 40, "y": 610 },
                { "x": 40, "y": 590 },
                { "x": 40, "y": 434 },
                { "x": 40, "y": 410 },
                { "x": 40, "y": 390 },
                { "x": 40, "y": 366 },
                { "x": 40, "y": 250 },
                { "x": 40, "y": 186 },
                { "x": 40, "y": 130 },
                { "x": 40, "y": 90 },
                { "x": 40, "y": 78 }
            ]
        },
        {
            "name": "Outer Circle Close Link",
            "points": [
                { "x": 40, "y": 78 },
                { "x": 40, "y": 12 }
            ]
        },
        {
            "name": "Outer Circle Link 1",
            "points": [ { "x": 40, "y": 78 }, { "x": 100, "y": 78 } ]
        },
        {
            "name": "Outer Circle Link 2",
            "points": [ { "x": 160, "y": 78 }, { "x": 220, "y": 78 } ]
        },
        {
            "name": "Outer Circle Link 3",
            "points": [ { "x": 206, "y": 666 }, { "x": 206, "y": 644 }, { "x": 220, "y": 644 } ]
        },
        {
            "name": "Inner Circular Path",
            "points": [
                { "x": 100, "y": 186 },
                { "x": 160, "y": 186 },
                { "x": 160, "y": 254 },
                { "x": 160, "y": 400 },
                { "x": 160, "y": 434 },
                { "x": 160, "y": 578 },
                { "x": 100, "y": 578 },
                { "x": 100, "y": 434 },
                { "x": 100, "y": 400 },
                { "x": 100, "y": 366 }
            ]
        },
        {
            "name": "Inner Circular Close Path",
            "points": [
                { "x": 100, "y": 366 },
                { "x": 100, "y": 186 }
            ]
        },
        {
            "name": "Inner Circle Link 1",
            "points": [ { "x": 40, "y": 186 }, { "x": 100, "y": 186 } ]
        },
        {
            "name": "Inner Circle Link 2",
            "points": [ { "x": 160, "y": 186 }, { "x": 220, "y": 186 } ]
        },
        {
            "name": "Inner Circle Link 3",
            "points": [ { "x": 40, "y": 366 }, { "x": 90, "y": 366 }, { "x": 100, "y": 366 } ]
        },
        {
            "name": "Inner Circle Link 4",
            "points": [ { "x": 160, "y": 254 }, { "x": 166, "y": 254 }, { "x": 166, "y": 366 }, { "x": 220, "y": 366 } ]
        },
        {
            "name": "Inner Circle Link 5",
            "points": [ { "x": 100, "y": 400 }, { "x": 130, "y": 400 }, { "x": 160, "y": 400 } ]
        },
        {
            "name": "Inner Circle Link 6",
            "points": [ { "x": 40, "y": 434 }, { "x": 90, "y": 434 }, { "x": 100, "y": 434 } ]
        },
        {
            "name": "Inner Circle Link 7",
            "points": [ { "x": 160, "y": 434 }, { "x": 170, "y": 434 }, { "x": 220, "y": 434 } ]
        },
        {
            "name": "Inner Circle Link 8",
            "points": [ { "x": 160, "y": 578 }, { "x": 160, "y": 600 } ]
        },
        {
            "name": "Inner Circle Link 9",
            "points": [ { "x": 40, "y": 610 }, { "x": 100, "y": 610 }, { "x": 100, "y": 578 } ]
        },
        {
            "name": "Inner Circle Link 10",
            "points": [ { "x": 100, "y": 78 }, { "x": 100, "y": 186 } ]
        },
        {
            "name": "Inner Circle Link 11",
            "points": [ { "x": 160, "y": 78 }, { "x": 160, "y": 186 } ]
        }
    ],
    "regions": [
        {
            "name": "2N",
            "points": [ { "x": 0, "y": 0 }, { "x": 260, "y": 0 }, { "x": 260, "y": 400 }, { "x": 0, "y": 400 } ],
            "color": "DarkSeaGreen"
        },
        {
            "name": "2S",
            "points": [ { "x": 0, "y": 400 }, { "x": 260, "y": 400 }, { "x": 260, "y": 800 }, { "x": 0, "y": 800 } ],
            "color": "DarkSeaGreen"
        },
        {
            "name": "Elevators",
            "points": [ { "x": 106, "y": 370 }, { "x": 154, "y": 370 }, { "x": 154, "y": 386 }, { "x": 106, "y": 386 } ],
            "color": "Khaki"
        },
        {
            "name": "Joliet",
            "points": [ { "x": 2, "y": 570 }, { "x": 34, "y": 570 }, { "x": 34, "y": 590 }, { "x": 2, "y": 590 } ],
            "color": "PaleGoldenRod "
        },
        {
            "name": "Bolingbrook",
            "points": [ { "x": 2, "y": 590 }, { "x": 34, "y": 590 }, { "x": 34, "y": 610 }, { "x": 2, "y": 610 } ]
        },
        {
            "name": "Riverdale",
            "points": [ { "x": 50, "y": 674 }, { "x": 170, "y": 674 }, { "x": 170, "y": 730 }, { "x": 50, "y": 730 } ]
        },
        {
            "name": "Lyons",
            "points": [ { "x": 2, "y": 690 }, { "x": 34, "y": 690 }, { "x": 34, "y": 710 }, { "x": 2, "y": 710 } ]
        },
        {
            "name": "Palos Hill",
            "points": [ { "x": 2, "y": 710 }, { "x": 34, "y": 710 }, { "x": 34, "y": 730 }, { "x": 2, "y": 730 } ]
        },
        {
            "name": "Burbank",
            "points": [ { "x": 2, "y": 730 }, { "x": 34, "y": 730 }, { "x": 34, "y": 750 }, { "x": 2, "y": 750 } ]
        },
        {
            "name": "Mokena",
            "points": [
                { "x": 2, "y": 750 },
                { "x": 34, "y": 750 },
                { "x": 34, "y": 760 },
                { "x": 30, "y": 760 },
                { "x": 30, "y": 798 },
                { "x": 2, "y": 798 }
            ]
        },
        {
            "name": "Monee",
            "points": [ { "x": 30, "y": 760 }, { "x": 50, "y": 760 }, { "x": 50, "y": 798 }, { "x": 30, "y": 798 } ]
        },
        {
            "name": "Crest Hill",
            "points": [ { "x": 50, "y": 760 }, { "x": 70, "y": 760 }, { "x": 70, "y": 798 }, { "x": 50, "y": 798 } ]
        },
        {
            "name": "Alsip",
            "points": [ { "x": 70, "y": 760 }, { "x": 110, "y": 760 }, { "x": 110, "y": 798 }, { "x": 70, "y": 798 } ]
        },
        {
            "name": "Hickory Hills",
            "points": [ { "x": 110, "y": 760 }, { "x": 130, "y": 760 }, { "x": 130, "y": 798 }, { "x": 110, "y": 798 } ]
        },
        {
            "name": "Oak Lane",
            "points": [ { "x": 130, "y": 760 }, { "x": 150, "y": 760 }, { "x": 150, "y": 798 }, { "x": 130, "y": 798 } ]
        },
        {
            "name": "Lockport",
            "points": [ { "x": 150, "y": 760 }, { "x": 190, "y": 760 }, { "x": 190, "y": 798 }, { "x": 150, "y": 798 } ]
        },
        {
            "name": "Plano",
            "points": [ { "x": 214, "y": 760 }, { "x": 258, "y": 760 }, { "x": 258, "y": 798 }, { "x": 214, "y": 798 } ]
        },
        {
            "name": "Morris",
            "points": [ { "x": 214, "y": 730 }, { "x": 258, "y": 730 }, { "x": 258, "y": 760 }, { "x": 214, "y": 760 } ]
        },
        {
            "name": "Dolton",
            "points": [ { "x": 214, "y": 700 }, { "x": 258, "y": 700 }, { "x": 258, "y": 730 }, { "x": 214, "y": 730 } ]
        },
        {
            "name": "Thornton",
            "points": [ { "x": 214, "y": 670 }, { "x": 258, "y": 670 }, { "x": 258, "y": 700 }, { "x": 214, "y": 700 } ]
        },
        {
            "name": "Homewood",
            "points": [ { "x": 226, "y": 640 }, { "x": 258, "y": 640 }, { "x": 258, "y": 670 }, { "x": 226, "y": 670 } ]
        },
        {
            "name": "Lansing",
            "points": [ { "x": 214, "y": 606 }, { "x": 258, "y": 606 }, { "x": 258, "y": 640 }, { "x": 214, "y": 640 } ]
        },
        {
            "name": "Tinley Park",
            "points": [ { "x": 168, "y": 606 }, { "x": 214, "y": 606 }, { "x": 214, "y": 640 }, { "x": 168, "y": 640 } ]
        },
        {
            "name": "Du Sable",
            "points": [ { "x": 226, "y": 550 }, { "x": 258, "y": 550 }, { "x": 258, "y": 570 }, { "x": 226, "y": 570 } ]
        },
        {
            "name": "Monroe",
            "points": [ { "x": 226, "y": 530 }, { "x": 258, "y": 530 }, { "x": 258, "y": 550 }, { "x": 226, "y": 550 } ]
        },
        {
            "name": "Calumet",
            "points": [ { "x": 168, "y": 370 }, { "x": 188, "y": 370 }, { "x": 188, "y": 400 }, { "x": 168, "y": 400 } ]
        },
        {
            "name": "Foster",
            "points": [ { "x": 168, "y": 400 }, { "x": 188, "y": 400 }, { "x": 188, "y": 430 }, { "x": 168, "y": 430 } ]
        },
        {
            "name": "Oak St",
            "points": [ { "x": 226, "y": 410 }, { "x": 258, "y": 410 }, { "x": 258, "y": 430 }, { "x": 226, "y": 430 } ]
        },
        {
            "name": "Belmont",
            "points": [ { "x": 226, "y": 390 }, { "x": 258, "y": 390 }, { "x": 258, "y": 410 }, { "x": 226, "y": 410 } ]
        },
        {
            "name": "Diversey",
            "points": [ { "x": 226, "y": 370 }, { "x": 258, "y": 370 }, { "x": 258, "y": 390 }, { "x": 226, "y": 390 } ]
        },
        {
            "name": "Burnham",
            "points": [ { "x": 188, "y": 370 }, { "x": 214, "y": 370 }, { "x": 214, "y": 430 }, { "x": 188, "y": 430 } ]
        },
        {
            "name": "Rogers",
            "points": [ { "x": 226, "y": 270 }, { "x": 258, "y": 270 }, { "x": 258, "y": 290 }, { "x": 226, "y": 290 } ]
        },
        {
            "name": "Montrose",
            "points": [ { "x": 226, "y": 250 }, { "x": 258, "y": 250 }, { "x": 258, "y": 270 }, { "x": 226, "y": 270 } ]
        },
        {
            "name": "Lane",
            "points": [ { "x": 226, "y": 230 }, { "x": 258, "y": 230 }, { "x": 258, "y": 250 }, { "x": 226, "y": 250 } ]
        },
        {
            "name": "Wheeling",
            "points": [ { "x": 226, "y": 150 }, { "x": 258, "y": 150 }, { "x": 258, "y": 170 }, { "x": 226, "y": 170 } ]
        },
        {
            "name": "Waukegan",
            "points": [ { "x": 226, "y": 130 }, { "x": 258, "y": 130 }, { "x": 258, "y": 150 }, { "x": 226, "y": 150 } ]
        },
        {
            "name": "Niles",
            "points": [ { "x": 226, "y": 110 }, { "x": 258, "y": 110 }, { "x": 258, "y": 130 }, { "x": 226, "y": 130 } ]
        },
        {
            "name": "Northbrook",
            "points": [ { "x": 226, "y": 90 }, { "x": 258, "y": 90 }, { "x": 258, "y": 110 }, { "x": 226, "y": 110 } ]
        },
        {
            "name": "Gurnee",
            "points": [ { "x": 226, "y": 70 }, { "x": 258, "y": 70 }, { "x": 258, "y": 90 }, { "x": 226, "y": 90 } ]
        },
        {
            "name": "Glenview",
            "points": [ { "x": 130, "y": 74 }, { "x": 154, "y": 74 }, { "x": 154, "y": 40 }, { "x": 130, "y": 40 } ]
        },
        {
            "name": "Evanston",
            "points": [ { "x": 130, "y": 40 }, { "x": 154, "y": 40 }, { "x": 154, "y": 2 }, { "x": 130, "y": 2 } ]
        },
        {
            "name": "Inverness",
            "points": [ { "x": 106, "y": 40 }, { "x": 130, "y": 40 }, { "x": 130, "y": 2 }, { "x": 106, "y": 2 } ]
        },
        {
            "name": "Lake Bluff",
            "points": [ { "x": 106, "y": 74 }, { "x": 130, "y": 74 }, { "x": 130, "y": 40 }, { "x": 106, "y": 40 } ]
        },
        {
            "name": "Skokie",
            "points": [ { "x": 106, "y": 82 }, { "x": 154, "y": 82 }, { "x": 154, "y": 130 }, { "x": 106, "y": 130 } ]
        },
        {
            "name": "Elgin",
            "points": [ { "x": 2, "y": 50 }, { "x": 34, "y": 50 }, { "x": 34, "y": 90 }, { "x": 2, "y": 90 } ]
        },
        {
            "name": "Platine",
            "points": [ { "x": 2, "y": 90 }, { "x": 34, "y": 90 }, { "x": 34, "y": 110 }, { "x": 2, "y": 110 } ]
        },
        {
            "name": "Huntley",
            "points": [ { "x": 2, "y": 110 }, { "x": 34, "y": 110 }, { "x": 34, "y": 132 }, { "x": 2, "y": 132 } ]
        },
        {
            "name": "Addison",
            "points": [ { "x": 2, "y": 250 }, { "x": 34, "y": 250 }, { "x": 34, "y": 270 }, { "x": 2, "y": 270 } ]
        },
        {
            "name": "Lisle",
            "points": [ { "x": 72, "y": 372 }, { "x": 92, "y": 372 }, { "x": 92, "y": 400 }, { "x": 72, "y": 400 } ]
        },
        {
            "name": "Oswego",
            "points": [ { "x": 72, "y": 400 }, { "x": 92, "y": 400 }, { "x": 92, "y": 428 }, { "x": 72, "y": 428 } ]
        },
        {
            "name": "Batavia",
            "points": [ { "x": 2, "y": 370 }, { "x": 34, "y": 370 }, { "x": 34, "y": 390 }, { "x": 2, "y": 390 } ]
        },
        {
            "name": "Geneva",
            "points": [ { "x": 2, "y": 390 }, { "x": 34, "y": 390 }, { "x": 34, "y": 410 }, { "x": 2, "y": 410 } ]
        },
        {
            "name": "Aurora",
            "points": [ { "x": 2, "y": 410 }, { "x": 34, "y": 410 }, { "x": 34, "y": 430 }, { "x": 2, "y": 430 } ]
        },
        {
            "name": "Oak Brook",
            "points": [ { "x": 46, "y": 372 }, { "x": 72, "y": 372 }, { "x": 72, "y": 428 }, { "x": 46, "y": 428 } ]
        }
    ]
}
```

Following are some important points to be aware of while defining JSON map data:
* Always define ways as arcs - do not define circular ways. Shortest path algorithm currently implemented in this library does not handle circular path and may enter into infinite loop.
* Region names are automatically displayed on the map. However way names are ignored and not displayed on map in current implementation.

Loading JSON map data is easy as shown in following example:
```
var data = retrieveMapJSONData(); //just an illustration of defining a variable to store map JSON data
mapJsApi.setMapData(data); //this statement will instantly render the map on HTML canvas element
```

Showing current location on map is illustrated in following example:
```
mapJsApi.setCurrentLocation(new mapJsApi.Point(40, 12));
```

Similarly navigation points with shortest connecting path can be shown on map as illustrated in following example:
```
mapJsApi.setNavigationPoints([{ "x" : 40, "y": 78 }, { "x" : 220, "y": 560 } ]);
```

Following statement will draw the map:
```
var scale = 1;
mapJsApi.draw(scale);
```

Scale value of 1 draws map to its original size as defined in the JSON map data. Value of scale allows zoom-in and zoom-out feature. For example, following statement will zoom-in the map by 1.2 factor:
```
scale *= 1.2;
mapJsApi.draw(scale);
```

Map can be displayed in vertical or horizontal orientations. Following statement illustrates map rotation feature:
```
mapJsApi.rotate();
```

###Sample HTML Application using Map JS

Here is a sample HTML code to illustrate use of map JS. Follow below steps:
* Create a folder named "mapJsSample". Then create 2 sub folders - (1) "data (2) "js"
* Copy the JSON map data provided in "Getting Started" section and save it as "mapData.json" file under "data" subfolder.
* Download map.js file and save into "js" subfolder.
* Copy following HTML and save into map.html file under "mapJsSample" folder.
```
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta name="viewport" content="user-scalable=yes, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi" />
    <title>MapJS</title>
    <script src="js/jquery.min.js"></script>
</head>
<body style="margin:0;padding:0">
    <div style="position:fixed; top:10px; left:10px; z-index: 100;">
        <input type="button" onclick="zoomIn();" value="+" />
        <input type="button" onclick="zoomOut();" value="-" />
        <input type="button" onclick="rotate();" value="rotate" />
    </div>
    <div id="mapContainer"></div>
    <script src="js/svgMap.js"></script>
    <script>
        var scale = 1;
        var startRegion;
        var destinationRegion;

        if (getParameterByName("startRegion")) {
            startRegion = getParameterByName("startRegion");
        }
        if (getParameterByName("destinationRegion")) {
            destinationRegion = getParameterByName("destinationRegion");
        }

        showMap();

        //zoom in
        function zoomIn() {
            scale *= 1.2;
            mapJsApi.draw(scale);
        };

        //zoom out
        function zoomOut() {
            scale *= 0.8
            mapJsApi.draw(scale);
        };

        //rotate
        function rotate() {
            mapJsApi.rotate();
        }

        function showMap() {
            //send http request
            $.get("data/Oak_Brook_Jorie_Blvd_711_2ndFloor.json", function () {
                //alert("Success");
            }).done(function (data) {
                if (data && data.regions) {
                    if (data.scale) {
                        //set scale to full width
                        scale = screen.width / data.scale.width;
                    }
                    if (data.regions) {
                        var startPoint;
                        var destinationPoint;
                        for (var i = 0; i < data.regions.length; i++) {
                            if (data.regions[i].name == startRegion) {
                                startPoint = getCenterPoint(data.regions[i].points);
                                data.regions[i].color = "lightgreen";
                            }
                            if (data.regions[i].name == destinationRegion) {
                                destinationPoint = getCenterPoint(data.regions[i].points);
                                data.regions[i].color = "pink";
                            }
                        }
                        var parentDiv = document.getElementById("mapContainer");
                        mapJsApi.setParentDiv(parentDiv);
                        mapJsApi.setMapData(data);
                        mapJsApi.setNavigationPoints([startPoint, destinationPoint]);
                        mapJsApi.draw(scale);
                    }
                }
            }).fail(function (status) {
                alert("fail" + status);
            });
        }

        //retrieve query string parameter by name
        function getParameterByName(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }

        //get center point
        function getCenterPoint(points) {
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
        }
    </script>
</body>
</html>
```

Host the "mapJsSample" folder on any web server and browse "map.html" file from any web browser. It works on all standard browsers on Windows and Mac computers as well as all major mobile brosers including iOS and Android.
