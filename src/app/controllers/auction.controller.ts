import * as auctions from '../models/auction.model';
import * as auctionBid from '../models/auction.bids.model';
import Logger from "../../config/logger";
import {Request, Response} from "express";
import Console from "console";
import {getOne} from "../models/auction.model";


const getAllAuction = async (req: Request, res: Response) : Promise<void> => {
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

const getOneAuction = async (req: Request, res: Response) : Promise<void> => {
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

const addAuction = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`Request to delete Auction...`)

    const details = req.body;
    const token = req.header('X-Authorization');
    const userId = req.body.authenticatedUserId;
    const checkCategory = await auctions.getCategoryById( req.body.categoryId );

    try {
        if (token) {
            if (!req.body.hasOwnProperty("title") || details.title.length === 0) {
                res.status(400)
                    .send('Bad Request: Please provide title');
            } else if (!req.body.hasOwnProperty("description") || details.description.length === 0) {
                res.status(400)
                    .send('Bad Request: Please provide description');
            } else if (!req.body.hasOwnProperty("reserve") || details.reserve === "") {
                res.status(400)
                    .send('Bad Request: Please provide reserve');
            } else if (!req.body.hasOwnProperty("categoryId") || !checkCategory) {
                res.status(400)
                    .send('Bad Request: Please provide categoryId/categoryId does not exist');
            } else if (!req.body.hasOwnProperty("endDate") || details.endDate.length === 0) {
                res.status(400)
                    .send('Bad Request: Please provide endDate');
            } else {
                const titleExist = await auctions.checkAuctionTitle( details.title );
                if (!titleExist) {
                    if (req.body.hasOwnProperty("reserve")) {
                        const reserve = details.reserve;
                        const result  = await auctions.add(req.body, userId, reserve);
                        res.status(201)
                            .send({auctionId: result.insertId});
                    } else {
                        const reserve = 1;
                        const result  = await auctions.add(req.body, userId, reserve);
                        res.status(201)
                            .send({auctionId: result.insertId});
                    }
                } else {
                    res.status(400)
                        .send('Bad Request: Auction already exist')
                }
            }
        } else {
            res.status(401)
                .send('Unauthorized')
        }
    } catch {
        res.status(500)
            .send('Internal Server Error')
    }
};

const updateAuction = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`Request to update Auction...`)

    const auctionId = req.params.id
    const checkAuction = await auctions.getOne( Number(auctionId) );
    const userId = req.body.authenticatedUserId;
    const bidExist = await auctionBid.getBid( Number(auctionId) );

    try {
        if (checkAuction !== false) {
            if ( Number(userId) === checkAuction[0].sellerId) {
                if (bidExist === null) {
                    Console.log(1)
                    if(req.body.title === undefined){
                        req.body.title = checkAuction[0].title;
                    }
                    if (req.body.description === undefined){
                        req.body.description = checkAuction[0].description;
                    }
                    if (req.body.description === undefined){
                        req.body.description = checkAuction[0].description;
                    }
                    if (req.body.endDate === undefined){
                        const date = new Date(checkAuction[0].endDate)
                        req.body.endDate = date;
                    }
                    if (req.body.reserve === undefined){
                        req.body.reserve = checkAuction[0].reserve;
                    }
                    if (req.body.categoryId === undefined){
                        req.body.categoryId = checkAuction[0].categoryId;
                    }
                    if (req.body.image_filename === undefined){
                        req.body.image_filename = checkAuction[0].image_filename;
                    }
                    Console.log(req.body)
                    Console.log(2)
                    const result = await auctions.update( Number(auctionId), req.body);
                    res.status(200)
                        .json(result);
                } else {
                    res.status(403)
                        .send('Forbidden: bid has been place can not update auction')
                }
            } else {
                res.status(403)
                    .send('Forbidden')
            }
        } else {
            res.status(404)
                .send('Auction Not Found')
        }
    } catch {
        res.status(500)
            .send('Internal Server Error')
    }
};

const getAllCategory = async (req: Request, res: Response) : Promise<void> => {
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

const deleteAuctionById = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`Request to delete auction...`)

    const auctionExist = await auctions.getOne( Number( req.params.id ) );
    const bidExist = await auctionBid.getBid( Number(req.params.id ));
    const token = req.header('X-Authorization');
    const userId = req.body.authenticatedUserId;

    try {
        if (token) {
            if (auctionExist) {
                const sellerId = auctionExist[0].sellerId;
                if ( Number(userId) === sellerId) {
                    if (bidExist === null) {
                        await auctions.deleteAuction( Number(req.params.id) );
                        res.status(200)
                            .send('OK: Auction deleted')

                    } else {
                        res.status(403)
                            .send('Forbidden: bid has been place can not delete auction')
                    }
                } else {
                    res.status(403)
                        .send('Forbidden')
                }
            } else {
                res.status(404)
                    .send('Auction Not Found')
            }
        }
    } catch {
        res.status(500)
            .send('Internal Server Error');
    }
}

export { getAllAuction, getOneAuction, getAllCategory, deleteAuctionById, addAuction, updateAuction }