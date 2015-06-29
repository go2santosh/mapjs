# mapjs
A JavaScript library to help draw map on HTML5 canvas. Map data is defined in JSON file. Implements functionality to set current and destination locations as well as show shortest path.

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

Width and hight of map can be changed at runtime using following JavaScript statement:
```
mapJsApi.resize(sizeX, sizeY);
```

Map data is defined in JSON format. This allows easiest way to create, store, and retrieve complex map. This map library is best suitable for indoor maps. Consider creating saperate JSON map data for different parts of a building. For example, if a building has two or more floors then create saperate JSOD map data for each floor. Further, it would be good idea if a very large floor can be seperated into different regions each defined using seperate JSON map data.  

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
    ]
}
```

Loading JSON map data is easy as shown in following example:
```
var data = retrieveMapJSONData(); //just an illustration of defining a variable to store map JSON data
mapJsApi.drawMap(data); //this statement will instantly render the map on HTML canvas element
```

Showing current location on map is illustrated in following example:
```
mapJsApi.setCurrentLocation(new mapJsApi.Point(40, 12));
```

Similarly destination location can be shown on map as illustrated in following example:
```
mapJsApi.setDestinationLocation(new mapJsApi.Point(106, 130));
```

A shortest path can be drawn from current  location to destination location by writing following statement:
```
mapJsApi.drawRouteToDestinationLocation();
```
