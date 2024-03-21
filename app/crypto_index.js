function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

async function createAndSaveKeyPairForUserChatConversationWithLocalStorage(
  user_id_to_chat_with
) {
  let keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
  let exportedPubRaw = await window.crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey
  );

  let exportedPrivateRaw = await window.crypto.subtle.exportKey(
    "pkcs8",
    keyPair.privateKey
  );

  const exportedAsBase64 = window.btoa(ab2str(exportedPubRaw));
  const exportedPrivateAsBase64 = window.btoa(ab2str(exportedPrivateRaw));

  localStorage.setItem(
    user_id + "_" + user_id_to_chat_with + "_public",
    exportedAsBase64
  );
  localStorage.setItem(
    user_id + "_" + user_id_to_chat_with + "_private",
    exportedPrivateAsBase64
  );

  postData("api/v1/conversations", {
    recipient_id: user_id_to_chat_with,
    public_key: exportedAsBase64,
  }).then((data) => {
    document.getElementById("inputuserfinder").value = "";
    getAllConversations();
  });
}

async function createAndSaveKeyPairForComplete(
  user_id_to_chat_with,
  conversation_id
) {
  let keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
  let exportedPubRaw = await window.crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey
  );

  let exportedPrivateRaw = await window.crypto.subtle.exportKey(
    "pkcs8",
    keyPair.privateKey
  );

  const exportedAsBase64 = window.btoa(ab2str(exportedPubRaw));
  const exportedPrivateAsBase64 = window.btoa(ab2str(exportedPrivateRaw));

  localStorage.setItem(
    user_id + "_" + user_id_to_chat_with + "_public",
    exportedAsBase64
  );
  localStorage.setItem(
    user_id + "_" + user_id_to_chat_with + "_private",
    exportedPrivateAsBase64
  );

  postData("api/v1/conversations/" + conversation_id + "/complete", {
    public_key: exportedAsBase64,
  }).then((data) => {
    document.getElementById("inputuserfinder").value = "";
    getAllConversations();
  });
}

async function encryptMyMessage(msg_text, user_id_chat) {
  const pemContents = localStorage.getItem(
    user_id + "_" + user_id_chat + "_public_alien"
  );
  // base64 decode the string to get the binary data
  const binaryDerString = window.atob(pemContents);
  // convert from a binary string to an ArrayBuffer
  const binaryDer = str2ab(binaryDerString);

  const alien_public_key = await window.crypto.subtle.importKey(
    "spki",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );

  let enc = new TextEncoder('utf-8');
  let encoded = enc.encode(msg_text);

  enc_text = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    alien_public_key,
    encoded
  );

  return window.btoa(ab2str(enc_text));
}

async function decryptAlienMessage(encrypted_msg_text, user_id_chat) {
  const pemContents = localStorage.getItem(
    user_id + "_" + user_id_chat + "_private"
  );
  let dec = new TextDecoder('utf-8');
  // base64 decode the string to get the binary data
  const binaryDerString = window.atob(pemContents);
  // convert from a binary string to an ArrayBuffer
  const binaryDer = str2ab(binaryDerString);
  const my_private_key = await window.crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );

  decrypted_txt = await window.crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    my_private_key,
    str2ab(window.atob(encrypted_msg_text))
  );
  return (dec.decode(decrypted_txt));
}

function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
