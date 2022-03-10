import {getPool} from "../../config/db";
import Logger from "../../config/logger";
import mime from 'mime';
import fs from 'mz/fs';


const getImage = async (id: number) : Promise<User[]> => {
    Logger.info(`Getting image from the database`);
    const conn = await getPool().getConnection();
    const query = 'SELECT image_filename FROM user WHERE user_id = ?';
    const [ rows ] = await conn.query( query, [ id ] );
    conn.release();
    return rows
    // const photo = await fs.readFile('storage/images/' + rows.image_filename)
    // return {photo, type: mime.getType(rows.image_filename)};
};


export {getImage}