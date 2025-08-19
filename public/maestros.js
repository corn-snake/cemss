window.init = () => {
    fetch(location.pathname, {method: "POST", body: localStorage.getItem("tkn")}).then(e=>e.text()).then(e=>document.getElementById("main").innerHTML = e);
};
window.extraScripts = (t=false)=>{
    fetch(`/staff/check${t ? `/?rl=${t}` : ""}`, {method: "POST", body:localStorage.getItem("tkn")}).then(e=>e.text()).then(t=>{if(t.length >0) {
        let s = document.getElementById("extrascripts");
        if (s!== null) document.head.removeChild(s);
        s = document.createElement("script");
        s.id = "extrascripts";
        s.textContent = t;
        document.head.appendChild(s);
    } });
}

if (document.getElementById("disp") === null){
    window.init();
    window.extraScripts();
}

window.displayGroup = (gID)=>fetch(`/staff/g/${gID}`, {method: "POST", body: localStorage.getItem("tkn")}).then(e=>e.text()).then(t=>document.getElementById("disp").innerHTML = t);

window.displayClass = (template, gID) => fetch(`/staff/c`, {method: "POST", body: `{"tkn": "${localStorage.getItem("tkn")}", "group": "${gID}", "template": "${template}"}`}).then(r=>r.text()).then(t=>document.getElementById("disp").innerHTML = t);