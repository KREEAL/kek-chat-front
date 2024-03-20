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

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

let exportedPubRaw = await window.crypto.subtle.exportKey(
  "spki",
  keyPair.publicKey
);

let exportedPrivateRaw = await window.crypto.subtle.exportKey(
  "spki",
  keyPair.privateKey
);

const exportedAsBase64 = window.btoa(ab2str(exportedPubRaw));
const exportedPrivateAsBase64 = window.btoa(ab2str(exportedPrivateRaw));
