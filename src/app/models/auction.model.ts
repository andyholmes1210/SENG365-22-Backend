import { getPool } from "../../config/db";
import Logger from "../../config/logger";
import {ResultSetHeader} from "mysql2";
import {ParsedQs} from "qs";

/**
 * Get all auction using query
 * @param q: string | string[] | ParsedQs | ParsedQs[]
 * @param categoryIds: string | string[] | ParsedQs | ParsedQs[]
 * @param startIndex: string | string[] | ParsedQs | ParsedQs[]
 * @param count: string | string[] | ParsedQs | ParsedQs[]
 * @param sellerId: string | string[] | ParsedQs | ParsedQs[]
 * @param bidderId: string | string[] | ParsedQs | ParsedQs[]
 * @param sortBy: string | string[] | ParsedQs | ParsedQs[]
 */
const getAll = async (q: string | string[] | ParsedQs | ParsedQs[], categoryIds: string | string[] | ParsedQs | ParsedQs[], startIndex: string | string[] | ParsedQs | ParsedQs[], count: string | string[] | ParsedQs | ParsedQs[], sellerId: string | string[] | ParsedQs | ParsedQs[], bidderId: string | string[] | ParsedQs | ParsedQs[], sortBy: string | string[] | ParsedQs | ParsedQs[]) : Promise<any> => {
    Logger.info(`Getting all Auction from the database`);
    const conn = await getPool().getConnection();
    if(q === undefined && categoryIds === undefined && startIndex === undefined && count === undefined && sellerId === undefined && bidderId === undefined && sortBy === undefined) {
        const query = 'SELECT ' +
            'auction.id as auctionId, ' +
            'auction.title as title, ' +
            'auction.reserve as reserve, ' +
            'auction.seller_id as sellerId, ' +
            'auction.category_id as categoryId, ' +
            'user.first_name as sellerFirstName, ' +
            'user.last_name as sellerLastName, ' +
            'auction.end_date as endDate, ' +
            'COUNT(auction_bid.auction_id) AS numBids, ' +
            'COALESCE(MAX(auction_bid.amount), null) AS highestBid ' +
            'FROM auction ' +
            'JOIN user ON auction.seller_id = user.id ' +
            'JOIN category ON auction.category_id = category.id ' +
            'LEFT JOIN auction_bid ON auction.id = auction_bid.auction_id ' +
            'GROUP BY auction.id ' +
            'ORDER BY auction.end_date ASC';
        const [ result ] = await conn.query( query );
        conn.release();
        return result;
    } else {
        let index = "";
        let countNum = "";
        let sort = "";
        let countMax = 0;
        const resultQ: number[] = [];
        const counts:object = {};

        if (q !== undefined) {
            const queryQ = "SELECT id FROM auction WHERE locate(?, title, 0) != 0"
            const [ result ] = await conn.query( queryQ, [ q ] );
            // tslint:disable-next-line:prefer-for-of
            for (let i=0;i<result.length;i++){
                resultQ.push(result[i].id);
            }
            countMax += 1;
        }

        if (categoryIds !== undefined) {
            if (isNaN(Number(categoryIds)) === true) {
                return null;
            }
            const queryQ = "SELECT id FROM auction WHERE category_id = ?"
            const [result] = await conn.query(queryQ, [Number(categoryIds)]);
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < result.length; i++) {
                resultQ.push(result[i].id);
            }
            countMax += 1;
        };

        if (sellerId !== undefined) {
            if(isNaN(Number(sellerId)) === true) {
                return null;
            }
            const queryQ = "SELECT id FROM auction WHERE seller_id = ?"
            const [result] = await conn.query(queryQ, [ Number(sellerId) ]);
            // tslint:disable-next-line:prefer-for-of
            for (let i=0;i<result.length; i++) {
                resultQ.push(result[i].id);
            }
            countMax += 1;
        };

        if (bidderId !== undefined) {
            if (isNaN(Number(bidderId)) === true) {
                return null;
            }
            const queryQ = "SELECT auction_id FROM auction_bid WHERE user_id = ?"
            const [result] = await conn.query(queryQ, [ Number(bidderId) ]);
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < result.length; i++) {
                resultQ.push(result[i].auction_id);
            }
            countMax += 1;
        };

        for (const i of resultQ) {
            // @ts-ignore
            counts[i] = counts[i]?counts[i] + 1 : 1;
        }
        const map = new Map();
        for (const i of resultQ) {
            // @ts-ignore
            map.set(i, counts[i]);
        }
        const resultF = [];
        for (const [key, value] of map.entries()) {
            // @ts-ignore
            if (value >= countMax){
                resultF.push(key);
            }
        }
        if (startIndex !== undefined) {
            if (isNaN(Number(startIndex)) === true) {
                return null;
            }
            index = ` offset ${startIndex}`;
        }
        if (count !== undefined) {
            if(isNaN(Number(count)) === true) {
                return null;
            }
            countNum = ` limit ${count}`;
        }
        if (Object.keys(resultF).length === 0) {
            return 1;
        }
        if (sortBy !== undefined) {
            if (sortBy === 'ALPHABETICAL_ASC') {
                sort = ` ORDER BY auction.title ASC`;
            }
            if (sortBy === 'ALPHABETICAL_DESC') {
                sort = ` ORDER BY auction.title DESC`;
            }
            if (sortBy === 'CLOSING_SOON') {
                sort = ` ORDER BY auction.end_date ASC`;
            }
            if (sortBy === 'CLOSING_LAST') {
                sort = ` ORDER BY auction.end_date DESC`;
            }
            if (sortBy === 'BIDS_ASC') {
                sort = ` ORDER BY auction_bid.amount ASC`;
            }
            if (sortBy === 'BIDS_DESC') {
                sort = ` ORDER BY auction_bid.amount DESC`;
            }
            if (sortBy === 'RESERVE_ASC') {
                sort = ` ORDER BY auction.reserve ASC`;
            }
            if (sortBy === 'RESERVE_DESC') {
                sort = ` ORDER BY auction.reserve DESC`;
            }
            const query = `SELECT `  +
                `auction.id as auctionId, ` +
                `auction.title as title, ` +
                `auction.reserve as reserve, ` +
                `auction.seller_id as sellerId, ` +
                `auction.category_id as categoryId, ` +
                `user.first_name as sellerFirstName, ` +
                `user.last_name as sellerLastName, ` +
                `auction.end_date as endDate, ` +
                `COUNT(auction_bid.auction_id) AS numBids, ` +
                `COALESCE(MAX(auction_bid.amount), null) AS highestBid ` +
                `FROM auction ` +
                `JOIN user ON auction.seller_id = user.id ` +
                `JOIN category ON auction.category_id = category.id ` +
                `LEFT JOIN auction_bid ON auction.id = auction_bid.auction_id ` +
                `WHERE auction.id IN (${resultF}) ` +
                `GROUP BY auction.id` + sort + countNum + index;
            const [ result ] = await conn.query( query );
            conn.release();
            return result;
        } else {
            const query = `SELECT `  +
                `auction.id as auctionId, ` +
                `auction.title as title, ` +
                `auction.reserve as reserve, ` +
                `auction.seller_id as sellerId, ` +
                `auction.category_id as categoryId, ` +
                `user.first_name as sellerFirstName, ` +
                `user.last_name as sellerLastName, ` +
                `auction.end_date as endDate, ` +
                `COUNT(auction_bid.auction_id) AS numBids, ` +
                `COALESCE(MAX(auction_bid.amount), null) AS highestBid ` +
                `FROM auction ` +
                `JOIN user ON auction.seller_id = user.id ` +
                `JOIN category ON auction.category_id = category.id ` +
                `LEFT JOIN auction_bid ON auction.id = auction_bid.auction_id ` +
                `WHERE auction.id IN (${resultF}) ` +
                `GROUP BY auction.id ` +
                `ORDER BY auction.end_date ASC` + countNum + index ;
            const [ result ] = await conn.query( query );
            conn.release();
            return result;
        }
    }
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


export { getOne, category, getAuctionDate, deleteAuction, add, checkAuctionTitle, getCategoryById, update, getAll }