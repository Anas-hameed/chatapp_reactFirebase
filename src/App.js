import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import { collection, onSnapshot, addDoc, orderBy, query } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import SignIn from "./SignIn";
import SignOut from "./SignOut";
import OneSignal from 'react-onesignal';


function App() {
	const [user] = useAuthState(auth);
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");
	const [player, setPlayer] = useState(null);
	const [playerList, setPlayerList] = useState([]);

	useEffect(() => {
		OneSignal.init({
			appId: "078b26b0-4ad5-4604-8188-d091edff87b1"
		});
		console.log("OneSignal Initialized");
		const q = query(collection(db, "messages"), orderBy("timestamp"));
		const unsubscribe = onSnapshot(q, (snapshot) => {
			setMessages(
				snapshot.docs.map((doc) => ({
					id: doc.id,
					data: doc.data(),
				}))
			);
		});
		return () => unsubscribe();
	}, []);


	const Initalize = async () => {
		const playerId = await new Promise((resolve, reject) => {
			OneSignal.getUserId().then(function (userId) {
				resolve(userId);
			}).catch(function (error) {
				console.log("OneSignal User ID Error:", error);
				reject(error);
			});
		});
		console.log("OneSignal Id::", playerId);

		const q = query(collection(db, "users"));
		const unsubscribe = onSnapshot(q, (snapshot) => {
			setPlayerList(
				snapshot.docs.map((doc) => ({
					uid: doc.data().id,
					playerId: doc.data().playerId,
				}))
			);
		});
		setPlayer(playerId);
		return () => unsubscribe();
	}

	useEffect(() => {
		Initalize();
	}, [player]);


	useEffect(() => {
		const userId = user?.uid;
		console.log("player::", playerList);
		// add player to db if not exists in playerList
		if (playerList.length > 0) {
			const playerExists = playerList.find((p) => p.uid === user.uid);
			if (!playerExists) {
				addDoc(collection(db, "users"), {
					id: userId,
					playerId: player
				});
				console.log("player added to db");

			}
		}
	}, [playerList, player]);



	const sendNotification = async () => {
		if (playerList.length === 0) return;
		// fillter playerList to get playerId of user without current user
		const playerListWithoutCurrentUser = playerList.filter((p) => {
			if (p.uid !== user.uid) return p.playerId;
			// return not
			return null;
		});

		console.log("playerListWithoutCurrentUser::", playerListWithoutCurrentUser);
		// create a comma seperated string of playerIds
		const playerIds = playerListWithoutCurrentUser.map((p) => p.playerId).join(",");
		console.log("playerIds::", playerIds);
		// keep input1 to max of 30 characters
		const input1= input.length > 30 ? input.substring(0, 30)+"..." : input+"...";
		// print playerIds type to check if it is string
		console.log("playerIds type::", typeof playerIds);
		const url = 'https://onesignal.com/api/v1/notifications';

		const data = `
{
  "include_player_ids": [
    "${playerIds}"
  ],
  "contents": {
    "en": "${user.displayName}: ${input1}",
    "es": "Spanish Message"
  },
  "headings": {
	"en": "New Message from ${user.displayName}",
	"es": "Spanish Message"
	  },
  "name": "Messaging","app_id": "078b26b0-4ad5-4604-8188-d091edff87b1"
}
`;

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Authorization': 'Basic NjEwYzkyNDUtNWZlMS00NDFlLThkZjItY2E3YWViOWY1MTVj',
				'accept': 'application/json',
				'content-type': 'application/json',
			},
			body: data,
		});

		const text = await response.text();
		console.log(text);

	}


	const handleInputChange = (e) => {
		setInput(e.target.value);
	};

	const sendMessage = async (e) => {
		e.preventDefault();

		if (input.trim()) {
			await addDoc(collection(db, "messages"), {
				text: input,
				timestamp: new Date(),
				uid: user.uid,
				displayName: user.displayName,
			});
			sendNotification();
			setInput("");
		}
	};


	return (
		<div className="App">
			<div>
				<header className="header">
					<h1>Firebase ChatApp</h1>
					{
						user ? <SignOut /> :
							<SignIn />
					}
				</header>
				<div className="Container">
					<div className="main">
						<h3>Chat Room</h3>
						<main>
							{user && (
								<>
									{messages.map(({ id, data }) => (
										<div key={id} className={`message ${data.uid === user.uid ? "sent text-left" : "received text-right"}`}>
											<span>{data.displayName === user.displayName ? 'You' : data.displayName}: </span>
											<span className="messageText">{data.text}</span>
											<div className="hr"></div>
										</div>
									))}
								</>
							)
							}
						</main>
						{user && (
							<footer>
								{/* <div className="hr"></div> */}
								<form onSubmit={sendMessage} className="form">
									<div className="form__group field">
										<input value={input} onChange={handleInputChange} type="input" className="form__field" name="name" id='name' required />
									</div>
									<button type="submit" className="button3">Send</button>
								</form>
							</footer>

						)}
					</div>
				</div>
			</div>
		</div>
	);
}
export default App;