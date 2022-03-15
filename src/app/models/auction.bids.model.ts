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
    Console.log(rows)
    conn.release();
    if (rows.length === 0) {
        return false;
    } else {
        return rows;
    }
};


/*
FIX QUERY
 */
const bid = async (auctionid: number, id: number, amount: number, dateTime: string) : Promise<any> => {
    Logger.info(`Getting All bid by ID from the database`);
    const conn = await getPool().getConnection();
    Console.log("asdasdas")
    const query = 'INSERT INTO auction_bid (auction_id) ' +
        'SELECT id ' +
        'FROM auction ' +
        'WHERE auction_id = ?'
    Console.log("fasfasdas")
    const query1 = 'INSERT INTO auction_bid (user_id) ' +
        'SELECT id ' +
        'FROM user ' +
        'WHERE user_id = ?'
    Console.log("gasdgdsg")
    const query2 = 'INSERT INTO auction_bid ' +
        '(amount, ' +
        'timestamp) ' +
        'VALUES ( ? ) '
    Console.log("jkrfhfgh")
    const [ result ] = await conn.query( query, query1, query2, [ auctionid ], [ id ], [ amount ], [ dateTime ])
    Console.log(result)
    conn.release();
    return result;
}

export { getbid, bid }