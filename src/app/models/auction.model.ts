import { getPool } from "../../config/db";
import Logger from "../../config/logger";
import Console from "console";

const getAll = async () : Promise<Auction[]> => {
    Logger.info(`Getting all Auction from the database`);
    const conn = await getPool().getConnection();
    const query = 'SELECT * FROM auction';
    const [ rows ] = await conn.query( query );
    conn.release();
    return rows;
};

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
    const [ rows ] = await conn.query( query, [ id ] );
    conn.release();
    if (rows[0].auctionId === null){
        return false;
    } else {
        return rows;
    }

};

const category = async () : Promise<Category[]> => {
    Logger.info(`Getting all category from the database`);
    const conn = await getPool().getConnection();
    const query = 'SELECT ' +
        '   id AS categoryId, ' +
        '   name ' +
        'FROM category ' +
        'ORDER BY id ASC;';
    const [ rows ] = await conn.query( query );
    conn.release();
    return rows;
};


const getAuctionDate = async (id: number) : Promise<any> => {
    Logger.info(`Getting auction date from the database`);
    const conn = await getPool().getConnection();
    const query = 'SELECT end_date FROM auction WHERE id = ?'
    const [ rows ] = await conn.query( query , [ id ]);
    conn.release();
    return rows;
};





export { getAll, getOne, category, getAuctionDate }