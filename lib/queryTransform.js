import { FragmentPath, render } from "./compose.js";

const suffix = (num) => ["??","er","do","er","to","to","to","mo","vo","no","mo","vo","vo","er","to","to"][num];
const pPrim = { a: "Septiembre-Diciembre", b: "Enero-Abril", c: "Mayo-Agosto" };
const nextTerm = (num, key) => key.toUpperCase() == "B" ? {year: num + 1, claveCuatri: "C"} : key.toUpperCase() === "A" ? {year: num, claveCuatri: "B"} : {year: num, claveCuatri: "A"},
    termFromMonthNumber = n => n < 5 ? "B" : n < 9 ? "C" : "A",
    getTermDistance = (one,two) => {};
const periods = key => pPrim[key.toLowerCase()];

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
                    <h3>Asignar clase</h3>
                    <label for="createClassTerm">Cuatrimestre:</label>&ensp;<select name="createClassTerm" id="createClassTerm"></select><br/>
                    <label for="templateSelect">Curso:</label>&ensp;<select name="templateSelect" disabled id="templateSelect">
                        <option value="" disable hidden selected>Seleccione un cuatrimestre.</option>
                    </select><br/>
                    <label for="createClassTeacher">Supervisa:</label>&ensp;<select name="createClassTeacher" id="createClassTeacher"></select><br/>
                    <input type="hidden" id="createClassGroup" value="${gInfo.idGrupo}"/>
                    <button class="adm-btn" onclick="createClass()">Finalizar</button>
                </article>${cList.length < 1 ? `
                <p class="notice">Este grupo todav&iacute;a no tiene clases asignadas.</p>` : cList.map(i => `
                <article class="subject-adm">
                    <h3>${i.nombre}</h3>
                    <p>Supervisa: <span>${i.nomMaestro}</span></p>
                    <button class="adm-btn" onclick="detailClass('${i.idClase}')">Ver actividades</button>
                    <div id="activity-list-${i.idClase}"></div>
                </article>`).join("")}
            </div>
        </section>
        <section class="group-list-alumni">
            <header class="alumna-adm">
                <h3>Lista de alumnos</h3>
                <button class="adm-btn alumnus-dialogue-open">+ Registrar</button>
            </header>${aList.length < 1 ? `
            <p class="notice">Este grupo todav&iacute;a no tiene alumnos.</p>` : `
            <ul class="alumni">${aList.map(a => `
                <li class="alumnus"><span class="matricula">${a.idAlumno}</span>&ensp;&ndash;&ensp;<span class="alumnus-name">${a.nomAlumno}</span></li>`).join("")}
            </ul>`}
        </section>
    `,
  renderTeacherOptions = tList => [`
        <option value="" selected disabled hidden>Haga click para ver las opciones</option>`, ...(tList.map(t => `
            <option value="${t.idMaestro}">${t.nomMaestro}</option>`))].join(""),
  renderTemplateOptions = cList => [`
        <option value="" selected disabled hidden>Haga click para ver las opciones</option>`,...(cList.map(c => `
        <option value="${c.idPlantilla}">${c.nombre}</option>`))].join(""),
  renderTermOptions = tList => [`
        <option value="" selected disabled hidden>Haga clic para ver las opciones</option>`,...(tList.map(t => `\
        <option value="${t.year}${t.claveCuatri}">${periods(t.claveCuatri.toLowerCase())} ${t.year}</option>`))].join("\n"),
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

const renderClases = (cList, alumni=false) =>`
        <h3>Clases</h3>${alumni ? `
        <button class="all-terms fw" onclick="showMarks()">Mis calificaciones</button>` : ""}
        <div class="group-list"> ${cList.length < 1 ? "Nada que mostrar." : cList.map(c=>`
            <div class="group-card" onclick="displayClass('${c.idPlantilla}'${!alumni ? `, '${c.idGrupo}'` : ""})">
                <h4>${c.nombre}${alumni ? `&emsp;<label class="smallabel" for="${c.idPlantilla}-progress">Progreso: </label><progress id="${c.idPlantilla}-progress" name="${c.idPlantilla}-progress" class="classProgress" max="${c.totalPartes}" value="0">0%</progress>` : ""}</h4>
                ${!alumni ? `<p>Grupo ${c.nomGrupo}&ensp;|&ensp;${c.cuatrimestreActual}${suffix(c.cuatrimestreActual)} cuatrimestre</p>` : `
                <p>Supervisa: ${c.nomMaestro}</p>`}
            </div>`).join("")}
        </div>`;

const renderClassCard = (info, template, topic)=>`
                    <article class="class-display">
                        <header>
                            <h2 id="materia-actual">${info.nombre}</h2>
                            <p><label class="smallabel" for="mainProgress">Progreso: </label><progress class="classProgress" id="mainClassProgress" max="${info.totalActs}" value="${topic}" name="mainProgress">${topic} de ${info.totalActs} actividades totales.</progress></p>
                        </header>
                        <main id="currentCard">
                            <span><h3>Progresi&oacute;n actual: </h3><span class="progActual">${info.currentBlock}</span> (${info.idTema}/${info.totalTemas})</span>
                            <span><h3>Siguiente asignatura: </h3><a class="progActual forwardlink" onclick='displayActivity("${template}", ${topic}, 0)'>${topic > info.totalActs ? `Examen!` : `${info.titulo}</a> (${ topic }/${ info.totalActs })`}</span>
                        </main>
                    </article>
`,
    renderActivityCard = (acts, template, topic)=>{
        const first = acts[0].idMaterial === topic,
            last = !first && acts.length === 2,
            lOU = last || !first && acts[1].nomTema !== acts[2].nomTema,
            fOU = acts[0].nomTema !== acts[1].nomTema;
        return `
                            <header>
                                <h3><u>${!fOU ? acts[1].nomTema : acts[0].nomTema}</u>: ${!first ? acts[1].titulo : acts[0].titulo}</h3>
                                <nav>
                                    <a class="backlink" onclick='displayActivity("${template}", ${topic - 1}, -1)'>${fOU && !first ? `<em><u>${acts[0].nomTema}</u></em>: ` : ""}${!first ? acts[0].titulo : ""}</a>
                                    <span class="separate smaller"></span>
                                    <a class="forwardlink" onclick='${!lOU ? `displayActivity("${template}", ${topic + 1}, ${!lOU ? 1 : 0})` : `getExam("${template}", ${acts[0].idTema})`}'>${!lOU ? acts.at(-1).titulo : "Bloque de Actividades!"}</a>
                                </nav>
                            </header>
                            <div id="currentActivityView">
                                ${first ? acts[0].contenido : acts[1].contenido}
                            </div>
                            <footer><nav>
                                <a class="backlink" onclick='displayActivity("${template}", ${topic - 1}, -1)'>${fOU && !first ? `<em><u>${acts[0].nomTema}</u></em>: ` : ""}${!first ? acts[0].titulo : ""}</a>
                                <span class="separate"></span>
                                <a class="forwardlink" onclick='${!lOU ? `displayActivity("${template}", ${topic + 1}, ${!lOU ? 1 : 0})` : `getExam("${template}", ${acts[0].idTema})`}'>${!lOU ? acts.at(-1).titulo : "Bloque de Actividades!"}</a>
                            </nav></footer>`;
    },
    renderTest = (info, questions)=>`
                            <header>
                                <h3>Actividades de la progresión ${info.idTema}: <u>${info.currBlock}</u></h3>
                                <nav>
                                    <a class="backlink" onclick='displayActivity("${info.idPlantilla}",${info.lastPartNum},0)'>${info.lastPart}</a>
                                </nav>
                            </header>
                            <form id="currentQuizView">${questions.map((p, questionNumber) => `
                                <h4 class="question">${p.titulo}</h4>
                                <div class="question-description">${p.body || typeof p.opciones.base !== "undefined" ? "Seleccione una opción de cada columna para relacionarlas." : "Seleccione una opción."}</div>
                                ${typeof p.opciones.base !== "undefined" ?`
                                <div class="two-column-layout">
                                    <div class="column-from">${p.opciones.base.map((e,optNumber)=>`
                                        <div class="item" onclick="setSelected('${questionNumber}-${optNumber}')">
                                            <span class="column-option">${e}</span>
                                            <span id="marker-question-${questionNumber}-option-${optNumber}" class="column-marker"></span>
                                            <input type="hidden" class="reactivo" id="slot-${questionNumber}-${optNumber}" name="${questionNumber}-${optNumber}"/>
                                        </div>`).join("")}
                                    </div>
                                    <ol class="column-to">${p.opciones.matches.map(e=>`
                                        <li class="item" onclick="setResponse(${typeof e === "string" ? `"${e}"` : e},true,)">${e}</li>`).join("")}
                                    </ol>
                                </div>` : `
                                <div class="option-holder">${p.opciones.matches.map((e, optNumber)=>`
                                    <input type="radio" name="question-${questionNumber}" value="${e}" id="question-${questionNumber}-match-${optNumber}" />
                                    <label for="question-${questionNumber}-match-${optNumber}">${typeof e ==="boolean" ? e===true ? "Verdadero" : "Falso" : e}</label>`).join("")}
                                    <input type="hidden" id="slot-${questionNumber}" class="reactivo"/>
                                </div>`}`
                                ).join("\n")}
                                <p class="send" onclick="send()">Calificar</p>
                            </form>
                            <footer><nav>
                                <a class="backlink" onclick='displayActivity("${info.idPlantilla}",${info.lastPartNum},0)'>${info.lastPart}</a>
                            </nav></footer>`,

    renderMarksPersonal = ({marks,classes, historial, now}) => `
            <header class="class-info">
                <h1>Calificaciones</h1>
            </header>
            <section class="class-display">
                <header>
                    <h2>Cuatrimestre actual: ${now}${suffix(now)}</h2>
                </header>${Object.entries(classes).length > 0 ? `
                <table class="marks current-marks">
                    <thead>
                        <tr>
                            <th><em>Clases</em></th>${Object.values(classes).map(name=>`
                            <th>${name}</th>`).join("")}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th>Parcial 1</th>${Object.keys(classes).map(template=>`
                            <td>${typeof marks[template] !== "undefined" && typeof marks[template][0] !== undefined ? marks[template][0] : "<em title=\"Sin datos\">S/D</em>"}</td>`).join("")}
                        </tr>
                        <tr>
                            <th>Parcial 2</th>${Object.keys(classes).map(template=>`
                            <td>${typeof marks[template] !== "undefined" && typeof marks[template][1] !== undefined ? marks[template][1] : "<em title=\"Sin datos\">S/D</em>"}</td>`).join("")}
                        </tr>
                        <tr>
                            <th>Parcial 3</th>${Object.keys(classes).map(template=>`
                            <td>${typeof marks[template] !== "undefined" && typeof marks[template][2] !== undefined ? marks[template][2] : "<em title=\"Sin datos\">S/D</em>"}</td>`).join("")}
                        </tr>
                    </tbody>
                </table>` : `
                <p class="info marks-info">Todavía no tiene clases asignadas para calificar. Si ya ha pasado el periodo de inscripción y todavía no se muestra ninguna, por favor, contacte a un administrador.</p>`}
            </section>
            <section class="class-display">
                <header>
                    <h2>Historial</h2>
                </header>${Object.keys(historial).length > 0 ? `
                <div class="marks past-marks">${Object.entries(historial).map(([number,store])=>`
                    <strong>${number}${suffix(number)} cuatrimestre:</strong>
                    ${Object.entries(store).map(([nm,store])=>`
                        <p><em>${nm}</em>: ${store}</p>`).join("") || `
                        <span class="info marks-info-inline">Sin historial para este cuatrimestre. Si cree que esto es un error, contacte a un administrador.</span>`}`).join("")}
                </div>` : `
                <p class="info marks-info">Sin historial previo. Si cree que esto es un error, contacte a un administrador.</p>`}
            </section>
    `,

    renderImparting = (info, alumni)=>{
        let c = [];
        while (c.length < info.totalMateriales)
            c.push(`<th>${c.length + 1}</th>`)
        return `
            <header class="class-info">
                <h1>${info.nombre} &mdash; ${info.nomGrupo}</h1>
                <strong>${info.cuatrimestre}${suffix(info.cuatrimestre)} Cuatrimestre, a&ntilde;o ${info.year}, periodo ${periods(info.claveCuatri)} (${info.claveCuatri})</strong>
            </header>
            <table>
                <thead>
                    <tr>
                        <td>Estudiante</td>
                        ${c.join("")}
                    </tr>
                </thead>
                <tbody>${alumni.map(a=>`
                    <tr>
                        <td>${a.idAlumno}<br><small>${a.nombre}</small></td>
                    </tr>`).join("")}
                </tbody>
            </table>
        `
    };

export {renderGroups, renderClases, renderGroupInfo, renderTeacherOptions, renderTermOptions, renderTemplateOptions, renderTerms, renderClassCard, renderActivityCard, renderTest, termFromMonthNumber, renderImparting, renderMarksPersonal};