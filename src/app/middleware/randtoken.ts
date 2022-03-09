import randtoken from 'rand-token';

const randToken = async () : Promise<any> =>{
    return randtoken.generate(32);
};

export {randToken}