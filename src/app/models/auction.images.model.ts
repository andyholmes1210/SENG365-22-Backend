import {getPool} from "../../config/db";
import Logger from "../../config/logger";
import mime from 'mime';
import fs from 'mz/fs';
import {randomToken} from "../middleware/randtoken";
const imagesDirectory = './storage/images/';

/**
 * SQL Function that get Auction image
 * @param id: number
 */
const getImageA = async (id: number) : Promise<any> => {
    Logger.info(`Getting auction image from the database`);
    const conn = await getPool().getConnection();
    const query = 'SELECT image_filename FROM auction WHERE id = ?';
    const [ result ] = await conn.query( query, [ id ] );
    conn.release();
    if (result.length !== 0) {
        const photo = await fs.readFile('storage/images/' + result[0].image_filename);
        return {photo, type: mime.getType(result[0].image_filename)};
    } else {
        return false;
    }
};

/**
 * SQL Function that store the Auction image
 * @param image: string
 * @param imageFileType: string
 */
const storeImageA = async (image: string, imageFileType: string) : Promise<any> => {
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
 * SQL Function that update the Auction image
 * @param id: number
 * @param imageFilename: string
 */
const updateImageA = async (id: number, imageFilename: string) : Promise<any> => {
    Logger.info(`Updating Auction image from the database`);

    const conn = await getPool().getConnection();
    const query = 'UPDATE auction SET image_filename = ? WHERE id = ?';
    const [ result ] = await conn.query( query, [[ imageFilename ], [ id ]]);
    conn.release();
    return result;

};

export { getImageA, storeImageA, updateImageA }