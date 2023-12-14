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
function Update(count) {
  let studentID = document.getElementById("studentID").value;
  //let sleepCount = document.getElementById("sleepCount").value;
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
          sleepCount: count,
        },
      }),
    }
  )
    .then((response) => response.json())
    .then((data) => console.log(data));
}
