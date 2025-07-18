const parseBlockInfo = o => {
  if (!(o instanceof HTMLOutputElement)) return "faulty";
  const partQualif = /(?:progresi[oó]\u0341?n|bloque)\s+[0-9]+/i;
  const name = o.querySelector("p").textContent,
    index = o.querySelectorAll("h1 ~ :is(p,ul,ol):has(~h1) a[href]"),
    units = [];
  let flag = false;
  for (i of index) {
    if (units.length < 1 && !(partQualif.exec(i.textContent))) continue;
    if (partQualif.exec(i.textContent)){
      units.push({number: i.textContent.match(/[0-9]+/)[0], lessons: []})
      flag = true;
      continue;
    }
    if (flag) {
      units.at(-1).name = i.textContent;
      flag = false;
      continue;
    }
    units.at(-1).lessons.push({title: i.textContent.trim})
  }
  if (units.length < 1) return "wrong";
  const content = o.querySelectorAll("h1 ~ :is(p,ul,ol):has(+h1) ~ *");
  let count = 0;
  for (i of content) {
    if (partQualif.exec(i.textContent))
      count = parseInt(i.textContent.match(/[0-9]+/)[0]) - 1;
    if (i.nodeName == "H2")
    units.at(count).lessons
  }
  return { name, units };
};

var isAdvancedUpload = function() {
  var div = document.createElement('div');
  return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FileReader' in window;
}();
const funnyShit = () => {
  const form = document.getElementById('form-word-upload'),
    input = document.querySelector('#form-word-upload input[type="file"]'),
    label = document.querySelector('#form-word-upload label'),
    output = document.getElementById("processed-word-html"),
    out = (html) => {
      output.innerHTML = html;
      document.getElementById("processed-listing").innerHTML = JSON.stringify(parseBlockInfo(output), null, "\t");
    },
    showFiles = (files) => {
      label.textContent = (files.length > 1 ? (input.getAttribute('data-multiple-caption') || '').replace( '{count}', files.length) : files[0].name);
    };
  form.addEventListener("change", e => showFiles(e.target.files));
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
  document.getElementById("submub").addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();
    form.dispatchEvent(new Event("submub"));
  });
  form.addEventListener('submub', function() {
    if (form.classList.contains('is-uploading')) return false;

    form.classList.add('is-uploading');
    form.classList.remove('is-error');
    form.classList.add("is-remove");

    const fd = new FormData(form);
    fd.append("tkn", localStorage.getItem("tkn"));
    if (input.files.length < 1) return false;
    fetch("/staff/parseWord", { method: "POST", body: fd }).then(r=>r.text()).then(t=>{
      out(t);
      form.classList.remove("is-uploading");
      form.classList.add("is-success");
    });
    return false;
  });
};