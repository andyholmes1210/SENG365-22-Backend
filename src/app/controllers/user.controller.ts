import * as users from "../models/user.model";
import Logger from "../../config/logger";
import {Request, Response} from "express";
import {randomToken} from '../middleware/randtoken';

/**
 * Function to register/add a new user
 * @param req
 * @param res
 */
const registerUser = async (req: Request, res: Response) : Promise<void> => {
    Logger.http('Request to create a new user...');
    const password =  req.body.password;
    const email = req.body.email;

    if (email.indexOf("@") === -1 || email.length === 0 ) {
        res.status(400)
            .send("Bad Request: Email must contain @/Can not be empty");
        return;
    } else if (!req.body.hasOwnProperty("password") || password.length === 0) {
        res.status(400)
            .send("Bad Request: Please provide Password");
        return;
    } else if (!req.body.hasOwnProperty("lastName") && !req.body.hasOwnProperty("firstName")) {
        res.status(400).send("Bad Request: Please provide firstName and lastName field");
        return;
    } else if (!req.body.hasOwnProperty("firstName") || req.body.firstName.length === 0) {
        res.status(400).send("Bad Request: Please provide firstName");
        return;
    } else if (!req.body.hasOwnProperty("lastName") || req.body.lastName.length === 0) {
        res.status(400).send("Bad Request: Please provide lastName");
        return;
    } else {
            try {
                const userid = await users.register(req.body)
                Logger.http(`User ${userid.insertId} is successfully added`);
                res.status(201)
                    .send({userId: userid.insertId});
                return;
            } catch (err) {
                if (err.errno === 1062 || err.code === 'ER_DUP_ENTRY')
                {
                    res.status(400)
                        .send('Bad Request: Email already in use, please try again');
                    return;

                } else {
                    res.status(500)
                        .send('Internal Server Error');
                    return;
                }
            }
    }
};

/**
 * Function to log in existing user
 * @param req
 * @param res
 */
const loginUser = async (req: Request, res: Response) : Promise<void> => {
    Logger.http('Request to login a user...');

    const token = await randomToken(32);
    const tokenExist = await users.getToken(req.body.email);
    const userExist = await users.checkUserExist(req.body.email)

    if (userExist) {
        if (tokenExist[0].auth_token !== null) {
            res.status(400)
                .send("Bad Request: Already login");
            return;
        } else {
            const user = await users.login(req.body, token);
            if (user === false) {
                res.status(400)
                    .send("Bad Request: Incorrect password");
                return;

            } else if (user.length > 0) {
                res.header('X-Authorization', token);
                res.statusMessage = 'Login Successful';
                res.status(200)
                    .send({userId: user[0].id, token});
                return;

            } else {
                res.status(500)
                    .send('Internal Server Error');
                return;
            }
        }
    } else {
        res.status(400)
            .send("Bad Request: Need to register first");
        return;
    }
};

const logoutUser = async (req: Request, res: Response) : Promise<void> => {
    Logger.http('Request to logout user...');

    const token = req.header('X-Authorization');

    try {
        if (token) {
            if (token === JSON.stringify(null)) {
                res.status(400)
                    .send('Bad Request: You need to login to logout');
                return;
            } else {
                await users.logout(token);
                res.header('X-Authorization', null);
                res.status(200)
                    .send('Logout Successful');
                return;
            }
        } else {
            res.status(401)
                .send('Unauthorized');
            return;
        }
    } catch {
        res.status(500)
            .send('Internal Server Error');
        return;
    }
};

const getDetails = async (req: Request, res: Response) : Promise<void> => {
    Logger.http('Request to get user details...');

    const token = req.header('X-Authorization');
    const id = req.params.id;
    const userPass = await users.checkId( Number(id) );
    const authPass = await users.checkIdMatchToken( Number(id), token);

    try{
        if (userPass) {
            const userDetails = await users.getUserDetails( Number(id) );
            if (authPass) {
                res.status(200)
                    .send({
                        firstName: userDetails[0].first_name,
                        lastName: userDetails[0].last_name,
                        email: userDetails[0].email
                    })
                return;
            } else {
                res.status(200)
                    .send({
                        firstName: userDetails[0].first_name,
                        lastName: userDetails[0].last_name,
                    })
                return;
            }
        } else {
            res.status(404)
                .json("User Not Found");
            return;
        }
    } catch {
        res.status(500)
            .send('Internal Server Error');
        return;
    }
};

/**
 * Function to update user details
 * @param req
 * @param res
 */
const updateDetails = async (req: Request, res: Response) : Promise<void> => {
    const id = req.params.id
    const token = req.header('X-Authorization');
    const authPass = await users.checkIdMatchToken( Number(id), token);

    try {
        if (authPass) {
            if (!(req.body.firstName === undefined && req.body.lastName === undefined && req.body.email === undefined && req.body.password === undefined && req.body.currentPassword === undefined)) {
                if (req.body.email !== undefined) {
                    const email = await users.checkEmailExist( req.body.email );
                    if (!email) {
                        if (req.body.email.indexOf("@") === -1) {
                            res.status(400)
                                .send('Bad Request: Email must contain @');
                            return;
                        } else {
                            const result = await users.updateUserDetails( Number(id), req.body)
                            if (result) {
                                res.status(200)
                                    .send('OK: Updated')
                                return;
                            } else if (result === 0) {
                                res.status(400)
                                    .send('Bad Request: Both password/currentPassword have to be provided ')
                                return;
                            } else if (result === 1){
                                res.status(400)
                                    .send('Bad Request: password field can not be empty')
                                return;
                            } else {
                                res.status(404)
                                    .send('Not Found')
                                return;
                            }
                        }
                    } else {
                        res.status(400)
                            .send('Bad Request: Email already in used');
                        return;
                    }
                } else {
                    const result = await users.updateUserDetails( Number(id), req.body)
                    if (result) {
                        res.status(200)
                            .send('OK: Updated')
                        return;
                    } else if (result === 0) {
                        res.status(400)
                            .send('Bad Request: Both password/currentPassword have to be provided ')
                        return;
                    } else if (result === 1){
                        res.status(400)
                            .send('Bad Request: password field can not be empty')
                        return;
                    } else {
                        res.status(404)
                            .send('Not Found')
                        return;
                    }
                }
            }
        } else {
            res.status(403)
                .send("Forbidden: Can not update another users details");
            return;
            }
    } catch {
        res.status(500)
            .send('Internal Server Error');
        return;

    }
};


export { registerUser, loginUser, logoutUser, getDetails, updateDetails }