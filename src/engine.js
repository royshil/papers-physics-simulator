const Matter = require('matter-js');

// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

// create an engine
var engine = Engine.create();

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine
});

import csvPath from './citing_papers.csv'
console.log(csvPath)          // assets/data.csv

// import jquery-csv
import * as jqueryCsv from 'jquery-csv';


// fetch csv file from csvPath and store in array
var csvData = [];
fetch(csvPath)
  .then(response => response.text())
  .then(data => (jqueryCsv.toObjects(data).filter((paper) => paper.num_citations > 10)))
  .then((papers) => {
    console.log(papers.length);
    // create ground
    var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
    // put up walls to prevent papers from escaping
    var leftWall = Bodies.rectangle(-10, 300, 20, 600, { isStatic: true });
    var rightWall = Bodies.rectangle(810, 300, 20, 600, { isStatic: true });

    // set up a timer that will gradually add more paper circles to the world
    // the papers should be timed according to their year
    setInterval(() => {
      // randomly choose a paper from the array
      var paper = papers[Math.floor(Math.random() * papers.length)];
      // create a circle, the size of which is determined by the number of citations
      var radius = Math.log(paper.num_citations) * 2 + 1;
      // circles should originate from the top of the screen
      // their x position depends on the year of the paper (with some randomness)
      // stretch the x axis so that the papers are more spread out (year 2000 = x = 0, year 2025 = x = width)
      var x = Math.random() * 800 * (paper.year - 2000) / 25;
      // give the cicrle a color based on the year of the paper
      var color = `hsl(${paper.year}, 100%, 50%)`;
        // create the circle
        var circle = Bodies.circle(x, -10, radius, {
            render: {
                fillStyle: color,
                strokeStyle: color,
                lineWidth: 1
            }
            });
      // add the circle to the world
      Composite.add(engine.world, circle);
      // remove paper from array so it can't be chosen again
      papers = papers.filter((p) => p !== paper);
      // if there are no more papers, stop the timer
        if (papers.length === 0) {
            clearInterval();
        }
    }, 200);

    // // for each paper create a circle, the size of which is determined by the number of citations
    // var circles = papers.map((paper) => {
    //   // use logarithm to scale the size of the circles
    //   var radius = Math.log(paper.num_citations) * 2 + 1;
    //   // randomly place the circles
    //   return Bodies.circle(Math.random() * 800, Math.random() * 600, radius);
    // });

    // add all of the bodies to the world
    Composite.add(engine.world, [ground, leftWall, rightWall]);

    // run the renderer
    Render.run(render);

    // create runner
    var runner = Runner.create();

    // run the engine
    Runner.run(runner, engine);
  });
