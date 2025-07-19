import { access, AccessMode } from "@attalliayoub/fs-access"
import { HttpError } from "@oak/oak"

const FragmentPath = async (s) => {
    if (s.indexOf("../") > -1) return new Promise(resolve=>resolve(new HttpError("no access :/")));
    try {
        await access(`./sectors/${s}`, AccessMode.R_OK)
    } catch (e) {
        return new HttpError("no access :/");
    }
    return await Deno.readTextFile(`./sectors/${s}`);
}
const render = (...s) => {
    let a = "";
    for (const param of s){
        if (typeof param !== "string")
            if (param instanceof HttpError)
                throw param
            else
                return new TypeError("render function only accepts strings");
        a += "\n" + param;
    }
    return a.trim();
};

const romanHash = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};
function romanToInt(s) {
  let accumulator = 0;for (let i = 0; i < s.length; i++) {
    if (s[i] === "I" && s[i + 1] === "V") {
      accumulator += 4;
      i++;
    } else if (s[i] === "I" && s[i + 1] === "X") {
      accumulator += 9;
      i++;
    } else if (s[i] === "X" && s[i + 1] === "L") {
      accumulator += 40;
      i++;
    } else if (s[i] === "X" && s[i + 1] === "C") {
      accumulator += 90;
      i++;
    } else if (s[i] === "C" && s[i + 1] === "D") {
      accumulator += 400;
      i++;
    } else if (s[i] === "C" && s[i + 1] === "M") {
      accumulator += 900;
      i++;
    } else {
      accumulator += romanHash[s[i]];
    }
  }
  return accumulator;
}

export { FragmentPath, render, romanToInt };