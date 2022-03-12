import {Express} from "express";
import * as auctionImage from '../controllers/auction.images.controller';
import {rootUrl} from "./base.routes";

module.exports = ( app: Express ) => {
    app.route( rootUrl + '/auctions/:id/image' )
        .get( auctionImage.getAuctionImage );

};