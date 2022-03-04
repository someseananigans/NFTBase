// import { Searchbar } from '../components'
import { Scrape } from '../utils/'
import React from 'react';

import { useEffect, useState } from 'react'
// import '../index.css'



class Profile2 extends React.Component {
  render() {


    const address = match.params.address

    const [profile, setProfile] = useState({
      user: {},
      nftCollections: [],
    })

    const [sets, setSets] = useState({
      collStats: [],
      collSocials: []
    })


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
}

export default Profile2;
