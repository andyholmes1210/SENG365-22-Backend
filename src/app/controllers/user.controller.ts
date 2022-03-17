import * as users from "../models/user.model";
import Logger from "../../config/logger";
import {Request, Response} from "express";
import {randomToken} from '../middleware/randtoken';
import * as Console from "console";
import {getUserDetails} from "../models/user.model";


const registerUser = async (req: Request, res: Response) : Promise<void> => {
    Logger.http('Request to create a new user...');
    const password =  req.body.password;
    const email = req.body.email;

    if (email.indexOf("@") === -1) {
        res.status(400)
            .send("Bad Request: Email must contain @");
    } else if (password.length === 0) {
        res.status(400)
            .send("Bad Request: Password cannot be empty")
    } else if (!req.body.hasOwnProperty("lastName") && !req.body.hasOwnProperty("firstName")) {
        res.status(400).send("Bad Request: Please provide firstName and lastName field");
        return
    } else if (!req.body.hasOwnProperty("firstName")) {
        res.status(400).send("Bad Request: Please provide firstName field");
        return
    } else if (!req.body.hasOwnProperty("lastName")) {
        res.status(400).send("Bad Request: Please provide lastName field");
        return
    } else {
            try {
                const userid = await users.register(req.body)
                Logger.http(`User ${userid.insertId} is successfully added`);
                res.status(201)
                    .send({userId: userid.insertId});
            } catch (err) {
                if (err.errno === 1062 || err.code === 'ER_DUP_ENTRY')
                {
                    res.status(400)
                        .send('Bad Request: Email already in use, please try again');

                } else {
                    res.status(500)
                        .send('Internal Server Error');
                }
            }
    }
};

const loginUser = async (req: Request, res: Response) : Promise<void> => {
    Logger.http('Request to login a user...');

    const token = await randomToken(32);
    const tokenExist = await users.getToken(req.body.email);
    const userExist = await users.checkUserExist(req.body.email)

    if (userExist) {
        if (tokenExist[0].auth_token !== null) {
            res.status(400)
                .send("Bad Request: Already login");
        } else {
            const user = await users.login(req.body, token);
            if (user === false) {
                res.status(400)
                    .send("Bad Request: Incorrect password");

            } else if (user.length > 0) {
                res.header('X-Authorization', token);
                res.statusMessage = 'Login Successful';
                res.status(200)
                    .send({userId: user[0].id, token});

            } else {
                res.status(500)
                    .send('Internal Server Error');
            }
        }
    } else {
        res.status(400)
            .send("Bad Request: Need to register first")
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
            } else {
                await users.logout(token);
                res.header('X-Authorization', null);
                res.status(200)
                    .send('Logout Successful');
            }
        } else {
            res.status(401)
                .send('Unauthorized');
        }
    } catch {
        res.status(500)
            .send('Internal Server Error')
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
            Console.log(userDetails)
            if (authPass) {
                res.status(200)
                    .send({
                        firstName: userDetails[0].first_name,
                        lastName: userDetails[0].last_name,
                        email: userDetails[0].email
                    })
            } else {
                res.status(200)
                    .send({
                        firstName: userDetails[0].first_name,
                        lastName: userDetails[0].last_name,
                    })
            }
        } else {
            res.status(404)
                .json("User Not Found")
        }
    } catch {
        res.status(500)
            .send('Internal Server Error')
    }
};

const updateDetails = async (req: Request, res: Response) : Promise<void> => {

    const id = req.params.id
    const token = req.header('X-Authorization');
    const authPass = await users.checkIdMatchToken( Number(id), token);

    try {
        if (authPass) {
            if (!(req.body.hasOwnProperty("password")) && (req.body.hasOwnProperty("currentPassword"))) {
                res.status(400)
                    .send('Bad Request: Please add in the password and currentPassword field');
            } else {
                const newPass = req.body.password;
                const oldPass = req.body.currentPassword;
                    if (newPass.length === 0) {
                        res.status(400)
                            .send('Password content is empty');
                    } else {
                        const result = await users.updateUserDetails( Number(id), newPass, oldPass);
                        if (result === false) {
                            res.status(400)
                                .send('Bad Request: currentPassword does not match your current password')
                        } else {
                            res.status(200)
                                .send('OK: User password updated')
                        }
                    }
                }
        } else {
          res.status(403)
              .send("Forbidden: Can not update another users details")
        }
    } catch {
        res.status(500)
            .send('Internal Server Error')

    }
};


export { registerUser, loginUser, logoutUser, getDetails, updateDetails }