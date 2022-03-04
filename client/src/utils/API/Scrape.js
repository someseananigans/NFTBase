
const hNorm = {
  "Content-Type": "application/json",
}

const Scrape = {

  // expects wallet address or opeansea username
  wallet: (wallet) => fetch(`/api/scrape/wallet/${wallet}`, {
    method: 'GET',
    headers: hNorm
  })
    .then(response => response.json())
  // .then(res => res.text())
  // .then(text => console.log(text))
  ,

  // expects "nftCollection" obj w/ "collection" w/ "collectionName" and "openseaCollectionURL"
  multiCollection: (nftCollections) => fetch('/api/scrape/collections', {
    method: 'GET',
    headers: hNorm,
    body: JSON.stringify(nftCollections)
  }).then(response => response.json()),

  // expects "collection" obj w/ "collectionName" and "openseaCollectionURL"
  oneCollection: (urlEnd) => fetch(`/api/scrape/collection/${urlEnd}`, {
    method: 'GET',
    headers: hNorm,
  }).then(response => response.json()),

}

export default Scrape
