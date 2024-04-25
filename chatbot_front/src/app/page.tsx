"use client";
import Image from "next/image";
import chat from "../../public/chatbox-icon.svg";
import bot from "../../public/chatbot.png";
import { useEffect, useState , useRef} from "react";
import './assests/window.css';
import Chat from "./components/chat";



export default function Home() {

	const [window, setWindow] = useState(false);
	const windowRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			if (!windowRef?.current?.contains(event.target as Node) ) {
				setWindow(false);
			}
		};

		document.addEventListener('mousedown', handleOutsideClick);

		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
		};

	}, []);

	return (
		<>
		
			<div className="main">
				<button onClick={()=>setWindow(!window)} className="widget">
					<Image src={chat.src} alt="chatbox-icon" width="50" height="50" />
				</button>
				{ window && 
					<div className="window" ref={windowRef}>
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


