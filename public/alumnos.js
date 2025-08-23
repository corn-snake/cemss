window.commitProgress = ()=>{
    localStorage.setItem("progress", JSON.stringify(progreso));
    const fd = new FormData();
    fd.append("tkn", localStorage.getItem("tkn"));
    fd.append("progreso", localStorage.getItem("progress"));
    fetch("/alumnos/commitProgreso", { method: "PUT", body: fd });
};
window.getProgress = (itemName) => {
    if (typeof progreso[itemName] === "undefined"){
        progreso[itemName] = 1;
        commitProgress();
    }
    return progreso[itemName];
};
window.resetProgress = () => fetch("/alumnos/progreso", {method: "POST", body:localStorage.getItem("tkn")}).then(r => r.json()).then(t=>{
    localStorage.setItem("progress", JSON.stringify(t));
    window.progreso = t;
});

window.displayClass = (name) => fetch("/alumnos/clase", {method: "POST", body: `{"tkn": "${localStorage.getItem("tkn")}", "plantilla": "${name}", "material": ${getProgress(name)}}`}).then(r=>r.text()).then(t=>document.getElementById("classwrap").innerHTML = t);

window.displayActivity = (template, number, add) => fetch("/alumnos/act", { method: "POST", body: `{"tkn":"${localStorage.getItem("tkn")}", "plantilla": "${template}", "material": ${number}}` }).then(r => r.text()).then(t => document.getElementById("currentCard").innerHTML = t)
    .then(document.getElementById("materia-actual").scrollIntoView())
    .then(()=>{
    progreso[template] = number;
    commitProgress();
}).then(()=>{
    if (add === 0) return;
    document.getElementById("mainClassProgress").value = number;
    document.getElementById(`${template}-progress`).value = number;
});

window.getExam = (template, block) => fetch("/alumnos/quiz", { method: "POST", body: `{"tkn":"${localStorage.getItem("tkn")}", "plantilla": "${template}", "tema":${block}}` }).then(r => r.text()).then(t => document.getElementById("currentCard").innerHTML = t);

window.init = () => fetch("/alumnos", { method: "POST", body: localStorage.getItem("tkn") }).then(e => e.text()).then(e => document.getElementById("main").innerHTML = e).then(() => {
    if (localStorage.getItem("progress")) {
        return window.progreso = JSON.parse(localStorage.getItem("progress"));
    } else
        return resetProgress();
}).then(() => [...(document.querySelectorAll("progress.classProgress"))].forEach(e =>
    e.value = getProgress(e.id.match(/.*(?=-progress)/i)[0])));

if (document.getElementById("disp") === null)
    init();

window.setResponse = (v,isOption,number) => {
    if (isOption && typeof window.selOption === "undefined")
        return;
    if (typeof window.responses === "undefined")
        window.responses = [];
    if (isOption){
        if (typeof responses[number] === "undefined")
            responses[number] = {};
        return responses[number][selOption] = v;
    }
    return responses[number] = v;
}

window.setSelected = (o,lock) => {
    return window.selOption = {o, lock};
}

window.send = () => {
    const reactivos = [...(document.querySelectorAll(".reactivo"))];
    for (const i of reactivos)
        if (i.value === "" || typeof i.value === "undefined")
            return shake(document.querySelector(`.item:has(#${i.id})`))
};

window.showMarks = () => fetch("/alumnos/califs", { method: "POST", body: localStorage.getItem("tkn") }).then(r => r.text()).then(t => document.getElementById("classwrap").innerHTML = t);