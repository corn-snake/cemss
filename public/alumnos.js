if (localStorage.getItem("progress"))
    window.progreso = JSON.parse(localStorage.getItem("progress"));
    else
        fetch("/alumnos/progreso", {method: "POST", body:localStorage.getItem("tkn")}).then(r => r.text()).then(t=>{
            localStorage.setItem("progress", t);
            window.progreso = JSON.parse(t)
        });

window.commitProgress = ()=>{
    localStorage.setItem("progress", JSON.stringify(progreso));
    const fd = new FormData();
    fd.append("tkn", localStorage.getItem("tkn"));
    fd.append("progreso", localStorage.getItem("progress"));
    fetch("/alumnos/commitProgreso", { method: "PUT", body: fd });
};
window.getProgress = (itemName) => {
    if (typeof progreso[itemName] === "undefined"){
        progreso[itemName] = {tema: 1, material: 1};
        commitProgress();
    }
    return progreso[itemName];
};
window.resetProgress = () => {
    fetch("/alumnos/progreso", {method: "POST", body:localStorage.getItem("tkn")}).then(r => r.text()).then(t=>{
        localStorage.setItem("progress", t);
        window.progreso = JSON.parse(t)
    });
};

window.displayClass = (name) => fetch("/alumnos/clase", {method: "POST", body: `{"tkn": "${localStorage.getItem("tkn")}", "plantilla": "${name}", "tema": ${getProgress(name).tema}, "material": ${getProgress(name).material}}`}).then(r=>r.json()).then(r=>{
    document.getElementById("disp").classList.add("init");
    document.getElementById("classwrap").innerHTML = r.render;
});

window.displayActivity = (template, block, number) => fetch("/alumnos/act", { method: "POST", body: `{"tkn":"${localStorage.getItem("tkn")}", "plantilla": "${template}", "tema": ${block}, "material": ${number}}` }).then(r => r.text()).then(t => document.getElementById("currentCard").innerHTML = t).then(document.getElementById("materia-actual").scrollIntoView());