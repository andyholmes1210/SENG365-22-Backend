import {Express} from "express";
import * as auctions from '../controllers/auctions.controller';
import {rootUrl} from "./base.routes";

module.exports = ( app: Express ) => {
    app.route( rootUrl + '/auctions' )
        .get( auctions.getAllAuction );
    app.route( rootUrl + '/auctions/categories')
        .get( auctions.getAllCategory );
    app.route( rootUrl + '/auctions/:id')
        .get( auctions.getOneAuction );
};

