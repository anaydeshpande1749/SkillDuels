// this is landingpage.jsx


import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom"; // Add this import
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import LoginPopup from "../Components/LoginPopup";

// Reusable components
const FeatureCard = ({ icon, title, desc, accent }) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.01 }}
    className={`group relative p-6 rounded-2xl border border-transparent bg-gradient-to-br from-[#071020] to-[#061122] backdrop-blur-md hover:border-[rgba(255,255,255,0.03)] transition-all duration-300 shadow-[0_0_24px_rgba(59,130,246,0.12)] hover:shadow-[0_0_36px_rgba(59,130,246,0.22)]`}
  >
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${accent} text-white mb-4 shadow-md`}>
      {icon}
    </div>
    <h4 className="text-lg font-semibold text-white/90">{title}</h4>
    <p className="mt-2 text-sm text-white/60">{desc}</p>
    <div className="absolute -right-6 -top-6 opacity-20 rotate-[18deg] text-[72px] select-none pointer-events-none text-white/5">⚡</div>
  </motion.div>
);

const LeaderboardRow = ({ rank, name, xp, avatarColor }) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#02101a] to-[#041226] border border-white/3">
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
          style={{ background: avatarColor }}
        >
          {name.split(' ')[0][0]}
        </div>
        <div>
          <div className="text-sm text-white/90 font-medium">{name}</div>
          <div className="text-[11px] text-white/50">Rank #{rank}</div>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="text-xs text-white/50">XP</div>
      <div className="text-sm font-semibold text-white">{xp.toLocaleString()}</div>
    </div>
  </div>
);

export default function LandingPage({ showLogin, setShowLogin, user, setUser }) {
  const navigate = useNavigate(); // For programmatic navigation

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#040506] to-[#05060a] text-white font-inter">
      {/* <Navbar />  */}
      {/* Added missing Navbar */}

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="text-4xl md:text-6xl font-extrabold leading-tight text-white"
            >
              Play. Learn. Conquer.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#6ee7b7] via-[#60a5fa] to-[#7c3aed]">
                {" "}Gamified Quiz Battles.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mt-6 text-white/70 max-w-xl"
            >
              SkillDuels turns study into a competitive sport — challenge peers, win rewards, gain XP and climb leaderboards in realtime quiz battles designed for engagement and mastery.
            </motion.p>

            <div className="mt-8 flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                className="inline-flex items-center gap-3 px-5 py-3 rounded-lg bg-gradient-to-r from-[#1f5cff] to-[#00bcd4] text-black font-semibold shadow-lg"
                onClick={() => setShowLogin(true)}
              >
                Start a Duel
                <span className="text-xs text-white/50">→</span>
              </motion.button>

              <Link to="/features"> {/* TODO: Create Features page or redirect to features section */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-lg border border-white/6 text-white/80 cursor-pointer"
                >
                  Explore Features
                </motion.button>
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
              <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-[#041022] to-[#02101a] border border-white/3">
                <div className="text-xs text-white/60">Active Battles</div>
                <div className="text-xl font-bold mt-1">1,242</div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-[#041022] to-[#02101a] border border-white/3">
                <div className="text-xs text-white/60">Daily Players</div>
                <div className="text-xl font-bold mt-1">18.6k</div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-[#041022] to-[#02101a] border border-white/3">
                <div className="text-xs text-white/60">Avg Match</div>
                <div className="text-xl font-bold mt-1">6m 24s</div>
              </div>
            </div>
          </div>

          {/* right visual */}
          <div className="relative">
            <div className="rounded-3xl p-6 bg-gradient-to-br from-[#031221] to-[#06132a] border border-white/3 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-white/60">Live Battle</div>
                  <div className="text-lg font-semibold">Physics: Quantum Quiz</div>
                </div>
                <div className="text-sm text-white/50">3v3</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1f5cff] to-[#00bcd4] flex items-center justify-center font-bold text-black">A</div>
                    <div>
                      <div className="text-sm text-white/90">Alex</div>
                      <div className="text-xs text-white/50">120 XP</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#60a5fa] flex items-center justify-center font-bold text-black">M</div>
                    <div>
                      <div className="text-sm text-white/90">Mira</div>
                      <div className="text-xs text-white/50">98 XP</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f97316] to-[#f43f5e] flex items-center justify-center font-bold text-black">R</div>
                    <div>
                      <div className="text-sm text-white/90">Ravi</div>
                      <div className="text-xs text-white/50">110 XP</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#34d399] to-[#60a5fa] flex items-center justify-center font-bold text-black">S</div>
                    <div>
                      <div className="text-sm text-white/90">Sara</div>
                      <div className="text-xs text-white/50">87 XP</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="w-full bg-white/6 rounded-full h-3 overflow-hidden">
                  <div className="h-3 rounded-full bg-gradient-to-r from-[#1f5cff] to-[#00bcd4]" style={{ width: "63%" }} />
                </div>
                <div className="text-xs text-white/50 mt-2">Time Left: 02:34</div>
              </div>
            </div>

            <div className="absolute -right-8 -bottom-8 opacity-10 text-[260px] select-none pointer-events-none text-white/3">✦</div>
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="pointer-events-none absolute right-0 top-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#1f5cff]/10 to-[#7c3aed]/8 blur-3xl" />
      </section>

      {/* ABOUT */}
      <section className="max-w-6xl mx-auto px-6 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-bold">Our mission</h3>
            <p className="mt-4 text-white/70">
              We transform passive study into active, social, competitive learning. SkillDuels creates micro-moments of mastery through head-to-head battles, real-time leaderboards, and meaningful rewards — helping learners stay motivated while building measurable skills.
            </p>

            <ul className="mt-6 space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1f5cff] to-[#00bcd4] flex items-center justify-center text-black font-bold">✓</div>
                <div>
                  <div className="text-sm font-semibold">Evidence-based microlearning</div>
                  <div className="text-xs text-white/60">Short, repeatable battles that reinforce retention.</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#60a5fa] flex items-center justify-center text-black font-bold">★</div>
                <div>
                  <div className="text-sm font-semibold">Gamified progression</div>
                  <div className="text-xs text-white/60">XP, ranks, and seasonal rewards to keep learners engaged.</div>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl p-6 bg-gradient-to-br from-[#031425] to-[#041224] border border-white/4">
            <h4 className="text-md font-semibold">Premium Insights</h4>
            <p className="text-sm text-white/60 mt-3">
              Detailed analytics for teachers and admins: question-level diagnostics, retention heatmaps, and class performance trends to convert play into measurable outcomes.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#02121a] border border-white/3">
                <div className="text-xs text-white/50">Avg mastery gain</div>
                <div className="font-bold text-lg mt-1">+12%</div>
              </div>
              <div className="p-3 rounded-lg bg-[#02121a] border border-white/3">
                <div className="text-xs text-white/50">Retention (30d)</div>
                <div className="font-bold text-lg mt-1">68%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-7xl mx-auto px-6 md:px-8 py-12"> {/* Added id for anchor link */}
        <h3 className="text-2xl font-bold">Features</h3>
        <p className="text-white/60 mt-2">Everything you need to create competitive, fair, and fun quiz battles.</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard icon={<span className="text-xl">⚔</span>} title="Battle Mode" desc="1v1, team battles, and tournaments with live question rounds and power-ups." accent="bg-gradient-to-br from-[#1f5cff] to-[#00bcd4]" />
          <FeatureCard icon={<span className="text-xl">🏆</span>} title="Leaderboards & Seasons" desc="Seasonal ladders, daily leaderboards, and rich profiles to showcase mastery." accent="bg-gradient-to-br from-[#7c3aed] to-[#60a5fa]" />
          <FeatureCard icon={<span className="text-xl">🎁</span>} title="Rewards & Badges" desc="Earn badges, redeem rewards, and unlock achievements that matter." accent="bg-gradient-to-br from-[#f97316] to-[#f43f5e]" />
          <FeatureCard icon={<span className="text-xl">⚡</span>} title="Realtime Gameplay" desc="Low-latency sockets, live scoring, and instant match results." accent="bg-gradient-to-br from-[#34d399] to-[#60a5fa]" />
          <FeatureCard icon={<span className="text-xl">🛠</span>} title="Admin Panel" desc="Powerful tools for creating battles, reviewing reports, and moderating." accent="bg-gradient-to-br from-[#0ea5a6] to-[#1f5cff]" />
          <FeatureCard icon={<span className="text-xl">📚</span>} title="Skill Categories" desc="STEM, Languages, Humanities and custom skill tags for focused practice." accent="bg-gradient-to-br from-[#8b5cf6] to-[#60a5fa]" />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-6 md:px-8 py-12">
        <h3 className="text-2xl font-bold">How it works</h3>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-5 items-center gap-6">
          {[
            { title: "Register", hint: "Sign up or use SSO" },
            { title: "Challenge", hint: "Pick a friend or join open battles" },
            { title: "Play", hint: "Fast, fair rounds" },
            { title: "Earn XP", hint: "Win matches & collect XP" },
            { title: "Rank Up", hint: "Climb up & claim rewards" },
          ].map((s, i) => (
            <div key={s.title} className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-[#071228] to-[#031021] border border-white/4">
                <div className="text-xl font-bold text-white">{i + 1}</div>
              </div>
              <div className="mt-3 font-semibold">{s.title}</div>
              <div className="text-xs text-white/60 mt-1">{s.hint}</div>
              {i < 5 && <div className="hidden md:block h-0.5 w-full bg-white/3 mt-6" />}
            </div>
          ))}
        </div>
      </section>

      {/* LEADERBOARD */}
      <section className="max-w-5xl mx-auto px-6 md:px-8 py-12">
        <h3 className="text-2xl font-bold">Leaderboard Preview</h3>
        <p className="text-white/60 mt-2">Top players this season — real XP, real bragging rights.</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            <div className="rounded-2xl p-4 bg-gradient-to-br from-[#02101a] to-[#041226] border border-white/3">
              <LeaderboardRow rank={1} name={"Ananya Sharma"} xp={152340} avatarColor={'linear-gradient(135deg,#7c3aed,#60a5fa)'} />
            </div>
            <div className="rounded-2xl p-4 bg-gradient-to-br from-[#02101a] to-[#041226] border border-white/3 grid grid-cols-2 gap-3">
              <LeaderboardRow rank={2} name={"Rohit Menon"} xp={143222} avatarColor={'linear-gradient(135deg,#1f5cff,#00bcd4)'} />
              <LeaderboardRow rank={3} name={"Lina Gomez"} xp={130450} avatarColor={'linear-gradient(135deg,#f97316,#f43f5e)'} />
            </div>
          </div>
          <div className="rounded-2xl p-6 bg-gradient-to-br from-[#031425] to-[#041224] border border-white/4">
            <div className="text-sm text-white/60">This Week</div>
            <div className="text-2xl font-bold mt-2">Top Movers</div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm">Mira</div>
                <div className="text-sm font-semibold">+3,200 XP</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">Ravi</div>
                <div className="text-sm font-semibold">+2,900 XP</div>
              </div>
            </div>
            <div className="mt-6">
              <Link to="/leaderboard"> {/* Updated to use Link */}
                <button className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-[#1f5cff] to-[#00bcd4] text-black font-semibold cursor-pointer">
                  View Full Leaderboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-6xl mx-auto px-6 md:px-8 py-12">
        <h3 className="text-2xl font-bold">What students say</h3>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Aisha, 10th", quote: "SkillDuels made revision fun — I improved my scores in two weeks!" },
            { name: "Dev, College", quote: "Competing with friends keeps me motivated to study everyday." },
            { name: "Priya, Tutor", quote: "I use the admin reports to tailor sessions. The insights are gold." },
          ].map((t) => (
            <motion.div key={t.name} whileHover={{ scale: 1.02 }} className="p-6 rounded-2xl bg-gradient-to-br from-[#02121a] to-[#041226] border border-white/3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#60a5fa] flex items-center justify-center font-bold text-black">{t.name.split(",")[0][0]}</div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-white/50">Verified learner</div>
                </div>
              </div>
              <div className="text-white/70">"{t.quote}"</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        <div className="rounded-3xl p-8 bg-gradient-to-r from-[#081628] to-[#031224] border border-white/4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-xl font-bold">Ready to level up your classroom (or your squad)?</div>
            <div className="text-white/60 mt-2">Create battles, reward learners, and measure growth — all in one competitive platform.</div>
          </div>
          <div className="flex gap-4">
            <button 
              className="px-5 py-3 rounded-lg bg-gradient-to-r from-[#1f5cff] to-[#00bcd4] text-black font-semibold cursor-pointer"
              onClick={() => setShowLogin(true)} // TODO: Change to signup route if separate page exists
            >
              Start Free Trial
            </button>
            <Link to="/contact"> {/* TODO: Create Contact page or component */}
              <button className="px-5 py-3 rounded-lg border border-white/6 cursor-pointer">
                Contact Sales
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      {/* <Footer />  */}
      {/* Added missing Footer */}

      {/* LOGIN POPUP */}
      {showLogin && (
        <LoginPopup
          setShowLogin={setShowLogin}
          setUser={setUser}
        />
      )}
    </div>
  );
}