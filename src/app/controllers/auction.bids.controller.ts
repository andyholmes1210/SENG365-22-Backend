import * as auctionBid from '../models/auction.bids.model';
import * as user from '../models/user.model';
import * as auction from '../models/auction.model'
import Logger from "../../config/logger";
import {Request, Response} from "express";

import Console from "console";

const getBidID = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`Request to get All Auction bids by ID...`)
    const id = req.params.id

    try {
        if (req.body !== 0){
            const result = await auctionBid.getbid( Number(id) );
            if (result === null) {
                res.status(404)
                    .json("Auction bid not found")
            } else {
                res.status( 200 )
                    .json( result );
            }
        }
    } catch( err ) {
        res.status( 500 )
            .send( `ERROR getting auctions (Internal Server Error) ${ err }` );
    }
};

const postBid = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`Create a Auction bid by ID...`)
    const date = new Date()
    const token = req.header('X-Authorization');
    const highestbid = await auctionBid.getbid(Number(req.params.id));
    const auctiondate = await auction.getauctiondate( Number(req.params.id) );

    try {
        if (token) {
            if (date > auctiondate) {
                res.status(400)
                    .send("Bad Request: Auction ended")
            } else if (req.body.amount < highestbid[0].amount) {
                res.status(400)
                    .send("Bad Request: Amount must be higher than the current bid")
            } else {
                await auctionBid.bid( Number(req.params.id), Number(req.body.authenticatedUserId), req.body.amount, date);
                res.status(201)
                    .send("Bid Placed")
            }
        } else {
            res.status(401)
                .send("Unauthorized: Need to login to place a bid");
        }
    } catch (err) {
        if (err.errno === 1062 || err.code === 'ER_DUP_ENTRY') {
            res.status(400)
                .send('Bad Request: Bid can not be the same amount as the previous bid')
        } else {
            res.status(500)
                .send("Internal Server Error")
        }
    }
}

export { getBidID, postBid }