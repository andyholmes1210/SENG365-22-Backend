import {Express} from "express";
import * as auctions from '../controllers/auction.controller';
import * as authenticate from '../middleware/authenticate';
import {rootUrl} from "./base.routes";

module.exports = ( app: Express ) => {
    app.route( rootUrl + '/auctions' )
        // .get( auctions.getAllAuction )
        .post( authenticate.loginRequired, auctions.addAuction);
    app.route( rootUrl + '/auctions/categories')
        .get( auctions.getAllCategory );
    app.route( rootUrl + '/auctions/:id')
        .get( auctions.getOneAuction )
        .delete( authenticate.loginRequired, auctions.deleteAuctionById)
        .patch( authenticate.loginRequired, auctions.updateAuction)
};

