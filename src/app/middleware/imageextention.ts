const getImageExtension = async (x: string) : Promise<string> =>{
    switch (x) {
        case 'image/jpeg':
            return '.jpeg';
        case 'image/png':
            return '.png';
        case 'image/gif':
            return '.gif';
        default:
            return null;
    }
};

export {getImageExtension}