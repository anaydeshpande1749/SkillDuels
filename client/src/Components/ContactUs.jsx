import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import useSound from "./useSound";
import { FaLinkedin } from "react-icons/fa";

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const playClickSound = useSound(
    "/audio/mixkit-sci-fi-click-900.wav",
    0.2
  );
  const playClickSound1 = useSound(
    "/audio/keyboard-click-327728.mp3",
    0.2
  );

  // captcha
  const captcha = useMemo(() => {
    const a = randomInt(2, 9);
    const b = randomInt(2, 9);
    return { a, b, result: a + b };
  }, []);

  function validateEmail(email) {
    return /^\S+@\S+\.\S+$/.test(email);
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    playClickSound();

    if (!form.name || !form.email || !form.message) {
      setResult("Please fill all fields.");
      setSubmitted(false);
      return;
    }

    if (!validateEmail(form.email)) {
      setResult("Please enter a valid email address.");
      setSubmitted(false);
      return;
    }

    if (Number(answer) !== captcha.result) {
      setResult("Captcha answer is incorrect.");
      setSubmitted(false);
      return;
    }

    const formData = new FormData();
    formData.append(
      "access_key",
      "d4a14678-bc5e-4da5-987a-b6b8a7e0398c"
    );
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("message", form.message);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult("Thank you! Your message has been sent successfully!");
        setSubmitted(true);
        setForm({ name: "", email: "", message: "" });
        setAnswer("");
      } else {
        setResult("Something went wrong. Please try again.");
        setSubmitted(false);
      }
    } catch {
      setResult("Network error. Please try again.");
      setSubmitted(false);
    }
  };

  const handleReset = () => {
    playClickSound1();
    setForm({ name: "", email: "", message: "" });
    setAnswer("");
    setResult("");
    setSubmitted(false);
  };

  return (
    <div className="w-full bg-black text-white py-20 px-6 md:px-20">
      <div className="max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold text-center mb-10"
        >
          Contact <span className="text-blue-500">Us</span>
        </motion.h1>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-semibold">Get in Touch</h2>
            <p className="text-gray-400 leading-relaxed">
              Have questions, feedback, or business inquiries?  
              We'd love to hear from you. Just drop a message!
            </p>

            {/* <div className="space-y-3 text-gray-300">
              <p>📍 Dombivli, Maharashtra, India</p>
              <p>📧 support@skillduels.com</p>
              <p>📞 +91 98765 43210</p>
            </div> */}

<div className="space-y-6 text-gray-300">

  {/* 📍 Location / Contact (optional keep) */}
  <div className="space-y-2">
    <p>📍 Dombivli, Maharashtra, India</p>
    {/* <p>📧 support@skillduels.com</p> */}
    {/* <p>📞 +91 98765 43210</p> */}
  </div>

  {/* 👨‍💻 Developers */}
  <div>
    <h3 className="text-lg font-semibold text-white mb-3">
      Developers
    </h3>

    <ul className="space-y-2">
      <li className="flex items-center gap-2">
        <span>Anay Deshpande</span>
        <a
          href="https://www.linkedin.com/in/anay-deshpande-/"
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 hover:text-blue-400"
        >
          <FaLinkedin />
        </a>
      </li>

      <li className="flex items-center gap-2">
        <span>Madhur Sawant</span>
        <a
          href="https://www.linkedin.com/in/madhur-sawant-183bb8356/"
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 hover:text-blue-400"
        >
          <FaLinkedin />
        </a>
      </li>

      <li className="flex items-center gap-2">
        <span>Sarthak Dudhe</span>
        <a
          href="https://www.linkedin.com/in/sarthak-dudhe-67155a327/"
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 hover:text-blue-400"
        >
          <FaLinkedin />
        </a>
      </li>

      <li className="flex items-center gap-2">
        <span>Piyush Shelar</span>
        <a
          href="https://www.linkedin.com/in/piyush-shelar-60bbb5356/"
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 hover:text-blue-400"
        >
          <FaLinkedin />
        </a>
      </li>
    </ul>
  </div>

  {/* 🗺️ Map Placeholder */}
  <div className="w-full h-60 rounded-lg overflow-hidden border border-gray-700">
    <iframe
      title="Dombivli Location"
      src="https://www.google.com/maps?q=Dombivli,Maharashtra,India&output=embed"
      width="100%"
      height="100%"
      style={{ border: 0 }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    ></iframe>
  </div>

</div>


            {/* <div className="flex space-x-5 text-xl mt-4">
              <a href="#" className="hover:text-blue-400">🐦</a>
              <a href="#" className="hover:text-blue-400">📘</a>
              <a href="#" className="hover:text-blue-400">📸</a>
              <a href="#" className="hover:text-blue-400">💼</a>
            </div> */}
          </motion.div>

          {/* Contact Form */}
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            onSubmit={handleSubmit}
            className="bg-gray-900 p-8 rounded-2xl border border-gray-700 shadow-xl space-y-5"
            noValidate
          >
            <div>
              <label className="block mb-1 text-gray-400">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-400">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-400">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                className="w-full p-3 h-32 bg-black border border-gray-700 rounded-lg focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-400">
                Captcha: {captcha.a} + {captcha.b}
              </label>
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:border-blue-500 outline-none"
                placeholder="Answer"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white transition-all"
            >
              Send Message
            </button>

            <button
              type="button"
              className="w-full py-3 bg-black hover:bg-gray-800 rounded-lg font-semibold text-white transition-all border border-gray-700"
              onClick={handleReset}
            >
              Reset
            </button>

            {result && (
              <p
                className={`text-sm ${
                  submitted ? "text-green-400" : "text-red-400"
                }`}
              >
                {result}
              </p>
            )}
          </motion.form>
        </div>
      </div>
    </div>
  );
}



//=====================================================================================================
// import { motion } from "framer-motion";
// import { useMemo, useState } from "react";
// import useSound from "./useSound";
// import "./ContactUs.css";

// function randomInt(min, max) {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
  
// }

// export default function ContactUs() {
//   const playClickSound = useSound("/audio/mixkit-sci-fi-click-900.wav", 0.2);
//   const playClickSound1 = useSound("/audio/keyboard-click-327728.mp3", 0.2);
  
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     message: "",
//   });

//   const [answer, setAnswer] = useState("");
//   const [result, setResult] = useState("");
//   const [submitted, setSubmitted] = useState(false);

//   const captcha = useMemo(() => {
//     const a = randomInt(2, 9);
//     const b = randomInt(2, 9);
//     return { a, b, result: a + b };
//   }, []);

//   function validateEmail(e) {
//     return /^\S+@\S+\.\S+$/.test(e);
//   }

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
//       setResult("Please fill all fields.");
//       return;
//     }

//     if (!validateEmail(form.email)) {
//       setResult("Please enter a valid email address.");
//       return;
//     }

//     if (Number(answer) !== captcha.result) {
//       setResult("Captcha answer is incorrect.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("access_key", "d4a14678-bc5e-4da5-987a-b6b8a7e0398c");
//     formData.append("name", form.name);
//     formData.append("email", form.email);
//     formData.append("message", form.message);

//     try {
//       const response = await fetch("https://api.web3forms.com/submit", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();

//       if (data.success) {
//         setResult("Thank you! Your message has been sent successfully!");
//         setSubmitted(true);
//         setForm({ name: "", email: "", message: "" });
//         setAnswer("");
//       } else {
//         setResult("Something went wrong. Please try again.");
//       }
//     } catch {
//       setResult("Network error. Please try again.");
//     }
//   };

//   const handleReset = () => {
//     playClickSound1();
//     setForm({ name: "", email: "", message: "" });
//     setAnswer("");
//     setResult("");
//     setSubmitted(false);
//   };

//   return (
//     <div className="contact-wrap">
//       <div className="contact-container">
//         <motion.h1
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="contact-header"
//         >
//           Contact Us
//         </motion.h1>

//         <div className="contact-grid">
//           {/* LEFT */}
//           <div className="contact-card">
//             <h2>Get in Touch</h2>
//             <p className="muted">
//               Have questions, feedback, or business inquiries? We'd love to hear
//               from you. Just drop a message!
//             </p>

//             <ul className="contact-list">
//               <li>
//                 <strong>Organization:</strong> SkillDuels
//               </li>
//               <li>
//                 <strong>Email:</strong> support@skillduels.com
//               </li>
//               <li>
//                 <strong>Address:</strong> 123 Learning Ave, Study City
//               </li>
//               <li>
//                 <strong>Hours:</strong> Mon–Fri 9:00–18:00 (UTC)
//               </li>
//             </ul>
//           </div>

//           {/* RIGHT */}
//           <motion.form
//             onSubmit={handleSubmit}
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             className="contact-card contact-card--form"
//             noValidate
//           >
//             <h2>Send us a message</h2>

//             <div className="contact-form">
//               <div className="form-field">
//                 <span className="label">Name</span>
//                 <input
//                   className="input"
//                   name="name"
//                   value={form.name}
//                   onChange={handleChange}
//                   placeholder="Jane Doe"
//                   required
//                 />
//               </div>

//               <div className="form-field">
//                 <span className="label">Email</span>
//                 <input
//                   className="input"
//                   name="email"
//                   value={form.email}
//                   onChange={handleChange}
//                   placeholder="you@domain.com"
//                   required
//                 />
//               </div>

//               <div className="form-field">
//                 <span className="label">Message</span>
//                 <textarea
//                   className="textarea"
//                   name="message"
//                   value={form.message}
//                   onChange={handleChange}
//                   placeholder="Tell us briefly what you need"
//                   required
//                 />
//               </div>

//               <div className="form-field captcha">
//                 <span className="label">
//                   Captcha: what is {captcha.a} + {captcha.b}?
//                 </span>
//                 <input
//                   className="input"
//                   value={answer}
//                   onChange={(e) => setAnswer(e.target.value)}
//                   placeholder="Answer"
//                   required
//                 />
//               </div>

//               <div className="form-actions">
//                 <button className="btn" onClick={playClickSound}>
//                   Send Message
//                 </button>

//                 <button
//                   type="button"
//                   className="btn btn--ghost"
//                   onClick={handleReset}
//                 >
//                   Reset
//                 </button>
//               </div>

//               {result && (
//                 <p className={submitted ? "success" : "error"}>{result}</p>
//               )}
//             </div>
//           </motion.form>
//         </div>
//       </div>
//     </div>
//   );
// }


