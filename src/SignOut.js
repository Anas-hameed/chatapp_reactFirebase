import { signOut } from "firebase/auth";
import { auth } from "./firebase";

function SignOut() {
  return (
    auth.currentUser && (
      <div className="signOut">
        <button className="button1">Hi, {auth.currentUser.displayName}</button>
        <button className="button" onClick={() => signOut(auth)}>Sign out</button>
      </div>
    )
  );
}
export default SignOut;