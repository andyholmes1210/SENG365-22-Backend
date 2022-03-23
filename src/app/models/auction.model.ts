import { getPool } from "../../config/db";
import Logger from "../../config/logger";
import {ResultSetHeader} from "mysql2";

const getAll = async () : Promise<Auction[]> => {
    Logger.info(`Getting all Auction from the database`);
    const conn = await getPool().getConnection();
    const query = 'SELECT * FROM auction';
    const [ result ] = await conn.query( query );
    conn.release();
    return result;
};

/**
 * SQL Function that get one auction using the auction id
 * @param id: number
 */
const getOne = async (id: number) : Promise<any> => {
    Logger.info(`Getting one Auction from the database`);
    const conn = await getPool().getConnection();
    const query = 'SELECT ' +
        '   auction.id AS auctionId, ' +
        '   auction.title, ' +
        '   auction.description, ' +
        '   auction.category_id AS categoryId, ' +
        '   auction.seller_id AS sellerId, ' +
        '   user.first_name AS sellerFirstName, ' +
        '   user.last_name AS sellerLastName, ' +
        '   auction.reserve, ' +
        '   COUNT(auction_bid.auction_id) AS numBids, ' +
        '   COALESCE(MAX(auction_bid.amount), 0) AS highestBid, ' +
        '   auction.end_date AS endDate, ' +
        '   auction.title ' +
        'FROM auction ' +
        'INNER JOIN user ON auction.seller_id = user.id ' +
        'INNER JOIN auction_bid ON auction.id = auction_bid.auction_id ' +
        'WHERE auction.id = ?';
    const [ result ] = await conn.query( query, [ id ] );
    conn.release();
    if (result[0].auctionId === null){
        return false;
    } else {
        return result;
    }

};

/**
 * SQL Function that add a new auction into the database
 * @param values: Auction types
 * @param id: number
 * @param reserve: number
 */
const add = async(values: Auction, id: number, reserve: number) : Promise<ResultSetHeader> => {
    Logger.info(`Adding auction into the database`);
    const conn = await getPool().getConnection();
    const query = 'INSERT INTO auction (title, description, end_date, image_filename, reserve, seller_id, category_id) VALUES ( ? )';
    const [ result ] = await conn.query( query ,[[[values.title], [values.description], [values.endDate],
        [values.image_filename], [reserve], [id], [values.categoryId]]]);
    conn.release();
    return result;
};

/**
 * SQL Function that get all the category
 */
const category = async () : Promise<Category[]> => {
    Logger.info(`Getting all category from the database`);
    const conn = await getPool().getConnection();
    const query = 'SELECT ' +
        '   id AS categoryId, ' +
        '   name ' +
        'FROM category ' +
        'ORDER BY id ASC;';
    const [ result ] = await conn.query( query );
    conn.release();
    return result;
};

/**
 * SQL Function that update the auction details
 * @param id: number
 * @param values: Auction types
 */
const update = async (id: number, values: Auction) : Promise<any> => {
    Logger.info(`Updating auction from the database`);

    const conn = await getPool().getConnection();
    const query = 'UPDATE auction ' +
        'SET title = ?, ' +
        'description = ?, ' +
        'end_date = ?, ' +
        'image_filename = ?, ' +
        'reserve = ?, ' +
        'category_id = ? ' +
        'WHERE id = ?';
    const [ result ] = await conn.query( query, [[values.title], [values.description], [values.endDate], [values.image_filename],
        [values.reserve], [values.categoryId], [ id ]] );
    conn.release();
    return result;

};

/**
 * SQL Function that delete auction from database by id
 * @param id: number
 */
const deleteAuction = async (id: number) : Promise<any> => {
    Logger.info(`Deleting auction from the database`);
    const conn = await getPool().getConnection();
    const query = 'DELETE FROM auction WHERE id = ?';
    await conn.query( query, [ id ]);
    conn.release();
};

/**
 * SQL Function that check if the Auction title exist in the database (duplication)
 * @param title
 */
const checkAuctionTitle = async (title: string) : Promise<any> => {
    Logger.info(`Checking auction title in the database`);
    const conn = await getPool().getConnection();
    const query = 'SELECT id FROM auction where title = ?';
    const [ result ] = await conn.query( query, [ title ]);
    conn.release();
    if (result.length === 0) {
        return false;
    } else
        return true;

};

/**
 * SQL Function that get the auction date using id
 * @param id
 */
const getAuctionDate = async (id: number) : Promise<any> => {
    Logger.info(`Getting auction date from the database`);
    const conn = await getPool().getConnection();
    const query = 'SELECT end_date FROM auction WHERE id = ?';
    const [ result ] = await conn.query( query , [ id ]);
    conn.release();
    return result;
};

/**
 * SQL Function that get category name from the database using id
 * @param id
 */
const getCategoryById = async (id: number) : Promise<any> => {
    Logger.info(`Getting category name from the database`);

    const conn = await getPool().getConnection();
    const query = 'SELECT name FROM category WHERE id = ?'
    const [ result ] = await conn.query( query, [ id ])
    conn.release();
    if (result.length === 0) {
        return false;
    } else
        return true;
};


export { getAll, getOne, category, getAuctionDate, deleteAuction, add, checkAuctionTitle, getCategoryById, update }