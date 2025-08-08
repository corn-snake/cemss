import { FragmentPath, render } from "./compose.js";

const suffix = (num) => ["??","er","do","er","to","to","to","mo","vo","no","mo","vo","vo","er","to","to"][num];
const pPrim = { a: "Septiembre-Diciembre", b: "Enero-Abril", c: "Mayo-Agosto" };
const nextTerm = (num, key) => key.toUpperCase() == "B" ? {year: num + 1, claveCuatri: "C"} : key.toUpperCase() === "A" ? {year: num, claveCuatri: "B"} : {year: num, claveCuatri: "A"},
    termFromMonthNumber = n => n < 5 ? "B" : n < 9 ? "C" : "A",
    getTermDistance = (one,two) => {};
const periods = key => pPrim[key];

const renderGroups = (gList) => `\
        <h3>Grupos</h3>
        <div class="group-list">
${gList.length < 1 ? "Nada que mostrar." : gList.map(g => `
        <div class="group-card" onclick="displayGroup('${g.idGrupo}')">
            <h4>${g.nombre}</h4>
            <p>${g.cuatrimestre}${suffix(g.cuatrimestre)} Cuatrimestre</p>
            <p>${g.cantidad} integrantes</p>
        </div>`).join("")}
        </div>`,
  renderGroupInfo = (cList, aList, gInfo) => `\
        <h2>Grupo ${gInfo.nombre}</h2>
        <section class="group-meta">
            <p>A&ntilde;o de ingreso: ${gInfo.nombre.match(/[0-9]+/)[0]}, en el periodo ${periods(gInfo.idGrupo.match(/[abcABC]/)[0])}</p>
        </section>
        <section class="group-list-classes">
            <header class="class-header">
                <h3>Listado de clases activas</h3>
                <button class="adm-btn class-dialogue-open" onclick="displayCreateClass()">+ A&ntilde;adir</button>
            </header>
            <div id="classes-list">
                <article id="classMaker" class="subject-adm h">
                    <p>
                        <h3 style="display: inline">Crear clase</h3>
                        <input name="copyActivitiesToggle" id="copyActivitiesToggle" type="checkbox"/><label for="copyActivitiesToggle">Copiar libro y cuadernillo (material y actividades)?</label>
                    </p>
                    <span id="copyClassWrap" class="h"><label for="createClassCopyFrom">Copiar desde:</label>&ensp;<select name="createClassCopyFrom" id="createClassCopyFrom"></select></span><br/>
                    <label for="createClassTitle">Nombre:</label>&ensp;<input id="createClassTitle"/><br/>
                    <label for="createClassTeacher">Supervisa:</label>&ensp;<select name="createClassTeacher" id="createClassTeacher"></select><br/>
                    <label for="createClassTerm">Cuatrimestre:</label>&ensp;<select name="createClassTerm" id="createClassTerm"></select><br/>
                    <label for="createClassGroup">Grupo:</label>&ensp;<select name="createClassGroup" id="createClassGroup">
                    </select><br/>
                    <button class="adm-btn" id="createClassSubmit">Finalizar</button>
                </article>
${cList.length < 1 ? `\
                <p class="notice">Este grupo todav&iacute;a no tiene clases asignadas.</p>
` : cList.map(i => `\
                <article class="subject-adm">
                    <h3>${i.nombre}</h3>
                    <p>Supervisa: <span>${i.nomMaestro}</span></p>
                    <button class="adm-btn" onclick="detailClass('${i.idClase}')">Ver actividades</button>
                    <div id="activity-list-${i.idClase}"></div>
                </article>`)}
            </div>
        </section>
        <section class="group-list-alumni">
            <header class="alumna-adm">
                <h3>Lista de alumnos</h3>
                <button class="adm-btn alumnus-dialogue-open">+ Registrar</button>
            </header>
${aList.length < 1 ? `\
            <p class="notice">Este grupo todav&iacute;a no tiene alumnos.</p>` : `\
            <ul class="alumni">
${aList.map(a => `\
                <li class="alumnus"><span class="matricula">${a.idAlumno}</span>&ensp;&ndash;&ensp;<span class="alumnus-name">${a.nomAlumno}</span></li>`).join("\n")}
            </ul>`}
        </section>
    `,
  renderTeacherOptions = tList => tList.map(t => `\
        <option value="${t.idMaestro}">${t.nomMaestro}</option>`).join("\n"),
  renderClassCopyOptions = cList => cList.map(c => `\
        <option value="${c.idClase}">${c.nombre} &mdash; ${c.year} ${c.claveCuatri}</option>`).join("\n"),
  renderTermOptions = tList => tList.map(t => `\
        <option value="${t.year}${t.claveCuatri}">${periods(t.claveCuatri.toLowerCase())} ${t.year}</option>`).join("\n"),
  renderGroupOptions = gList => gList.map(g => `\
        <option value="${g.idGrupo}">${g.nombre}, para ${g.cuatrimestreActual + 1}${suffix(g.cuatrimestreActual + 1)}</option>`).join("\n"),
  renderTerms = async(trList, tmList) => render(`\
      <section>${trList.map(t => `
        <h2>Cuatrimestres</h2>
        <article class="subject-adm">
            <span style="span"><h3>${t.year} ${t.claveCuatri} (${periods(t.claveCuatri.toLowerCase())})</h3></span>
            <ul>
                <li>Finaliza admisiones: ${t.fechaFinAdmis}
                <ul>
                  <li>Prórroga: ${t.fechaProrroga}</li>
                </ul>
                </li>
                <li>Inicia primer extraordinario: ${t.primerExtra}</li>
                <li>Inicia segundo extraordinario: ${t.segundoExtra}</li>
                <li>
                  <span class="span">
                    Cierre total: ${t.fechaFin}
                    <button class="adm-btn redaction">ConfirmarCierre</button>
                  </span>
                </li>
            </ul>
        </article>`).join("\n")}
      </section>`,
      `
      <section class="template-sect">
        <header class="class-header">
          <h2>Plantillas disponibles</h2>
          <button class="adm-btn" onclick="alert('${tmList.at(-1).cuatrimestre + 1}')">Falta un cuatrimestre?</button>
        </header>`,
        await FragmentPath("staff/uploadFile.html"),
        `
        <div class="template-list classes-list">`,
      tmList.map((t,i)=>render(
        i && tmList[i - 1].cuatrimestre !== t.cuatrimestre ? `
            </section>
          </article>` : "",
        !i || tmList[i-1].cuatrimestre !== t.cuatrimestre ? `
          <article class="subject-adm">
            <h2>${t.cuatrimestre}${suffix(t.cuatrimestre)} cuatrimestre</h2>
            <section>` : "",
        i && tmList[i-1].cuatrimestre === t.cuatrimestre && tmList[i-1].legacy !== t.legacy ?
          `
            </section>
            <section>
              </h4>Plan anterior:</h4>
          ` : "",
        `<button class="adm-btn" onclick="alert('${t.idPlantilla}')">${t.nombre}</button>`
      )).join("\n"),
      `
            </section>
          </article>
        </div>
      </section>`
    );

const renderClases = (cList, alumni) =>`\
        <h3>Clases</h3>
        <div class="group-list">
${cList.length < 1 ? "Nada que mostrar." : cList.map(c=>`
            <div class="group-card" onclick="displayClass('${c.idPlantilla}')">
                <h4>${c.nombre}${alumni ? `&emsp;<label class="smallabel" for="${c.idPlantilla}-progress">Progreso: </label><progress id="${c.idPlantilla}-progress" name="${c.idPlantilla}-progress" class="classProgress" max="${c.totalPartes}" value="0">0%</progress>` : ""}</h4>
                <p>Grupo ${c.nomGrupo}&ensp;|&ensp;${c.cuatrimestreActual}${suffix(c.cuatrimestreActual)} cuatrimestre</p>${alumni ? `
                <p>Supervisa: ${c.nomMaestro}</p>` : ""}
            </div>`)}
        </div>`;

const renderClassCard = (mInfo, cInfo, template, block, topic)=>`
                    <article class="class-display">
                        <header>
                            <h2 id="materia-actual">${cInfo.nombre}</h2>
                            <p><label class="smallabel" for="mainProgress">Progreso: </label><progress class="classProgress" max="${cInfo.totalActs}" value="${cInfo.fullProg - 1}" name="mainProgress">${cInfo.fullProg - 1} de ${cInfo.totalActs} actividades totales.</progress></p>
                        </header>
                        <main id="currentCard">
                            <span><h3>Progresi&oacute;n actual: </h3><span class="progActual">${cInfo.currentBlock}</span> (${block}/${cInfo.totalTemas})</span>
                            <span><h3>Siguiente asignatura: </h3><a class="progActual forwardlink" onclick='displayActivity("${template}", ${block}, ${topic})'>${topic > mInfo.length ? `Examen!` : `${cInfo.currentAct}</a> (${ topic }/${ mInfo.length })`}</span>
                        </main>
                    </article>
`,
    renderActivityCard = (acts, template, block, current)=>{
        const first = acts[0].idMaterial === current,
            last = !first && acts.length === 2;
        return `
                            <header>
                                <h3 id="anchor">${!first ? acts[1].titulo : acts[0].titulo}</h3>
                            </header>
                            <div id="currentActivityView">
                                ${first ? acts[0].contenido : acts[1].contenido}
                            </div>
                            <footer><nav>
                                <a class="backlink" onclick='displayActivity("${template}", ${block}, ${current - 1})'>${!first ? acts[0].titulo : ""}</a>
                                <span>${!first && !last ? "|" : ""}</span>
                                <a class="forwardlink" onclick='displayActivity("${template}", ${block}, ${current + 1})'>${!last ? acts.at(-1).titulo : "Examen!"}</a>
                            </nav></footer>
                        `;
    };

export {renderGroups, renderClases, renderGroupInfo, renderTeacherOptions, renderClassCopyOptions, renderTermOptions, renderTerms, renderGroupOptions, renderClassCard, renderActivityCard, termFromMonthNumber};