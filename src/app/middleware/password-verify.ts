import passwords from "password-hash";

const passwordVerify = async (x: string, y: string) : Promise<any> =>{
    return passwords.verify(x, y);
};

export {passwordVerify}