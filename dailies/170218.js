/*
 Copyright 2017 Keith Peters

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
 persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var context = bitlib.context(0, 0),
    width = context.width,
    height = context.height;


var points = [];
var angle = 0;

var a = 1,
    b = 0.63,
    c = 1,
    d = 0.995;

panel
    .addRange("a", -1, 1, a, 0.01)
    .addRange("b", -1, 1, b, 0.01)
    .addRange("c", -1, 1, c, 0.01)
    .addRange("d", -1, 1, d, 0.01)
    .setGlobalChangeHandler(function() {
        a = panel.getValue("a");
        b = panel.getValue("b");
        c = panel.getValue("c");
        d = panel.getValue("d");
        points = [];
        context.clear("#000");
    })


context.clear("#111");
context.lineWidth = 0.25;

context.globalCompositeOperation = 'lighter';
var anim = bitlib.anim(update, 1000);
anim.start();


document.getElementById("canvas")

function getCol(r, g, b){
    var obj = {red: bitlib.math.clamp(r, 0, 255), green: bitlib.math.clamp(g, 0, 255), blue: bitlib.math.clamp(b, 0, 255)};
    obj.getHex = function(){
        return [this.red, this.green, this.blue]
            .map(function(v){
                var hexVal = Math.floor(v).toString(16);
                return "0".repeat(2-hexVal.length) + hexVal;
            })
            .reduce(function(acc, val){
                return acc + val;
            }, "#");
    }
    obj.map = function(f){
        return getCol(f(this.red), f(this.green), f(this.blue));
    }
    obj.add = function(colour2){
        return getCol(this.red + colour2.red, this.green + colour2.green, this.blue + colour2.blue);
    }
    obj.mix = function(colour2, fraction){
        var c1 = this.map(function(v){return v*(1-fraction)});
        var c2 = colour2.map(function(v){return v*fraction});
        return c1.add(c2);
    }
    return obj;
}

function getRange(cols){
    var obj = {colours: cols};
    obj.getValueAt = function(frac){
        var len = this.colours.length;
        var stepLength = 1/(len-1) + 0.000001;

        var c1 = this.colours[Math.floor(frac/stepLength)];
        var c2 = this.colours[Math.floor(frac/stepLength+1)];

        var mix = (frac % stepLength) / stepLength;
        
        return c1.mix(c2, mix);
    }
    return obj;
}

var blue = getCol(32, 107, 229);
var white = getCol(255, 255, 255);
var red = getCol(201, 24, 50);
var orange = getCol(224, 97, 33)

var colRange = getRange([blue, orange].reverse());

var minSpeed = 0;
var maxSpeed = 0;


var drawConstructionLines = false;

function update() {
    
    var p0 = {
        x: width / 2 + Math.sin(angle * a) * width * 0.4,
        y: height - 20
    };
    var p1 = {
        x: width / 2 + Math.cos(angle * b) * width * 0.4,
        y: 20
    };
    var p2 = {
        x: 20,
        y: height / 2 + Math.sin(angle * c) * height * 0.3
    };
    var p3 = {
        x:  width - 20,
        y: height / 2 + Math.cos(angle * d) * height * 0.4
    };
    angle += 0.05;

    var p4 = bitlib.math.segmentIntersect(p0, p1, p2, p3);
    if(p4) {
        points.push(p4);
    }

    if(points.length >= 2){
        var i = points.length -1;
        context.beginPath();
        context.moveTo(points[i-1].x, points[i-1].y);    
        var speed = bitlib.math.dist(points[i-1], points[i]);

        maxSpeed = Math.max(speed, maxSpeed);
        minSpeed = Math.min(speed+0.001, minSpeed);

        var relSpeed = (speed - minSpeed)/(maxSpeed - minSpeed);

        col = colRange.getValueAt(relSpeed);

        context.strokeStyle=col.getHex();

        context.lineTo(points[i].x, points[i].y);
        context.stroke();
    }

}