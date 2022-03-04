const router = require('express').Router()
const puppeteer = require('puppeteer-extra');

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());


const blocked_domains = [
  'googlesyndication.com',
  'adservice.google.com',
];

// grab basic info from user's opensea account
router.get('/scrape/wallet/:wallet', async (req, res) => {

  try {

    const address = `https://opensea.io/${req.params.wallet}`

    // launch browser
    const browser = await puppeteer.launch({
      userDataDir: '/tmp/user-data-dir',
      headless: true
    });

    // open new tab in browser
    const page = await browser.newPage();

    // set page rules for tab
    await page.setDefaultNavigationTimeout(0);
    await page.setViewport({
      width: 1200,
      height: 1000
    });

    // turns request receptor on
    await page.setRequestInterception(true);
    // if page makes a request to image or style resorce abort it
    page.on('request', request => {
      const url = request.url()
      if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet' || request.resourceType() === 'font' || request.resourceType() === 'media' || request.resourceType() === 'manifest' || blocked_domains.some(domain => url.includes(domain))) {
        request.abort();
      }
      else {
        request.continue();
      }

    });


    // open address on the tab
    await page.goto(address);
    //
    // wait for img to load
    await page.waitForSelector(".AssetMedia--img img");

    // scroll down to load elements
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });



    // await page.screenshot({ path: "walletnft.png" });

    /**
    * @method user grabs user information from opensea
    * @return {Object} shortAdress, username, profileImg, twitter
    */
    const user = await page.evaluate(() => {

      const twitter = document.querySelector(".AccountHeader--social-container") ? document.querySelector(".AccountHeader--social-container").href : null

      const profileImg = document.querySelector(".ProfileImage--image img") ? document.querySelector(".ProfileImage--image img").src : null

      const shortAddress = document.querySelector(".AccountHeader--address div").innerHTML

      const username = document.querySelector(".AccountHeader--title") ? document.querySelector(".AccountHeader--title").innerHTML : null

      return {
        shortAddress,
        username,
        profileImg,
        twitter,
      }
    })

    /**
    * @method nftCollections grab nftcollection surface level information
    * @return {Array} nftStorage includes assets and collections
    */
    const nftCollections = await page.evaluate(() => {

      // select all assets
      const nfts = document.querySelectorAll(".AssetSearchList--asset")

      let nftStorage = []

      // parse through assets to get asset/collection details
      for (let nft of nfts) {

        const collectionName = nft.querySelector(".jPSCbX").innerHTML

        const assetImg = nft.querySelector(".Image--image").src

        const openseaCollectionURL = nft.querySelector(".AssetCardFooter--collection-name").href

        const assetName = nft.querySelector(".AssetCardFooter--name").innerHTML

        const openseaAssetURL = nft.querySelector(".Asset--anchor").href

        let collectionAddress = openseaAssetURL.split('/')
        collectionAddress = collectionAddress[collectionAddress.length - 2]

        // add individual asset's info into nftStorage
        nftStorage.push({
          asset: {
            assetImg,
            assetName,
            openseaAssetURL,
          },
          collection: {
            collectionName,
            collectionAddress,
            openseaCollectionURL
          }
        })
      }

      return nftStorage
    })


    res.json({
      user: { opensea: address, ...user },
      nftCollections,
      status: 200
    })

    await browser.close()

  } catch (error) {

    res.json({ data: null, dataSent: req.params.wallet, status: 400 })

  }

});


// grab multiple collections' stat info (needs nftCollections: [collections: collections])
router.post('/scrape/collections', async (req, res) => {

  try {
    // launch browser
    const browser = await puppeteer.launch({ headless: false });

    const data = []

    // parse through collections provided
    for (let nftCollection of req.body.nftCollections) {

      // open new tab in browser
      const newTab = await browser.newPage()

      // set page rules for tab
      await newTab.setDefaultNavigationTimeout(0);
      await newTab.bringToFront()
      await newTab.setViewport({
        width: 1200,
        height: 1000
      });

      // turns request receptor on
      await newTab.setRequestInterception(true);
      // if page makes a request to image or style resorce abort it
      newTab.on('request', request => {
        if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet')
          request.abort();
        else
          request.continue();
      });

      // open address on the tab
      await newTab.goto(nftCollection.collection.openseaCollectionURL, { waitUntil: "networkidle2" })

      /**
      * @method statistics grab inner info / stat info
      * @return {Object} floor, volume, owners, items 
      */
      const statistics = await newTab.evaluate(() => {
        /* 
        const social = document.querySelectorAll(".fresnel-container")
        const twitter = document.querySelector(".kGbCcZ a") ? document.querySelector(".kGbCcZ a").href : null

        // grab other info from etherscan api instead 
        */

        // select all stats
        const stats = document.querySelectorAll(".iePaOU")

        const floor = stats[2].querySelector(".jPSCbX").innerHTML

        const volume = stats[3].querySelector(".jPSCbX").innerHTML

        const owners = stats[1].querySelector(".jPSCbX").innerHTML

        const items = stats[0].querySelector(".jPSCbX").innerHTML

        return {
          floor,
          volume,
          owners,
          items
        }

      })

      data.push({
        collectionName: nftCollection.collection.collectionName,
        statistics
      })

    };
    res.json({
      data,
      status: 200
    })

    await browser.close()

  } catch (error) {

    console.log(error)

    res.json({
      data: null,
      dataSent: req.body.nftCollections,
      status: 400
    })

    await browser.close()
  }

})


// grab single collection's stat info (needs collection: collection)
router.get('/scrape/collection/:url', async (req, res) => {

  try {

    // launch browser
    const browser = await puppeteer.launch({
      userDataDir: '/tmp/user-data-dir',
      headless: true
    });

    // open new tab in browser
    const page = await browser.newPage()

    // set page rules for tab
    await page.setDefaultNavigationTimeout(0);

    // turns request receptor on
    await page.setRequestInterception(true);
    // if page makes a request to image or style resorce abort it
    page.on('request', request => {
      const url = request.url()
      if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet' || request.resourceType() === 'font' || request.resourceType() === 'media' || request.resourceType() === 'manifest' || blocked_domains.some(domain => url.includes(domain))) {
        request.abort();
      }
      else {
        request.continue();
      }

    });

    // open address on the tab
    // await page.goto(`https://opensea.io/collection/official-apezuki`)
    await page.goto(`https://opensea.io/collection/${req.params.url}`)
    // waitUntil: 'domcontentloaded'

    await page.waitForSelector('.CollectionHeader--description');

    /**
    * @method statistics grab inner info / stat info
    * @return {Object} floor, volume, owners, items
    */
    const statistics = await page.evaluate(() => {
      /* 
      const social = document.querySelectorAll(".fresnel-container")
      const twitter = document.querySelector(".kGbCcZ a") ? document.querySelector(".kGbCcZ a").href : null

      // grab other info from etherscan api instead 
      */

      // select all stats
      const stats = document.querySelectorAll(".iePaOU")

      const floor = stats[2].querySelector(".jPSCbX").innerHTML
      const volume = stats[3].querySelector(".jPSCbX").innerHTML
      const owners = stats[1].querySelector(".jPSCbX").innerHTML
      const items = stats[0].querySelector(".jPSCbX").innerHTML

      return {
        floor,
        volume,
        owners,
        items
      }
    })

    res.json({
      // data: {
      //   // collectionName: req.body.collectionName,
      //   statistics: statistics
      // },
      statistics,
      status: 200
    })

    await browser.close()

  } catch (error) {

    console.log(error)

    res.json({
      statistics: null,
      dataSent: req.params.url,
      status: 400
    })

  }

})

module.exports = router