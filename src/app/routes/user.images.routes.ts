import {Express} from "express";
import * as usersImage from '../controllers/user.images.controller';
import * as authenticate from '../middleware/authenticate';
import {rootUrl} from "./base.routes";

module.exports = ( app: Express ) => {
    app.route( rootUrl + '/users/:id/image' )
        .get( usersImage.getUserImage )
        .delete( authenticate.loginRequired, usersImage.deleteUserImage );
};