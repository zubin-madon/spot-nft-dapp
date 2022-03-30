import { stringify } from 'postcss';
import React, { useEffect, useState } from 'react'
import { useWeb3ExecuteFunction, useMoralisCloudFunction } from "react-moralis";
import spotNFTAbiFuji from '../contracts/spotNFTAbiFuji.json';
import Moralis from 'moralis';



function Mint(props) {
  console.log("mint component render")
  const [legalMint, checkLegalMint] = useState(false)
  const spotTraitsContract = "0x9521807adf320d1cdf87afdf875bf438d1d92d87";
  const spotNFTContract = '';
  const spotTraitsContractFuji = '0xD1cebaDdf3a76CD1E628e8Ce541fC700c64Afe47';
  const spotNFTContractFuji = '0x1BcaC9c748619578B8b420ff4E5536a55441fc42';

  let userAddress = props.userAddress

  const { data: mintData, error: mintError, fetch: mintFetch, isFetching: mintFetching, isLoading: mintLoading } = useWeb3ExecuteFunction({
    abi: spotNFTAbiFuji,
    contractAddress: spotNFTContractFuji,
    functionName: "mint",
    params: {
      bg: props.chosenTrait.BackgroundID,
      body: props.chosenTrait.BodyID,
      head: props.chosenTrait.HeadID,
      eyes: props.chosenTrait.EyesID,
      mouth: props.chosenTrait.MouthID,
      headwear: props.chosenTrait.HeadwearID
         },
      msgValue: Moralis.Units.ETH(1.0),
     });
     
     const [finalImage, setFinalImage] = useState(null)
     const { fetch:cloudFetch } = useMoralisCloudFunction(
      "handlemint",
      {
        autoFetch: false,
        userAddress: userAddress,
        image: finalImage
    }
  );

    useEffect(()=>{
      function handleImage() {
        let image = props.saveImage()
        setFinalImage(image)
      }
      handleImage()
    },[props.canvas])

    const[rerender, setRerender] = useState(true)
    
      
      const cloudCall = ()=>{
        handleImage()
        cloudFetch({
          onSuccess: (data)=>console.log(data)
        })
      }
        

  function checkTraits() {
    if (props.walletTraits.includes(String(props.chosenTrait.BackgroundID))&&props.walletTraits.includes(String(props.chosenTrait.BodyID))&&props.walletTraits.includes(String(props.chosenTrait.HeadID))&&
    props.walletTraits.includes(String(props.chosenTrait.MouthID))&&props.walletTraits.includes(String(props.chosenTrait.EyesID))&&(props.walletTraits.includes(String(props.chosenTrait.HeadwearID))||props.chosenTrait.HeadwearID==='599')) {
        return true;
    }  else return false;
  }

  async function mintMyNFT() {
    console.log(props.chosenTrait.BackgroundID)
    if(!checkTraits()) {
      alert("Some of the selected traits are not in your wallet. Ensure all trait-titles are yellow. Click 'My Owned Traits' again to refresh wallet traits.")
    }

    else {
      
      const mintResult = await mintFetch({
        onError: (err)=> {
          
          alert(JSON.stringify(err.data.message))
        },
        onSuccess: (data) => console.log(data)
      })   
    }

  }
   
    return (
    <div>
        <button className="m-2 rounded-lg px-4 py-2 border-2 border-gray-200 text-gray-200
     hover:bg-gray-200 hover:text-gray-900 duration-300 font-mono font-bold text-base" onClick={cloudCall}>Mint</button>
     <div>{''?rerender:""}</div>
    </div>
  )
}

export default Mint;