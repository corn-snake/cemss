var subst = true;
const parseBlockInfo = o => {
  if (!(o instanceof HTMLOutputElement)) return "faulty";
  const type = o.querySelector("p:has(+h1:first-of-type)").textContent.match(/libro|cuaderno/i)[0];
  const partQualif = /(?:progresi[oó]\u0341?n|bloque)\s+[0-9]+/i;
  const name = o.querySelector("p:has(+ :is(p,h1))").textContent.match(/[A-Za-zÀ-ÿ]+\s+[IVX]*/i)[0],
    content = o.querySelectorAll("h1 ~ :is(p,ul,ol):has(+h1) ~ *"),
    units = [],
    mode = subst ? "replace" : "obsolete";
  let flag = false;
  if (type[0].toUpperCase() === "CUADERNO") {
    for (i of content) {
      if (units.length < 1 && !(partQualif.test(i.textContent))) continue;
      if (partQualif.test(i.textContent)){
        units.push({number: parseInt(i.textContent.match(/[0-9]+/)[0]), questions: []})
        continue;
      }
      if (i.nodeName == "H1") {
      }
    }
    return {name, units, type, mode};
  }
  for (i of content) {
    if (units.length < 1 && !(partQualif.test(i.textContent))) continue;
    if (partQualif.test(i.textContent)){
      units.push({number: parseInt(i.textContent.match(/[0-9]+/)[0]), lessons: []})
      flag = true;
      continue;
    }
    if (flag) {
      units.at(-1).name = i.textContent.trim();
      flag = false;
      continue;
    }
    if (i.nodeName === "H2") {
      units.at(-1).lessons.push({ name: i.textContent.trim(), content: "" });
      continue;
    }
    units.at(-1).lessons.at(-1).content += i.outerHTML;
  }
  return { name, units, type, mode };
};

var isAdvancedUpload = function() {
  var div = document.createElement('div');
  return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FileReader' in window;
}();
const funnyShit = () => {
  const scrInj = document.createElement("script");
  fetch("/scripts/mammoth").then(r => r.text()).then(t => scrInj.textContent = t).then(document.head.appendChild(scrInj));
  const form = document.getElementById('form-word-upload'),
    input = document.querySelector('#form-word-upload input[type="file"]'),
    label = document.querySelector('#form-word-upload label'),
    output = document.getElementById("processed-word-html"),
    out = (html) => {
      output.innerHTML = html;
      const read = parseBlockInfo(output),
        fd = new FormData();
      fd.append("read", JSON.stringify(read));
      fd.append("tkn", localStorage.getItem("tkn"));
      fetch("/staff/word", { method: "POST", body: fd }).then(r=>r.text()).then(t=>document.getElementById("processed-listing").innerHTML = t);
    },
    mammothise = async () =>
      mammoth.convertToHtml({arrayBuffer: await input.files[0].arrayBuffer()}).then(r=>r.value).then(t=>{
        out(t);
        form.classList.remove("is-uploading");
        form.classList.add("is-success");
      }),
    showFiles = (files) => {
      label.textContent = (files.length > 1 ? (input.getAttribute('data-multiple-caption') || '').replace( '{count}', files.length) : files[0].name);
    };
  input.addEventListener("change", e => {
    e.preventDefault();
    e.stopPropagation();
    showFiles(e.target.files);
    form.dispatchEvent(new Event("submub"));
  });
  document.getElementById("submub").addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();
    showFiles(e.target.files);
    form.dispatchEvent(new Event("submub"));
  });
  form.addEventListener('submub', async function() {
    if (form.classList.contains('is-uploading')) return false;

    form.classList.add('is-uploading');
    form.classList.remove('is-error');
    form.classList.remove("is-success");

    if (input.files.length < 1) return false;
    mammothise();
    return false;
  });
  document.querySelector(".box__success").addEventListener("click", e => mammothise());
  if (!isAdvancedUpload) return;
  form.classList.add('has-advanced-upload');
  var droppedFiles = false;
  form.addEventListener('drag', function (e) {
    e.preventDefault();
    e.stopPropagation();
  });
  form.addEventListener('dragstart', function (e) {
    e.preventDefault();
    e.stopPropagation();
  });
  form.addEventListener('dragend', function (e) {
    e.preventDefault();
    e.stopPropagation();
  });
  form.addEventListener('dragover', function (e) {
    e.preventDefault();
    e.stopPropagation();
  });
  form.addEventListener('dragenter', function (e) {
    e.preventDefault();
    e.stopPropagation();
  });
  form.addEventListener('dragleave', function (e) {
    e.preventDefault();
    e.stopPropagation();
  });
  form.addEventListener('dragover', ()=>
    form.classList.add('is-dragover')
  );
  form.addEventListener('dragenter', ()=>
    form.classList.add('is-dragover')
  );
  form.addEventListener('dragleave', ()=>
    form.classList.remove('is-dragover')
  );
  form.addEventListener('dragend', ()=>
    form.classList.remove('is-dragover')
  );
  form.addEventListener('drop', e =>{
    e.preventDefault();
    e.stopPropagation();
    form.classList.remove('is-dragover');
    input.files = droppedFiles = e.dataTransfer.files;
    showFiles(droppedFiles);
    form.dispatchEvent(new Event("submub"));
  });
  document.getElementById("mode-represent").addEventListener("click", e=>{
    subst = !subst;
    document.getElementById("mode-represent").textContent = subst ? "reemplazo" : "siguiente cuatri";
  });
};