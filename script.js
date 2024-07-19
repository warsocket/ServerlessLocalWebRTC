async function main(){


	let rtcA = new RTCPeerConnection()
	let rtcB = new RTCPeerConnection()

	let dataA
	let dataB

	rtcA.addEventListener("iceconnectionstatechange", async (e)=>{console.log(`A:`,e)})
	rtcA.addEventListener("icegatheringstatechange", async (e)=>{console.log(`A:`,e)})

	b.addEventListener('click',() => {
		dataA.send("xxx")
	})

	rtcA.addEventListener("signalingstatechange", async (e)=>{
		console.log(`A:`,e)
	})

	rtcA.addEventListener("icecandidate", async (e)=>{
		const candidate = e.candidate
		if (!candidate){// transfer it to the other client via own means 
			rtcB.setRemoteDescription(rtcA.localDescription)
		}
	})
	rtcA.addEventListener("datachannel", (e)=>{console.log(`A:`,e)})
	rtcA.addEventListener("negotiationneeded", async (e)=>{
		offerA = await rtcA.createOffer()
		rtcA.setLocalDescription(offerA)
	})

	rtcB.addEventListener("iceconnectionstatechange", async (e)=>{console.log(`B:`,e)})
	rtcB.addEventListener("icegatheringstatechange", async (e)=>{console.log(`B:`,e)})

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
	rtcB.addEventListener("datachannel", (e)=>{console.log(`B:`,e)})
	rtcB.addEventListener("negotiationneeded", async (e)=>{
		console.log(`B:`,e)
	})

	dataA = rtcA.createDataChannel("data", {negotiated:true, id:0})

	dataA.addEventListener('open', (e)=>{
		e.target.send("Data from A to B.")
	})
	dataA.addEventListener('message', (e)=>{
		console.log(e.data)
	})

}
document.addEventListener("DOMContentLoaded", main)