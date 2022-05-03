const URL = "./my_model/";
let model, webcam, ctx, labelContainer, maxPredictions;

///
const audio_shoot = new Audio("./assets/sound/silencerShoot1_p.mp3");
const audio_reload = new Audio("./assets/sound/reload0_p.wav");

const BulletColors = [
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
const canvas_bullet = document.getElementById("canvas_bullet");
canvas_bullet.width = 100;
canvas_bullet.height = 100;
const ctx_bullet = canvas_bullet.getContext("2d");

function reload() {
  audio_reload.play();
}

function shoot() {
  audio_shoot.play();

  ctx_bullet.arc(50, 50, 10, 10, 0, 2 * Math.PI);

  ctx_bullet.stroke();
  for (i = 0; i < BulletColors.length - 1; i++) {
    (function (x) {
      setTimeout(function () {
        ctx_bullet.fillStyle = BulletColors[x];
        ctx_bullet.fill();
      }, 50 * x);
    })(i);
  }
  ctx_bullet.clearRect(0, 0, 100, 100);
}
///

async function init() {
  $("#title_main").fadeOut("slow");
  $("#title_sub").fadeOut("slow");
  $("#button_start").fadeOut("slow");

  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // Note: the pose library adds a tmPose object to your window (window.tmPose)
  model = await tmPose.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Convenience function to setup a webcam
  const size = 200;
  const flip = true; // whether to flip the webcam
  webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);

  // append/get elements to the DOM
  const canvas = document.getElementById("canvas_ML");
  canvas.width = size;
  canvas.height = size;
  ctx = canvas.getContext("2d");
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

async function predict() {
  // Prediction #1: run input through posenet
  // estimatePose can take in an image, video or canvas html element
  const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
  // Prediction 2: run input through teachable machine classification model
  const prediction = await model.predict(posenetOutput);

  if (prediction[1].probability.toFixed(2) > 0.8) {
    labelContainer.childNodes[0].innerHTML = "땅!";
    shoot();
  } else if (prediction[0].probability.toFixed(2) > 0.4) {
    labelContainer.childNodes[0].innerHTML = "대기중";
    ctx_bullet.clearRect(0, 0, 100, 100);
  } else if (prediction[2].probability.toFixed(2) == 1) {
    labelContainer.childNodes[0].innerHTML = "장전 중";
    ctx_bullet.clearRect(0, 0, 100, 100);
    reload();
  }
  // for (let i = 0; i < maxPredictions; i++) {
  //   const classPrediction =
  //     prediction[i].className + ": " + prediction[i].probability.toFixed(2);
  //   labelContainer.childNodes[i].innerHTML = classPrediction;
  // }

  // finally draw the poses
  drawPose(pose);
}

////

function drawPose(pose) {
  if (webcam.canvas) {
    ctx.drawImage(webcam.canvas, 0, 0);
    // draw the keypoints and skeleton
    if (pose) {
      const minPartConfidence = 0.5;
      tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
      tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
    }
  }
}
