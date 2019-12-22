let map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1],
    [1, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// This class handles all of the 
// operations needed for 2D vectors
class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    // add another vector to this one
    add(vec2) {
        return new Vec2(this.x + vec2.x, this.y + vec2.y);
    }

    // subtract a vector from this one
    subtract(vec2) {
        return new Vec2(this.x - vec2.x, this.y - vec2.y);
    }

    // multiply a scalar to this vector
    multiply(num) {
        let returnVal = new Vec2(this.x * num, this.y * num);
        if (returnVal.x == 0 || returnVal.x == -0) {
            returnVal.x = 0;
        }
        if (returnVal.y == 0 || returnVal.y == -0) {
            returnVal.y = 0;
        }
        return returnVal;
    }

    // divide this vector by the given scalar
    divide(num) {
        let returnVal = new Vec2(this.x / num, this.y / num);
        if (returnVal.x == 0 || returnVal.x == -0) {
            returnVal.x = 0;
        }
        if (returnVal.y == 0 || returnVal.y == -0) {
            returnVal.y = 0;
        }
        return returnVal;
    }

    // get a normalized version of this vector
    normalize() {
        let len = this.length();
        return new Vec2(this.x / len, this.y / len);
    }

    // test whether this is equal to another vector
    equals(vec2) {
        return (vec2.x == this.x && vec2.y == this.y);
    }

    // get the length of this vector
    length() {
        let lenSqrd = (this.x * this.x) + (this.y * this.y);
        return Math.sqrt(lenSqrd);
    }

    // get the squared length of this vector
    lengthSquared() {
        return (this.x * this.x) + (this.y * this.y);
    }
}

// this class will store info for
// each pixel column on the viewport
class WallSlice {
    constructor() {
        this.wallHeights = [];
        this.wallColors = [];
        this.rayDistances = [];
        this.relativeHitLocations = [];
    }
}

// WallBlock stores info on each map square
class WallBlock {
    constructor(topL, topR, bottomR, bottomL) {
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
        this.LeftVector = new Vector2(0, -1);
    }
}

// Helper methods for raycasting
// improved upon versions seen in
// my MonoGame raycasting engine
class RaycastingMethods {
    // returns a HitInfo object
    static FindDistance(w, raycast) {
        // make sure to solve coefficients in this order
        let vectorsHit = [w.TopVector, w.RightVector, w.BottomVector, w.LeftVector];

        // solve coefficients for all wall faces
        let coefficientSets = [];
        coefficientSets.push(this.FindIntersection(w.TopLeft, w.TopVector, raycast));
        coefficientSets.push(this.FindIntersection(w.TopRight, w.RightVector, raycast));
        coefficientSets.push(this.FindIntersection(w.BottomRight, w.BottomVector, raycast));
        coefficientSets.push(this.FindIntersection(w.BottomLeft, w.LeftVector, raycast));


        let indexOfClosestVectorHit = -1;
        let distance = Number.MAX_VALUE;
        for (let i = 0; i < coefficientSets.length; i++) {
            // if coefficients are > 0 and < 1, the vectors intersect
            if (coefficientSets[i].X >= 0 && coefficientSets[i].X <= 1 &&
                coefficientSets[i].Y >= 0 && coesfficientSets[i].Y <= 1) {
                // if they intersect and the location of intersection is 
                // closer than distance, then store the index of the hit
                let rayModified = raycast.multiply(coefficientSets[i].x);
                if (rayModified.Length() < distance) {
                    distance = rayModified.length();
                    indexOfClosestVectorHit = i;
                }
            }
        }

        // if there was actually a hit...
        if (indexOfClosestVectorHit != -1){
            // then return a HitInfo object containing correct normal, hit location, and distance
            let normal = new Vector2(vectorsHit[indexOfClosestVectorHit].y, -vectorsHit[indexOfClosestVectorHit].x);
            // for future reference, relativeHitLocation is a number 0-1 that
            // represents where the raycast hit on the wall vector, which will
            // be used when it is time to get a slice of a texture to render
            let relativeHitLocation = coefficientSets[indexOfClosestVectorHit].y;
            let hitInfo = new HitInfo(normal, relativeHitLocation, distance);
            return hitInfo;
        }
        return null;
    }

    // This method is the formula for parametric intersections
    // of vectors solved for just the coefficients of the vectors
    //
    // returns a set of 'coefficients.' X is the relative hit location,
    // Y is the coefficient for the raycast vector
    static FindIntersection(wallVecStart, wallVecDir, raycast) {
        let pToC_X, pToC_Y; // number values for vector from the player to the wall's corner
        let solvedCoefficients = new Vector2();
        pToC_X = wallVecStart.x - player.position.x;
        pToC_Y = wallVecStart.y - player.position.y;
        solvedCoefficients.x = -wallVecDir.y * pToC_X + wallVecDir.x * pToC_Y;
        solvedCoefficients.Y = -raycast.y * pToC_X + raycast.x * pToC_Y;
        solvedCoefficients.divide((-raycast.x * wallVecDir.y) + (raycast.y * wallVecDir.x));
        return solvedCoefficients;
    }
}

class HitInfo {
    constructor(normal, relativeHitLocation, distance) {
        this.normal = normal;
        this.relativeHitLocation = relativeHitLocation;
        this.distance = distance;
    }
}

class Player {
    constructor() {
        this.coords = new Vector2(); 3
        this.position = new Vector2();
        this.fov = 0;
        this.angle = 0;
    }
}