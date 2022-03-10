import { getPool } from "../../config/db";
import Logger from "../../config/logger";


const getAll = async () : Promise<Auction[]> => {
    Logger.info(`Getting all Auction from the database`);
    const conn = await getPool().getConnection();
    const query = 'SELECT * FROM auction';
    const [ rows ] = await conn.query( query );
    conn.release();
    return rows;
};

const getOne = async (id: number) : Promise<Auction[]> => {
    Logger.info(`Getting one Auction from the database`);
    const conn = await getPool().getConnection();
    const query = 'SELECT auction.id, auction.title, auction.category_id, auction.seller_id, user.first_name, user.last_name, ' +
        'auction.reserve, auction_bid.amount, auction.end_date, auction.title ' +
        'FROM auction ' +
        'INNER JOIN user ON auction.seller_id = user.id ' +
        'INNER JOIN auction_bid ON auction.seller_id = auction_bid.id ' +
        'WHERE auction.id = ?';
    const [ rows ] = await conn.query( query, [ id ] );
    conn.release();
    return rows;
};

const category = async () : Promise<Category[]> => {
    Logger.info(`Getting all category from the database`);
    const conn = await getPool().getConnection();
    const query = 'SELECT * FROM category';
    const [ rows ] = await conn.query( query );
    conn.release();
    return rows;
};






export { getAll, getOne, category }