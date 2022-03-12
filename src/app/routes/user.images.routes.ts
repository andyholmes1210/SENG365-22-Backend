import {Express} from "express";
import * as usersImage from '../controllers/user.images.controller';
import {rootUrl} from "./base.routes";

module.exports = ( app: Express ) => {
    app.route( rootUrl + '/users/:id/image' )
        .get( usersImage.getUserImage );

};