function register() {
  let login = document.getElementById("registerlogin").value;
  let password = document.getElementById("registerpassword").value;
  let body = { username: login, password: password };
  postData("api/v1/auth/register", body).then((data) => {
    if (data.detail == null) {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("token_type", "app_token");

      setTimeout(() => {
        // Жизнь полна неожиданностей... Но эта пауза точно не будет лишней
        document.getElementById("2fa_container").style.visibility = "visible";
        document.getElementById("signcontainer").remove();
        getQR();
      }, 200);
    }
  });
}

function login() {
  let login = document.getElementById("loginlogin").value;
  let password = document.getElementById("loginpassword").value;
  let body = { username: login, password: password };
  postData("api/v1/auth/login", body).then((data) => {
    if (data.detail == null) {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("token_type", "pre_2fa_token");

      setTimeout(() => {
        document.getElementById("qrcode").remove();
        document.getElementById("2fa_container").style.height = "300px";
        document.getElementById("2fa_container").style.visibility = "visible";

        document.getElementById("signcontainer").remove();
        // Жизнь полна неожиданностей... Но эта пауза точно не будет лишней
      }, 1);
    }
  });
}

function getQR() {
  getData("api/v1/auth/my_totp_qr").then((response) => {
    printQR(response.qr_text);
  });
}

function checkTestTOTP() {
  totpres = "";
  totpres += document.getElementById("totp1").value;
  totpres += document.getElementById("totp2").value;
  totpres += document.getElementById("totp3").value;
  totpres += document.getElementById("totp4").value;
  totpres += document.getElementById("totp5").value;
  totpres += document.getElementById("totp6").value;

  if (localStorage.getItem("token_type") == "pre_2fa_token") {
    postData("api/v1/auth/login_totp", { code: totpres }).then(
      (data, response) => {
        if (data.detail == null) {
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          localStorage.setItem("token_type", "app_token");
          document.location.replace("/index.html");
        }
      }
    );
  } else if (localStorage.getItem("token_type") == "app_token") {
    postData("/api/v1/auth/test_totp", { code: totpres }).then((data) => {
      if (data.success) {
        document.location.replace("/index.html");
      }
    });
  } else {
    console.log("Все очень плохо");
  }
}

// Example POST method implementation:
async function getData(url = "") {
  url = "https://chat-back.kekdev.top/" + url;
  // Default options are marked with *

  let headers = { "Content-Type": "application/json" };

  if (localStorage.getItem("access_token") != null) {
    const auth_header = "Bearer " + localStorage.getItem("access_token");
    headers["Authorization"] = auth_header;
  }

  const response = await fetch(url, {
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: headers,
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  });
  response["_status"] = response.status;
  return response.json(); // parses JSON response into native JavaScript objects
}

// Example POST method implementation:
async function postData(url = "", data = {}) {
  url = "https://chat-back.kekdev.top/" + url;

  let headers = { "Content-Type": "application/json" };

  if (localStorage.getItem("access_token") != null) {
    const auth_header = "Bearer " + localStorage.getItem("access_token");
    headers["Authorization"] = auth_header;
  }

  // Default options are marked with *
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: headers,
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

function printQR(qr_text) {
  var qrcode = new QRCode("qrcode_code_img", {
    text: qr_text,
    width: 300,
    height: 300,
    colorDark: "#000000",
    colorLight: "#ffffff",
  });
}

function exitfromaccount() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("token_type");
  document.location.replace("/login.html");
}
