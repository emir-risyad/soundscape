// P_2_2_3_02
//
// Generative Gestaltung – Creative Coding im Web
// ISBN: 978-3-87439-902-9, First Edition, Hermann Schmidt, Mainz, 2018
// Benedikt Groß, Hartmut Bohnacker, Julia Laub, Claudius Lazzeroni
// with contributions by Joey Lee and Niels Poldervaart
// Copyright 2018
//
// http://www.generative-gestaltung.de
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * form mophing process by connected random agents
 * two forms: circle and line
 *
 * MOUSE
 * click               : start a new circe
 * position x/y        : direction and speed of floating
 *
 * KEYS
 * 1-2                 : fill styles
 * 3-4                 : form styles circle/line
 * 5-6                 : change color
 * arrow up/down       : step size +/-
 * f                   : freeze. loop on/off
 * Delete/Backspace    : clear display
 * s                   : save png
 */
'use strict';

var sound;
var fft;
var bg;
var particles = [];

var formResolution = 15;
var stepSize = 2;
var distortionFactor = 1;
var initRadius = 150;
var centerX;
var centerY;
var x = [];
var y = [];

var filled = false;
var freeze = false;
var drawMode = 1;
var lineColor = 1;

function preload() {
  sound = loadSound('inochi.mp3');
}


function setup() {
  createCanvas(windowWidth, windowHeight);

  // init shape
  rectMode(CENTER);
  centerX = width / 2;
  centerY = height / 2;
  var angle = radians(360 / formResolution);
  for (var i = 0; i < formResolution; i++) {
    x.push(cos(angle * i) * initRadius);
    y.push(sin(angle * i) * initRadius);
  }

  stroke(0, 50);
  strokeWeight(0.75);
  background(255);
  fft = new p5.FFT(0.25);
  sound.play();
}

function draw() {
  // floating towards mouse position
  centerX += (mouseX - centerX) * 0.01;
  centerY += (mouseY - centerY) * 0.01;

  // calculate new points
  for (var i = 0; i < formResolution; i++) {
    x[i] += random(-stepSize, stepSize);
    y[i] += random(-stepSize, stepSize);
  }
  
  fft.analyze();
  var amp = fft.getEnergy(20, 200);
  
  var colorRed = color(255, 51, 51);
  var colorPinkA = color(246, 189, 192);
  var colorPinkB = color(250,128,114);
  
  var colorCyanA = color(0, 236, 250);
  var colorCyanB = color(0, 206, 241);
  var colorCyanC = color(0, 184, 234);
  
  switch(lineColor){
  case 1: //red
    if(amp > 190){
      mousePressed();
     }else if(amp > 180){
       stroke(colorRed);
     } else if(amp > 150){
       stroke(colorPinkB);
     } else if (amp < 150){
       stroke(colorPinkA);
     }
    break;
  case 2: //cyan
    if(amp > 190){
      mousePressed();
    }else if(amp > 180){
       stroke(colorCyanC);
     } else if(amp > 150){
       stroke(colorCyanB);
     } else if (amp < 150){
       stroke(colorCyanA);
     }
    break;
  }
  

  if (filled) {
    fill(random(255));
  } else {
    noFill();
  }

  switch (drawMode) {
  case 1: // circle
    beginShape();
    // start controlpoint
    curveVertex(x[formResolution - 1] + centerX, y[formResolution - 1] + centerY);

    // only these points are drawn
    for (var i = 0; i < formResolution; i++) {
      curveVertex(x[i] + centerX, y[i] + centerY);
    }
    curveVertex(x[0] + centerX, y[0] + centerY);
      

    // end controlpoint
    curveVertex(x[1] + centerX, y[1] + centerY);
    endShape();
    break;
  case 2: // line
    beginShape();
    // start controlpoint
    curveVertex(x[0] + centerX, y[0] + centerY);

    // only these points are drawn
    for (var i = 0; i < formResolution; i++) {
      curveVertex(x[i] + centerX, y[i] + centerY);
    }

    // end controlpoint
    curveVertex(x[formResolution - 1] + centerX, y[formResolution - 1] + centerY);
    endShape();
    break;
  }
  
}

function mousePressed() {
  // init shape on mouse position
  centerX = mouseX;
  centerY = mouseY;


  switch (drawMode) {
  case 1: // circle
    var angle = radians(360 / formResolution);
    var radius = initRadius * random(0.5, 1);
    for (var i = 0; i < formResolution; i++) {
      x[i] = cos(angle * i) * radius;
      y[i] = sin(angle * i) * radius;
    }
    break;
  case 2: // line
    var radius = initRadius * random(0.5, 5);
    var angle = random(PI);

    var x1 = cos(angle) * radius;
    var y1 = sin(angle) * radius;
    var x2 = cos(angle - PI) * radius;
    var y2 = sin(angle - PI) * radius;
    for (var i = 0; i < formResolution; i++) {
      x[i] = lerp(x1, x2, i / formResolution);
      y[i] = lerp(y1, y2, i / formResolution);
    }
    break;
  }
}

function keyReleased() {
  if (key == 's' || key == 'S') saveCanvas(gd.timestamp(), 'png');
  if (keyCode == DELETE || keyCode == BACKSPACE) background(255);
  if (key == '1') filled = false;
  if (key == '2') filled = true;
  if (key == '3') drawMode = 1;
  if (key == '4') drawMode = 2;
  if (key == '5') lineColor = 1;
  if (key == '6') lineColor = 2;

  if (keyCode == UP_ARROW) stepSize++;
  if (keyCode == DOWN_ARROW) stepSize--;
  stepSize = max(stepSize, 1);

  // pause/play draw loop
  if (key == 'f' || key == 'F') freeze = !freeze;
  if (freeze) {
    noLoop();
  } else {
    loop();
  }
}
