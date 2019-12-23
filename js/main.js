"use strict";
let type = "WebGL";
if (!PIXI.utils.isWebGLSupported()) {
    type = "canvas";
}
let app = new PIXI.Application();
document.body.appendChild(app.view);

let mapHeight, // height of the map array
    mapWidth, // width of the map array
    gridSize = 1, // the in-world size of each grid square on the map. does not matter much
    walls = [], // stores all wallblocks on the map
    player, // the Player object, holds angle, position, fov, and anything else needed
    raycastSlices, // renders/contains all raycast slices
    raycastSlices_Info = [], // stores a HitInfo for every pixel column on screen
    FPSCounter, // shows FPS on screen
    fisheyeModifiers = [], // fisheye modifiers for each slice on the screen
    sinLookupTables = new Object(), // stores a bunch of sine values
    cosLookupTables = new Object(), // stores a bunch of cosine values
    accuracy = 10000; // the accuracy of the sin and cosine lookup tables, 0's=decimal places

// load all images
PIXI.Loader.shared.
    on("progress", e => { console.log(`progress=${e.progress}`) }).
    load(init);

function init() {
    // create generous lookup
    // tables for sin and cosine
    let circle = 31415 * 2;
    for (let i = -circle; i < circle; i += 1){
        sinLookupTables[i] = Math.sin(i / accuracy);
    }
    for (let i = -circle; i < circle; i += 1){
        cosLookupTables[i] = Math.cos(i / accuracy);
    }

    //create fps counter
    {
        let textStyle = new PIXI.TextStyle({
            fill: 0xFF00FF,
            fontSize: 20,
            fontFamily: "Futura",
            stroke: 0xFF00FF,
            strokeThickness: 0.5
        });
        FPSCounter = new PIXI.Text();
        FPSCounter.style = textStyle;
        FPSCounter.x = 5;
        FPSCounter.y = 5;
        app.stage.addChild(FPSCounter);
    }

    player = new Player();
    mapHeight = map.length;
    mapWidth = map[0].length;

    raycastSlices = new PIXI.Container();

    // populate the list of all the wallblocks
    for (let i = 0; i < mapHeight; i++)
    {
        walls.push([]);
        for (let j = 0; j < mapWidth; j++)
        {
            // if there's a number here, put a wallblock there
            if (map[i][j] > 0) {
                let block = new WallBlock(new Vector2(gridSize * j, gridSize * i),                        // top left
                                          new Vector2(gridSize * j + gridSize, gridSize * i),             // top right
                                          new Vector2(gridSize * j + gridSize, gridSize * i + gridSize),  // bottom right
                                          new Vector2(gridSize * j, gridSize * i + gridSize));            // bottom left
                walls[i].push(block);
            }
            else{
                walls[i].push(null);
            }
        }
    }

    app.stage.addChild(raycastSlices);
    app.ticker.add(update);
}

// runs every update
function update(){
    FPSCounter.text = Math.round(app.ticker.FPS);
    clearScreen();
    castRays();
    fillScreen();
}

// this function casts a ray for 
// every pixel on screen, building 
// the raycastHitSlices_Info array
function castRays(){
    for (let i = 0; i < app.view.width; i++){
        // the ray angle is the far left of the player's fov
        // plus the ratio of the pixel column and the screen
        // width multiplied by the player's fov
        let rayAngle = (player.angle - player.fov / 2) +
                       (i / app.view.width) * player.fov;

        // the unit vector representing the ray,
        // made using the angle calculated above
        let cos, sin;
        let key = Math.round(rayAngle * accuracy);
        cos = cosLookupTables[key];
        sin = sinLookupTables[key];

        let ray = new Vector2(cos, sin);

        // max travel distance for 
        // the ray in grid units
        let rayDist = 40;

        let hit = 0; // the number on the map at the ray's coordinates
        let hitX = 0, // the coordinates of
            hitY = 0; // where the ray ends
        let roughDistToHit = 0; // where the ray approximates a wall to be

        // while the map square the ray is hitting is
        // empty and the ray is still within range...
        while (hit == 0 && roughDistToHit < rayDist){
            let coordx = Math.trunc(player.position.x + roughDistToHit * ray.x);
            let coordy = Math.trunc(player.position.y + roughDistToHit * ray.y);
            hitX = coordx;
            hitY = coordy;
            hit = map[coordy][coordx];
            roughDistToHit += 0.02;
        }

        // if there was not hit, move on to the next column
        if(hit == 0){
            raycastSlices_Info.push(null);
            continue;
        }
        
        // now find the exact distance to the wall
        let raycast = new Vector2(ray.x * rayDist, ray.y * rayDist);
        let hitInf = RaycastingMethods.FindDistance(walls[hitY][hitX], raycast);
        
        // if hitInf ends up being null,
        // move to the next slice
        if (hitInf == null){
            raycastSlices_Info.push(null);
            continue;
        }

        raycastSlices_Info.push(hitInf);
    }
}

// fill the screen with raycasting slices
function fillScreen(){
    for (let i = 0; i < app.view.width; i++){
        // if there was a hit here, create a slice 
        // out of it and render it to the screen
        let hitHere = raycastSlices_Info[i];
        if (hitHere != null){
            // make the slice
            let slice = createSlice(hitHere, i);
            // render it to the screen
            raycastSlices.addChild(slice);
        }
    }
}

// clear all the slices from the screen
function clearScreen(){
    raycastSlices.removeChildren();
    raycastSlices_Info = [];
    fisheyeModifiers = [];
}

// this function will return a 'slice,'
// which is a straight line made from
// the PIXI.Graphics class
function createSlice(hitInfo, pixel){
    let slice = new PIXI.Graphics();
    let size = app.view.height / hitInfo.distance;
    slice.beginFill(0xFFFFFF);
    slice.lineStyle(1, 0xFFFFFF, 1);
    slice.drawRect(0, -size / 2, 1, size);
    slice.x = pixel;
    slice.y = app.view.height / 2;
    slice.endFill();
    return slice;
}