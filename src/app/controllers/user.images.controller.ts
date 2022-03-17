import * as usersImage from "../models/user.images.model";
import * as users from "../models/user.model";
import Logger from "../../config/logger";
import {Request, Response} from "express";
import {getImageExtension} from "../middleware/imageextention";
import Console from "console";
import {storeImageU, updateImageU} from "../models/user.images.model";


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

const updateUserImage = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`Request to update user image...'`)

    const image = req.body;
    const userId = req.params.id;
    const loginId = req.body.authenticatedUserId;
    const user = await users.checkId( Number(userId) );

    if (user) {
        if (loginId === userId) {
            const mimeType = req.header('Content-Type');

            const fileExt: any = await getImageExtension(mimeType);

            if (fileExt !== null){
                if (req.body.length !== undefined) {
                    const existImage = await usersImage.getImageU( Number(userId) );
                    const filename = await usersImage.storeImageU(image, fileExt);
                    Console.log(filename)
                    if (existImage) {
                        await usersImage.updateImageU( Number(userId), filename);
                        res.status(200)
                            .send("OK")
                    } else {
                        await usersImage.updateImageU( Number(userId), filename);
                        res.status(201)
                            .send("Created")
                    }
                } else {
                    res.status(400)
                        .send('Bad request: image must be image/jpeg, image/png, image/gif type');
                }
            } else {
                res.status(400)
                    .send('Bad Request: empty image');
            }
        } else {
            res.status(403)
                .json('Forbidden');
        }
    } else {
        res.status(404)
            .json("User Not Found");
    }
};


const deleteUserImage = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`Request to delete user image...'`)

    const id = req.params.id;
    const loginId = req.body.authenticatedUserId;
    const userExist = await users.checkId( Number(id) );
    const ImageExist = await usersImage.getImageU( Number(id) );

    if (userExist) {
        if (loginId === id) {
            try {
                if (ImageExist) {
                    await usersImage.deleteImageU( Number(id) );
                    res.status(200)
                        .json('Image deleted');
                } else {
                    res.status(404)
                        .json('Can not delete Image not found');
                }
            } catch (err) {
                res.status(500)
                    .send('Internal Server Error');
            }
        } else {
            res.status(403)
                .send('Forbidden: Can not delete other people Image');
        }
    } else {
        res.status(404)
            .send("User Not Found");
    }
};

export { getUserImage, deleteUserImage, updateUserImage }