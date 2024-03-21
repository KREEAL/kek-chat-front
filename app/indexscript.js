user_id = null;
user_name = "";
users_ids_i_have_chat_with = [];
current_conversation_id = null;
current_user_chat_id = null;
current_chat_messages = [];

async function getCurrentUser() {
  await getData("api/v1/users/me").then((data) => {
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

async function open_chat_with_user(open_chat_with_me_id, conversation_id) {
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

  await getData("api/v1/conversations/" + conversation_id).then((data) => {
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

  await getLastMessagesInChat();

  const scrollDiv = document.getElementsByClassName('messagesscrollbar')[0]
  scrollDiv.scroll(0, scrollDiv.scrollHeight)
}

async function sendMessage() {
  text = document.getElementById("inputmessage").value;

  encrypted_message = await encryptMyMessage(text, current_user_chat_id);
  postData("api/v1/conversations/" + current_conversation_id + "/sendmsg", {
    encrypted_text: encrypted_message,
  }).then((res) => {
    document.getElementById("inputmessage").value = "";

    const date = new Date(Date.parse(res.send_datetime));
    current_chat_messages.push(res.message_id);
    fromFriend = false;

    const date_msg =
      date.getDate() +
      "." +
      (date.getMonth() + 1) +
      "," +
      date.getHours() +
      ":" +
      date.getMinutes();

    document.getElementById("messagesscroll").innerHTML +=
      '<div class="minemessage" id="msg_' + res.message_id + '"><h4>' +
      date_msg +
      "</h4><h3>" +
      text +
      "</h3></div>";

    const scrollDiv = document.getElementsByClassName('messagesscrollbar')[0]
    if (scrollDiv != null) {
      scrollDiv.scrollTop = scrollDiv.scrollHeight
    } 

    let my_messages = localStorage.getItem(
      user_id + "_" + current_user_chat_id + "_my_messages"
    );
    if (my_messages == null) {
      my_messages = [];
    } else {
      my_messages = JSON.parse(my_messages);
    }
    my_messages.push({
      message_id: res.message_id,
      conversation_id: res.conversation_id,
      sender_user_id: res.sender_user_id,
      send_datetime: res.send_datetime,
      plain_text: text,
    });
    localStorage.setItem(
      user_id + "_" + current_user_chat_id + "_my_messages",
      JSON.stringify(my_messages)
    );
  });
}

async function getLastMessagesInChat() {
  let my_messages = localStorage.getItem(
    user_id + "_" + current_user_chat_id + "_my_messages"
  );
  if (my_messages != null) {
    my_messages = JSON.parse(my_messages);
  } else {
    my_messages = [];
  }

  current_chat_messages = []

  await getData("api/v1/conversations/" + current_conversation_id + "/messages?count=20").then(async (data) => {
    for (const element of data.slice().reverse()) {
      if (element.sender_user_id == user_id) {
        my_messages.forEach((my_msg) => {
          if (my_msg.message_id == element.message_id) {
            // Сообщение моё
            const date = new Date(Date.parse(my_msg.send_datetime));
            current_chat_messages.push(my_msg.message_id);
            text = my_msg.plain_text;
            fromFriend = false;

            const date_msg =
              date.getDate() +
              "." +
              (date.getMonth() + 1) +
              "," +
              date.getHours() +
              ":" +
              date.getMinutes();

            document.getElementById("messagesscroll").innerHTML +=
              '<div class="minemessage" id="msg_' + my_msg.message_id + '"><h4>' +
              date_msg +
              "</h4><h3>" +
              text +
              "</h3></div>";
          }
        });
      } else {
        // Сообщение не моё
        const date = new Date(Date.parse(element.send_datetime));
        current_chat_messages.push(element.message_id);
        text = await decryptAlienMessage(
          element.encrypted_text,
          current_user_chat_id
        );
        fromFriend = true;

        const date_msg =
          date.getDate() +
          "." +
          (date.getMonth() + 1) +
          "," +
          date.getHours() +
          ":" +
          date.getMinutes();
        document.getElementById("messagesscroll").innerHTML +=
          '<div class="friendmessage" id="msg_' + element.message_id + '"><h4>' +
          date_msg +
          "</h4><h3>" +
          text +
          "</h3></div>";
      }
    }
  });
}

window.onload = async () => {
  const accessToken = localStorage.getItem("access_token")

  if (accessToken == null) {
    document.location.replace("/login.html");
    return
  }

  await getCurrentUser();
  getAllConversations();

  const scrollDiv = document.getElementsByClassName('messagesscrollbar')[0]
  scrollDiv.addEventListener("scroll", async function() {
    if (scrollDiv.scrollTop === 0) {
      const topMsgId = current_chat_messages[0]
      console.log('Loading more messages from ' + topMsgId)

      let my_messages = localStorage.getItem(
        user_id + "_" + current_user_chat_id + "_my_messages"
      );
      if (my_messages != null) {
        my_messages = JSON.parse(my_messages);
      } else {
        my_messages = [];
      }


      await getData("api/v1/conversations/" + current_conversation_id + "/messages?count=20&from_message_id=" + topMsgId).then(async (data) => {
        for (const element of data.slice()) {
          if (current_chat_messages.includes(element.message_id)) {
            continue
          }

          if (element.sender_user_id == user_id) {
            my_messages.forEach((my_msg) => {
              if (my_msg.message_id == element.message_id) {
                // Сообщение моё
                const date = new Date(Date.parse(my_msg.send_datetime));
                current_chat_messages.splice(0, 0, my_msg.message_id);
                text = my_msg.plain_text;
                fromFriend = false;
    
                const date_msg =
                  date.getDate() +
                  "." +
                  (date.getMonth() + 1) +
                  "," +
                  date.getHours() +
                  ":" +
                  date.getMinutes();
    
                document.getElementById("messagesscroll").innerHTML =
                  '<div class="minemessage" id="msg_' + my_msg.message_id + '"><h4>' +
                  date_msg +
                  "</h4><h3>" +
                  text +
                  "</h3></div>" + document.getElementById("messagesscroll").innerHTML;

                const topMsgElem = document.getElementById('msg_' + topMsgId)
                if (topMsgElem != null) {
                  scrollDiv.scrollTop = topMsgElem.offsetTop - 20
                }
              }
            });
          } else {
            // Сообщение не моё
            const date = new Date(Date.parse(element.send_datetime));
            current_chat_messages.splice(0, 0, element.message_id);
            text = await decryptAlienMessage(
              element.encrypted_text,
              current_user_chat_id
            );
            fromFriend = true;
    
            const date_msg =
              date.getDate() +
              "." +
              (date.getMonth() + 1) +
              "," +
              date.getHours() +
              ":" +
              date.getMinutes();
            document.getElementById("messagesscroll").innerHTML =
              '<div class="friendmessage" id="msg_' + element.message_id + '"><h4>' +
              date_msg +
              "</h4><h3>" +
              text +
              "</h3></div>" + document.getElementById("messagesscroll").innerHTML;
            
            const topMsgElem = document.getElementById('msg_' + topMsgId)
            if (topMsgElem != null) {
              scrollDiv.scrollTop = topMsgElem.offsetTop - 20
            }
          }
        }
      });

      const topMsgElem = document.getElementById('msg_' + topMsgId)
      if (topMsgElem != null) {
        scrollDiv.scrollTop = topMsgElem.offsetTop - 20
      }
    }
  });


  // запуск реал тайм сообщений
  const socket = new WebSocket("wss://chat-back.kekdev.top/conv_ws");



  // Обработчик события при получении сообщения от сервера
  socket.addEventListener("message", async (event) => {
    const message = event.data;
    console.log("Получено ws сообщение: " + message);
    const msg_obj = JSON.parse(message)

    if (msg_obj.conversation_id == current_conversation_id && msg_obj.sender_user_id != user_id && !(current_chat_messages.includes(msg_obj.message_id))) {
      console.log('adding msg from ws')
      
      const date = new Date(Date.parse(msg_obj.send_datetime));
      current_chat_messages.push(msg_obj.message_id);
      text = await decryptAlienMessage(
        msg_obj.encrypted_text,
        current_user_chat_id
      );
      fromFriend = true;

      const date_msg =
        date.getDate() +
        "." +
        (date.getMonth() + 1) +
        "," +
        date.getHours() +
        ":" +
        date.getMinutes();
      document.getElementById("messagesscroll").innerHTML +=
        '<div class="friendmessage" id="msg_' + msg_obj.message_id + '"><h4>' +
        date_msg +
        "</h4><h3>" +
        text +
        "</h3></div>";
      
      const scrollDiv = document.getElementsByClassName('messagesscrollbar')[0]
      if (scrollDiv != null) {
        scrollDiv.scrollTop = scrollDiv.scrollHeight
      } 
    }
  });

  // Обработчик события при открытии соединения
  socket.addEventListener("open", (event) => {
    console.log("Соединение установлено")
    socket.send(accessToken)
  });

  // Обработчик события при закрытии соединения
  socket.addEventListener("close", (event) => {
    if (event.wasClean) {
        console.log("Соединение закрыто корректно");
    } else {
        console.error("Соединение разорвано");
    }
  });

  // Обработчик события при возникновении ошибки
  socket.addEventListener("error", (event) => {
    console.error("Ошибка соединения: " + event.message);
  });
};
