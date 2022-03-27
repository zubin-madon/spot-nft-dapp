import React from 'react'

function Card(props) {
return(

    
    <div className="hover:z-0 rounded overflow-hidden shadow-lg bg-slate-700 hover: hover:scale-105 hover:bg-slate-500 duration-300">
    <img className="w-full" src={props.image} alt={props.traitName}></img>
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2"><h3>Trait Name: {props.traitName}</h3></div>
        <div className="text-slate-50 text-base">
        <h4>Trait Type: {props.traitType}</h4>
        <h4>Rarity: {props.rarity}</h4>
        <h5>ID: {props.id}</h5>
        </div>
      </div>
      <div className="px-6 pt-4 pb-2">
      </div>
    </div>
    
    
)
}
export default Card;