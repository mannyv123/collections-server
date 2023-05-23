"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const collectionImagesData = [
    {
        id: "144875fe-e638-4dea-9857-40f861c9774c",
        image: "DSC_0591.jpg",
        title: "Plaža Malo Zaraće, Croatia",
        latitude: 43.15197034707428,
        longitude: 16.509642832369682,
        post_id: "134875ee-e638-4dea-9857-40f861c9774c",
    },
    {
        id: "244875ee-e638-4dea-9857-40f861c9774c",
        image: "DSC_0655.jpg",
        title: "Plaža Dubovica, Croatia",
        latitude: 43.14627887021994,
        longitude: 16.534293203694183,
        post_id: "134875ee-e638-4dea-9857-40f861c9774c",
    },
    {
        id: "344875ee-e638-4dea-9857-40f861c9774c",
        image: "DSC_0703.jpg",
        title: "Fortica Fortress, Hvar, Croatia",
        latitude: 43.175146983168844,
        longitude: 16.44183526072015,
        post_id: "134875ee-e638-4dea-9857-40f861c9774c",
    },
    {
        id: "444875ee-e638-4dea-9857-40f861c9774c",
        image: "DSC_0761.jpg",
        title: "City Walls, Dubrovnik, Croatia",
        latitude: 42.6417629225669,
        longitude: 18.107163184705374,
        post_id: "134875ee-e638-4dea-9857-40f861c9774c",
    },
    {
        id: "544875ee-e638-4dea-9857-40f861c9774c",
        image: "DSC_0773.jpg",
        title: "West Harbour, Dubrovnik, Croatia",
        latitude: 42.64087504717668,
        longitude: 18.106396072911593,
        post_id: "134875ee-e638-4dea-9857-40f861c9774c",
    },
    {
        id: "644875ee-e638-4dea-9857-40f861c9774c",
        image: "DSC_0794.jpg",
        title: "Old Town, Dubrovnik, Croatia",
        latitude: 42.6409026701504,
        longitude: 18.11112212521755,
        post_id: "134875ee-e638-4dea-9857-40f861c9774c",
    },
    {
        id: "744875ee-e638-4dea-9857-40f861c9774c",
        image: "DSC_0850.jpg",
        title: "West Harbour Entrance, Dubrovnik, Croatia",
        latitude: 42.64155772582697,
        longitude: 18.10495304443271,
        post_id: "134875ee-e638-4dea-9857-40f861c9774c",
    },
    {
        id: "844875ee-e638-4dea-9857-40f861c9774c",
        image: "DSC_0901.jpg",
        title: "Lookout Gray Falcon, Cavtat, Croatia",
        latitude: 42.59326408330013,
        longitude: 18.243855784549396,
        post_id: "134875ee-e638-4dea-9857-40f861c9774c",
    },
    {
        id: "944875ee-e638-4dea-9857-40f861c9774c",
        image: "DSC_0909.jpg",
        title: "Spice/Egyptian Bazaar, Istanbul, Turkey",
        latitude: 41.016850768655544,
        longitude: 28.97056036796798,
        post_id: "144875ee-e638-4dea-9857-40f861c9774c",
    },
    {
        id: "104875ee-e638-4dea-9857-40f861c9774c",
        image: "DSC_0912.jpg",
        title: "On our way to the Grand Bazaar, Istanbul, Turkey",
        latitude: 41.0117281250598,
        longitude: 28.968129846598853,
        post_id: "144875ee-e638-4dea-9857-40f861c9774c",
    },
    {
        id: "114875ee-e638-4dea-9857-40f861c9774c",
        image: "DSC_0917.jpg",
        title: "Wandering in Istanbul, Turkey",
        latitude: 41.0117281250595,
        longitude: 28.968129846598855,
        post_id: "144875ee-e638-4dea-9857-40f861c9774c",
    },
    {
        id: "124875ee-e638-4dea-9857-40f861c9774c",
        image: "DSC_0928.jpg",
        title: "Grand Bazaar Entrance, Istanbul, Turkey",
        latitude: 41.0108913385169,
        longitude: 28.968080768008864,
        post_id: "144875ee-e638-4dea-9857-40f861c9774c",
    },
    {
        id: "134875ee-e638-4dea-9857-40f861c9774c",
        image: "DSC_0932.jpg",
        title: "Goreme, Cappadocia, Turkey",
        latitude: 38.643892970835985,
        longitude: 34.82876022265518,
        post_id: "144875ee-e638-4dea-9857-40f861c9774c",
    },
    {
        id: "144875ee-e639-4dea-9857-40f861c9774c",
        image: "DSC_0953.jpg",
        title: "Uchisar Castle, Uchisar, Turkey",
        latitude: 38.63101924800337,
        longitude: 34.805585700177204,
        post_id: "144875ee-e638-4dea-9857-40f861c9774c",
    },
    {
        id: "154875ee-e638-4dea-9857-40f861c9774c",
        image: "DSC_0976.jpg",
        title: "Pigeon Valley, Nevsehir, Turkey",
        latitude: 38.62112877357056,
        longitude: 34.80494197001452,
        post_id: "144875ee-e638-4dea-9857-40f861c9774c",
    },
    {
        id: "164875ee-e638-4dea-9857-40f861c9774c",
        image: "DSC_0979.jpg",
        title: "Pigeon Valley, Nevsehir, Turkey",
        latitude: 38.62002229668965,
        longitude: 34.80532820812047,
        post_id: "144875ee-e638-4dea-9857-40f861c9774c",
    },
    {
        id: "174875ee-e638-4dea-9857-40f861c9774c",
        image: "DSC_0988.jpg",
        title: "View of hot air balloon tour company trucks, Cappadocia, Turkey",
        latitude: 38.6504754763954,
        longitude: 34.83574505452656,
        post_id: "144875ee-e638-4dea-9857-40f861c9774c",
    },
];
exports.default = collectionImagesData;
