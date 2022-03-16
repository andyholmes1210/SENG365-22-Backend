import * as users from "../models/user.model";
import Logger from "../../config/logger";
import {Request, Response} from "express";
import {randomToken} from '../middleware/randtoken';
import * as Console from "console";

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

    const token = await randomToken();
    const tokenexist = await users.gettoken(req.body.email);
    const userexist = await users.checkuserexist(req.body.email)


    if (userexist) {
        if (tokenexist[0].auth_token !== null) {
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
    const tokennull: any = null;

    try {
        if (token) {
            if (token === JSON.stringify(null)) {
                res.status(400)
                    .send('Bad Request: You need to login to logout');
            } else {
                await users.logout(token);
                res.header('X-Authorization', tokennull);
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

export { registerUser, loginUser, logoutUser }