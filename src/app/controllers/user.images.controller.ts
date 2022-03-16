import * as usersImage from "../models/user.images.model";
import * as users from "../models/user.model";
import Logger from "../../config/logger";
import {Request, Response} from "express";
import Console from "console";


const getUserImage = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`Request to get user image...'`)
    const id = req.params.id;
    try {
        const result = await usersImage.getImageU( Number(id) );
        if (result === false) {
            res.status(404)
                .send('Not Found');
        } else {
            res.contentType( result.type );
            res.status( 200 )
                .send( result.photo );
        }
    } catch( err ) {
        if (err.errno === -2 || err.code === 'ENOENT') {
            res.status(404)
                .send('Not Found');
        } else {
            res.status(500)
                .send(`ERROR reading event ${id}: ${ err }`);
        }
    }
};

const deleteUserImage = async (req: Request, res: Response) : Promise<void> => {

    const id = req.params.id
    const loginId = req.body.authenticatedUserId
    const userExist = await users.checkId( Number(id) )
    const ImageExist = await usersImage.getImageU( Number(id) )

    if (userExist) {
        if (loginId === id) {
            try {
                if (ImageExist) {
                    await usersImage.deleteImageU( Number(id) );
                    res.status(200)
                        .send('Image deleted')
                } else {
                    res.status(404)
                        .send('Can not delete Image not found')
                }
            } catch (err) {
                res.status(500)
                    .send('Internal Server Error')
            }
        } else {
            res.status(403)
                .send('Forbidden: Can not delete other people Image')
        }
    } else {
        res.status(404)
            .send("User Not Found")
    }
};

export { getUserImage, deleteUserImage }