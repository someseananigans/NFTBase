
const hNorm = {
  "Content-Type": "application/json",
}

const Scrape = {

  // expects wallet address or opeansea username
  wallet: (wallet) => fetch(`/api/scrape/wallet/${wallet}`, {
    method: 'GET',
    headers: hNorm
  }).then(response => response.json()),

  // expects "nftCollection" obj w/ "collection" w/ "collectionName" and "openseaCollectionURL"
  multiCollection: (nftCollections) => fetch('/api/scrape/collections', {
    method: 'POST',
    headers: hNorm,
    body: JSON.stringify(nftCollections)
  }).then(response => response.json()),

  // expects "collection" obj w/ "collectionName" and "openseaCollectionURL"
  oneCollection: (collection) => fetch('/api/scrape/collection', {
    method: 'POST',
    headers: hNorm,
    body: JSON.stringify(collection)
  }).then(response => response.json()),

}

export default Scrape
