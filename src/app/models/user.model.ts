import {getPool} from "../../config/db";
import Logger from "../../config/logger";
import {ResultSetHeader} from "mysql2";
import {passwordHash} from '../middleware/password.hash';
import {passwordVerify} from '../middleware/password.verify';
import Console from "console";

/**
 *
 * @param values
 */
const register = async (values: User) : Promise<ResultSetHeader> => {
    Logger.info(`Adding user to the database`);

    const newPassword = await passwordHash(values.password);
    const conn = await getPool().getConnection();
    const query = 'INSERT INTO user (first_name, last_name, email, password) VALUES ( ? )';
    const [ result ] = await conn.query( query, [[[ values.firstName ], [ values.lastName ], [ values.email ], [ newPassword ]]] );
    conn.release();
    return result;
};

/**
 *
 * @param values
 * @param token
 */
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

/**
 *
 * @param token
 */
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
    const [ result ] = await conn.query( query, [ id ]);
    conn.release();
    if (result.length === 0) {
        return false
    } else {
        return true
    }

};

const checkIdMatchToken = async (id: number, token: string) : Promise<any> => {
    Logger.info(`Checking userid match with token in the database`);

    const conn = await getPool().getConnection();
    const query = 'select * from user where id = ? and auth_token = ? ';
    const [ result ] = await conn.query( query, [[ id ], [ token ]]);
    conn.release();
    if (result.length === 0) {
        return false
    } else {
        return true
    }
};

const checkEmailExist = async (email: string) : Promise<any> => {
    Logger.info(`Checking email exist in the database`);

    const conn = await getPool().getConnection();
    const query = 'SELECT * FROM user WHERE email = ?';
    const [ result ] = await conn.query( query, [[email]]);
    conn.release();
    if (result.length === 0) {
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

const getAllUserDetails = async (id: number) : Promise<any> => {
    Logger.info(`Getting All user details from the database`);

    const conn = await getPool().getConnection();
    const query = 'SELECT * FROM user WHERE id = ?';
    const [ result ] = await conn.query( query, [ id ]);
    conn.release();
    return result;
};

const updateUserDetails = async (id: number, values: User) : Promise<any> => {
    Logger.info(`Updating user details from the database`);
    const conn = await getPool().getConnection();
    const userExist = await checkId(id);

    if (userExist) {
        if (values.email !== undefined || values.firstName !== undefined || values.lastName !== undefined) {
            if ((values.password === undefined && values.currentPassword !== undefined) || (values.password !== undefined && values.currentPassword === undefined)) {
                return 0
            } else {
                if (values.password === "") {
                    return 0;
                } else if (values.firstName !== undefined) {
                    const queryFirstName = 'UPDATE user SET first_name = ? WHERE id = ?'
                    await conn.query(queryFirstName, [[values.firstName], [id]])
                }
                conn.release()
                if (values.lastName !== undefined) {
                    const queryLastname = 'UPDATE user SET last_name = ? WHERE id = ?'
                    await conn.query(queryLastname, [[values.lastName], [id]])
                }
                conn.release()
                if (values.email !== undefined) {
                    const queryEmail = 'UPDATE user SET email = ? WHERE id = ?'
                    await conn.query(queryEmail, [[values.email], [id]])
                }
                conn.release()
                const queryPass = 'SELECT password FROM user WHERE id = ?'
                const [resultPass] = await conn.query(queryPass, [id]);
                const checkPass = await passwordVerify(values.currentPassword, resultPass[0].password)
                if (checkPass) {
                    const newPassword = await passwordHash(values.password)
                    const query = 'UPDATE user SET password = ? WHERE id = ?';
                    await conn.query(query, [[newPassword], [id]])
                    conn.release()
                    return true;
                } else {
                    return 2;
                }

            }
        } else {
            if ((values.password === undefined && values.currentPassword === undefined ) || (values.password === undefined && values.currentPassword !== undefined) || (values.password !== undefined && values.currentPassword === undefined) || values.password === "") {
                conn.release();
                return 0;
            } else {
                if (values.firstName !== undefined) {
                    const queryFirstName = 'UPDATE user SET first_name = ? WHERE id = ?'
                    await conn.query(queryFirstName, [[values.firstName], [ id ]])
                }
                conn.release()
                if (values.lastName !== undefined) {
                    const queryLastname = 'UPDATE user SET last_name = ? WHERE id = ?'
                    await conn.query(queryLastname, [[values.lastName], [ id ]])
                }
                conn.release()
                if (values.email !== undefined) {
                    const queryEmail = 'UPDATE user SET email = ? WHERE id = ?'
                    await conn.query(queryEmail, [[values.email], [ id ]])
                }
                conn.release()
                const queryPass = 'SELECT password FROM user WHERE id = ?'
                const [resultPass] = await conn.query(queryPass, [id]);
                const checkPass = await passwordVerify(values.currentPassword, resultPass[0].password)
                if (checkPass) {
                    const newPassword = await passwordHash(values.password)
                    const query = 'UPDATE user SET password = ? WHERE id = ?';
                    await conn.query(query, [[newPassword], [id]])
                    return true;
                } else {
                    return 2;
                }
            }
        }
    } else {
        conn.release();
        return false
    }

};


export { register, login, logout, getToken, checkUserExist, getUserDetails, checkId, checkIdMatchToken, updateUserDetails, getAllUserDetails, checkEmailExist }