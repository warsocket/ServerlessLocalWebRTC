const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    // { urls: "stun:stun.l.google.com:5349" },
    // { urls: "stun:stun1.l.google.com:3478" },
    // { urls: "stun:stun1.l.google.com:5349" },
    // { urls: "stun:stun2.l.google.com:19302" },
    // { urls: "stun:stun2.l.google.com:5349" },
    // { urls: "stun:stun3.l.google.com:3478" },
    // { urls: "stun:stun3.l.google.com:5349" },
    // { urls: "stun:stun4.l.google.com:19302" },
    // { urls: "stun:stun4.l.google.com:5349" }
];

const iceConfiguration = {
    iceServers: iceServers
}


let rtc
let data


function clear(){
	makeOffer.remove()
	waitAnswer.remove()

	send.addEventListener('click', ()=>{
		let content = document.getElementById('text').value
		log.value += `> ${content}\n`
		data.send(content)
	})

	send.removeAttribute("hidden")
	text.removeAttribute("hidden")
	log.removeAttribute("hidden")
	
}


async function init(){

	makeOffer.addEventListener('click', async ()=>{

		rtc = new RTCPeerConnection(iceConfiguration)
		data = rtc.createDataChannel("data", {negotiated:true, id:0})

		//after creating offer
		rtc.addEventListener("negotiationneeded", async (e)=>{
			offer = await rtc.createOffer()
			rtc.setLocalDescription(offer)
		})

		rtc.addEventListener("icecandidate", async (e)=>{
			if (!e.candidate){// transfer it to the other client via own means	
				await fetch("/offer", {method:"post", body:JSON.stringify(rtc.localDescription)})

				pollAnswer()

			}
		})

		data.addEventListener('open', ()=>{
			clear()
			data.send("Hello there. This is sent from the requestor")
		})
		data.addEventListener('message', (e)=>{
			let content = e.data
			log.value += `< ${content}\n`
		})



		async function pollAnswer(){
			let response = await fetch("/answer", {method:"get"})
			let obj = await response.json()

			if ("type" in obj){
				rtc.setRemoteDescription(obj)
			}else{
				setTimeout(pollAnswer, 500)	
			}

		}



	})




	async function answer(offer){
		await rtc.setRemoteDescription(offer)
		let ans = await rtc.createAnswer()
		fetch("/answer", {method:"post", body:JSON.stringify(ans)})
		rtc.setLocalDescription(ans)
	}


	async function pollOffer(){
		rtc = new RTCPeerConnection(iceConfiguration)
		data = rtc.createDataChannel("data", {negotiated:true, id:0})

		data.addEventListener('open', ()=>{
			clear()
			data.send("Hello there. This is sent from the answerer")
		})
		data.addEventListener('message', (e)=>{
			let content = e.data
			log.value += `< ${content}\n`
		})

		let response = await fetch("/offer", {method:"get"})
		let obj = await response.json()

		if ("type" in obj){
			answer(obj)
		}else{
			setTimeout(pollOffer, 500)	
		}

	}

	waitAnswer.addEventListener('click', pollOffer)

}


document.addEventListener("DOMContentLoaded", init)