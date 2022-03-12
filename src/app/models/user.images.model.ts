import {getPool} from "../../config/db";
import Logger from "../../config/logger";
import mime from 'mime';
import fs from 'mz/fs';
import Console from "console";


const getImageU = async (id: number) : Promise<any> => {
    Logger.info(`Getting user image from the database`);
    const conn = await getPool().getConnection();
    const query = 'SELECT image_filename FROM user WHERE id = ?';
    const [ rows ] = await conn.query( query, [ id ] );
    conn.release();
    if (rows.length !== 0) {
        const photo = await fs.readFile('storage/images/' + rows[0].image_filename)
        return {photo, type: mime.getType(rows[0].image_filename)};
    } else {
        return false;
    }
};


export {getImageU}