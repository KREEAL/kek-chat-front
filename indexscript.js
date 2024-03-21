user_id = null;
user_name = "";
users_ids_i_have_chat_with = [];
current_conversation_id = null;
current_user_chat_id = null;
current_chat_messages = [];

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

function whichUserSentDialogue(element) {
  if (element.user_1_pub_key != null) {
    return element.user_1_id;
  } else {
    return element.user_2_id;
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
            initialized: element.initialized,
            sender: whichUserSentDialogue(element),
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
            initialized: element.initialized,
            sender: whichUserSentDialogue(element),
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
  is_initialized = false;
  sender_id = null;
  conversation_id = null;
  user_id_to_chat = null;

  users_ids_i_have_chat_with.forEach((element) => {
    if (element.user_id == user_on_click_id) {
      already_dialogue = true;
      is_initialized = element.initialized;
      sender_id = element.sender;
      conversation_id = element.conversation_id;
      user_id_to_chat = element.user_id;
    }
  });

  if (already_dialogue) {
    if (is_initialized) {
      console.log("Переход в чат");
      open_chat_with_user(user_id_to_chat, conversation_id);
    } else if (sender_id == user_id) {
      console.log("Я отправил запрос на чат");
    } else {
      console.log("Мне отправили запрос на чат");
      completeChatCreation(sender_id, conversation_id);
    }
  } else {
    createAndSaveKeyPairForUserChatConversationWithLocalStorage(
      user_on_click_id
    );
  }
}

function completeChatCreation(user_id_to_chat, conversation_id) {
  createAndSaveKeyPairForComplete(user_id_to_chat, conversation_id);
  console.log("Переход в чат");
}

function open_chat_with_user(open_chat_with_me_id, conversation_id) {
  conversation_id = null;

  //замена ника
  username_of_chatting_user = null;
  users_ids_i_have_chat_with.forEach((element) => {
    if (element.user_id == open_chat_with_me_id) {
      username_of_chatting_user = element.user_username;
      conversation_id = element.conversation_id;
    }
  });

  current_conversation_id = conversation_id;
  current_user_chat_id = open_chat_with_me_id;

  document.getElementById("nameofchattinguser").innerHTML =
    username_of_chatting_user;

  //получение и сохранение чужого ключа

  getData("api/v1/conversations/" + conversation_id).then((data) => {
    if (data.user_1_id == open_chat_with_me_id) {
      //если первый узер - тот, с кем я открыл чат
      user_chating_public_key = data.user_1_pub_key;
      localStorage.setItem(
        user_id + "_" + user_id_to_chat + "_public_alien",
        user_chating_public_key
      );
    } else {
      user_chating_public_key = data.user_2_pub_key;
      localStorage.setItem(
        user_id + "_" + user_id_to_chat + "_public_alien",
        user_chating_public_key
      );
    }
  });

  //очистка чата
  document.getElementById("messagesscroll").innerHTML = "";

  getLastMessagesInChat();

  console.log("получить чат");
}

async function sendMessage() {
  text = document.getElementById("inputmessage").value;

  encrypted_message = await encryptMyMessage(text, current_user_chat_id);
  postData("api/v1/conversations/" + current_conversation_id + "/sendmsg", {
    encrypted_text: encrypted_message,
  });
  document.getElementById("inputmessage").value = "";
}

function getLastMessagesInChat() {
  getData("api/v1/conversations/" + current_conversation_id + "/messages").then(
    (data) => {
      data.forEach(async (element) => {
        date = new Date(Date.parse(element.send_datetime));
        current_chat_messages.push(element.message_id);

        text = await decryptAlienMessage(
          element.encrypted_text,
          current_user_chat_id
        );
        fromFriend = null;
        if (element.sender_id == current_user_chat_id) {
          fromFriend = true;
        } else {
          fromFriend = false;
        }
        addMessageToScroll(
          "·" +
            date.getDate() +
            date.getMonth() +
            "," +
            date.getHours() +
            ":" +
            date.getMinutes(),
          text,
          fromFriend
        );
      });
    }
  );
}

window.onload = () => {
  getCurrentUser();
  getAllConversations();
};
