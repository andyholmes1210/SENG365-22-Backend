import randtoken from 'rand-token';

const randomToken = async () : Promise<any> =>{
    return randtoken.generate(32);
};

export {randomToken}