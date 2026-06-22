// This component handles Google OAuth login. It uses Firebase for authentication and then sends the user data to the backend to get a JWT token. The token is stored in Redux state for authenticated requests.
import Button from "./Button";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import { setCredentials } from "../redux/features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL || "https://taskmanagerbysatyamsaroj.onrender.com";

const OAuth = ({ title }) => {
  const auth = getAuth(app);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      const resultsFromGoogle = await signInWithPopup(auth, provider);
      
      const res = await fetch(`${baseUrl}/api/v1/user/google`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: resultsFromGoogle.user.displayName,
          email: resultsFromGoogle.user.email,
          googlePhotoUrl: resultsFromGoogle.user.photoURL,
        }),
      });

      const data = await res.json();
      
      // IMPORTANT LOGS - tell me what these print
      console.log("Status:", res.status);
      console.log("Full data:", JSON.stringify(data));
      console.log("Token in data:", data.token);

      if (res.ok) {
        dispatch(setCredentials(data));
        console.log("setCredentials called!");
        toast.success("Login successful");
        setTimeout(() => navigate("/"), 100);
      } else {
        toast.error(data.message || "Google login failed");
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      toast.error(error.message);
    }
  };

  return (
    <Button
      type="button"
      className="bg-green-600 text-white mx-auto block rounded-md p-2 m-4 justify-center"
      onClick={handleGoogleClick}
    >
      {title}
    </Button>
  );
};

export default OAuth;