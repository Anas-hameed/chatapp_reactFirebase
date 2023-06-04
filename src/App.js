import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import { collection, onSnapshot, addDoc, orderBy, query } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import SignIn from "./SignIn";
import SignOut from "./SignOut";


function App() {
	const [user] = useAuthState(auth);
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");

	useEffect(() => {
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
	console.log(auth.currentUser);


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
									<div class="form__group field">
										<input value={input} onChange={handleInputChange} type="input" class="form__field" name="name" id='name' required />
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