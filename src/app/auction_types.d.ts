type Auction = {

    auctionId: number,
    title: string,
    description?: string,
    endDate: string,
    image_filename?: string,
    reserve: number,
    sellerId: number,
    categories: [number]

}
