//sarthak's dummy login popup code
// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useNavigate } from "react-router-dom";

// const LoginPopup = ({ setShowLogin, setUser }) => {
//   const [mode, setMode] = useState("signin"); // 'signin' or 'signup'
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [fullName, setFullName] = useState("");
//  const navigate = useNavigate();
//   const handleSubmit = (e) => {
//     e.preventDefault(); // Prevent page reload

//     // Basic validation
//     if (mode === "signup" && !fullName) {
//       alert("Please enter your full name");
//       return;
//     }
//     if (!email || !password) {
//       alert("Please enter email and password");
//       return;
//     }

//     // Fake authentication simulation
//     const loggedInUser = {
//       name: mode === "signup" ? fullName : "Player",
//       email,
//     };

//     setUser(loggedInUser); // update App state
//     setShowLogin(false);   // close modal
//     navigate("/dashboard")
//   };
 

//   return (
//     <AnimatePresence>
//       <motion.div
//         key="login-popup"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 z-50 flex items-center justify-center"
//       >
//         {/* BACKDROP */}
//         <div
//           className="absolute inset-0 bg-black/70 backdrop-blur-sm"
//           onClick={() => setShowLogin(false)}
//         />

//         {/* MODAL */}
//         <motion.div
//           initial={{ y: 20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           exit={{ y: 20, opacity: 0 }}
//           transition={{ type: "spring", stiffness: 300, damping: 30 }}
//           className="relative w-full max-w-md p-6 rounded-2xl bg-gradient-to-br from-[#06121f] to-[#02080f] border border-white/10 shadow-2xl"
//         >
//           <h2 className="text-xl font-bold text-white text-center">
//             {mode === "signin" ? "Sign In" : "Sign Up"}
//           </h2>
//           <p className="text-white/50 text-sm text-center mt-1">
//             {mode === "signin"
//               ? "Login to continue your SkillDuels journey"
//               : "Create your player account to start battling"}
//           </p>

//           {/* FORM */}
//           <form onSubmit={handleSubmit} className="mt-6 space-y-4">
//             {/* Full Name for Signup */}
//             {mode === "signup" && (
//               <div>
//                 <label className="text-white/70 text-sm">Full Name</label>
//                 <input
//                   type="text"
//                   placeholder="Full name"
//                   value={fullName}
//                   onChange={(e) => setFullName(e.target.value)}
//                   className="w-full mt-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#1f5cff]"
//                   required={mode === "signup"}
//                 />
//               </div>
//             )}

//             {/* Email */}
//             <div>
//               <label className="text-white/70 text-sm">Email</label>
//               <input
//                 type="email"
//                 placeholder="player@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full mt-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#1f5cff]"
//                 required
//               />
//             </div>

//             {/* Password */}
//             <div>
//               <label className="text-white/70 text-sm">Password</label>
//               <input
//                 type="password"
//                 placeholder="••••••••"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full mt-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#1f5cff]"
//                 required
//               />
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               className="w-full mt-2 px-4 py-3 rounded-lg bg-gradient-to-r from-[#1f5cff] to-[#00bcd4] text-black font-semibold cursor-pointer"
//             >
//               {mode === "signin" ? "Sign In" : "Create Account"}
//             </button>
//           </form>

//           {/* Toggle Mode */}
//           <div className="text-center text-white/60 text-sm mt-3">
//             {mode === "signin" ? (
//               <>
//                 Don't have an account?{" "}
//                 <button
//                   type="button"
//                   className="text-[#60a5fa] underline cursor-pointer"
//                   onClick={() => setMode("signup")}
//                 >
//                   Sign Up
//                 </button>
//               </>
//             ) : (
//               <>
//                 Already have an account?{" "}
//                 <button
//                   type="button"
//                   className="text-[#60a5fa] underline cursor-pointer"
//                   onClick={() => setMode("signin")}
//                 >
//                   Sign In
//                 </button>
//               </>
//             )}
//           </div>

//           {/* Close */}
//           <button
//             onClick={() => setShowLogin(false)}
//             className="w-full mt-2 text-sm text-white/40 hover:text-white/70 transition cursor-pointer"
//           >
//             Close
//           </button>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// };

// export default LoginPopup;


//piyush backend code down here of login popup
import React, { useState ,useContext} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IdContext } from "./Appcontext";
import { useSocket } from "./SocketContext";

const API = import.meta.env.VITE_API_BASE_URL;


const LoginPopup = ({ setShowLogin, setUser }) => {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [msg, setMsg] = useState("");
  const {id,setId}=useContext(IdContext)
  const { socket } = useSocket();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (mode === "signup") {
        // REGISTER API
        // const res = await axios.post("http://localhost:9000/register", {
        //   fullName,
        //   email,
        //   password
        // });
      //  const res = await axios.post("http://localhost:9000/register", {
      //  const res = await axios.post("http://localhost:4080/api/users/register", {
       const res = await axios.post(`${API}/api/users/register`, {
          fullName,
          email,
          password
        });



        setMsg(res.data.message);
        setMode("signin"); // switch to login after signup
        return;
      }

      // LOGIN API
      // const res = await axios.post("http://localhost:9000/login", {
      //   email,
      //   password
      // });

        // const res = await axios.post("http://localhost:9000/login", {
        // const res = await axios.post("http://localhost:4080/api/users/login", {
        const res = await axios.post(`${API}/api/users/login`, {
        email,
        password
      });



      const { token, user } = res.data;
      console.log(user)
         setId(user.id)
      console.log(user.id)
      socket.emit("register-user", user.id);
      // Store token
      // localStorage.setItem("token", token);

      // // Set user in App state
      // setUser(user);

      localStorage.setItem("token", token);
     localStorage.setItem("userId", user.id);
     localStorage.setItem("username", user.name)
      // localStorage.setItem("username", user.fullName) ;

      // const username = localStorage.getItem("username");
      const username = localStorage.getItem("user");
      console.log(username);// ✅ ADD THIS
      setUser(user);
      //console.log(username);
      console.log(user.fullName);
      console.log("hurr")

      setShowLogin(false);
      navigate("/dashboard");

    } catch (err) {
      setMsg(err.response?.data?.message || "Something went wrong use new name or email " );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div
          className="absolute inset-0 bg-black/70"
          onClick={() => setShowLogin(false)}
        />

        <motion.div className="relative w-full max-w-md p-6 rounded-2xl bg-[#06121f]">
          <h2 className="text-xl text-white text-center">
            {mode === "signin" ? "Sign In" : "Sign Up"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <input
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 rounded bg-white/10 text-white"
              />
            )}

            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded bg-white/10 text-white"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-white/10 text-white"
            />

            <button className="w-full py-2 bg-blue-500 rounded">
              {mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="text-red-400 text-sm mt-2">{msg}</p>

          <div className="text-center text-white/60 mt-3">
            {mode === "signin" ? (
              <button onClick={() => setMode("signup")}>Sign Up</button>
            ) : (
              <button onClick={() => setMode("signin")}>Sign In</button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoginPopup;


