import scraping from '../scraping';

export default async function (url: string) {
  await scraping(false, url, (si) => {
    return !!(si.tags && si.tags.find(({ name }) => name === 'list'))
  });
}
