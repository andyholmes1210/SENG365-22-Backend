import randToken from 'rand-token';

const randomToken = async () : Promise<any> =>{
    return randToken.generate(32);
};

export {randomToken}