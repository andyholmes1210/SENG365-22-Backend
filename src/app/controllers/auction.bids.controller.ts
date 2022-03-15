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
            if (result === false) {
                res.status(404)
                    .send('Not Found')
            } else {
                res.status( 200 )
                    .send( result );
            }
        }
    } catch( err ) {
        res.status( 500 )
            .send( `ERROR getting auctions (Internal Server Error) ${ err }` );
    }
};


const postBid = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`Create a Auction bid by ID...`)
    const options = { year: 'numeric', month: 'short', day: 'numeric'};
    const date = new Date().toISOString().slice(0,10);
    const time = new Date().toISOString().slice(11,19);
    const token = req.header('X-Authorization');
    const dateTime = date + " " + time;

    try {
        if (token) {
            Console.log(1)
            // const userid = await user.getidbytoken(token);
            const auctiondate = await auction.getauctiondate( Number(req.params.id) );
            Console.log(343224)
            const placebid = await auctionBid.bid( Number(req.params.id), Number(req.body.authenticatedUserId), req.body.amount, dateTime);
            Console.log(2)
            if (placebid[0].timestamp < auctiondate) {
                Console.log(3)
                res.status(201)
                    .send("Bid placed")
            } else {
                Console.log(4)
                res.status(403)
                    .send("Forbidden: Auction ended")
            }
        } else {
            Console.log(5)
            res.status(400)
                .send("Bad Request: Need to login to place a bid");
        }
    } catch {
        Console.log(6)
        res.status(500)
            .send("Internal Server Error")
    }
}

export { getBidID, postBid }