import { stringify } from 'postcss';
import React, { useEffect, useState } from 'react'
import { useWeb3ExecuteFunction, useMoralisCloudFunction } from "react-moralis";
import spotNFTAbiFuji from '../contracts/spotNFTAbiFuji.json';
import Moralis from 'moralis';



function Mint(props) {
  const [isLoading, setIsLoading] = useState(false)
  const spotTraitsContract = "0x9521807adf320d1cdf87afdf875bf438d1d92d87";
  const spotNFTContract = '';
  const spotTraitsContractFuji = '0xD1cebaDdf3a76CD1E628e8Ce541fC700c64Afe47';
  const spotNFTContractFuji = '0xAf8c4E9c77df06245F3718977f67a60CA7EAfF3D';

  let userAddress = props.userAddress

  const { data: mintData, error: mintError, fetch: mintFetch, isFetching: mintFetching, isLoading: mintLoading } = useWeb3ExecuteFunction();

      function getImage() {
        return props.saveImage()
      }

  function checkTraits() {
    let isSafeBG = props.solidBG.some(ai=> props.chosenTrait.BackgroundID===ai)
 
    if ((props.walletTraits.includes(String(props.chosenTrait.BackgroundID))||isSafeBG)&&props.walletTraits.includes(String(props.chosenTrait.BodyID))&&props.walletTraits.includes(String(props.chosenTrait.HeadID))&&
    props.walletTraits.includes(String(props.chosenTrait.MouthID))&&props.walletTraits.includes(String(props.chosenTrait.EyesID))&&(props.walletTraits.includes(String(props.chosenTrait.HeadwearID))||props.chosenTrait.HeadwearID==='599')) {
        return true;
    }  else return false;
  }

  async function mintMyNFT() {
    if(!checkTraits()) {
      alert("Some of the selected traits are not in your wallet. Ensure all trait-titles are yellow. Click 'My Owned Traits' again to refresh wallet traits.")
    }

    else {
      setIsLoading(true)
      const base64 = await getImage()
      const imageData = new Moralis.File("img.png", {base64: base64});
      await imageData.saveIPFS();
      const imgURL = await imageData.ipfs();

      const metadata = {
        "name": "Goatd",  
        "description": "Customizable PFP on Avax", 
        "image": imgURL, 
        "attributes": [
            {
            "trait_type": "Background", 
            "value": props.chosenTrait.Background
          },
          {
            "trait_type": "Body", 
            "value": props.chosenTrait.Body
          },
          {
            "trait_type": "Head", 
            "value": props.chosenTrait.Head
          },
          {
            "trait_type": "Eyes", 
            "value": props.chosenTrait.Eyes
          },
          {
            "trait_type": "Mouth", 
            "value": props.chosenTrait.Mouth
          },
          {
            "trait_type": "Headwear", 
            "value": props.chosenTrait.Headwear
          }
          ], 
      }
        
        const tokenMetadataUrlResult = await Moralis.Cloud.run("handlemintTest", {
                  metadata
              });
      
      const mintResult = await mintFetch({
        params: {
            abi: spotNFTAbiFuji,
            contractAddress: spotNFTContractFuji,
            functionName: "mint",
            params: {
                bg: props.chosenTrait.BackgroundID,
                body: props.chosenTrait.BodyID,
                head: props.chosenTrait.HeadID,
                eyes: props.chosenTrait.EyesID,
                mouth: props.chosenTrait.MouthID,
                headwear: props.chosenTrait.HeadwearID,
                uri: tokenMetadataUrlResult,
            },
            msgValue: Moralis.Units.ETH(0.3),
        },
        onError: (err) => {
            setIsLoading(false)
            alert(JSON.stringify(err.data.message));
            
        },
        onSuccess: (data) => {
            console.log(data);
            setIsLoading(false)
        },
    });
      
    setIsLoading(false)
         
    }
    setIsLoading(false)
  }
   if(isLoading) {
     return(
    <div><button className="inline-flex m-2 rounded-lg px-4 py-2 border-2 border-spot-yellow text-spot-yellow
     duration-300 font-mono font-bold text-base" disabled>
  <svg className="inline animate-ping h-5 w-5 mr-3" viewBox="0 0 35 35">
  <circle className="path" cx="12" cy="15" r="10" fill="yellow" stroke="yellow" strokeWidth="2"></circle>
  </svg>
  Processing...
</button>
</div>
)
   } else
    return (
    <div>
        <button className="m-2 rounded-lg px-4 py-2 border-2 border-gray-200 text-gray-200
     hover:bg-gray-200 hover:text-gray-900 duration-300 font-mono font-bold text-base" onClick={mintMyNFT} disabled={props.traitsAvailability==='1'}>Mint</button>
    </div>
  )
}

export default Mint;