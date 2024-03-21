user_id = null;
user_name = "";
users_ids_i_have_chat_with = [];

function getCurrentUser() {
  getData("api/v1/users/me").then((data) => {
    user_id = data.user_id;
    user_name = data.username;
    document.getElementById("nameofloggeduser").innerText = user_name;
  });
}

// ▶ ⬤
function get_conversation_symbol(conversation) {
  if (conversation.initialized) {
    return "";
  }

  if (conversation.user_1_id == user_id) {
    if (conversation.user_1_pub_key == null) {
      return "⬤";
    } else {
      return "▶";
    }
  } else {
    if (conversation.user_2_pub_key == null) {
      return "⬤";
    } else {
      return "▶";
    }
  }
}

function getAllConversations() {
  document.getElementById("peopleScroll").innerHTML = "";

  getData("api/v1/conversations").then((data) => {
    users_ids_i_have_chat_with = [];
    if (data.length == 0) {
      document.getElementById("peopleScroll").innerHTML +=
        '<h3 class="humantochat">Нет чатов</h3>';
    } else {
      data.forEach((element) => {
        if (element.user_1_id == user_id) {
          users_ids_i_have_chat_with.push({
            conversation_id: element.conversation_id,
            user_id: element.user_2_obj.user_id,
            user_username: element.user_2_obj.username,
          });

          document.getElementById("peopleScroll").innerHTML +=
            '<div class="humantochatdiv"><button class="chatbutton" onclick="click_on_user_button(this)"><h3 class="humantochat"> ' +
            get_conversation_symbol(element) +
            " " +
            element.user_2_obj.username +
            '</h3><h3 style="visibility:hidden">' +
            element.user_2_obj.user_id +
            "</h3></button></div>";
        } else {
          users_ids_i_have_chat_with.push({
            conversation_id: element.conversation_id,
            user_id: element.user_1_obj.user_id,
            user_username: element.user_1_obj.username,
          });

          document.getElementById("peopleScroll").innerHTML +=
            '<div class="humantochatdiv"><button class="chatbutton" onclick="click_on_user_button(this)" ><h3 class="humantochat"> ' +
            get_conversation_symbol(element) +
            " " +
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
            '<div class="humantochatdiv" style = "background:#f0f0f0"><button class="chatbutton" onclick="click_on_user_button(this)"><h3 class="humantochat">' +
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
  //console.log(callingObject.children[1].innerHTML);
  return callingObject.children[1].innerHTML;
}

function click_on_user_button(callingObject) {
  user_on_click_id = getConversationID(callingObject);

  already_dialogue = false;

  users_ids_i_have_chat_with.forEach((element) => {
    if (element.user_id == user_on_click_id) {
      already_dialogue = true;
    }
  });

  if (already_dialogue) {
    console.log("тут вызывать комплит, если ко мне пришел запрос");
  } else {
    createAndSaveKeyPairForUserChatConversationWithLocalStorage(
      user_on_click_id
    );
  }
}

window.onload = () => {
  getCurrentUser();
  getAllConversations();
};
