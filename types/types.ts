//Interfaces
export interface ImageInfo {
    id: string;
    image: string;
    imageUrl: string;
    title: string;
    latitude: number;
    longitude: number;
}

export interface Collection {
    id: string;
    title: string;
    description: string;
    user_id: string;
    collection_images: ImageInfo[];
    // imageUrls: string[];
}

export interface NewCollection extends Omit<Collection, "collection_images"> {}
