/*async function sha512(str) {
    if (typeof window.crypto.subtle == "undefined")
        return alert("subtle" in self.crypto);
    return window.crypto.subtle.digest("SHA-512", new TextEncoder("utf-8").encode(str)).then(buf => {
        return Array.prototype.map.call(new Uint8Array(buf), x => (('00' + x.toString(16)).slice(-2))).join('');
    });
}*/
const verify = async (callback) => {
    if ((document.getElementById("username").value.length ?? 0) < 5 || (document.getElementById("password").value.length ?? 0) < 5)
        return;
    await fetch(location.pathname, {
        method: "POST",
        body: `["${document.getElementById("username").value}","${await sha512(document.getElementById("password").value)}"]`
    }).then(r => {
        if (r.status != 200) return false;
        return r.text();
    }).then(rt => {
        if (rt === false) return rt;
        localStorage.setItem("tkn", rt);
        return true;
    }).then(callback);
}

const check = async()=>{
    const tkn = localStorage.getItem("tkn"),
        pref = location.pathname.substring(location.pathname.indexOf("/", 3) + 1);
    if (tkn == null || (await fetch(`${location.origin}/login/check/${pref}`, {method: "POST", body: tkn}).catch(e => false).then(a => a.json()).catch(e => false)) === false) {
        localStorage.removeItem("tkn");
        return;
    }
    location.pathname = pref;
}
check();