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

  localStorage.setItem(user_id_to_chat_with + "_public", exportedAsBase64);
  localStorage.setItem(
    user_id_to_chat_with + "_private",
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
