const suffix = (num) => ["??","er","do","er","to","to","to","mo","vo","no","mo","vo","vo","er","to","to"][num];

const renderGroups = (gList) =>`\
        <h3>Grupos</h3>
        <div class="group-list">
${gList.length < 1 ? "Nada que mostrar." : gList.map(g=> `\
        <div class="group-card" onclick="displayGroup('${g.idGrupo}')">
            <h4>${g.nombre}</h4>
            <p>${g.cuatrimestre}${suffix(g.cuatrimestre)} Cuatrimestre</p>
            <p>${g.cantidad} integrantes</p>
        </div>`).join("")}
        </div>`,
renderGroupInfo = (cList,aList, gInfo) =>`\
        <h2>Grupo ${gInfo.nombre}</h2>
        <section class="group-meta">
            <p>A&ntilde;o de ingreso: ${gInfo.inicio.getFullYear()}, en el periodo de ${({ a: "Septiembre", b: "Enero", c: "Mayo" })[gInfo.idGrupo.match(/[abc]/)[0]]}</p>
        </section>
        <section class="group-list-classes">
            <h3>Listado de clases activas</h3>
${cList.length < 1 ? `\
            <p>Este grupo todav&iacute;a no tiene clases asignadas.</p>
            <button class="class-dialogue-open">+ A&ntilde;adir</button>
` : cList.map(i=>`\
            <button class="class-dialogue-open">+ A&ntilde;adir</button>
            <article class="class-card">
                <h3>${i.nombre}</h3>
                <p>Supervisa: <span>${i.nomMaestro}</span></p>
                <button onclick="detailClass('${i.idClase}')">Ver actividades</button>
                <div id="activity-list-${i.idClase}"></div>
            </article>`)}
        </section>
    `;

const renderClases = (cList) =>`\
        <h3>Clases</h3>
        <div class="group-list">
${cList.length < 1 ? "Nada que mostrar." : cList.map(c=>`
        <div class="group-card" onclick="displayClass('${c.idClase}')">
            <h4>${c.nombre}</h4>
            <p>Grupo ${c.nomGrupo}&ensp;|&ensp;${c.cuatrimestreActual}${suffix(c.cuatrimestreActual)} cuatrimestre</p>${typeof c.nomMaestro !== "undefined" ? `\
            <p>Supervisi&oacute;n: ${c.nomMaestro}</p>` : ""}
        </div>`)}
        </div>`;

export {renderGroups, renderClases, renderGroupInfo};