import * as auctions from '../models/auction.model';
import Logger from "../../config/logger";
import {Request, Response} from "express";
import Console from "console";


const getAllAuction = async (req: Request, res: Response) : Promise<void> =>
{
    Logger.http(`Request to get All Auction...`)
    try {
        if (req.body !== 0){
            const result = await auctions.getAll();
            res.status( 200 ).send( result );
        } else {
            res.status(400)
                .send('Bad Request')
        }
    } catch( err ) {
        res.status( 500 )
            .send( `ERROR getting auctions (Internal Sever Error) ${ err }` );
    }
};

const getOneAuction = async (req: Request, res: Response) : Promise<void> =>
{
    Logger.http(`Request to get One Auction...`)
    const id = req.params.id

    try {
        const result = await auctions.getOne( Number(id) );
        if (result === false) {
            res.status(404)
                .send('Not Found')
        } else {
            res.status( 200 )
                .json( result[0] );
        }
    } catch( err ) {
        res.status( 500 )
            .send( `ERROR getting auction (Internal Sever Error) ${ err }` );
    }

};

const getAllCategory = async (req: Request, res: Response) : Promise<void> =>
{
    Logger.http(`Request to get All Categories...`)
    try {
        const result = await auctions.category();
        res.status( 200 )
            .send( result );
    } catch( err ) {
        res.status( 500 )
            .send( `ERROR getting categories (Internal Sever Error) ${ err }` );
    }
};

export { getAllAuction, getOneAuction, getAllCategory }