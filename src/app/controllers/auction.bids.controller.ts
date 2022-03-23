import * as auctionBid from '../models/auction.bids.model';
import * as auction from '../models/auction.model'
import Logger from "../../config/logger";
import {Request, Response} from "express";
import * as Console from "console";

/**
 * Function to get the all bid by using the id from the Request params
 * @param req
 * @param res
 */
const getBidID = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`Request to get All Auction bids by ID...`);
    const id = req.params.id;

    try {
        if (req.body !== 0){
            const result = await auctionBid.getBid( Number(id) );
            if (result === null) {
                res.status(404)
                    .json("Auction bid not found");
                return;
            } else {
                res.status( 200 )
                    .json( result );
                return;
            }
        }
    } catch( err ) {
        res.status( 500 )
            .send( `ERROR getting auctions (Internal Server Error) ${ err }` );
        return;
    }
};

/**
 * Function to create bid using the Request body as parameters and insert into auction_bids table
 * @param req
 * @param res
 */
const postBid = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`Create a Auction bid by ID...`);
    const date = new Date();
    const token = req.header('X-Authorization');

    try {
        const auctionExist = await auction.getOne(Number(req.params.id));
        const auctionDate = await auction.getAuctionDate( Number(req.params.id) );
        if (token) {
            if (auctionExist) {
                if (date < auctionDate) {
                    if (req.body.amount > auctionExist[0].reserve) {
                    const highestBid: any = auctionExist[0].amount;
                    const sellerId = auctionExist[0].sellerId;
                        if (sellerId.sellerId === Number(req.body.authenticatedUserId)) {
                            res.status(403)
                                .send("Forbidden: Can not place bid on your own Auction");
                            return;
                        } else {
                           if (req.body.amount < highestBid) {
                                res.status(400)
                                    .send("Bad Request: Amount must be higher than the current bid");
                               return;
                            } else {
                                await auctionBid.bid( Number(req.params.id), Number(req.body.authenticatedUserId), req.body.amount, date);
                                res.status(201)
                                 .send("Bid Placed");
                               return;
                            }
                        }
                    } else {
                        res.status(404)
                            .send("Bad Request: Bid must be greater than the reserved price");
                        return;
                    }
                } else {
                    res.status(400)
                        .send("Bad Request: Auction ended");
                    return;
                }
            } else {
                res.status(404)
                    .send("Auction not found");
                return;
            }
        }
    } catch (err) {
        if (err.errno === 1062 || err.code === 'ER_DUP_ENTRY') {
            res.status(400)
                .send('Bad Request: Bid can not be the same amount as the previous bid');
            return;
        } else if (err.errno === 1054 || err.code === 'ER_BAD_FIELD_ERROR') {
            res.status(404)
                .send('Not Found')
            return;
        } else {
            res.status(500)
                .send("Internal Server Error");
            return;
        }
    }
};

export { getBidID, postBid }