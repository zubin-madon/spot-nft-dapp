import React, { useState, useEffect, useRef, useCallback } from 'react';
import Card from '../Card';
import traits from '../../traits';
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import Moralis from 'moralis';
import Authenticate from '../Authenticate';
import contractsData from '../../contracts/contractsData';
import spotNFTAbiFuji from '../../contracts/spotNFTAbiFuji.json';


export const Board = () => {
    const {account, isAuthenticated} = useMoralis();
    const userAddress = account
    const spotTraitsContract = "0x9521807adf320d1cdf87afdf875bf438d1d92d87";
    const spotNFTContract = '';
    const spotTraitsContractFuji = '0xD1cebaDdf3a76CD1E628e8Ce541fC700c64Afe47';
    const spotNFTContractFuji = '0x1BcaC9c748619578B8b420ff4E5536a55441fc42';
    const [filter, setFilter] = useState('');


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
        HeadwearID: '',
        Eyes: '',
        EyesID: '',
        Mouth: '',
        MouthID: ''
    })
    {/* For retrieval of traits */}
    const [walletTraits, setWalletTraits] = useState([])
    const [apiLoaded, setApiLoaded] = useState(false)
    const [checkMyTraits, setCheckMyTraits] = useState(false)
    console.log("component rendered")
    
    function getTraits() {
        const options = { chain: "0xa869", address: userAddress, token_address: spotTraitsContractFuji };
        Moralis.Web3API.account.getNFTsForContract(options).then((data)=>{
            const result = data.result
            setWalletTraits(result.map(nft=>nft.token_id))
            setApiLoaded(true)
            console.log("api triggered")
        });
    
    }
    useEffect(()=>{
        getTraits();
    }, [checkMyTraits, account])
    
    function createCard(trait) { //Building the card here from Card.jsx passing props and simultaneously fetching traits on click.
        return (
            
           <div onClick= {()=>{
     
               if(trait.traitType==='Background') {setCanvasImage(prevImage=> ({...prevImage, 'Background': trait.image})); 
               setChosenTrait(prevTrait=>({...prevTrait, 'Background': trait.traitName, 'BackgroundID': trait.id}))}
               if(trait.traitType==='Body') {setCanvasImage(prevImage=>({...prevImage, 'Body': trait.image}));
               setChosenTrait(prevTrait=>({...prevTrait, 'Body': trait.traitName, 'BodyID': trait.id}))}
               if(trait.traitType==='Head') {setCanvasImage(prevImage=>({...prevImage, 'Head': trait.image}));
               setChosenTrait(prevTrait=>({...prevTrait, 'Head': trait.traitName, 'HeadID': trait.id}))}
               if(trait.traitType==='Eyes') {setCanvasImage(prevImage=>({...prevImage, 'Eyes': trait.image}));
               setChosenTrait(prevTrait=>({...prevTrait, 'Eyes': trait.traitName, 'EyesID': trait.id}))}
               if(trait.traitType==='Mouth') {setCanvasImage(prevImage=>({...prevImage, 'Mouth': trait.image}));
               setChosenTrait(prevTrait=>({...prevTrait, 'Mouth': trait.traitName, 'MouthID': trait.id}))}
               if(trait.traitType==='Headwear') {setCanvasImage(prevImage=>({...prevImage, 'Headwear': trait.image}));
               setChosenTrait(prevTrait=>({...prevTrait, 'Headwear': trait.traitName, 'HeadwearID': trait.id}))}
    
           }}> <Card
            key = {trait.id}
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
    const [windowWidth, setWindowWidth] = React.useState(window.innerWidth)
    const [windowHeight, setWindowHeight] = React.useState(window.innerHeight)
  
  const div = useCallback(node => {
    
    if (node !== null) {
       
      setHeight(node.getBoundingClientRect().height); //set height and width of canvas relative to parent div.
      setWidth(node.getBoundingClientRect().width);
    }
  }, [windowWidth, windowHeight]);

    function drawImage(layer) {
        const img = new Image();
        img.src = layer
        img.onload= () => {
            const ctx = canvas.current.getContext("2d")
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0,0, width, height)  
    }
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
        const [savedImage, setSavedImage] = useState('') //Saving image for sending to IPFS. This part isn't active yet!
    function saveImage() {
        let imageToSave = new Image();
        imageToSave.src = hiddenCanvas.current.toDataURL('image/png', 1.0);
        setSavedImage(imageToSave.src)
        //alert("Patience Lurker! Minting isn't active yet!")
    }
//     3. You need to verify that the current combination of traits has not been used before. 
//  There is a function checkDNA in the pfp contract where you pass in a string of the concatenated trait ids. Returns 0 if combo available. Returns 1 if taken.
// 4. Before minting, user must approve the pfp contract to use their traits. Traits contract has a function setApprovalFor which takes in the pfp contractvaddress and a bool (true).
// 4. Mint by passing in all the trait ids as individual ints. See contract function.
// 5. Minting burns the traits and mints the pfp. It will emit the standard erc721 Mint even (listen for this in Moralis to get the token id)
// 6. Now that you have the token ID, upload the image and Metadata to filebase
// As another note in case you missed it. If the user selects no Headwear you must pass in 599 for the Headwear trait id
const { data, error, fetch, isFetching, isLoading } = useWeb3ExecuteFunction({
    abi: spotNFTAbiFuji,
    contractAddress: spotNFTContractFuji,
    functionName: "checkDNA",
    params: {
    DNA: '2101200300400600',
    },
});

const [traitsAvailability, setTraitsAvailability] = useState('')
    
useEffect(function() {
        fetch()
        .then((data)=> setTraitsAvailability(JSON.stringify(data)))
        .then(console.log(traitsAvailability))
            },[chosenTrait])
    
    if (!isAuthenticated) {
        return (
          <Authenticate />
        );
      } else  
    // Main Component Return
  return (
<div className='container flex-auto mx-auto w-full'>

{/* Canvas Row*/}
<div className="lg:sticky top-20 grid 2xl:grid-cols-3 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-1 sm:grid-cols-1 gap-4 mt-1 ml-6 sm:p-5 bg-slate-900 lg:pb-3">
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
className='invisible' />
</div>
{/* canvas div ends */}
{/* Stats div*/}
<div className='border-dashed border-4 border-slate-500 p-3 m-1 text-left col-span-1 w-96 md:mt-10 lg:mt-1 mt-10 sm:mt-10 text-sm'>
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
<div className={`text-${walletTraits.includes(`${chosenTrait.HeadwearID}`)?"spot-yellow":"[red]"} font-bold pr-3`}>Headwear: </div>
{chosenTrait.Headwear} (ID: {chosenTrait.HeadwearID})
</div>
{/* End of Indiv Stats */}
{/* Buttons */}
<div className="pt-1 pb-1">
<button className="m-2 rounded-lg px-4 py-2 border-2 border-gray-200 text-gray-200
     hover:bg-gray-200 hover:text-gray-900 duration-300 font-mono font-bold text-base" onClick={null}>Mint</button>
     <button className="m-2 rounded-lg px-4 py-2 border-2 border-gray-200 text-gray-200
     hover:bg-gray-200 hover:text-gray-900 duration-300 font-mono font-bold text-base" onClick={()=>{
        setCheckMyTraits(!checkMyTraits)
     }}>My Owned Traits</button>
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

    <div className="p-10 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-4 xl:grid-cols-6 gap-5 font-mono text-spot-yellow">
      {dataSearch.map(createCard)}
    </div>
    
</div>
  )
}