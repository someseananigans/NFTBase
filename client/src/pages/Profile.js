// import { Searchbar } from '../components'
import { Scrape } from '../utils/'

import { useEffect, useState } from 'react'
// import '../index.css'



const Profile = ({ match }) => {

  const address = match.params.address

  const [profile, setProfile] = useState({
    user: {},
    nftCollections: [],
  })

  const [sets, setSets] = useState({
    collStats: [],
    collSocials: []
  })


  const exampledata = {
    user: {
      opensea: 'https://opensea.io/0xlust',
      shortAddress: '0x655b...d892',
      username: '0xLust',
      profileImg: 'https://lh3.googleusercontent.com/ViJM7MGGsmrvDh23mQ1XLuOkSHq_03-76lXP-rEdTQb6FY2XQvaIyBQ1IkuQPVCAgFK4CjbP-be05qzOpLaJOcWvXmzpiqmBCR1NZw=s96',
      twitter: 'https://twitter.com/@0xLust'
    },
    nftCollections: [
      {
        asset: {
          assetImg: 'https://lh3.googleusercontent.com/ZFwAVvO9MPXqt0z2gongJXoWdTMei75iu8-WwC5jCzukz_skY-bt-m1-RBctL4dlroycq0Iag6CqtNSFt9YdLFITzYT6TVcITSrlEQ=w342',
          assetName: 'ApeZuki #1739',
          openseaAssetURL: 'https://opensea.io/assets/0x16ef6e8563456283f50654a8fb16056a88eecbb5/1739'
        },
        collection: {
          collectionName: 'Official ApeZuki',
          collectionAddress: '0x16ef6e8563456283f50654a8fb16056a88eecbb5',
          openseaCollectionURL: 'https://opensea.io/collection/official-apezuki'
        }
      }
    ],
    statistics: {
      floor: "0.003",
      volume: "154",
      owners: "2.8K",
      items: "9.8K"
    }
  }


  /**
  * @method handleUserLoad grab information scraped and setProfile
  * @param {String} address of wallet (ethereum addess/ens/opensea username)
  */
  const handleUserLoad = (address) => {
    Scrape.wallet(address)
      .then(({ user, nftCollections, status }) => {
        if (status === 200) {
          setProfile({ user: user, nftCollections: nftCollections })

          handleStatLoad(nftCollections.length, nftCollections)

        } else {

        }
      })
      .catch(err => console.log(err))
  }


  /**
  * @method handleSocialLoad grab collection information from etherscan
  * @param {Object} collection information (specifically need name and openseaURL)
  */
  const handleSocialLoad = (collection) => {
    console.log(collection)
  }

  /**
  * @method handleStatLoad grab scraped collection stat information
  * @param {Int} length of collection array
  * @param {Array} nftCollection array
  */
  const handleStatLoad = async (length, nftCollections) => {


    for (let i = 0; i < length; i++) {
      const url = nftCollections[i].collection.openseaCollectionURL
      const urlEnd = url.split('https://opensea.io/collection/')[1]
      let response = await Scrape.oneCollection(urlEnd)
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`)
      } else {

        setSets({ ...sets, collStats: [...sets.collStats, response.statistics] })
      }
    }




  }

  useEffect(() => {
    console.log('useEffect')
    handleUserLoad(address)
    console.log(profile)

  }, []);


  return (
    <>
      <p>{sets.collStats[0] ? sets.collStats[0].floor : 'unavailable'}</p>
    </>
  )
}

export default Profile