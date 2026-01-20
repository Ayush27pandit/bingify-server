import prisma from "../lib/db";

export type MovieInput = {
    title: string;
    description: string;
    thumbnailUrl: string;
    rating: number;
    year: number;
    genre: string;
    duration: number; // seconds
    muxAssetId: string;
    muxPlaybackId: string;
};


const movies = [
    {
        title: "De Dana Dan",
        description:
            "A comedy short film inspired by chaos, confusion, and mistaken identities.",
        thumbnailUrl:
            "https://wnvechfqaaomuauwzcjz.supabase.co/storage/v1/object/public/assests/51u1EipM4TL.webp",
        rating: 8.1,
        year: 2009,
        genre: "Comedy",
        duration: 10020, // 2h 47m
        muxAssetId: "1saQTl12lXXCm3kkV4gUMZuryUMEAAsx01sdr00epXZv00",
        muxPlaybackId: "FT02wlI00qVeO1ReXjJ3ToDqRRwfVR1VyaP7lfQkeZnIg",
    },
    {
        title: "Messi World Cup Documentary",
        description:
            "A documentary chronicling Lionel Messi’s journey to winning the FIFA World Cup.",
        thumbnailUrl:
            "https://wnvechfqaaomuauwzcjz.supabase.co/storage/v1/object/public/assests/hk7m6W.jpg",
        rating: 9.0,
        year: 2022,
        genre: "Documentary",
        duration: 660, // 11m
        muxAssetId: "nv6Rj005YJXCUzxXzD4NNtNTpalLVdb00tC4mZ6hmSaeo",
        muxPlaybackId: "KPLanPUdrJPKsRNIr3BcM1z0157r7PPFAh01xpE5B9XlY",
    },
    {
        title: "In This Life",
        description:
            "A romantic short film about love, loss, and destiny.",
        thumbnailUrl:
            "https://wnvechfqaaomuauwzcjz.supabase.co/storage/v1/object/public/assests/maxresdefault.webp",
        rating: 7.6,
        year: 2021,
        genre: "Romance",
        duration: 1440, // 24m
        muxAssetId: "007ZqAK1WT2eEhzU9YvRahdlrompKKeod9chIKuH9rdc",
        muxPlaybackId: "nMyTXmp00Ih00wnqeNU8mY005w29zMJ12yHHwvoBGrPl4o",
    },
]


export async function uploadMovies() {
    try {
        console.log("Uploading movies...")
        for (const movie of movies) {
            await prisma.movie.upsert({
                where: { muxAssetId: movie.muxAssetId },
                update: movie,
                create: movie,
            });

            console.log(`✅ Upserted movie: ${movie.title}`);
        }
    }
    catch (error) {
        console.log("Error upserting movie", error)
    }
}