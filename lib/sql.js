import mysql from "npm:mysql2/promise";
import sqlcreds from "../.env/sqlcreds.js";
import { renderClases, renderClassCopyOptions, renderGroupInfo, renderGroupOptions, renderGroups, renderTeacherOptions, renderTermOptions, renderTerms } from "./queryTransform.js";
import { FragmentPath, render } from "./compose.js";
import { HttpError } from "@oak/commons/http_errors";
const connection = await mysql.createConnection(sqlcreds);

await connection.query("use cemss");

const tokenCorrect = async uname => {
    if (uname === false) throw new Promise(resolve => resolve("por favor, inicie sesión nuevamente. <script> localStorage.removeItem('tkn') </script>"));
    const i = (await connection.query(`select \`admin\` from \`staff\` where \`idMaestro\` = '${uname}'`))[0];
    if ((await i).length < 1 || (await i)[0].admin === 0) throw "usuario no encontrado.";
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
  if (uname === false) return new Promise(resolve=>resolve("por favor, inicie sesión nuevamente. <script> localStorage.removeItem('tkn') </script>"));
  const i = (await connection.query(`select \`admin\`,\`nombres\` from \`staff\` where \`idMaestro\` = '${uname}'`))[0];
  if ((await i).length < 1) return "usuario no encontrado.";
  const clases = (await connection.query(`select \`clases\`.*, \`grupos\`.nombre AS nomGrupo, \`grupos\`.cuatrimestreActual from \`clases\` left join \`grupos\` on \`clases\`.idGrupo = \`grupos\`.idGrupo where idMaestro = '${uname}' order by \`clases\`.nombre asc, \`clases\`.idGrupo asc`))[0];
  if ((await i)[0].admin === 0)
      return render(
      '<aside class="groups-panel">',
      renderClases(await clases),
      "</aside>",
      '<button id="hide-side" onclick="turn()">&lt;</button>',
      `<main id="disp" class="activities-panel">
          <h2>Bienvenid@, Prof. ${(await i)[0].nombres}</h2>
          <p>Haga click en una de las tarjetas a mano izquierda para administrar sus clases.</p>
          <p>Si aún no tiene clases asignadas, contacte a un administrador.</p>
      </main>`);
  const g = (await connection.query("SELECT COUNT(idAlumno) as cantidad, `grupos`.idGrupo, `grupos`.cuatrimestreActual as cuatrimestre, `grupos`.nombre FROM `alumnos` right JOIN `grupos` ON `alumnos`.idGrupo = `grupos`.idGrupo GROUP BY `idGrupo`"))[0];
  return render(
      '<aside class="groups-panel">',
      renderGroups(await g),
      renderClases(await clases),
      `<section class="extra-adm">
          <h4>Funciones Adicionales</h4>
          <button class="adm-btn all-terms" onclick="fetch('/staff/t', {method:'POST',body:localStorage.getItem('tkn')}).then(t=>t.text()).then(t=>document.getElementById('disp').innerHTML = t).then(()=>funnyShit())">Gestionar cuatrimestres</button>
          <button class="adm-btn new-alumnus">+ Registrar alumno</button>
      </section>`,
      "</aside>",
      '<button id="hide-side" onclick="turn()">&lt;</button>',
      `<main id="disp" class="activities-panel">
          <h2>Bienvenid@, Prof. ${(await i)[0].nombres}</h2>
          <p>Haga click en una de las tarjetas a mano izquierda para administrar sus clases; o bien, uno de los grupos para ver su información.</p>
          <p>Si no se muestran clases, esto sugiere que hay un problema de causa mayor. Consulte los registros de cPanel y/o a un técnico.</p>
      </main>`);
},
getGroupInfoAdmin = async (uname, gID) => {
    try {
        await tokenCorrect(uname)
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
        await tokenCorrect(uname)
    } catch (e) {
        return e;
    }
    const t = (await connection.query(`select \`staff\`.idMaestro, CONCAT(\`staff\`.nombres, " ", \`staff\`.apellidos) AS nomMaestro from \`staff\` order by \`nomMaestro\` asc`))[0];
    return renderTeacherOptions(await t);
},
getClassesForCopy = async uname => {
    try {
        await tokenCorrect(uname)
    } catch (e) {
        return e;
    }
    const c = (await connection.query("select `clases`.nombre, `clases`.idClase, `clases`.year, `clases`.claveCuatri from `clases` order by `clases`.nombre asc"))[0];
    return renderClassCopyOptions(await c);
},
getTerms = async uname => {
    try {
        await tokenCorrect(uname)
    } catch (e) {
        return e;
    }
    const tr = (await connection.query("select * from `cuatrimestres` order by year desc, claveCuatri desc"))[0];
    const tm = (await connection.query('select * from `plantillas` order by cuatrimestre,legacy desc'))[0];
    return await renderTerms(await tr, await tm);
},
getOpenTerms = async uname => {
    try {
        await tokenCorrect(uname)
    } catch (e) {
        return e;
    }
    const t = (await connection.query("select * from `cuatrimestres` where abierto = 1 order by year asc, claveCuatri desc"))[0];
    return renderTermOptions(await t);
},
getGroupsFromTerm = async (uname, term) => {
    try {
        await tokenCorrect(uname)
    } catch (e) {
        return e;
    }
    const g = (await connection.query(`select \`grupos\`.idGrupo, \`grupos\`.nombre, \`grupos\`.cuatrimestreActual from \`grupos\` where \`grupos\`.cuatrimestreActual < 6`))[0];
    return renderGroupOptions(await g);
},
getAllTemplates = async (uname) => {
  try {
      await tokenCorrect(uname)
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
\`grupos\`.nombre AS nomGrupo, \`grupos\`.cuatrimestreActual \
from \`clases\` \
LEFT JOIN staff ON \`clases\`.idMaestro = \`staff\`.idMaestro \
LEFT JOIN grupos ON \`clases\`.idGrupo = \`grupos\`.idGrupo \
WHERE \`clases\`.idGrupo="${(await i)[0].idGrupo}"`))[0];
    return render(
        '<aside class="groups-panel">',
        renderClases(await c),
        "</aside>",
        '<button id="hide-side" onclick="turn()">&lt;</button>',
        `<main id="disp" class="activities-panel">
            <h2>Bienvenid@, ${(await i)[0].nombres}</h2>
            <p>Haga click en una de las tarjetas a mano izquierda para ingresar a su clase.</p>
            <p>Si aún no tiene clases asignadas, contacte a un administrador.</p>
        </main>`);
};

export {validateStaff, validatePupil, getStaffFront, getPupilFront, getGroupInfoAdmin, getTeachers, getClassesForCopy, getTerms, getOpenTerms, getGroupsFromTerm, getAllTemplates, tokenCorrect};
