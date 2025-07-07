import { access, AccessMode } from "@attalliayoub/fs-access"
import { HttpError } from "@oak/oak"

const HTMLPath = async (s) => {
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

export { HTMLPath, render };