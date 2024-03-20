user_id = "";
user_name = "";

function getCurrentUser() {
  getData("api/v1/users/me").then((data) => {
    user_id = data.user_id;
    user_name = data.username;
    document.getElementById("nameofloggeduser").innerText = user_name;
  });
}

function getAllConversations() {
  getData("api/v1/conversations").then((data) => {
    if (data.length == 0) {
      document.getElementById("peopleScroll").innerHTML +=
        '<h3 class="humantochat">Нет чатов</h3>';
    } else {
      data.forEach((element) => {
        if (element.user_1_id == user_id) {
          document.getElementById("peopleScroll").innerHTML +=
            '<div class="humantochatdiv"><button class="chatbutton" onclick="getConversationID(this)"><h3 class="humantochat">' +
            element.user_2_obj.username +
            '</h3><h3 style="visibility:hidden">' +
            element.user_2_obj.user_id +
            "</h3></button></div>";
        } else {
          document.getElementById("peopleScroll").innerHTML +=
            '<div class="humantochatdiv"><button class="chatbutton" onclick="getConversationID(this)" ><h3 class="humantochat">' +
            element.user_1_obj.username +
            '</h3><h3 style="visibility:hidden">' +
            element.user_1_obj.user_id +
            "</h3></button></div>";
        }
      });
    }
  });
}

function searchonchange(value) {
  document.getElementById("peopleScroll").innerHTML = "";

  if (value != "") {
    getData("/api/v1/users/search?username=" + value).then((data) => {
      if (data.length == 0) {
        document.getElementById("peopleScroll").innerHTML +=
          '<h3 class="humantochat">Нет юзеров</h3>';
      } else {
        data.forEach((element) => {
          document.getElementById("peopleScroll").innerHTML +=
            '<div class="humantochatdiv" style = "background:#f0f0f0"><button class="chatbutton" onclick="getConversationID(this)"><h3 class="humantochat">' +
            element.username +
            '</h3><h3 style="visibility:hidden">' +
            element.user_id +
            "</h3></button></div>";
        });
      }
    });
  } else {
    getAllConversations();
  }
}

function getConversationID(callingObject) {
  console.log(callingObject.children[1].innerHTML);
  return callingObject.children[1].innerHTML;
}

window.onload = () => {
  getCurrentUser();
  getAllConversations();
};
