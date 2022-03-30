import React, { useState, useEffect, useRef, useCallback } from 'react';
import Card from '../Card';
import traits from '../../traits';
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import Moralis from 'moralis';
import Authenticate from '../Authenticate';
import spotNFTAbiFuji from '../../contracts/spotNFTAbiFuji.json';
import spotTraitsAbiFuji from '../../contracts/spotTraitsAbiFuji.json';
import SetApproval from '../SetApproval';
import Mint from '../Mint';

export const Board = () => {
    const {account, isAuthenticated} = useMoralis();
    const userAddress = account
    const spotTraitsContract = "0x9521807adf320d1cdf87afdf875bf438d1d92d87";
    const spotNFTContract = '';
    const spotTraitsContractFuji = '0xD1cebaDdf3a76CD1E628e8Ce541fC700c64Afe47';
    const spotNFTContractFuji = '0x1BcaC9c748619578B8b420ff4E5536a55441fc42';
    const [filter, setFilter] = useState('');

    // async function handleMint(){
    //     const handlemint = await Moralis.Cloud.run("handlemint")
    //     console.log(handlemint)
    // }
    // handleMint()

    {/* For Image retrieval */}
    const [canvasImage, setCanvasImage] = useState({
        Background: '',
        Body: '',
        Head: '',
        Headwear: '',
        Eyes: '',
        Mouth: ''
    });
    {/* For Traits retrieval */}
    const [chosenTrait, setChosenTrait] = useState({
        Background: '',
        BackgroundID: '',
        Body: '',
        BodyID: '',
        Head: '',
        HeadID: '',
        Headwear: '',
        HeadwearID: '599',
        Eyes: '',
        EyesID: '',
        Mouth: '',
        MouthID: ''
    })
    {/* For retrieval of traits */}
    const [walletTraits, setWalletTraits] = useState([])
    const [apiLoaded, setApiLoaded] = useState(false)
    const [checkMyTraits, setCheckMyTraits] = useState(false)
    
    
    function getTraits() {
        const options = { chain: "0xa869", address: userAddress, token_address: spotTraitsContractFuji };
        Moralis.Web3API.account.getNFTsForContract(options).then((data)=>{
            const result = data.result
            setWalletTraits(result.map(nft=>nft.token_id))
            setApiLoaded(true)
            
        });
    
    }
    useEffect(()=>{
        getTraits();
    }, [checkMyTraits, account])

    function updateCanvasTraits(trait) {
        setCanvasImage(prevImage=>({...prevImage, [trait.traitType]:trait.image}))
        setChosenTrait(prevTrait=>({...prevTrait, [trait.traitType]:trait.traitName, [trait.traitType+'ID']:trait.id}))
    }

    function createCard(trait) { //Building the card here from Card.jsx passing props and simultaneously fetching traits on click.
        return (
            
           <div key = {trait.id} onClick= {()=>{
               updateCanvasTraits(trait)
           }}> <Card
            traitName = {trait.traitName}
            traitType = {trait.traitType}
            rarity = {trait.rarity}
            image = {trait.image}
            id = {trait.id}
            /></div>
        )
    }

    // For Searching traits
    const searchText = (event) => {
        setFilter(event.target.value);
    }
    let dataSearch = traits.filter(item =>{
        return Object.keys(item).some(key =>item[key].toString().toLowerCase().includes(filter.toString().toLowerCase())
        )
    });

    // Putting stuff on Canvas
    const canvas = useRef(null)
    const hiddenCanvas = useRef(null)
    const [height, setHeight] = useState(null);
    const [width, setWidth] = useState(null);
    const {windowWidth} = useState(window.innerWidth)
    const {windowHeight} = useState(window.innerHeight)
  
  const div = useCallback(node => {
    
    if (node !== null) {
       
      setHeight(node.getBoundingClientRect().height); //set height and width of canvas relative to parent div.
      setWidth(node.getBoundingClientRect().width);
    }
  }, [windowWidth, windowHeight]);

    function drawImage(layer) {
        const img = new Image();
        //img.setAttribute('crossOrigin', '*');
        img.onload= () => {
            const ctx = canvas.current.getContext("2d")
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0,0, width, height)  
    }
    img.src = layer
    const imgHidden = new Image();
        imgHidden.src = layer
        imgHidden.onload= () => {
            const ctxHidden = hiddenCanvas.current.getContext("2d")
            ctxHidden.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);
            ctxHidden.drawImage(imgHidden, 0,0, 900, 900)     
    }


        }
    useEffect(()=> {
        drawImage(canvasImage.Background);
        drawImage(canvasImage.Body);
        drawImage(canvasImage.Head);
        drawImage(canvasImage.Eyes);
        drawImage(canvasImage.Mouth);
        drawImage(canvasImage.Headwear);

        
        }
    , [canvasImage, canvas, windowWidth, windowHeight])
        const [savedImage, setSavedImage] = useState('empty image') //Saving image for sending to IPFS. This part isn't active yet!
        
        function saveImage() {
        let imageToSave = new Image();
        imageToSave.src = canvas.current.toDataURL('image/png', 1.0)
        return imageToSave.src
        }
       


//     3. You need to verify that the current combination of traits has not been used before. 
//  There is a function checkDNA in the pfp contract where you pass in a string of the concatenated trait ids. Returns 0 if combo available. Returns 1 if taken.
// 4. Before minting, user must approve the pfp contract to use their traits. Traits contract has a function setApprovalFor which takes in the pfp contractvaddress and a bool (true).
// 4. Mint by passing in all the trait ids as individual ints. See contract function.
// 5. Minting burns the traits and mints the pfp. It will emit the standard erc721 Mint event (listen for this in Moralis to get the token id)
// 6. Now that you have the token ID, upload the image and Metadata to filebase
// As another note in case you missed it. If the user selects no Headwear you must pass in 599 for the Headwear trait id

//Calling Traits Contract and PFP Contract using Moralis below.
const currentDNA = ""+chosenTrait.BackgroundID+chosenTrait.BodyID+chosenTrait.HeadID+chosenTrait.EyesID+chosenTrait.MouthID+chosenTrait.HeadwearID;
const { data: traitData, error: traitError, fetch: traitFetch, isFetching: traitFetching, isLoading: traitLoading } = useWeb3ExecuteFunction({
    abi: spotNFTAbiFuji,
    contractAddress: spotNFTContractFuji,
    functionName: "checkDNA",
    params: {
    DNA: currentDNA,
    },
});
const { data: pfpData, error: pfpError, fetch: pfpFetch, isFetching: pfpFetching, isLoading: pfpLoading } = useWeb3ExecuteFunction({
    abi: spotTraitsAbiFuji,
    contractAddress: spotTraitsContractFuji,
    functionName: "checkDNA",
    params: {
    DNA: currentDNA,
    },
});

//Pass current DNA of selected traits in checkDNA function of NFT contract. Set Availability to 0 if available.
const [traitsAvailability, setTraitsAvailability] = useState('1')
useEffect(function() {
    
    if(currentDNA.length >15) {
        traitFetch()
        .then((data)=> setTraitsAvailability(JSON.stringify(data)))
    }
            },[chosenTrait])
//---------------------------------//

    if (!isAuthenticated) {
        return (
          <Authenticate />
        );
      } else  
    // Main Component Return
  return (
<div className='container flex-auto mx-auto w-full'>

{/* Canvas Row*/}
<div className="lg:sticky top-20 grid 2xl:grid-cols-3 xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-1 gap-4 mt-1 ml-6 sm:p-5 bg-slate-900 lg:pb-3">
{/* canvas div */}

<div className="p-1 mb-10 sm:mb-10" ref={div} style={{height: "20rem", width: "20rem"}}>
<canvas
    ref={canvas}
    width = {width}
    height = {height}
    className='mt-1 border-1 border-4 border-slate-500 text-center content-center p-5'
/>
<div className="text-center md: pl-10"><h1 className='font-mono text-lg text-yellow-400 pt-1'>Transmorphisizer</h1></div>
<canvas
ref={hiddenCanvas}
width = '900px'
height = '900px'
className='hidden' />
</div>
{/* canvas div ends */}
{/* Stats div*/}
<div className='grow border-dashed border-4 border-slate-500 p-3 m-1 text-left col-span-1 w-96 md:mt-10 lg:mt-1 mt-10 sm:mt-10 text-sm'>
{/* Individual Stats */}
<div className='font-mono text-white list-none flex pb-3'>
<div className= {`text-${walletTraits.includes(`${chosenTrait.BackgroundID}`)?"spot-yellow":"[red]"} font-bold pr-3`}>Background: </div>
{chosenTrait.Background} (ID: {chosenTrait.BackgroundID})
</div>

<div className='font-mono text-white list-none flex pb-3'>
<div className={`text-${walletTraits.includes(`${chosenTrait.BodyID}`)?"spot-yellow":"[red]"} font-bold pr-3`}>Body: </div>
{chosenTrait.Body} (ID: {chosenTrait.BodyID})
</div>

<div className='font-mono text-white list-none flex pb-3'>
<div className={`text-${walletTraits.includes(`${chosenTrait.HeadID}`)?"spot-yellow":"[red]"} font-bold pr-3`}>Head: </div>
{chosenTrait.Head} (ID: {chosenTrait.HeadID})
</div>

<div className='font-mono text-white list-none flex pb-3'>
<div className={`text-${walletTraits.includes(`${chosenTrait.EyesID}`)?"spot-yellow":"[red]"} font-bold pr-3`}>Eyes: </div>
{chosenTrait.Eyes} (ID: {chosenTrait.EyesID})
</div>

<div className='font-mono text-white list-none flex pb-3'>
<div className={`text-${walletTraits.includes(`${chosenTrait.MouthID}`)?"spot-yellow":"[red]"} font-bold pr-3`}>Mouth: </div>
{chosenTrait.Mouth} (ID: {chosenTrait.MouthID})
</div>

<div className='font-mono text-white list-none flex pb-3'>
<div className={`text-spot-yellow font-bold pr-3`}>Headwear: </div>
{chosenTrait.Headwear} (ID: {chosenTrait.HeadwearID})
</div>
{/* End of Indiv Stats */}
{/* Buttons */}
<div className="pt-1 pb-1">
{/* <button className="m-2 rounded-lg px-4 py-2 border-2 border-gray-200 text-gray-200
     hover:bg-gray-200 hover:text-gray-900 duration-300 font-mono font-bold text-base" onClick={null}>Mint</button> */}
<Mint 
    chosenTrait = {chosenTrait}
    walletTraits = {walletTraits}
    saveImage = {saveImage}
    userAddress = {userAddress}
    canvas = {chosenTrait}   
/>
<button className="m-2 rounded-lg px-4 py-2 border-2 border-gray-200 text-gray-200
    hover:bg-gray-200 hover:text-gray-900 duration-300 font-mono font-bold text-base" onClick={()=>{
    setCheckMyTraits(!checkMyTraits)
    }}>My Owned Traits</button>

<button className="m-2 rounded-lg px-4 py-2 border-2 border-gray-200 text-gray-200
    hover:bg-gray-200 hover:text-gray-900 duration-300 font-mono font-bold text-base" onClick={saveImage}>Save Image</button>
<SetApproval />   
</div>
{/* End of Buttons */}
{/* Two bottom text lines */}
<div className='font-mono text-white list-none flex pb-0 pt-3 text-sm'>
<div className='text-spot-yellow font-bold pr-3 text-xl'>* </div>
Traits in your wallet:  {apiLoaded,checkMyTraits&&walletTraits.length+' nos.'} {apiLoaded,checkMyTraits&&'IDs: '+walletTraits.map(trait=>' '+trait)}
</div>
<div className='font-mono text-white list-none flex pb-3 text-sm'>
<div className='text-[red] pr-3 text-xl'>* </div>
Traits not in your wallet.
</div>
<div className='font-mono text-white list-none flex pb-3 text-sm'><span className={traitsAvailability==='0'?"text-green-300":"text-red"}>
{traitsAvailability==='0'&&currentDNA.length>=16?'Trait Combo is Unique!':null}
{traitsAvailability==='1'&&currentDNA.length>=16?"Trait Combo's Been Minted!":null}</span>
</div> {/* End of btm text lines */}
</div>{/* Stats div Ends*/}
{/* SearchBox */}
<div className="grid grid-rows-1 grid-cols-12 gap-4 pt-10 pl-10 self-end">
    <div className='col-span-1'><input type="text" 
        className="border-2 border-slate-600 bg-slate-400 text-left font-mono placeholder-slate-600 pl-2" placeholder="search trait/ID..."
        value={filter}
        onChange={searchText.bind(this)}
      /></div>
</div>{/* SearchBox Ends */}
</div>{/* Canvas Row Div Ends*/}
<img crossOrigin="anonymous" src={saveImage} alt="test result"></img>

    <div className="p-10 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-4 xl:grid-cols-6 gap-5 font-mono text-spot-yellow">
      {dataSearch.map(createCard)}
    </div>
    
</div>
  )
}