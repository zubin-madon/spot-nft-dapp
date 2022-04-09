import React, { useState, useEffect, useRef, useCallback } from 'react';

import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import Moralis from 'moralis';


export const BackupBoard = () => {
    const {account, isAuthenticated} = useMoralis();
    const userAddress = account
    const spotTraitsContract = "0x9521807adf320d1cdf87afdf875bf438d1d92d87";
    const spotNFTContract = '';
    const spotTraitsContractFuji = '0xD1cebaDdf3a76CD1E628e8Ce541fC700c64Afe47';
    const spotNFTContractFuji = '0x1BcaC9c748619578B8b420ff4E5536a55441fc42';
    const [filter, setFilter] = useState('');
    const spotAnalogContract = '0x0C6945E825fc3c80F0a1eA1d3E24d6854F7460d8';
    const [walletImg, setWalletImg] = useState([])

    async function getNfts() {
        const options = { address: account, chain: 'avalanche', token_address: spotAnalogContract }
        const NFTs = await Moralis.Web3API.account.getNFTsForContract(options)
            const result = NFTs.result
            const final = result.map(nft=>nft.metadata)
        const tokenArray = final.map((ea)=>{
            const parsed = JSON.parse(ea)
            if(parsed!=null){
                return parsed.image   
            } 
            
        })
        setWalletImg(tokenArray)
      };
    //   useEffect(() => {
    //     getNfts();
    //   },[]);
     
  return (
<div>

</div>
  )
}

    // const cloudCall = () => {
      //   getImage().then(async(image)=>{
      //     const result = await Moralis.Cloud.run("handlemintTest", {
      //             userAddress,
      //             image
      //         });
      //     console.log(result)
      //   })  
        
      // }