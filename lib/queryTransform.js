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
        </div>`;

const renderClases = (cList) =>`\
        <h3>Clases</h3>
        <div class="group-list">
${cList.length < 1 ? "Nada que mostrar." : cList.map(c=>`
        <div class="group-card" onclick="displayClass('${c.idClase}')>
            <h4>${c.nombre}</h4>
        </div>`)}
        </div>`;

export {renderGroups, renderClases};