import * as auctionImage from "../models/auction.images.model";
import Logger from "../../config/logger";
import {Request, Response} from "express";
import Console from "console";



const getAuctionImage = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`Request to get the auction image...'`)
    const id = req.params.id;
    try {
        const result = await auctionImage.getImageA( Number(id) );
        if (result === false) {
            res.status(404)
                .send('Not Found');
        } else {
            res.contentType( result.type );
            res.status( 200 )
                .send( result.photo );
        }
    } catch( err ) {
        if (err.errno === -2 || err.code === 'ENOENT') {
            res.status(404)
                .send('Not Found');
        } else {
            res.status(500)
                .send(`ERROR reading event (Internal Sever Error) ${id}: ${ err }`);
        }
    }
};

export { getAuctionImage }