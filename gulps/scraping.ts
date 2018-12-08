import scraping from '../scraping';

export default async function(url: string) {
  await scraping(false, url);
}
