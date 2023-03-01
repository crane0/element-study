export function isDef(val) {
  return val !== undefined && val !== null;
}
// String.fromCodePoint('\uAC00'.codePointAt()) 能得到对应的韩文
export function isKorean(text) {
  const reg = /([(\uAC00-\uD7AF)|(\u3130-\u318F)])+/gi;
  return reg.test(text);
}
