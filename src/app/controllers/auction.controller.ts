import * as auctions from '../models/auction.model';
import * as auctionBid from '../models/auction.bids.model';
import Logger from "../../config/logger";
import {Request, Response} from "express";

/**
 * Function to get all auction with/without query
 * @param req
 * @param res
 */
const getAllAuction = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`Request to get All Auction...`)
    const body = req.query;

    try {
        const result = await auctions.getAll(body.q, body.categoryIds, body.startIndex, body.count, body.sellerId, body.bidderId, body.sortBy)
        if (result === null) {
            res.status(400)
                .json('Bad Request');
            return;
        } else if (result === 1) {
            const array = new Array();
            res.status(200)
                .json({auctions: array, count: 0});
            return;
        } else {
            res.status(200)
                .json({auctions: result, count: result.length});
            return;
        }
    } catch {
        res.status(500)
            .send('Internal Server Error')
    }
};

/**
 * Function to get 1 Auction by id from the Request Params
 * @param req
 * @param res
 */
const getOneAuction = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`Request to get One Auction...`)
    const id = req.params.id

    try {
        const result = await auctions.getOne( Number(id) );
        if (result === false) {
            res.status(404)
                .json('Not Found');
            return;
        } else {
            res.status( 200 )
                .json( result[0] );
            return;
        }
    } catch( err ) {
            res.status( 500 )
                .send( `ERROR getting auction (Internal Sever Error) ${ err }` );
            return;
    }
};

/**
 * Function to add a new Auction into the Auction table using Request body as params
 * @param req
 * @param res
 */
const addAuction = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`Request to add Auction...`)
    const details = req.body;
    const token = req.header('X-Authorization');
    const userId = req.body.authenticatedUserId;
    const checkCategory = await auctions.getCategoryById( req.body.categoryId );

    try {
        if (token) {
            if (!req.body.hasOwnProperty("title") || details.title.length === 0) {
                res.status(400)
                    .send('Bad Request: Please provide title');
                return;
            } else if (!req.body.hasOwnProperty("description") || details.description.length === 0) {
                res.status(400)
                    .send('Bad Request: Please provide description');
                return;
            } else if (!req.body.hasOwnProperty("categoryId") || !checkCategory) {
                res.status(400)
                    .send('Bad Request: Please provide categoryId/categoryId does not exist');
                return;
            } else if (!req.body.hasOwnProperty("endDate") || details.endDate.length === 0) {
                res.status(400)
                    .send('Bad Request: Please provide endDate');
                return;
            } else {
                const titleExist = await auctions.checkAuctionTitle( details.title );
                if (!titleExist) {
                    if (req.body.hasOwnProperty("reserve")) {
                        const reserve = details.reserve;
                        const result  = await auctions.add(req.body, userId, reserve);
                        res.status(201)
                            .send({auctionId: result.insertId});
                        return;
                    } else {
                        const reserve = 1;
                        const result  = await auctions.add(req.body, userId, reserve);
                        res.status(201)
                            .send({auctionId: result.insertId});
                        return;
                    }
                } else {
                    res.status(400)
                        .send('Bad Request: Auction already exist');
                    return;
                }
            }
        } else {
            res.status(401)
                .send('Unauthorized');
            return;
        }
    } catch {
        res.status(500)
            .send('Internal Server Error');
        return;
    }
};

/**
 * Function to update existing Auction. User can only update their own Auction and can not update once there's a bid
 * @param req
 * @param res
 */
const updateAuction = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`Request to update Auction details...`)
    const auctionId = req.params.id
    const checkAuction = await auctions.getOne( Number(auctionId) );
    const userId = req.body.authenticatedUserId;
    const bidExist = await auctionBid.getBid( Number(auctionId) );

    try {
        if (checkAuction !== false) {
            if ( Number(userId) === checkAuction[0].sellerId) {
                if (bidExist === null) {
                    if(req.body.title === undefined) {
                        req.body.title = checkAuction[0].title;
                    }
                    if (req.body.description === undefined) {
                        req.body.description = checkAuction[0].description;
                    }
                    if (req.body.description === undefined) {
                        req.body.description = checkAuction[0].description;
                    }
                    if (req.body.endDate === undefined) {
                        const date = new Date(checkAuction[0].endDate)
                        req.body.endDate = date;
                    }
                    if (req.body.reserve === undefined) {
                        req.body.reserve = checkAuction[0].reserve;
                    }
                    if (req.body.categoryId === undefined) {
                        req.body.categoryId = checkAuction[0].categoryId;
                    }
                    if (req.body.image_filename === undefined) {
                        req.body.image_filename = checkAuction[0].image_filename;
                    }
                    const result = await auctions.update( Number(auctionId), req.body);
                    res.status(200)
                        .json(result);
                    return;
                } else {
                    res.status(403)
                        .send('Forbidden: bid has been place can not update auction');
                    return;
                }
            } else {
                res.status(403)
                    .send('Forbidden');
                return;
            }
        } else {
            res.status(404)
                .send('Auction Not Found');
            return;
        }
    } catch {
        res.status(500)
            .send('Internal Server Error');
        return;
    }
};

/**
 * Function to get all Category
 * @param req
 * @param res
 */
const getAllCategory = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`Request to get All Categories...`)

    try {
        const result = await auctions.category();
        res.status( 200 )
            .send( result );
        return;
    } catch( err ) {
        res.status( 500 )
            .send( `ERROR getting categories (Internal Sever Error) ${ err }` );
        return;
    }
};

/**
 * Function to delete an Auction from the database. User can only delete their own Auction and can not
 * delete an Auction once there's a bid
 * @param req
 * @param res
 */
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
                            .send('OK: Auction deleted');
                        return;

                    } else {
                        res.status(403)
                            .send('Forbidden: bid has been place can not delete auction');
                        return;
                    }
                } else {
                    res.status(403)
                        .send('Forbidden');
                    return;
                }
            } else {
                res.status(404)
                    .send('Auction Not Found');
                return;
            }
        }
    } catch {
        res.status(500)
            .send('Internal Server Error');
        return;
    }
};

export { getOneAuction, getAllCategory, deleteAuctionById, addAuction, updateAuction, getAllAuction }