import {useState, useEffect} from 'react';
import React from 'react';
import '../assests/window.css';




export default function Chat() {




	return (
		<>
		<div className='chat'>

			<div className='conversation'>
				<p className='msg'>Ana NabadyBot, Bach ne9der n3awnek</p>
			</div>
	
			<div className="send">
				<input type="text" placeholder="Enter un message..." />
				<button>Envoyer</button>
			</div>
		</div>

	</>);
}