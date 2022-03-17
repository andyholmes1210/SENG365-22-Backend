import {Express} from "express";
import * as users from '../controllers/user.controller';
import {rootUrl} from "./base.routes";
import * as authenticate from '../middleware/authenticate';

module.exports = ( app: Express ) => {
    app.route( rootUrl + '/users/register' )
        .post( users.registerUser );
    app.route(rootUrl + '/users/login' )
        .post( users.loginUser );
    app.route(rootUrl + '/users/logout' )
        .post( users.logoutUser );
    app.route(rootUrl + '/users/:id')
        .get( authenticate.loginRequired, users.getDetails )
        .patch( authenticate.loginRequired, users.updateDetails);
};