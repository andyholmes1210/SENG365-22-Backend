import {getPool} from "../../config/db";
import Logger from "../../config/logger";
import mime from 'mime';
import fs from 'mz/fs';
import {randomToken} from '../middleware/randtoken';
const imagesDirectory = './storage/images/';

/**
 * SQL Function that get the users Image
 * @param id: number
 */
const getImageU = async (id: number) : Promise<any> => {
    Logger.info(`Getting user image from the database`);

    const conn = await getPool().getConnection();
    const query = 'SELECT image_filename FROM user WHERE id = ?';
    const [ result ] = await conn.query( query, [ id ] );
    conn.release();
    if (result.length === 0 || result[0].image_filename === null) {
        return false;
    } else {
        const photo = await fs.readFile('storage/images/' + result[0].image_filename);
        return {photo, type: mime.getType(result[0].image_filename)};
    }
};

/**
 * SQL Function that update the users image by id
 * @param id: number
 * @param imageFilename: string
 */
const updateImageU = async (id: number, imageFilename: string) : Promise<any> => {
    Logger.info(`Updating user image from the database`);

    const conn = await getPool().getConnection();
    const query = 'UPDATE user SET image_filename = ? WHERE id = ?';
    const [ result ] = await conn.query( query, [[ imageFilename ], [ id ]]);
    conn.release();
    return result
};

/**
 * SQL Function that store the user image
 * @param image: string
 * @param imageFileType: string
 */
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

/**
 * SQL Function that delete the user image by id
 * @param id: number
 */
const deleteImageU = async (id: number) : Promise<any> => {
    Logger.info(`Deleting user image from the database`);

    const conn = await getPool().getConnection();
    const query = 'UPDATE user SET image_filename = ? WHERE id = ?';
    const [ result ] = await conn.query( query, [[ null ], [ id ]]);
    conn.release();
    return result
};


export { getImageU, deleteImageU, updateImageU, storeImageU }