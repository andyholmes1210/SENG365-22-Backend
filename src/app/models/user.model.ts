import {getPool} from "../../config/db";
import Logger from "../../config/logger";
import {ResultSetHeader} from "mysql2";
import {passwordHash} from '../middleware/password.hash';
import {passwordVerify} from '../middleware/password.verify';
import Console from "console";

const register = async (values: User) : Promise<ResultSetHeader> => {
    Logger.info(`Adding user to the database`);

    const newPassword = await passwordHash(values.password);
    const conn = await getPool().getConnection();
    const query = 'INSERT INTO user (first_name, last_name, email, password) VALUES ( ? )';
    const [ result ] = await conn.query( query, [[[ values.firstName ], [ values.lastName ], [ values.email ], [ newPassword ]]] );
    conn.release();
    return result;
};

const login = async (values: User, token: string) : Promise<any> => {
    Logger.info(`Login user into the database`);

    const conn = await getPool().getConnection();
    const query = 'SELECT * FROM user WHERE email = ?';
    const [ result ] = await conn.query( query, [values.email]);
    conn.release();

    if (result.length !== 0) {
        const query1 = 'SELECT password FROM user WHERE email = ?';
        const [ result1 ] = await conn.query( query1, [ values.email ]);
        conn.release();
        const pass = result1[0].password;
        const passwordT = await passwordVerify(values.password, pass);

        if (passwordT) {
            const query2 = 'UPDATE user SET auth_token = ? WHERE email = ?';
            const [result2] = await conn.query(query2, [token, values.email]);
            conn.release();
            return result;
        } else {
            return false;
        }
    }
};

const logout = async (token: string) : Promise<any> => {
    Logger.info(`Logout user from the database`);

    const conn = await getPool().getConnection();
    const query = 'UPDATE user SET auth_token = ? WHERE auth_token = ?';
    const [ result ] = await conn.query( query, [[null], [token]]);
    conn.release();
    return result;

};

const checkUserExist = async (email: string) : Promise<any> => {
    Logger.info(`Getting userid from the database`);

    const conn = await getPool().getConnection();
    const query = 'SELECT id FROM user WHERE email = ?';
    const [ result ] = await conn.query( query, [ email ]);
    conn.release();
    if (result.length === 0) {
        return false
    } else
        return true;
};

const getToken = async (email: string) : Promise<any> => {
    Logger.info(`Getting user token from the database`);

    const conn = await getPool().getConnection();
    const query = 'SELECT auth_token FROM user WHERE email = ?';
    const [ result ] = await conn.query( query, [ email ]);
    conn.release();
    return result;

};

const checkId = async (id: number) : Promise<any> => {
    Logger.info(`Checking user in the database`);

    const conn = await getPool().getConnection();
    const query = 'select * from user where id = ?';
    const [ rows ] = await conn.query( query, [ id ]);
    conn.release();
    if (rows.length === 0) {
        return false
    } else {
        return true
    }

};

const checkIdMatchToken = async (id: number, token: string) : Promise<any> => {
    Logger.info(`Checking userid match with token in the database`);

    const conn = await getPool().getConnection();
    const query = 'select * from user where id = ? and auth_token = ? ';
    const [ rows ] = await conn.query( query, [[ id ], [ token ]]);
    conn.release();
    if (rows.length === 0) {
        return false
    } else {
        return true
    }
};

const getUserDetails = async (id: number) : Promise<any> => {
    Logger.info(`Getting user details from the database`);

    const conn = await getPool().getConnection();
    const query = 'SELECT email, first_name, last_name FROM user WHERE id = ?';
    const [ result ] = await conn.query( query, [ id ]);
    conn.release();
    return result;
};

// const updateUserDetails = async (id: number, newEmail: string, newPass: string, oldPass: string) : Promise<any> => {
//     Logger.info(`Updating user details from the database`);
//
//     const conn = await getPool().getConnection();
//     const queryPass = 'SELECT password FROM user WHERE id = ?'
//     const [ result ] = await conn.query( queryPass, [ id ]);
//     const checkPass = await passwordVerify(result[0], oldPass)
//     if (checkPass) {
//         const query = 'UPDATE user SET email = newEmail WHERE id = id'
//         const query1 = 'UPDATE user set passowrd = newPass WHERE id = id'
//         const [ result ] = await conn.query( query, query1, [ id ] )
//         return result
//     } else {
//         return false;
//     }
// };


export { register, login, logout, getToken, checkUserExist, getUserDetails, checkId, checkIdMatchToken }