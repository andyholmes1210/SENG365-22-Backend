import { getPool } from "../../config/db";
import Logger from "../../config/logger";

/**
 * SQL Function that gets all the bid by bid id
 * @param id: number
 */
const getBid = async (id: number) : Promise<any> => {
    Logger.info(`Getting All bid by ID from the database`);
    const conn = await getPool().getConnection();
    const query = 'SELECT ' +
        '   auction_bid.id AS bidId, ' +
        '   auction_bid.user_id AS bidderId, ' +
        '   auction_bid.amount, ' +
        '   user.first_name AS firstName, ' +
        '   user.last_name AS lastName, ' +
        '   auction_bid.timestamp ' +
        'FROM auction_bid ' +
        'INNER JOIN user ON auction_bid.user_id = user.id ' +
        'WHERE auction_bid.auction_id = ? ' +
        'ORDER BY auction_bid.amount DESC;';
    const [ result ] = await conn.query(query, [ id ]);
    conn.release();
    if (result.length === 0) {
        return null;
    } else {
        return result;
    }
};

/**
 * SQL Function that when a user make a bid it will insert the bid into the database
 * @param auctionId: number
 * @param id: number
 * @param amount: number
 * @param dateTime: Date
 */
const bid = async (auctionId: number, id: number, amount: number, dateTime: Date) : Promise<any> => {
    Logger.info(`Inserting a bid into the database`);
    const conn = await getPool().getConnection();
    const query = 'INSERT INTO auction_bid (auction_id, user_id, amount, timestamp) VALUES ( ? )';
    const [ result ] = await conn.query( query, [[[auctionId] , [id],  [amount], [dateTime]]]);
    conn.release();
    return result;
};

export { getBid, bid }