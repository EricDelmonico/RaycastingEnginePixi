"use strict";
let type = "WebGL";
if (!PIXI.utils.isWebGLSupported()) {
    type = "canvas";
}
let app = new PIXI.Application();
document.body.appendChild(app.view);

let mapHeight,
    mapWidth,
    gridSize = 1,
    walls = [],
    player;

// load all images
PIXI.Loader.shared.
    on("progress", e => { console.log(`progress=${e.progress}`) }).
    load(init);

function init() {
    player = new Player();
    mapHeight = map.length;
    mapWidth = map[0].length;

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

}

function update(){

}