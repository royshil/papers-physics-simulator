const Matter = require("matter-js");

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
  engine: engine,
  options: {
    wireframes: false // <-- important
  }
});

import csvPath from "./citing_papers.csv";
console.log(csvPath); // assets/data.csv

// import jquery-csv
import * as jqueryCsv from "jquery-csv";

// fetch csv file from csvPath and store in array
var csvData = [];
fetch(csvPath)
  .then((response) => response.text())
  .then((data) =>
    jqueryCsv.toObjects(data).filter((paper) => paper.num_citations > 1)
  )
  .then((papers) => {
    console.log(papers.length);
    // sort papers by year, secondarily sort papers by number of citations
    papers.sort((a, b) => {
      if (a.year === b.year) {
        return b.num_citations - a.num_citations;
      } else {
        return a.year - b.year;
      }
    });
    // set gravity to 0 so that papers don't fall
    engine.world.gravity.y = 0.1;
    // create ground
    var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true,
      // make ground very soft so that papers don't bounce off of it
      render: {
        fillStyle: 'transparent',
      },
      friction: 0.1,
      frictionStatic: 0.1,
      restitution: 0.1,
    });
    // put up walls to prevent papers from escaping
    var leftWall = Bodies.rectangle(-10, 300, 20, 600, { isStatic: true });
    var rightWall = Bodies.rectangle(760, 300, 20, 600, { isStatic: true });
    // put up 5 vetical walls equally spaced out on the x axis
    var walls = [];
    for (var i = 0; i < 5; i++) {
      // make these walls transparent
      walls.push(
        Bodies.rectangle(800 * (i/5.0), 300, 7, 600, { isStatic: true,
          render: {
            fillStyle: 'transparent',
          }, })
      );
    }

    // set up a timer that will gradually add more paper rectangles to the world
    // the papers should be timed according to their year
    setInterval(() => {
      // randomly choose a paper from the array
      var paper = papers[0];
      if (!paper) {
        return;
      }
      if (!paper.num_citations) {
        return;
      }
      // create a circle, the size of which is determined by the number of citations
      var radius = Math.pow(paper.num_citations, 0.33) * 1.5;
      // circles should originate from the top of the screen
      // their x position depends on the year of the paper (with some randomness)
      // stretch the x axis so that the papers are more spread out (year 2018 = x = 0, year 2025 = x = width)
      var x = (800 * (paper.year - 2018 - 0.5) / 5); // + Math.random() * 10 - 5;
      // give the cicrle a color based on the year of the paper
      var color = `hsl(${(paper.year - 2018)/5 * 360}, 100%, 50%)`;
      var backgroundColor = `rgb(255,255,255)`;
      // make the circles heavier based on the number of citations
      var mass = paper.num_citations * 10;
      // create the circle, use very high friction so that they don't slide around
      var circle = Bodies.circle(x, 300, radius, {
        render: {
          fillStyle: color,
          lineWidth: 1,
          strokeStyle: backgroundColor,
        },
        // mass: mass,
        // frictionStatic: 0.1,
        // friction: 0.1,
        // restitution: 1,
        // stiffness: 1,
      });
      // add the circle to the world
      Composite.add(engine.world, circle);

      // remove paper from array so it can't be chosen again
      papers = papers.filter((p) => p !== paper);
      // if there are no more papers, stop the timer
      if (papers.length === 0) {
        clearInterval();
        // remove
      }
    }, 10);

    // // for each paper create a rectangle, the size of which is determined by the number of citations
    // var rectangles = papers.map((paper) => {
    //   // use logarithm to scale the size of the rectangles
    //   var radius = Math.log(paper.num_citations) * 2 + 1;
    //   // randomly place the rectangles
    //   return Bodies.rectangle(Math.random() * 800, Math.random() * 600, radius);
    // });

    // add all of the bodies to the world
    Composite.add(engine.world, [...walls, ground, leftWall, rightWall]);

    // run the renderer
    Render.run(render);

    // create runner
    var runner = Runner.create();

    // run the engine
    Runner.run(runner, engine);
  });
