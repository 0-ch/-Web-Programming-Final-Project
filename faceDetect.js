import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
import './sheetdb.js';
import './modal.js';
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;
const imageBlendShapes = document.getElementById("image-blend-shapes");
const videoBlendShapes = document.getElementById("video-blend-shapes");
let faceLandmarker;
let runningMode = "IMAGE"; //為IMAGE或VIDEO
let enableWebcamButton;
let webcamRunning = false;
const videoWidth = 480;
// 創建模型函式
async function createFaceLandmarker() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU",
    },
    outputFaceBlendshapes: true,
    runningMode,
    numFaces: 1,
  });
  console.log("faceLandmarker創建完成");
}
// 創建模型
createFaceLandmarker();
const selectedImage = document.getElementById("selectedImage");
// 設置監聽事件
if (selectedImage != null)
{ 
  selectedImage.addEventListener("click", handleClick);
  }
//偵測臉部特徵點
async function handleClick(event) {
  console.log("開始偵測臉部");
  if (!faceLandmarker) {
    console.log("等待faceLandmarker載入後再點擊！");
    return;
  }
  //設置模式為IMAGE
  if (runningMode === "VIDEO") {
    runningMode = "IMAGE";
    await faceLandmarker.setOptions({ runningMode });
  }
  //移除所有canvas
  const allCanvas = event.target.parentNode.getElementsByClassName("canvas");
  for (var i = allCanvas.length - 1; i >= 0; i--) {
    const n = allCanvas[i];
    n.parentNode.removeChild(n);
  }
  //繪製canvas
  var modalFlag = 0;
  const faceLandmarkerResult = faceLandmarker.detect(event.target);
  const canvas = document.createElement("canvas");
  canvas.setAttribute("class", "canvas");
  canvas.setAttribute("width", event.target.naturalWidth + "px");
  canvas.setAttribute("height", event.target.naturalHeight + "px");
  canvas.style.left = "0px";
  canvas.style.top = "0px";
  canvas.style.width = `${event.target.width}px`;
  canvas.style.height = `${event.target.height}px`;
  event.target.parentNode.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const drawingUtils = new DrawingUtils(ctx);
  // console.log(FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE);
  for (const landmarks of faceLandmarkerResult.faceLandmarks) {
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_TESSELATION,
      { color: "#C0C0C070", lineWidth: 1 }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
      { color: "#FF3030" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
      { color: "#FF3030" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
      { color: "#30FF30" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
      { color: "#30FF30" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
      { color: "#E0E0E0" }
    );
    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, {
      color: "#E0E0E0",
    });
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
      { color: "#FF3030" }
    );
    drawingUtils.drawConnectors(
      landmarks,
      FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
      { color: "#30FF30" }
    );
  }
  //畫臉
  drawBlendShapes(imageBlendShapes, faceLandmarkerResult.faceBlendshapes);
}
// 鏡頭模式
const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
//確認鏡頭存取權
function hasGetUserMedia() {
  console.warn("無法存取鏡頭");
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}
if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById("webcamButton");
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("無法使用鏡頭");
}
// 開啟鏡頭 確認模型 開始偵測
function enableCam(event) {
  var studentID = document.getElementById("studentID").value;
  var studentName = document.getElementById("studentName").value;
  // console.log(studentID);
  // console.log(studentName);
  if (studentID == "" || studentName == "")
  {
    window.alert("請先輸入學號和姓名");
    return;
    }
  if (!faceLandmarker) {
    console.log("稍等 模型未載入完成");
    return;
  }
  if (webcamRunning === true) {
    webcamRunning = false;
    enableWebcamButton.innerText = "開始偵測";
  } else {
    webcamRunning = true;
    enableWebcamButton.innerText = "結束偵測";
  }
  const constraints = {
    video: true,
  };
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}
let lastVideoTime = -1;
let results = undefined;
const detectionInterval = 1000; // 毫秒
let closeEyesCount = 0;
var detectCount = 0;
var detectTotalTime = 0;
const audio = new Audio();
//提示音路徑
// audio.src = 'moo.mp3';
const drawingUtils = new DrawingUtils(canvasCtx);
async function predictWebcam() {
  const radio = video.videoHeight / video.videoWidth;
  video.style.width = videoWidth + "px";
  video.style.height = videoWidth * radio + "px";
  canvasElement.style.width = videoWidth + "px";
  canvasElement.style.height = videoWidth * radio + "px";
  canvasElement.width = video.videoWidth;
  canvasElement.height = video.videoHeight;
  // 變更為鏡頭模式
  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await faceLandmarker.setOptions({ runningMode: runningMode });
  }
  let startTimeMs = performance.now();
  //不斷執行
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    //先只算100次 偵測平均耗時差不多0.3-0.6秒
    if (detectCount < 100) {
      var timeDetectStart = performance.now();
      results = faceLandmarker.detectForVideo(video, startTimeMs);
      var timeDetectEnd = performance.now();
      console.log("偵測時間：" + (timeDetectEnd - timeDetectStart) + "ms");
      detectTotalTime += timeDetectEnd - timeDetectStart;
      detectCount++;
    } else {
      results = faceLandmarker.detectForVideo(video, startTimeMs);
    }
  }
  //有人臉的話 繪製
  if (results.faceLandmarks) {
    for (const landmarks of results.faceLandmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_TESSELATION,
        { color: "#C0C0C070", lineWidth: 1 }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
        { color: "#30FF30" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
        { color: "#30FF30" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
        { color: "#E0E0E0" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LIPS,
        { color: "#E0E0E0" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
        { color: "#30FF30" }
      );
    }
  }
  drawBlendShapes(videoBlendShapes, results.faceBlendshapes);
  if (webcamRunning === true) {
    // 設定每秒執行一次
    setTimeout(() => {
      window.requestAnimationFrame(predictWebcam);
    }, detectionInterval);
  }
}

function drawBlendShapes(el, blendShapes) {
  if (!blendShapes.length) {
    console.log("沒有偵測到臉");
    el.innerHTML = "<h1>沒有偵測到臉</h1>";
    return;
  }
  console.log("有偵測到臉");
  console.log(blendShapes[0]);
  let htmlMaker = "";
  if (runningMode === "IMAGE") {
    //顯示52個臉部不同狀態的分數
    blendShapes[0].categories.map((shape) => {
      htmlMaker += `
          <li class="blend-shapes-item">
            <span class="blend-shapes-label">${
              shape.displayName || shape.categoryName
            }</span>
            <span class="blend-shapes-value" style="width: calc(${
              +shape.score * 100
            }% - 120px)">${(+shape.score).toFixed(4)}</span>
          </li>
        `;
    });
  } else {
    //判定閉眼門檻
    if (
      blendShapes[0].categories[9].score > 0.5 &&
      blendShapes[0].categories[10].score > 0.5
    ) {
      //門檻可再調
      closeEyesCount++;
    }
    //不連續則歸零
    else {
      closeEyesCount = 0;
    }
    //9:{index: 9, score: 0.03884951025247574, categoryName: 'eyeBlinkLeft', displayName: ''}
    //10:{index: 10, score: 0.023560430854558945, categoryName: 'eyeBlinkRight', displayName: ''}

    htmlMaker += `
    <li class="blend-shapes-item">
         <span class="blend-shapes-label">${
           blendShapes[0].categories[9].displayName ||
           blendShapes[0].categories[9].categoryName
         }</span>
         <span class="blend-shapes-value" style="width: calc(${
           +blendShapes[0].categories[9].score * 100
         }% - 120px)">${(+blendShapes[0].categories[9].score).toFixed(4)}</span>
  </li>
  `;
    htmlMaker += `
    <li class="blend-shapes-item">
        <span class="blend-shapes-label">${
          blendShapes[0].categories[10].displayName ||
          blendShapes[0].categories[10].categoryName
        }</span>
        <span class="blend-shapes-value" style="width: calc(${
          +blendShapes[0].categories[10].score * 100
        }% - 120px)">${(+blendShapes[0].categories[10].score).toFixed(4)}</span>
  </li>
  `;
    htmlMaker += `<h2>你連續閉眼了${closeEyesCount}次<h2/>`;
    // htmlMaker += `<h2>前${detectCount}次平均偵測時間：${
    //   detectTotalTime / detectCount/1000
    // }秒<h2/>`;
    //偵測耗時差不多0.3-0.6秒
  
    //使用者在睡覺 該採取的措施...
    if (closeEyesCount > 4) {
      
      //!!呼叫API輸入資料庫未做!!
      //大概是if sleepCount == null then sleepCount = 1 else sleepCount++
      // var studentID = document.getElementById("studentID").value;
      Update();
      openModal();
    }
  }
  el.innerHTML = htmlMaker;
}
