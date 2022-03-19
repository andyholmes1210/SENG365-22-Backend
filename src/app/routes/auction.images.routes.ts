import {Express} from "express";
import * as auctionImage from '../controllers/auction.images.controller';
import {rootUrl} from "./base.routes";
import * as authenticate from "../middleware/authenticate";

module.exports = ( app: Express ) => {
    app.route( rootUrl + '/auctions/:id/image' )
        .get( auctionImage.getAuctionImage )
        .put( authenticate.loginRequired, auctionImage.updateAuctionImage );

};