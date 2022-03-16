import { getPool } from "../../config/db";
import Logger from "../../config/logger";
import Console from "console";


const getbid = async (id: number) : Promise<any> => {
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
    const [rows] = await conn.query(query, [ id ]);
    conn.release();
    if (rows.length === 0) {
        return null;
    } else {
        return rows;
    }
};


/*
FIX QUERY
 */
const bid = async (auctionid: number, id: number, amount: number, dateTime: Date) : Promise<any> => {
    Logger.info(`Inserting a bid into the database`);
    const conn = await getPool().getConnection();
    const query = 'INSERT INTO auction_bid (auction_id, user_id, amount, timestamp) VALUES ( ? )';
    const [ result ] = await conn.query( query, [[[auctionid] , [id],  [amount], [dateTime]]]);
    conn.release();
    return result;
}

export { getbid, bid }