import mysql from "npm:mysql2/promise";
import sqlcreds from "../.env/sqlcreds.js";
const connection = await mysql.createConnection(sqlcreds);

await connection.query("use cemss");
const getGroups = async() => (await connection.query("select * from `grupos`"))[0];
//console.log(await getGroups());

const validateStaff = async(uname, pwdHash)=> {
    const r = (await connection.query(`select \`hash\` from \`staff\` where \`idMaestro\` = '${uname}'`))[0];
    if (r.length < 1) return 404;
    if(r[0].hash !== pwdHash) return 403;
    return 200;
}

const validatePupil = async (uname, pwdHash) => {
    const r = (await connection.query(`select \`hash\` from \`alumnos\` where \`idAlumno\` = '${uname}'`))[0];
    if (r.length < 1) return 404;
    if (r[0].hash !== pwdHash) return 403;
    return 200;
}

export {getGroups, validateStaff, validatePupil};
