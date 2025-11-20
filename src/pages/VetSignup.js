import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function VetSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  const handleSignup = async () => {
    if (form.password !== form.confirm) return alert("Passwords do not match!");

    try {
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);

      await setDoc(doc(db, "users", userCred.user.uid), {
        name: form.name,
        email: form.email,
        profession: "veterinarian"
      });

      navigate("/vet/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="p-8 text-center">
      <h2 className="text-3xl font-bold">Veterinarian Signup</h2>

      <input className="input" placeholder="Full Name" 
             onChange={e => setForm({ ...form, name: e.target.value })} />
      <input className="input" placeholder="Email"
             onChange={e => setForm({ ...form, email: e.target.value })} />
      <input className="input" type="password" placeholder="Password"
             onChange={e => setForm({ ...form, password: e.target.value })} />
      <input className="input" type="password" placeholder="Confirm Password"
             onChange={e => setForm({ ...form, confirm: e.target.value })} />

      <button onClick={handleSignup} className="btn-green">Create Account</button>
    </div>
  );
}