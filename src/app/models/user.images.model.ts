import {getPool} from "../../config/db";
import Logger from "../../config/logger";
import mime from 'mime';
import fs from 'mz/fs';
import {randomToken} from '../middleware/randtoken';
const imagesDirectory = './storage/images/';
import Console from "console";

const getImageU = async (id: number) : Promise<any> => {
    Logger.info(`Getting user image from the database`);
    const conn = await getPool().getConnection();
    const query = 'SELECT image_filename FROM user WHERE id = ?';
    const [ rows ] = await conn.query( query, [ id ] );
    conn.release();
    if (rows.length === 0 || rows[0].image_filename === null) {
        return false;
    } else {
        const photo = await fs.readFile('storage/images/' + rows[0].image_filename)
        return {photo, type: mime.getType(rows[0].image_filename)};
    }
};


const updateImageU = async (id: number, imageFilename: string) : Promise<any> => {
    Logger.info(`Updating user image from the database`);

    const conn = await getPool().getConnection();
    const query = 'UPDATE user SET image_filename = ? WHERE id = ?';
    const [ rows ] = await conn.query( query, [[ imageFilename ], [ id ]]);
    conn.release();
    return rows

};


const storeImageU = async (image: string, imageFileType: string) : Promise<any> => {
    const filename = await randomToken(32) + imageFileType;

    try {
        await fs.writeFile(imagesDirectory + filename, image);
        return filename;
    } catch (err) {
        await fs.unlink(imagesDirectory + filename)
            .catch(err);
        throw err;
    }

};


const deleteImageU = async (id: number) : Promise<any> => {
    Logger.info(`Deleting user image from the database`);

    const conn = await getPool().getConnection();
    const query = 'UPDATE user SET imagine_filename = ? WHERE = ?';
    const [ rows ] = await conn.query( query, [[ null ], [ id ]]);
    conn.release();
    return rows
};


export { getImageU, deleteImageU, updateImageU, storeImageU }