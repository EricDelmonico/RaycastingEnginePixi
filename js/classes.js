map=

// This class handles all of the 
// operations needed for 2D vectors
class Vector2{
    constructor(x = 0, y = 0){
        this.x = x;
        this.y = y;
    }

    // add another vector to this one
    add(vec2){
        return new Vec2(this.x + vec2.x, this.y + vec2.y);
    }

    // subtract a vector from this one
    subtract(vec2){
        return new Vec2(this.x - vec2.x, this.y - vec2.y);
    }

    // multiply a scalar to this vector
    multiply(num){
        let returnVal = new Vec2(this.x * num, this.y * num);
        if (returnVal.x == 0 || returnVal.x == -0){
            returnVal.x = 0;
        }
        if (returnVal.y == 0 || returnVal.y == -0){
            returnVal.y = 0;
        }
        return returnVal;
    }

    // get a normalized version of this vector
    normalize(){
        let len = this.length();
        return new Vec2(this.x / len, this.y / len);
    }

    // test whether this is equal to another vector
    equals(vec2){
        return (vec2.x == this.x && vec2.y == this.y);
    }

    // get the length of this vector
    length(){
        let lenSqrd = (this.x * this.x) + (this.y * this.y);
        return Math.sqrt(lenSqrd);
    }

    // get the squared length of this vector
    lengthSquared(){
        return (this.x * this.x) + (this.y * this.y);
    }
}

// this class will store info for
// each pixel column on the viewport
class WallSlice{
    constructor(){
        this.wallHeights = [];
        this.wallColors = [];
        this.rayDistances = [];
        this.relativeHitLocations = [];
    }
}

// WallBlock stores info on each map square
class WallBlock{
    constructor(topL, topR, bottomR, bottomL){
        this.TopLeft = topL;
        this.TopRight = topR;
        this.BottomRight = bottomR;
        this.BottomLeft = bottomL;

        // points right
        this.TopVector = new Vector2(1, 0);
        // points down
        this.RightVector = new Vector2(0, 1);
        // points left
        this.BottomVector = new Vector2(-1, 0);
        // points up
        this.LeftVector   = new Vector2(0, -1);
    }
}

