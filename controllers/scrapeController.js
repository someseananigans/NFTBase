const router = require('express').Router()
const puppeteer = require('puppeteer');
const { collection } = require('../models/User');


// grab basic info from user's opensea account
router.get('/scrape/wallet/:wallet', async (req, res) => {

  try {

    const address = `https://opensea.io/${req.params.wallet}`

    // launch browser
    const browser = await puppeteer.launch({ headless: false });

    // open new tab in browser
    const page = await browser.newPage();

    // set page rules for tab
    await page.setDefaultNavigationTimeout(0);
    await page.setViewport({
      width: 1200,
      height: 1000
    });

    // open address on the tab
    await page.goto(address);

    // scroll down to load elements
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });

    // wait for img to load
    await page.waitForSelector(".AssetMedia--img img");

    // await page.screenshot({ path: "walletnft.png" });

    // grab user information from opensea
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

    // grab nftcollection surface level information
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

    const data = {
      user: { opensea: address, ...user },
      nftCollections
    }

    res.json({ data: data, status: 200 })

    await browser.close()

  } catch (error) {

    res.json({ data: null, dataSent: req.params.wallet, status: 400 })

    await browser.close()

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

      // open address on the tab
      await newTab.goto(nftCollection.collection.openseaCollectionURL, { waitUntil: "networkidle2" })

      // grab inner info / stat info
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
router.post('/scrape/collection', async (req, res) => {

  try {

    // launch browser
    const browser = await puppeteer.launch({ headless: false });

    // open new tab in browser
    const page = await browser.newPage()

    // set page rules for tab
    await page.setDefaultNavigationTimeout(0);

    // open address on the tab
    await page.goto(req.body.collection.openseaCollectionURL)

    /* await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    }); */

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
      data: {
        collectionName: req.body.collection.collectionName,
        statistics: statistics
      },
      status: 200
    })

    await browser.close()

  } catch (error) {

    console.log(error)

    res.json({
      data: null,
      dataSent: req.body.collection,
      status: 400
    })

    await browser.close()
  }

})

module.exports = router