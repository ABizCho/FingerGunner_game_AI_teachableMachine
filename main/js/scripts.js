var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

canvas.width = window.innerWidth - 650;
canvas.height = window.innerHeight - 650;

var BulletColors = [
  "#fb4c00",
  "#fc0000",
  "#fc0000",
  "#fc0000",
  "#b00000",
  "#960000",
  "#620000",
  "#590000",
  "#340000",
  "#190000",
  "#000000",
];

var audio_shoot = new Audio("./assets/sound/silencerShoot1_p.mp3");
var audio_reload = new Audio("./assets/sound/reload0_p.wav");

var bullet = {
  x: 10,
  y: 200,
  width: 30,
  height: 30,
  reload() {
    audio_reload.play();
  },
  shoot() {
    audio_shoot.play();
    ctx.arc(600, 200, 10, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = BulletColors[0];
    ctx.fill();
    for (i = 1; i < BulletColors.length - 1; i++) {
      (function (x) {
        setTimeout(function () {
          ctx.fillStyle = BulletColors[x];
          ctx.fill();
        }, 50 * x);
      })(i);
    }
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  },
};
//////////////////////////////
//Main HTML Element

function delete_startTag() {
  // var header_title = document.getElementById("header_title");
  // var title_main = document.getElementById("title_main");
  // var title_sub = document.getElementById("title_sub");
  // var button_start = document.getElementById("button_start");
  // header_title.removeChild(title_main);
  // header_title.removeChild(title_sub);
  // header_title.removeChild(button_start);
}

// function sleep(delay) {
//   console.log("대기중.................");
//   var start = new Date().getTime();
//   while (new Date().getTime() < start + delay);
// }

//////////////////////////////

// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "../my_model/";

let model, webcam, labelContainer, maxPredictions;

// Load the image model and setup the webcam
async function init() {
  $("#title_main").fadeOut("slow");
  $("#title_sub").fadeOut("slow");
  $("#button_start").fadeOut("slow");

  delete_startTag();
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";
  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // or files from your local hard drive
  // Note: the pose library adds "tmImage" object to your window (window.tmImage)
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Convenience function to setup a webcam
  const flip = true; // whether to flip the webcam
  webcam = new tmImage.Webcam(300, 300, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);

  // append elements to the DOM
  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
    // and class labels
    labelContainer.appendChild(document.createElement("div"));
  }
}

async function loop() {
  webcam.update(); // update the webcam frame
  await predict();
  window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
  // predict can take in an image, video or canvas html element
  const prediction = await model.predict(webcam.canvas);
  if (prediction[2].probability.toFixed(2) >= 0.4) {
    bullet.reload();
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    labelContainer.childNodes[0].innerHTML = "장전중..";
  } else if (prediction[1].probability.toFixed(2) == 1) {
    bullet.shoot();
    labelContainer.childNodes[0].innerHTML = "땅!";
  } else if (prediction[0].probability.toFixed(2) >= 0.1) {
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    labelContainer.childNodes[0].innerHTML = "대기중";
  }
}
