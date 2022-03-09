import {Express} from "express";
import * as usersImage from '../controllers/users.images.controller';
import {rootUrl} from "./base.routes";

module.exports = ( app: Express ) => {
    app.route( rootUrl + '/users/register' )
        .post( usersImage.getUserImage );

};