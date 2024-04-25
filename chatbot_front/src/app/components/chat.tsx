import {useState, useEffect, useRef} from 'react';
import React from 'react';
import '../assests/window.css';
import { MouseEvent , KeyboardEvent } from 'react';
import { get } from 'http';
import SelectedRes from './selectedRes';


interface Msg{
	id? : number;
	content : string;
	sender : string;
	time? : string;
}


export default function Chat() {


	let msgs : Msg[] = [];
	msgs.push({content : 'Ana NabadyBot, Bach ne9der n3awnek', sender : 'bot', id : 1});
	// msgs.push({content : 'bghit rdv', sender : 'usr', id : 2});
	// msgs.push({content : 'makaynch rdv sir b7alk', sender : 'bot', id : 1});
	// msgs.push({content : 'ach had lbot mamrabich', sender : 'usr', id : 2});
	// msgs.push({content : '7sen mn mok', sender : 'bot', id : 1});

	const botMsg = 'bot msg';
	const usrMsg = 'usr msg';
	const [data, setData] = useState<Msg[]>(msgs);
	const [specialites, setSpecialites] = useState<any[]>([]);
	const [input, setInput] = useState('');
	const scroll = useRef<HTMLDivElement>(null);

	async function send(e: KeyboardEvent | MouseEvent){
		if (
			e.type === "click" ||
			(e.type === "keydown" && (e as KeyboardEvent).key === "Enter")
		) {
			if ((input !== "")) {
				setData([...data, {content : input, sender : 'usr', id : 2}]);
				// console.log(data);
			}
			setInput("");
		}
		
	}



	function PrintMsg(Message : Msg){
	
		return(<>
			<div className={Message.sender === 'bot' ? botMsg : usrMsg}>
				{Message.content}
			</div>
		</>)
	}

	

	useEffect(() => {
		if (scroll.current) {
			scroll.current.scrollTop = scroll.current.scrollHeight;
		}
		
	}, [data]);

	return (
		<>
			<div className='chat'>
				<div className='conversation' id="scroll" ref={scroll}>
					{data.map((msg: Msg, index: number) => (
						<PrintMsg {...msg} key={index} />
					))}
				{/* <SelectedRes /> */}
				</div>
				<div className="send">
					<input
						className='input'
						type="text"
						placeholder="Enter un message..."
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e: KeyboardEvent) => {
							send(e);
						}}
					/>
					<button onClick={(e)=>send(e)}>Envoyer</button>
				</div>
			</div>
		</>
	);
}