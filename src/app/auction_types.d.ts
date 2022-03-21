type Auction = {

    title: string,
    description: string,
    reserve: number,
    categoryId: number,
    sellerId: number,
    endDate: Date,
    image_filename?: string|null
}
