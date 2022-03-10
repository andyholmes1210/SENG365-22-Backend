import passwords from "password-hash";

const passwordHash = async (x: string) : Promise<string> =>{
    return passwords.generate(x);
};

export {passwordHash}