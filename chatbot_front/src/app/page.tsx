"use client";
import Image from "next/image";
import chat from "../../public/chatbox-icon.svg";
import bot from "../../public/chatbot.png";
import { useEffect, useState } from "react";
import './assests/window.css';
import Chat from "./components/chat";



export default function Home() {

	const [window, setWindow] = useState(false);
	// const [wait, checkWait] = useState(false);

	// useEffect(()=>{
	// 	setWindow(true);
	// },[])

	return (
		<>
		
			<div className="main">
				<button onClick={()=>setWindow(!window)} className="widget">
					<Image src={chat.src} alt="chatbox-icon" width="50" height="50" />
				</button>
				{ window && 
					<div className="window">
						<header className="header">
							<Image src={bot.src} className="icon" alt="bot-icon" property="true" width={50} height={50}/>
								<aside>
									<h1>Nabady Bot</h1>
									<h4>Salam, bach neqder naawnek ?</h4>
								</aside>
						</header>
						
						<Chat />
					</div>
				}
			</div>


		</>
	);
}


