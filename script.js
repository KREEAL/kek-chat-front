class message {
  constructor(sender, date, text) {
    this.sender = sender;
    this.date = date;
    this.text = text;
  }
}

let messages = [];

let msg = null;

for (let i = 0; i < 10; i++) {
  msg = new message("Арсений", "31.08.99. 21:50", "Поздравляю с Новым Годом");
  messages.push(msg);
}

function addMessageToScroll(date_msg, message, fromFriend) {
  let elem = document.getElementById("messagesscroll");
  if (fromFriend == false) {
    elem.innerHTML +=
      '<div class="minemessage"><h4>' +
      date_msg +
      "</h4><h3>" +
      message +
      "</h3></div>";
    //прокрутка скролбара
    //elem.scrollIntoView({
    //  behavior: "smooth",
    //  block: "end",
    //  inline: "nearest",
    //});
  } else {
    document.getElementById("messagesscroll").innerHTML +=
      '<div class="friendmessage"><h4>' +
      date_msg +
      "</h4><h3>" +
      message +
      "</h3></div>";
    //прокрутка скролбара
    //elem.scrollTop = elem.scrollHeight;
    //scroll.animate({
    //  scrollLeft: scroll.get()[0].scrollWidth,
    //});
  }
}

const loginBtn = document.getElementById("login");
const signupBtn = document.getElementById("signup");

/*loginBtn.addEventListener("click", (e) => {
  let parent = e.target.parentNode.parentNode;
  Array.from(e.target.parentNode.parentNode.classList).find((element) => {
    if (element !== "slide-up") {
      parent.classList.add("slide-up");
    } else {
      signupBtn.parentNode.classList.add("slide-up");
      parent.classList.remove("slide-up");
    }
  });
});*/

signupBtn.addEventListener("click", (e) => {
  let parent = e.target.parentNode;
  Array.from(e.target.parentNode.classList).find((element) => {
    if (element !== "slide-up") {
      parent.classList.add("slide-up");
    } else {
      loginBtn.parentNode.parentNode.classList.add("slide-up");
      parent.classList.remove("slide-up");
    }
  });
});

function mockSendMessage() {
  const input = document.getElementById("inputmessage");
  if (input.value != "") {
    const now = new Date();
    addMessageToScroll(
      now.getHours() + ":" + now.getMinutes(),
      input.value,
      false
    );
  }
}

document
  .querySelector("#inputmessage")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      mockSendMessage();
    }
  });

function showtofa() {
  document.getElementById("2fa_container").style.visibility = "visible";
}

new QRCode();
