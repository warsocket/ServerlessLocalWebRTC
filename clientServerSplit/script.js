const iceServers = [
    // { urls: "stun:stun.l.google.com:19302" },
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


// let rtc
// let data

async function main(){

	let rtc
	let data
	text.value = ""

	document.getElementById("genOffer").addEventListener('click', ()=>{

		rtc = new RTCPeerConnection(iceConfiguration)

		//after creating offer
		rtc.addEventListener("negotiationneeded", async (e)=>{
			offer = await rtc.createOffer()
			rtc.setLocalDescription(offer)
		})

		rtc.addEventListener("icecandidate", async (e)=>{
			if (!e.candidate){// transfer it to the other client via own means	
				text.value = JSON.stringify(rtc.localDescription)
			}
		})

		data = rtc.createDataChannel("data", {negotiated:true, id:0})
		data.addEventListener('open', ()=>{
			data.send("Hello there. This is sent from the requestor")
		})
		data.addEventListener('message', (e)=>{
			text.value = e.data
		})

	})


	document.getElementById("genAnswer").addEventListener('click', async ()=>{

		rtc = new RTCPeerConnection(iceConfiguration)

		//you can also reacto to signalingstatechange event with have-remote-offer
		await rtc.setRemoteDescription( JSON.parse(text.value) )

		let answer = await rtc.createAnswer()
		rtc.setLocalDescription(answer)

		rtc.addEventListener("icecandidate", async (e)=>{
			if (!e.candidate){// transfer it to the other client via own means	
				
				text.value = ""
				text.value = JSON.stringify(rtc.localDescription)

			}
		})

		data = rtc.createDataChannel("data", {negotiated:true, id:0})
		data.addEventListener('open', ()=>{
			data.send("Hello there. This is sent from the answerer")
		})
		data.addEventListener('message', (e)=>{
			text.value = e.data
		})
	

	})



	document.getElementById("acceptAnswer").addEventListener('click', async ()=>{

		await rtc.setRemoteDescription( JSON.parse(text.value) )

	})




	// document.getElementById("genAnswer").addEventListener('click', ()=>{
	// 	let offer = new
	// }






	// document.getElementById("regenerate").addEventListener('click',async ()=>{
		
	// 	let answerSdp = document.getElementById("answerSDP").value
	// 	let offer = new RTCSessionDescription({type:"offer", sdp:answerSdp})

	// 	//got offer, so im client now
	// 	rtc = new RTCPeerConnection(iceConfiguration)
	// 	await rtc.setRemoteDescription(offer)
	// 	let answer = await rtc.createAnswer()
	// 	await rtc.setLocalDescription(answer)

	// 	document.getElementById("answerSDP")
		
	// 	console.log(answer)

	// })





}

async function createRtcA(){

	rtcA = new RTCPeerConnection(iceConfiguration)
	dataA = rtcA.createDataChannel("data", {negotiated:true, id:0})

	// rtcA.addEventListener("iceconnectionstatechange", async (e)=>{console.log(`A:`,e)})
	// rtcA.addEventListener("icegatheringstatechange", async (e)=>{console.log(`A:`,e)})

	// rtcA.addEventListener("signalingstatechange", async (e)=>{
	// 	console.log(`A:`,e)
	// })

	rtcA.addEventListener("icecandidate", async (e)=>{
		const candidate = e.candidate
		if (!candidate){// transfer it to the other client via own means 
			rtcB.setRemoteDescription(rtcA.localDescription)
		}
	})
	// rtcA.addEventListener("datachannel", (e)=>{console.log(`A:`,e)})
	rtcA.addEventListener("negotiationneeded", async (e)=>{
		offerA = await rtcA.createOffer()
		rtcA.setLocalDescription(offerA)
	})

	

	dataA.addEventListener('open', (e)=>{
		e.target.send("Data from A to B.")
	})
	dataA.addEventListener('message', (e)=>{
		console.log(e.data)
	})

}

function createRtcB(){

	rtcB = new RTCPeerConnection(iceConfiguration)

	// rtcB.addEventListener("iceconnectionstatechange", async (e)=>{console.log(`B:`,e)})
	// rtcB.addEventListener("icegatheringstatechange", async (e)=>{console.log(`B:`,e)})

	rtcB.addEventListener("signalingstatechange", async (e)=>{
		if (rtcB.signalingState == "have-remote-offer"){
			dataB = rtcB.createDataChannel("data", {negotiated:true, id:0})
			let answer = await rtcB.createAnswer()
			rtcB.setLocalDescription(answer)

			dataB.addEventListener('message', (e)=>{
				console.log(e.data)
				dataB.send("Data response from B to A.")
			})
		}
	})

	rtcB.addEventListener("icecandidate", (e)=>{
		const candidate = e.candidate
		if (!candidate){// transfer it to the other client via own means
			rtcA.setRemoteDescription(rtcB.localDescription)
		}
	})
	// rtcB.addEventListener("datachannel", (e)=>{console.log(`B:`,e)})
	rtcB.addEventListener("negotiationneeded", async (e)=>{
		console.log(`B:`,e)
	})

}


document.addEventListener("DOMContentLoaded", main)