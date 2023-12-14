function submit() {
  var studentID = document.getElementById("studentID").value;

  var studentName = document.getElementById("studentName").value;
  if (studentID == "" || studentName == "") {
    alert("請輸入資料");
    return;
  }
  var data = {
    data: [
      {
        studentID: "'" + studentID, //防止0被刪除
        studentName: studentName,
      },
    ],
  };
  //呼叫API
  fetch("https://sheetdb.io/api/v1/x2qj8ckpsv196", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (jsonData) {
      console.log(jsonData);
    });
  var result = document.getElementById("result");
  result.innerHTML = "你的學號：" + studentID + " 你的姓名：" + studentName;  
}
function Update() {
  // console.log("進入UPDATE API");
  // console.log(studentID);
  var studentID = document.getElementById("studentID").value;
  var sleepCount = 0;//設定為若沒取得資料會發生錯誤的初始值
  fetch(`https://sheetdb.io/api/v1/x2qj8ckpsv196/search?studentID=${studentID}`)
    .then((response) => response.json())
    .then((data) => {
      // console.log('返回的數據：', data[0].sleepCount);
      sleepCount = data[0].sleepCount;
      // console.log("資料庫拿來的sleepCount=" + sleepCount);
      if (sleepCount == "")
      {
        sleepCount = 1;
      } else if (sleepCount > 0)
      {
        sleepCount++;
      }
      else {
        window.alert("資料錯誤");
        return;
      }
      // console.log("後來sleepCount=" + sleepCount);
      fetch(
        `https://sheetdb.io/api/v1/x2qj8ckpsv196/studentID/${studentID}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              sleepCount: sleepCount,
            },
          }),
        }
      )
        .then((response) => response.json())
        .then((data) => console.log(data));
    })
    .catch((error) => {
      console.error('發生錯誤：', error);
    });
}
