"use strict";
let type = "WebGL";
if(!PIXI.utils.isWebGLSupported()){
    type = "canvas";
}
let app = new PIXI.Application();
document.body.appendChild(app.view);

// load all images
PIXI.Loader.shared.
on("progress",e=>{console.log(`progress=${e.progress}`)}).
load(init);

function init(){
    
}

