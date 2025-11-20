import { useState } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function VetLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async () => {
    try {
      const userCred = await signInWithEmailAndPassword(auth, form.email, form.password);

      const snap = await getDoc(doc(db, "users", userCred.user.uid));
      const data = snap.data();

      if (data.profession === "veterinarian") {
        navigate("/vet/dashboard");
      } else {
        alert("You do not have veterinarian access!");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="p-8 text-center">
      <h2 className="text-3xl font-bold">Veterinarian Login</h2>

      <input className="input" placeholder="Email"
             onChange={e => setForm({ ...form, email: e.target.value })} />
      <input className="input" type="password" placeholder="Password"
             onChange={e => setForm({ ...form, password: e.target.value })} />

      <button onClick={handleLogin} className="btn-green">Login</button>
    </div>
  );
}