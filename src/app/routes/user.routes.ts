import {Express} from "express";
import * as users from '../controllers/user.controller';
import {rootUrl} from "./base.routes";

module.exports = ( app: Express ) => {
    app.route( rootUrl + '/users/register' )
        .post( users.registerUser );
    app.route(rootUrl + '/users/login' )
        .post( users.loginUser )

};