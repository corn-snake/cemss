import mysql from "npm:mysql2/promise";
import sqlcreds from "../.env/sqlcreds.js";
import { renderClases, renderGroupInfo, renderGroups } from "./queryTransform.js";
import { render } from "./compose.js";
const connection = await mysql.createConnection(sqlcreds);

await connection.query("use cemss");

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
            "</aside>");
    return render(
        '<aside class="groups-panel">',
        renderGroups((await connection.query("SELECT COUNT(idAlumno) as cantidad, `grupos`.idGrupo, `grupos`.cuatrimestreActual as cuatrimestre, `grupos`.nombre FROM `alumnos` right JOIN `grupos` ON `alumnos`.idGrupo = `grupos`.idGrupo GROUP BY `idGrupo`"))[0]),
        renderClases(await clases),
        "</aside>",
        `<main id="disp" class="activities-panel">
            <h2>Bienvenid@, Prof. ${(await i)[0].nombres}</h2>
            <p>Haga click en una de las tarjetas a mano izquierda para administrar sus clases${(await i)[0].admin === 1 ? ", o bien, uno de los grupos para ver su información." : ""}.</p>
            <p>Si aún no tiene clases asignadas, contacte a un administrador.</p>
        </main>`);
},
getGroupInfoAdmin = async (uname, gID) => {
    if (uname === false) return new Promise(resolve => resolve("por favor, inicie sesión nuevamente. <script> localStorage.removeItem('tkn') </script>"));
    const i = (await connection.query(`select \`admin\` from \`staff\` where \`idMaestro\` = '${uname}'`))[0];
    if ((await i).length < 1 || (await i)[0].admin === 0) return "usuario no encontrado.";
    const c = (await connection.query(`SELECT \`clases\`.*, \
CONCAT(\`staff\`.nombres, " ", \`staff\`.apellidos) AS nomMaestro \
from \`clases\` \
LEFT JOIN staff ON \`clases\`.idMaestro = \`staff\`.idMaestro \
WHERE \`clases\`.idGrupo="${gID}"`))[0],
    g = (await connection.query(`SELECT \`alumnos\`.idAlumno, CONCAT(\`alumnos\`.nombres, " ", \`alumnos\`.apellidos) AS \`nombreAlumno\` \
FROM \`alumnos\` \
WHERE \`alumnos\`.idGrupo = "${gID}"`))[0],
    f = (await connection.query(`select * from \`grupos\` where idGrupo="${gID}"`))[0][0];
    return renderGroupInfo(await c, await g, await f);
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
        `<main id="disp" class="activities-panel">
            <h2>Bienvenid@, ${(await i)[0].nombres}</h2>
            <p>Haz click en una de las tarjetas a mano izquierda para ingresar a tu clase.</p>
            <p>Si aún no tiene clases asignadas, contacta a un administrador.</p>
        </main>`);
};

export {validateStaff, validatePupil, getStaffFront, getPupilFront, getGroupInfoAdmin};
