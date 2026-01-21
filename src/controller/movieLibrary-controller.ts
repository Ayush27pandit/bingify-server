import { Request, Response } from 'express';
import prisma from '../lib/db';

export const movieLibrary = async (req: Request, res: Response) => {
  //client request movies list and server respond with list of movies and their meta data
  try {
    const movies = await prisma.movie.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        thumbnailUrl: true,
        muxPlaybackId: true,
        duration: true,
        description: true,
        genre: true,
        rating: true,
        year: true,
        muxAssetId: true,
      },
    });
    if (movies.length === 0) {
      return res.status(404).json({ message: 'No movies found' });
    }
    console.log('movies', movies);
    return res.status(200).json({
      count: movies.length,
      movies,
    });
  } catch (error) {
    console.log('Error fetching movie library', error);
    res.status(500).json({ message: 'Error fetching movie library' });
  }
};
