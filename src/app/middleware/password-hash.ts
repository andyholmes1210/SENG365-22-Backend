import passwords from "password-hash";

const passwordHash = async (x: string) : Promise<any> =>{
    return passwords.generate(x);
};

export {passwordHash}