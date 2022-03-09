import {getPool} from "../../config/db";
import Logger from "../../config/logger";
import {ResultSetHeader} from "mysql2";
import {passwordHash} from '../middleware/password-hash';
import {passwordVerify} from '../middleware/password-verify';


const register = async (values: User) : Promise<ResultSetHeader> => {
    Logger.info(`Adding user to the database`);

    const newpassword = await passwordHash(values.password);
    const conn = await getPool().getConnection();
    const query = 'insert into user (first_name, last_name, email, password) values ( ? )';
    const [ result ] = await conn.query( query, [[[ values.firstName ], [ values.lastName ], [ values.email ], [ newpassword ]]] );
    conn.release();
    return result;
};

const login = async (values: User, token: () => Promise<any>) : Promise<ResultSetHeader> => {
    Logger.info(`Login user into the database`);

    const conn = await getPool().getConnection();
    const query = 'select * from user where email = ?';
    const [ result ] = await conn.query( query, [values.email]);
    conn.release();

    if (result.length !== 0) {
        const query1 = 'select password from user where email = ?';
        const [ result1 ] = await conn.query( query1, [ values.email ]);
        conn.release();
        const pass = result1[0].password;
        const passwordT = await passwordVerify(values.password, pass);

        if (passwordT) {
            const query2 = 'update user set auth_token = ? where email = ?';
            const [result2] = await conn.query(query2, [[token], [values.email]]);
            conn.release();
            return result;
        }
    }
};


export {register, login}