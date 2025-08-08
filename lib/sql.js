import mysql from "npm:mysql2/promise";
import sqlcreds from "../.env/sqlcreds.js";
import { renderClases, renderClassCard, renderClassCopyOptions, renderGroupInfo, renderGroupOptions, renderGroups, renderTeacherOptions, renderTermOptions, renderTerms, termFromMonthNumber } from "./queryTransform.js";
import { render, romanToInt } from "./compose.js";
const connection = await mysql.createConnection(sqlcreds);

await connection.query("use cemss");

const checkAdmin = async uname => {
    if (uname === false) throw new Promise(resolve => resolve("por favor, inicie sesión nuevamente. <script> localStorage.removeItem('tkn') </script>"));
    const i = (await connection.query(`select \`admin\` from \`staff\` where \`idMaestro\` = '${uname}'`))[0];
    if ((await i).length < 1 || (await i)[0].admin === 0) throw "usuario no encontrado.";
},
checkStudent = async uname => {
    if (uname === false) throw new Promise(resolve => resolve("por favor, inicie sesión nuevamente. <script> localStorage.removeItem('tkn') </script>"));
    const i = (await connection.query(`select \`idAlumno\` from \`alumnos\` where \`idAlumno\` = '${uname}'`))[0];
    if ((await i).length < 1 || (await i)[0].admin === 0) throw "usuario no encontrado.";
},
tokenCorrect = async uname => {
    if (uname === false) throw new Promise(resolve => resolve("por favor, inicie sesión nuevamente. <script> localStorage.removeItem('tkn') </script>"));
};

const validateStaff = async(uname, pwdHash)=> {
    const r = (await connection.query(`select \`hash\` from \`staff\` where \`idMaestro\` = '${uname}'`))[0];
    if (r.length < 1) return 404;
    if(r[0].hash !== pwdHash) return 403;
    return 200;
},

validatePupil = async (uname, pwdHash) => {
    const r = (await connection.query(`select \`hash\` from \`alumnos\` where \`idAlumno\` = '${uname}'`))[0];
    if (r.length < 1) return 404;
    if (r[0].hash !== pwdHash) return 403;
    return 200;
}

const getStaffFront = async uname => {
    if (uname === false) return new Promise(resolve => resolve("por favor, inicie sesión nuevamente. <script> localStorage.removeItem('tkn') </script>"));
    const i = (await connection.query(`select \`admin\`,\`nombres\` from \`staff\` where \`idMaestro\` = '${uname}'`))[0];
    if ((await i).length < 1) return "usuario no encontrado.";
    const clases = (await connection.query(`select \`clases\`.*, \`grupos\`.nombre AS nomGrupo, \`grupos\`.cuatrimestreActual, \`plantillas\`.nombre as nombre from \`clases\` left join \`grupos\` on \`clases\`.idGrupo = \`grupos\`.idGrupo left join \`plantillas\` on \`plantillas\`.idPlantilla = \`clases\`.idPlantilla where idMaestro = '${uname}' order by \`plantillas\`.nombre asc, \`clases\`.idGrupo asc`))[0];
    if ((await i)[0].admin === 0)
        return render(
            `\
            <aside class="groups-panel">`,
            renderClases(await clases),
            `
            </aside>`,
            `
            <button id="hide-side" onclick="turn()">&lt;</button>`,
            `
            <main id="disp" class="activities-panel">
                <article class="welcome-banner">
                    <h1>Bienvenid@, <span id="professor-name">Prof. ${(await i)[0].nombres}</span></h1>
                    <p>Cuatrimestre: <strong>${new Date().getFullYear()}-${termFromMonthNumber(new Date().getMonth())}</strong></p>
                </article>
                <article class="initmsg">
                    <p>Haga click en una de las tarjetas a mano izquierda para ingresar a su clase.</p>
                    <p>Si aún no tiene clases asignadas, contacte a un administrador.</p>
                </article>
                <div id="classwrap"></div>
            </main>`);
    const g = (await connection.query("SELECT COUNT(idAlumno) as cantidad, `grupos`.idGrupo, `grupos`.cuatrimestreActual as cuatrimestre, `grupos`.nombre FROM `alumnos` right JOIN `grupos` ON `alumnos`.idGrupo = `grupos`.idGrupo GROUP BY `idGrupo`"))[0];
    return render(
        `
        <aside class="groups-panel">`,
            renderGroups(await g),
            renderClases(await clases),
            `
            <section class="extra-adm">
                <h4>Funciones Adicionales</h4>
                <button class="adm-btn all-terms" onclick="fetch('/staff/t', {method:'POST',body:localStorage.getItem('tkn')}).then(t=>t.text()).then(t=>document.getElementById('disp').innerHTML = t).then(()=>funnyShit())">Gestionar cuatrimestres</button>
                <button class="adm-btn new-alumnus">+ Registrar alumno</button>
            </section>`,
        `
        </aside>`,
        '<button id="hide-side" onclick="turn()">&lt;</button>',
            `
            <main id="disp" class="activities-panel">
                <article class="welcome-banner">
                    <h1>Bienvenid@, <span id="professor-name">Prof. ${(await i)[0].nombres}</span></h1>
                    <p>Cuatrimestre: <strong>${new Date().getFullYear()}-${termFromMonthNumber(new Date().getMonth())}</strong></p>
                </article>
                <article class="initmsg">
                    <p>Haga click en una de las tarjetas a mano izquierda para ingresar a su clase.</p>
                    <p>Si aún no tiene clases asignadas, contacte a un administrador.</p>
                </article>
                <div id="classwrap"></div>`,
            `
            </main>`);
},
    getGroupInfoAdmin = async (uname, gID) => {
        try {
            await checkAdmin(uname)
        } catch (e) {
            return e;
        }
        const c = (await connection.query(`SELECT \`clases\`.*, \
CONCAT(\`staff\`.nombres, " ", \`staff\`.apellidos) AS nomMaestro \
from \`clases\` \
LEFT JOIN staff ON \`clases\`.idMaestro = \`staff\`.idMaestro \
WHERE \`clases\`.idGrupo="${gID}"`))[0],
            g = (await connection.query(`SELECT \`alumnos\`.idAlumno, CONCAT(\`alumnos\`.nombres, " ", \`alumnos\`.apellidos) AS \`nomAlumno\` \
FROM \`alumnos\` \
WHERE \`alumnos\`.idGrupo = "${gID}"`))[0],
            f = (await connection.query(`select * from \`grupos\` where idGrupo="${gID}"`))[0][0];
        return renderGroupInfo(await c, await g, await f);
    },
    getTeachers = async uname => {
        try {
            await checkAdmin(uname)
        } catch (e) {
            return e;
        }
        const t = (await connection.query(`select \`staff\`.idMaestro, CONCAT(\`staff\`.nombres, " ", \`staff\`.apellidos) AS nomMaestro from \`staff\` order by \`nomMaestro\` asc`))[0];
        return renderTeacherOptions(await t);
    },
    getClassesForCopy = async uname => {
        try {
            await checkAdmin(uname)
        } catch (e) {
            return e;
        }
        const c = (await connection.query("select `clases`.nombre, `clases`.idClase, `clases`.year, `clases`.claveCuatri from `clases` order by `clases`.nombre asc"))[0];
        return renderClassCopyOptions(await c);
    },
    getTerms = async uname => {
        try {
            await checkAdmin(uname)
        } catch (e) {
            return e;
        }
        const tr = (await connection.query("select * from `cuatrimestres` order by year desc, claveCuatri desc"))[0];
        const tm = (await connection.query('select * from `plantillas` order by cuatrimestre,legacy desc'))[0];
        return await renderTerms(await tr, await tm);
    },
    getOpenTerms = async uname => {
        try {
            await checkAdmin(uname)
        } catch (e) {
            return e;
        }
        const t = (await connection.query("select * from `cuatrimestres` where abierto = 1 order by year asc, claveCuatri desc"))[0];
        return renderTermOptions(await t);
    },
    getGroupsFromTerm = async (uname, term) => {
        try {
            await checkAdmin(uname)
        } catch (e) {
            return e;
        }
        const g = (await connection.query(`select \`grupos\`.idGrupo, \`grupos\`.nombre, \`grupos\`.cuatrimestreActual from \`grupos\` where \`grupos\`.cuatrimestreActual < 6`))[0];
        return renderGroupOptions(await g);
    },
    getAllTemplates = async (uname) => {
        try {
            await checkAdmin(uname)
        } catch (e) {
            return e;
        }
        const t = (await connection.query('select group_concat(idPlantilla order by nombre separator ";") as ids, group_concat(nombre order by nombre separator ";") as nombres, cuatrimestre from `plantillas` group by `plantillas`.cuatrimestre'))[0];
        return t;
    },

    getPupilFront = async (uname) => {
        if (uname === false) return new Promise(resolve => resolve("por favor, inicie sesión nuevamente. <script> localStorage.removeItem('tkn') </script>"));
        const i = (await connection.query(`select \`nombres\`,\`idGrupo\` from \`alumnos\` where \`idAlumno\` = '${uname}'`))[0];
        if ((await i).length < 1 || (await i)[0].admin === 0) return "usuario no encontrado.";
        const c = (await connection.query(`SELECT \`clases\`.*, \
CONCAT(\`staff\`.nombres, " ", \`staff\`.apellidos) AS nomMaestro, \
\`grupos\`.nombre AS nomGrupo, \`grupos\`.cuatrimestreActual, \
\`plantillas\`.nombre AS nombre, \
count(\`partes\`.idMaterial) as totalPartes \
from \`clases\` \
LEFT JOIN staff ON \`clases\`.idMaestro = \`staff\`.idMaestro \
LEFT JOIN grupos ON \`clases\`.idGrupo = \`grupos\`.idGrupo \
LEFT JOIN plantillas ON \`clases\`.idPlantilla=\`plantillas\`.idPlantilla \
LEFT JOIN \`partes\` on \`partes\`.idPlantilla=\`clases\`.idPlantilla \
WHERE \`clases\`.idGrupo="${(await i)[0].idGrupo}"`))[0];
        return render(
            `
            <aside class="groups-panel">`,
            renderClases(await c, true),
            `
            </aside>`,
            `
            <button id="hide-side" onclick="turn()">&lt;</button>`,
            `<main id="disp" class="activities-panel">
                <article class="welcome-banner">
                    <h1>Bienvenid@, <span id="student-name">${(await i)[0].nombres}</span></h1>
                    <p>Cuatrimestre: <strong>${new Date().getFullYear()}-${termFromMonthNumber(new Date().getMonth())}</strong></p>
                </article>
                <article class="initmsg">
                    <p>Haga click en una de las tarjetas a mano izquierda para ingresar a su clase.</p>
                    <p>Si aún no tiene clases asignadas, contacte a un administrador.</p>
                </article>
                <div id="classwrap"></div>
            </main>`);
    },

    getPupilProgress = async (uname) => {
        try {
            await tokenCorrect(uname)
        } catch (e) {
            return e;
        }
        const p = (await connection.query(`select \`plantillas_progreso\` from \`alumnos\` where idAlumno="${uname}"`))[0];
        if (p.length < 1) return "usuario no encontrado.";
        return p[0].plantillas_progreso;
    },

getClassInfo = async (uname, template, tema, material) => {
    try {
        await tokenCorrect(uname)
    } catch (e) {
        return e;
    }
    const partes = (await connection.query(`select \`idMaterial\`, \`titulo\` from \`partes\` where \`idPlantilla\` = "${template}"  and idTema = ${tema}`))[0],
        info = (await connection.query(`select (select count(idTema) from \`temas\` where \`temas\`.idPlantilla = "${template}") as totalTemas, (select titulo from \`temas\` where \`temas\`.idPlantilla="${template}" and \`temas\`.idTema = ${tema}  limit 1) as currentBlock, \
(select count(idMaterial) from \`partes\` where \`partes\`.idPlantilla = "${template}") as totalActs, \
(select count(case when idTema < ${tema} or idTema = ${tema} and idMaterial <= ${material} then idMaterial end) from \`partes\` where \`partes\`.idPlantilla="${template}") as fullProg, \
(select titulo from \`partes\` where \`partes\`.idPlantilla="${template}" and \`partes\`.idTema=${tema} and \`partes\`.idMaterial = ${material}  limit 1) as currentAct, \
\`clases\`.\`cambioP12\`, \`clases\`.\`cambioP23\`, \
\`plantillas\`.nombre \
from \`clases\` \
left join \`plantillas\` on \`plantillas\`.\`idPlantilla\`=\`clases\`.\`idPlantilla\` \
where \`clases\`.\`idPlantilla\`="${template}"
limit 1`))[0][0];
    return {info, partes, render: renderClassCard(partes, info, tema, material)};
};

const bookResult = async r => {
  const { name, units, type, mode } = r;
  //console.log(name, units.length + " units", type, mode);
  const templateQuery = await connection.query(`select * from \`plantillas\` where nombre = 'ÉTICA I'`),
    templates = templateQuery[0];
  //console.log(await templates)
  let insertId;
  if ((await templates).length < 1){
    if ([...name.matchAll(/\s/gi)].length > 2)
      insertId = name.split(/\s/gi).filter(Boolean).filter(e => !(/\s/.test(e))).filter(e => e !== "").map(e => e[0]).join("").toLowerCase();
    else insertId = name.substring(0, 3).toLowerCase();
    if (/\s[IVX]+$/.test(name))
      insertId += romanToInt(name.substring(name.lastIndexOf(" ") + 1));
    await connection.query(`insert into \`plantillas\` (idPlantilla, cuatrimestre, nombre, legacy) values ("${insertId}",0,"${name}",0)`);
  } else {
    if (mode == "replace") {
      insertId = (await templates)[0].idPlantilla;
    } else {
      insertId = (await templates)[0].idPlantilla + "_" + (new Date()).getFullYear();
      await connection.query(`insert into \`plantillas\` (idPlantilla, cuatrimestre, nombre, legacy) values ("${insertId}",0,"${name}",0)`);
    }
  }
  await connection.query(`delete from \`temas\` where \`idPlantilla\`="${insertId}"`);
  if (type.toUpperCase() == "CUADERNO") {
    return;
  };
  await connection.query(`delete from \`partes\` where \`idPlantilla\`="${insertId}"`);
  for (const { number,lessons,name } of units) {
    //console.log(number, `${lessons.length} lessons`, name);
    try {
      await connection.query(`insert into \`temas\` (idPlantilla, idTema, titulo) values ("${insertId}",${number},"${name}")`);
    } catch (e) { /*console.log(e);*/ }
    for (const i in lessons) {
      //console.log(name, i);
      const { content } = lessons[i];
      const lesname = lessons[i].name;
      try {
        await connection.query(`insert into \`partes\` (idPlantilla, idTema, idMaterial, titulo, contenido) values ("${insertId}", ${number}, ${i+1}, "${lesname}", "${JSON.stringify(content).slice(1, -1)}")`);
      } catch (e) {
        //console.log(e);
      }
    }
  }
  return;
};

const commitProgress = async(uname, d) => {
    try {
        await checkStudent(uname)
    } catch (e) {
        return e;
    }
    try {
        const q = await connection.query(`update \`alumnos\` set plantillas_progreso="${JSON.stringify(d).slice(1,-1)}" where idAlumno="${uname}"`);
        return q.length > 0;
    } catch (e) {
        console.log(e);
        return false;
    }
}

const dev = {
    classfresh: async(uname, type) => {
        if (uname === false) return new Promise(resolve => resolve("por favor, inicie sesión nuevamente. <script> localStorage.removeItem('tkn') </script>"));
        const idField = type.toLowerCase() === "alumnos" ? "Alumno" : "Maestro"
        const i = (await connection.query(`select \`nombres\`,\`idGrupo\` from \`${type}\` where \`id${idField}\` = '${uname}'`))[0];
        if ((await i).length < 1 || (await i)[0].admin === 0) return "usuario no encontrado.";
        const c = type.toLowerCase() === "alumnos" ? (await connection.query(`SELECT \`clases\`.*, \
CONCAT(\`staff\`.nombres, " ", \`staff\`.apellidos) AS nomMaestro, \
\`grupos\`.nombre AS nomGrupo, \`grupos\`.cuatrimestreActual, \
\`plantillas\`.nombre AS nombre, \
count(\`partes\`.idMaterial) as totalPartes \
from \`clases\` \
LEFT JOIN staff ON \`clases\`.idMaestro = \`staff\`.idMaestro \
LEFT JOIN grupos ON \`clases\`.idGrupo = \`grupos\`.idGrupo \
LEFT JOIN plantillas ON \`clases\`.idPlantilla=\`plantillas\`.idPlantilla \
LEFT JOIN \`partes\` on \`partes\`.idPlantilla=\`clases\`.idPlantilla \
WHERE \`clases\`.idGrupo="${(await i)[0].idGrupo}"`))[0] : (await connection.query(`select \`clases\`.*, \`grupos\`.nombre AS nomGrupo, \`grupos\`.cuatrimestreActual, \`plantillas\`.nombre as nombre from \`clases\` left join \`grupos\` on \`clases\`.idGrupo = \`grupos\`.idGrupo left join \`plantillas\` on \`plantillas\`.idPlantilla = \`clases\`.idPlantilla where idMaestro = '${uname}' order by \`plantillas\`.nombre asc, \`clases\`.idGrupo asc`))[0];
        return renderClases(await c, type.toLowerCase() === "alumnos");
    }
};

export {validateStaff, validatePupil,
  getStaffFront, getPupilFront, getGroupInfoAdmin, getTeachers, getClassesForCopy, getTerms, getOpenTerms, getGroupsFromTerm, getAllTemplates, getClassInfo, getPupilProgress,

  commitProgress,

  bookResult,

 checkAdmin,

 dev
};
