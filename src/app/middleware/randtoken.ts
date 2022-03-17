import randToken from 'rand-token';

const randomToken = async (x: number) : Promise<any> =>{
    return randToken.generate(x);
};

export {randomToken}