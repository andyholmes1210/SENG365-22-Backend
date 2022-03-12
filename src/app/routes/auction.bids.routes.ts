import {Express} from "express";
import * as auctionBid from '../controllers/auction.bids.controller';
import {rootUrl} from "./base.routes";

module.exports = ( app: Express ) => {
    app.route( rootUrl + '/auctions/:id/bids' )
        .get( auctionBid.getBidID );

};