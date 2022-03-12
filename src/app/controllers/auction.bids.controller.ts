import * as auctionBid from '../models/auction.bids.model';
import Logger from "../../config/logger";
import {Request, Response} from "express";
import Console from "console";


const getBidID = async (req: Request, res: Response) : Promise<void> =>
{
    Logger.http(`Request to get All Auction bids by ID...`)
    const id = req.params.id

    try {
        if (req.body !== 0){
            const result = await auctionBid.getBid( Number(id) );
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

export { getBidID }