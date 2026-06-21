

import Button from "./Button";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
//logout
import { setCredentials } from "../redux/features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

const OAuth = ({ title }) => {
  const auth = getAuth(app);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      const resultsFromGoogle = await signInWithPopup(auth, provider);
      //   console.log(resultsFromGoogle);
      const res = await fetch(`${baseUrl || "https://taskmanagerbysatyamsaroj.onrender.com"}/api/v1/user/google`, {
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
      console.log("Google backend response:", data);
      if (res.ok) {
        dispatch(setCredentials(data));
        toast.success("Login successful");
        setTimeout(() => navigate("/"), 100);
        navigate("/");
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
      className="bg-green-600 text-white  mx-auto block rounded-md p-2 m-4 justify-center"
      onClick={handleGoogleClick}
    >
      {title}
    </Button>
  );
};

export default OAuth;
