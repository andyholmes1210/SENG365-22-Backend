import * as users from "../models/users.model";
import Logger from "../../config/logger";
import {Request, Response} from "express";
import {randomToken} from '../middleware/randtoken';

const registerUser = async (req: Request, res: Response) : Promise<void> => {
    Logger.http('Request to create a new user...');
    const password =  req.body.password;
    const email = req.body.email;

    if (email.indexOf("@") === -1) {
        res.status(400)
            .send("Email must contain @");
    } else if (password.length === 0) {
        res.status(400)
            .send("Password cannot be empty")
    } else if (!req.body.hasOwnProperty("lastName") && !req.body.hasOwnProperty("firstName")) {
        res.status(400).send("Please provide firstName and lastName field");
        return
    } else if (!req.body.hasOwnProperty("firstName")) {
        res.status(400).send("Please provide firstName field");
        return
    } else if (!req.body.hasOwnProperty("lastName")) {
        res.status(400).send("Please provide lastName field");
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
                        .send('Email already in use, please try again');

                } else {
                    res.status(500)
                        .send('Internal Server Error');
                }
            }
    }
};

const loginUser = async (req: Request, res: Response) : Promise<void> => {
    Logger.http('Request to login a user...');
    const token = randomToken;
    try {
        const userid = await users.login(req.body, token);
        print()
        if (userid) {
            res.statusMessage = 'Login Successful';
            res.status(200)
                .send({userId: userid.insertId, token});

        } else {
            res.status(400)
                .send("Wrong password");
        }
    } catch {
        res.status(500)
            .send('Internal Server Error')
    }

}


export { registerUser, loginUser }