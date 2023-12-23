var nouns = new Array(
  "同學",
  "你",
  "未來工程師",
  "老鐵",
  "老哥",
  "兄弟",
  "大哥"
);
var verb = new Array(
  "不要再睡了",
  "看起來很累",
  "一定昨晚熬夜",
  "快被當了",
  "是不是在想周公",
  "想不想重修",
  "需要提神",
  "一直在狀況外",
  "還搞不清楚狀況"
);
var img = new Array(
  "src/Cat.jpg",
  "src/jerry.jpg",
  "src/bird.jpg",
  "src/tom.jpg",
  "src/patrick.jpg",
  "src/tired.jpg"
);
const sound = new Audio();

function Start() {
  sound.src = "src/alarm.mp3";
  var name = nouns[Math.floor(Math.random() * nouns.length)];
  var v = verb[Math.floor(Math.random() * verb.length)];
  var image = img[Math.floor(Math.random() * img.length)];
  var ima = document.getElementById("ig");
  ima.setAttribute("src", image);
  var output =
    '<span id= "normal">' +
    name +
    "</span>" +
    '<span id= "verb">' +
    v +
    "</span> <br>";

  document.getElementById("text").innerHTML = output;
}
function openModal() {
  document.getElementById("overlay").style.display = "flex";
  Start();
  // 模态框显示时播放音效
  //   var sound = document.getElementById("sound");
  sound.play();
}

function closeModal() {
  document.getElementById("overlay").style.display = "none";
  // 关闭模态框时暂停音效
  //var sound = document.getElementById("sound");
  console.log(sound);
  sound.pause();
}
