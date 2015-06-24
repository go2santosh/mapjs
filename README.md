# mapjs
A JavaScript library to help draw map on HTML5 canvas. Map data can be defined in JSON file. Implements functionality to set current and destination locations as well as show shortest path.

### Getting Started
Download the map.js file and include in your HTML.
For example, 
```
<script src="js/map.js"></script>
```

This library is implemented using JavaScript module pattern. Variable name that holds the modle is - "mapJsApi".

This library is build upon HTML5 canvas. Therefore first start with defining a canvas in your HTML as illustrated below:
```
<canvas id="mapJsCanvas" width="400" height="300">This browser doesnot support this feature.</canvas>
```

Entire map is rendered on this canvas so width and hight of map can be changed at runtime using following JavaScript statement:
```
mapJsApi.resize(sizeX, sizeY);
```

After setting the size, a map can be drawn using following two options:
* Define map data in JSON format
* Draw map regions, ways, and nodes using API functions

#### Define map data in JSON format
Defining map data in JSON format provides easiest way to create complex map.

Following is a sample JSON map file:
```
{
    "backgroundColor": "white",
    "scale": { "width": 260, "height": 800 },
    "ways": [
        {
            "name": "River Walk",
            "points": [
                { "x": 40, "y": 186 },
                { "x": 100, "y": 186 },
                { "x": 214, "y": 186 }
            ]
        },
        {
            "name": "Woods Walk",
            "points": [ { "x": 40, "y": 12 }, { "x": 100, "y": 12 }, { "x": 100, "y": 78 } ]
        },
        {
            "name": "Playground Way",
            "points": [ { "x": 214, "y": 12 }, { "x": 154, "y": 12 }, { "x": 154, "y": 78 } ]
        }
    ],
        {
            "name": "Glen",
            "points": [ { "x": 128, "y": 74 }, { "x": 150, "y": 74 }, { "x": 150, "y": 40 }, { "x": 128, "y": 40 } ],
            "color": "dimgray"
        },
        {
            "name": "Evan",
            "points": [ { "x": 128, "y": 40 }, { "x": 150, "y": 40 }, { "x": 150, "y": 2 }, { "x": 128, "y": 2 } ],
            "color": "darkgray"
        },
        {
            "name": "Joe",
            "points": [ { "x": 106, "y": 40 }, { "x": 128, "y": 40 }, { "x": 128, "y": 2 }, { "x": 106, "y": 2 } ],
            "color": "dimgray"
        },
        {
            "name": "Mike",
            "points": [ { "x": 106, "y": 74 }, { "x": 128, "y": 74 }, { "x": 128, "y": 40 }, { "x": 106, "y": 40 } ],
            "color": "darkgray"
        },
        {
            "name": "Linda",
            "points": [ { "x": 106, "y": 82 }, { "x": 150, "y": 82 }, { "x": 150, "y": 130 }, { "x": 106, "y": 130 } ],
            "color": "dimgray"
        }
    ],
    "nodes": [
        {
            "point": { "x": 114, "y": 66 },
            "name": "Mike",
            "wayPoints": [ { "x": 100, "y": 78 } ]
        },
        {
            "point": { "x": 114, "y": 34 },
            "name": "Joe",
            "wayPoints": [ { "x": 100, "y": 12 } ]
        },
        {
            "point": { "x": 136, "y": 20 },
            "name": "Evan",
            "wayPoints": [ { "x": 154, "y": 12 } ]
        },
        {
            "point": { "x": 136, "y": 52 },
            "name": "Glen",
            "wayPoints": [ { "x": 154, "y": 78 } ]
        },
        {
            "point": { "x": 114, "y": 100 },
            "name": "Linda",
            "wayPoints": [ { "x": 130, "y": 78 } ]
        }
    ]
}
```

#### Draw map regions, ways, and nodes using API functions
A set of API functions are exposed to allow programatically draw the map.

######backgroundColor()
Use this function to change background color for map by specifying any valid HTML color name or HEX or RGB value. Example:
```
mapJsApi.backgroundColor("red"); //by color name
mapJsApi.backgroundColor("#FF0000"); //by HEX value
mapJsApi.backgroundColor("rgb(255,0,0)"); //by RGB value
```

######A Point on the map
This library uses "Point", a pair of x and y values, as basic unit of drawing. Following example shows declaring a point:
```
var point1 = new mapJsApi.Point(10, 10);
```

A map is made of a set of regions, ways, and nodes.

######Drawing a Region
Region is defined by 3 attributes: 
* name
* points: array of Point objects
* color

Example:
```
var points = [new mapJsApi.Point(128, 74), 
            new mapJsApi.Point(150, 74), 
            new mapJsApi.Point(150, 40), 
            new mapJsApi.Point(128, 50)
            ];
var region1 = new mapJsApi.Region("Evans", points, "darkgray");
mapJsApi.drawRegion(region1);
```

