import * as usersImage from "../models/users.images.model";
import Logger from "../../config/logger";
import {Request, Response} from "express";


// @ts-ignore
const getUserImage = async (req: Request, res: Response) : Promise<void> =>
{
    // Logger.http(`Request to get user image...'`)
    // const id = req.body.id;
    // try {
    //     const result = await usersImage.getImage( id );
    // }
};

export { getUserImage }