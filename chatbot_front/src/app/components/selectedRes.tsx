import { useState, useEffect, useRef } from 'react';
import '../assests/window.css';



export default function SelectedRes() {

	const [data, setData] = useState<any[]>([]);
	const [spec, setSpec] = useState('');

	async function getResponse(){
		const res1 = await fetch('https://apiuat.nabady.ma/api/specialites', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		})
		console.log("res ", res1);
		const data1 = await res1.json();
		console.log(data1);
		console.log("member ", data1.hydra, data1['hydra:member']);
		setData(data1['hydra:member']);
		
	}

	useEffect(()=>{
		getResponse();
	},[])

	return (<>
		<div className='selectBox'>
		{/* <label>Choisir une specialte</label> */}
			
					<select name="spacialite"  onChange={(e)=>setSpec(e.target.value)}>
						<option value="">Choisir une specialte</option>
						{
							data.map((item, index)=>{
								return <option key={index} value={item.id}>{item.name}</option>
							})
						}
					</select>
		</div>
	</>)
}