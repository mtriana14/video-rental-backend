import axios from 'axios';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG  = 'https://image.tmdb.org/t/p/w500';

const tmdb = axios.create({
  baseURL: TMDB_BASE,
  headers: { Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzMzQwYTU5YTQ2YjY4NDFkZGI2YjA3YmFlYTdjY2I3YSIsIm5iZiI6MTc3MTQ3NzY0OS4wNTQwMDAxLCJzdWIiOiI2OTk2OWE5MWMzZDgyZmRkYTQyODcxOTYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.blLRj94iSEJfQRrFXqDLiblI70CE_BkABm9Xz2ISzpM` }
});
const posterCache = new Map<string, string | null>();
export async function getFilmPoster(title: string, year?: number) {
  const key = `${title}`.toLowerCase();
    console.log(`Buscando poster para: ${key} `);
  if (posterCache.has(key)) {
    return posterCache.get(key);
  }

  try {
    const { data } = await tmdb.get('/search/movie', {
      params: { query: title, year, language: 'en-US', page: 1 }
    });

    const result = data.results[0];
    const url = result?.poster_path
      ? `${TMDB_IMG}${result.poster_path}`
      : null;

    posterCache.set(key, url);
    return url;

  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getActorPhoto(
  firstName: string,
  lastName: string
): Promise<string | null> {
  try {
    const fullName = `${firstName} ${lastName}`;

    const { data } = await tmdb.get("/search/person", {
      params: {
        query: fullName,
        language: "en-US",
        page: 1,
      },
    });

    if (!data.results || data.results.length === 0) {
      return null;
    }

    // Buscar coincidencia exacta ignorando mayúsculas
    const exactMatch = data.results.find(
      (p: any) =>
        p.name.toLowerCase() === fullName.toLowerCase()
    );

    const person = exactMatch || data.results[0];

    if (!person?.profile_path) return null;

    return `${TMDB_IMG}${person.profile_path}`;

  } catch (error: any) {
    console.error("Error getting actor photo:", error.response?.data || error);
    return null;
  }
}
