import {getPool} from "../../config/db";
import Logger from "../../config/logger";
import mime from 'mime';
import fs from 'mz/fs';
import Console from "console";
import {randomToken} from "../middleware/randtoken";
const imagesDirectory = './storage/images/';


const getImageA = async (id: number) : Promise<any> => {
    Logger.info(`Getting auction image from the database`);
    const conn = await getPool().getConnection();
    const query = 'SELECT image_filename FROM auction WHERE id = ?';
    const [ rows ] = await conn.query( query, [ id ] );
    conn.release();
    if (rows.length !== 0) {
        const photo = await fs.readFile('storage/images/' + rows[0].image_filename)
        return {photo, type: mime.getType(rows[0].image_filename)};
    } else {
        return false;
    }
};

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

const updateImageA = async (id: number, imageFilename: string) : Promise<any> => {
    Logger.info(`Updating Auction image from the database`);

    const conn = await getPool().getConnection();
    const query = 'UPDATE auction SET image_filename = ? WHERE id = ?';
    const [ rows ] = await conn.query( query, [[ imageFilename ], [ id ]]);
    conn.release();
    return rows

};


export { getImageA, storeImageA, updateImageA }