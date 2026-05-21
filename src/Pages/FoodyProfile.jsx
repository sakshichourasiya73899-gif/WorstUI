import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Mail, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft, 
  LogOut, 
  ShieldAlert,
  Eye,
  EyeOff,
  Sparkles,
  Trash2,
  RefreshCw,
  X
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   LOGOUT GAME
═══════════════════════════════════════════════════════ */
const LogoutGame = ({ onConfirm, onCancel }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [attempts, setAttempts] = useState(0);
  
  const handleHover = () => {
    if (attempts >= 3) return; // After 3 tries, let them click it
    
    setAttempts(a => a + 1);
    // Button jumps randomly and shrinks slightly
    const rx = (Math.random() - 0.5) * 200;
    const ry = (Math.random() - 0.5) * 150;
    setPos({ x: rx, y: ry });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      zIndex: 20000, display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "white", borderRadius: 32, padding: "3rem",
        maxWidth: 500, width: "92%", textAlign: "center", position: "relative",
        boxShadow: "0 30px 80px rgba(0,0,0,0.45)", overflow: "hidden"
      }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", margin: "0 0 10px", color: "#222" }}>
          Log Out?
        </h2>
        <p style={{ color: "#555", fontSize: "0.95rem", margin: "0 0 10px", fontWeight: 700 }}>
          Just click the red button to confirm.
        </p>
          {attempts > 0 && (
          <p style={{ color: "#e63946", fontSize: "0.8rem", margin: "0 0 10px", fontStyle: "italic", fontWeight: "bold" }}>
            {attempts >= 3 ? "Okay, okay. You can log out now." : `Missed! Attempts: ${attempts}`}
          </p>
        )}
        
        <div style={{ position: "relative", height: 260, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button
            onMouseEnter={handleHover}
            onClick={onConfirm}
            style={{
              position: "absolute",
              transform: `translate(${pos.x}px, ${pos.y}px) scale(${Math.max(0.7, 1 - attempts * 0.1)})`,
              transition: "transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              background: "#e63946", color: "white", border: "none",
              borderRadius: 100, padding: "10px 20px", fontSize: "0.9rem",
              fontWeight: 800, cursor: "pointer", zIndex: 10,
              boxShadow: "0 10px 25px rgba(230, 57, 70, 0.4)",
              whiteSpace: "nowrap"
            }}
          >
            Yes, Log Out
          </button>
          
          <button
            onClick={onCancel}
            style={{
              position: "absolute", bottom: 0,
              background: "#f5f1f1", color: "#555", border: "none",
              borderRadius: 100, padding: "10px 20px", fontSize: "0.9rem",
              fontWeight: 800, cursor: "pointer", zIndex: 5,
              transition: "transform 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            Nevermind, I'll stay
          </button>
        </div>
      </div>
    </div>
  );
};

export default function FoodyProfile() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Annoying reset progress states
  const [isResetting, setIsResetting] = useState(false);
  const [resetProgress, setResetProgress] = useState(0);
  const [resetText, setResetText] = useState("");

  // Shell Game delete states
  const [showDeleteGame, setShowDeleteGame] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [winningIndex, setWinningIndex] = useState(0);
  const [revealedIndex, setRevealedIndex] = useState(null);
  const [gameFeedback, setGameFeedback] = useState("");
  const [deleteAttempts, setDeleteAttempts] = useState(0);
  const [showLogoutGame, setShowLogoutGame] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");
    if (!userStr) {
      navigate("/foody/auth");
      return;
    }
    const user = JSON.parse(userStr);
    setCurrentUser(user);
    setEmail(user.email || "");
  }, [navigate]);

  const handleResetPassword = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim() || !newPassword || !confirmPassword) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    // Load all registered users
    const usersStr = localStorage.getItem("users");
    const users = usersStr ? JSON.parse(usersStr) : [];

    // Check if the password is already used by ANY user
    const duplicateUser = users.find(u => u.password === newPassword);
    if (duplicateUser) {
      setErrorMsg(`This password has already been used by '${duplicateUser.email}', please use another password`);
      return;
    }

    // Find current user index
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (userIndex !== -1) {
      // Trigger funny slow simulated reset sequence!
      triggerResetSequence(users, userIndex);
    } else {
      setErrorMsg("User account not found in database.");
    }
  };

  const triggerResetSequence = (users, userIndex) => {
    setIsResetting(true);
    setResetProgress(0);
    setResetText("Connecting to the Cumin Vault...");

    const steps = [
      { pct: 12, text: "Contacting the master spices server..." },
      { pct: 28, text: "Analyzing character frequency for Cumin patterns..." },
      { pct: 45, text: "Error: Key length is too secure. Injecting standard vulnerabilities for speed..." },
      { pct: 67, text: "Warning: High network latency. Carrying bits manually to server..." },
      { pct: 83, text: "Checking permissions with Karen... Karen approved." },
      { pct: 95, text: "Drizzling dynamic database table with extra seasoning..." },
      { pct: 100, text: "Finalizing Cumin database transaction..." }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setResetProgress(steps[currentStep].pct);
        setResetText(steps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        
        // Actually perform password write in localStorage
        users[userIndex].password = newPassword;
        localStorage.setItem("users", JSON.stringify(users));

        setIsResetting(false);
        setSuccessMsg("Your password has been successfully reset! Hashed with Cumin spices.");
        setNewPassword("");
        setConfirmPassword("");
      }
    }, 1100);
  };

  // ── Shell Game Operations ──────────────────────────────────────────────
  const startDeleteGame = () => {
    setShowDeleteGame(true);
    setRevealedIndex(null);
    setDeleteAttempts(0);
    setGameFeedback("Shuffling the glasses... Watch carefully!");
    triggerShuffle();
  };

  const triggerShuffle = () => {
    setIsShuffling(true);
    setRevealedIndex(null);
    
    // Choose a random index between 0, 1, 2 for the DELETE button
    const nextWinning = Math.floor(Math.random() * 3);
    
    setTimeout(() => {
      setWinningIndex(nextWinning);
      setIsShuffling(false);
      setGameFeedback("Select a glass to find the DELETE button!");
    }, 1500);
  };

  const handleSelectCup = (index) => {
    if (isShuffling || revealedIndex !== null) return;
    setRevealedIndex(index);
    
    if (index === winningIndex) {
      setGameFeedback("Success! You found it. Click DELETE to confirm removal.");
    } else {
      setDeleteAttempts(prev => prev + 1);
      setGameFeedback("Empty glass! Reshuffling the cups...");
      
      // Reshuffle after showing empty cup
      setTimeout(() => {
        triggerShuffle();
      }, 1500);
    }
  };

  const finalizeDeleteAccount = () => {
    const usersStr = localStorage.getItem("users");
    let users = usersStr ? JSON.parse(usersStr) : [];
    
    // Remove user
    users = users.filter(u => u.email.toLowerCase() !== currentUser.email.toLowerCase());
    localStorage.setItem("users", JSON.stringify(users));
    
    // Set deletion confirmation state
    localStorage.setItem("showDeletedConfirmation", "true");
    
    // Clean session
    localStorage.removeItem("currentUser");
    localStorage.removeItem("foody_cart");
    
    // Redirect to home page!
    navigate("/foody");
    window.location.reload();
  };

  const handleLogout = () => {
    setShowLogoutGame(true);
  };

  if (!currentUser) return null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f1f1",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Nunito', sans-serif",
      padding: "2rem 1rem",
      position: "relative",
      overflow: "hidden"
    }}>
      <style>{`
        @keyframes shuffleCup0 {
          0% { transform: translateX(0) translateY(0) scale(1); }
          25% { transform: translateX(110px) translateY(-15px) scale(0.95); }
          50% { transform: translateX(220px) translateY(0) scale(1); }
          75% { transform: translateX(110px) translateY(15px) scale(1.05); }
          100% { transform: translateX(0) translateY(0) scale(1); }
        }
        @keyframes shuffleCup1 {
          0% { transform: translateX(0) translateY(0) scale(1); }
          25% { transform: translateX(-110px) translateY(15px) scale(1.05); }
          50% { transform: translateX(110px) translateY(0) scale(0.95); }
          75% { transform: translateX(-110px) translateY(-15px) scale(1); }
          100% { transform: translateX(0) translateY(0) scale(1); }
        }
        @keyframes shuffleCup2 {
          0% { transform: translateX(0) translateY(0) scale(1); }
          25% { transform: translateX(-110px) translateY(-15px) scale(0.95); }
          50% { transform: translateX(-220px) translateY(0) scale(1); }
          75% { transform: translateX(-110px) translateY(15px) scale(1.05); }
          100% { transform: translateX(0) translateY(0) scale(1); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* ── Annoying password reset progress spinner overlay ── */}
      {isResetting && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
          zIndex: 20000, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "white", borderRadius: 24, padding: "2.5rem 3rem",
            maxWidth: 380, width: "90%", textAlign: "center", boxShadow: "0 25px 70px rgba(0,0,0,0.3)"
          }}>
            <div style={{ display: "inline-block", animation: "spin 1.5s linear infinite", marginBottom: 18 }}>
              <RefreshCw size={42} style={{ color: "#e63946" }} />
            </div>
            <p style={{ fontWeight: 800, fontSize: "1.2rem", color: "#222", margin: "0 0 8px" }}>Resetting Password...</p>
            <p style={{ color: "#888", fontSize: "0.8rem", height: 44, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 0 20px", fontStyle: "italic", lineHeight: 1.4 }}>
              {resetText}
            </p>
            
            {/* Progress Bar */}
            <div style={{ width: "100%", height: 10, background: "#f0ece8", borderRadius: 100, overflow: "hidden", position: "relative" }}>
              <div style={{
                height: "100%", width: `${resetProgress}%`, background: "linear-gradient(to right, #ff6b6b, #e63946)",
                borderRadius: 100, transition: "width 0.4s ease-out"
              }} />
            </div>
            <p style={{ fontSize: "0.78rem", color: "#e63946", fontWeight: 800, margin: "8px 0 0" }}>{resetProgress}% COMPLETED</p>
          </div>
        </div>
      )}

      {/* ── Delete Account Cups Shell Game Overlay ── */}
      {showDeleteGame && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          zIndex: 19999, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "white", borderRadius: 32, padding: "2.5rem 2rem",
            maxWidth: 460, width: "92%", textAlign: "center", boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
            position: "relative"
          }}>
            <button 
              onClick={() => setShowDeleteGame(false)}
              style={{
                position: "absolute", top: 20, right: 20, background: "none", border: "none",
                color: "#bbb", cursor: "pointer", outline: "none"
              }}
            >
              <X size={20} />
            </button>
            
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", margin: "0 0 6px", color: "#222" }}>
              Remove your account
            </h2>
            <p style={{ color: "#555", fontSize: "0.9rem", margin: "0 0 10px", fontWeight: 700 }}>
              To confirm, click the <span style={{ color: "#e63946" }}>DELETE</span> button.
            </p>
            <p style={{ color: "#e63946", fontSize: "0.8rem", margin: "0 0 30px", fontWeight: 800 }}>
              This decision is final.
            </p>

            {/* Cup visual grid container */}
            <div style={{
              display: "flex", justifySelf: "center", justifyContent: "center", gap: 35,
              height: 180, position: "relative", marginBottom: 20, width: "100%", overflow: "visible"
            }}>
              {[0, 1, 2].map((i) => {
                const isSelected = revealedIndex === i;
                const isWinner = winningIndex === i;
                const animName = isShuffling ? `shuffleCup${i} 1.5s ease-in-out` : "none";
                
                return (
                  <div
                    key={i}
                    onClick={() => handleSelectCup(i)}
                    style={{
                      position: "relative",
                      width: 90,
                      height: 140,
                      cursor: isShuffling ? "not-allowed" : "pointer",
                      animation: animName,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      overflow: "visible"
                    }}
                  >
                    {/* Hiding Object (Revealed under the cup) */}
                    {isSelected && (
                      <div style={{
                        position: "absolute", bottom: 0, zIndex: 1,
                        animation: "popIn 0.3s ease-out both"
                      }}>
                        {isWinner ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              finalizeDeleteAccount();
                            }}
                            style={{
                              background: "#e63946", color: "white", border: "none",
                              borderRadius: 8, padding: "8px 12px", fontSize: "0.8rem",
                              fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 14px rgba(230,57,70,0.3)"
                            }}
                          >
                            DELETE
                          </button>
                        ) : (
                          <span style={{ fontSize: "0.72rem", color: "#e63946", fontWeight: 800, fontStyle: "italic", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 3 }}>
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "inline-block" }}>
                              <path d="M6 18C8.5 15.5 14.5 12.5 17 9.5C14.5 12 8.5 15 6 18Z" stroke="#8b5a2b" strokeWidth="2" strokeLinecap="round" fill="#b48352"/>
                              <path d="M8.5 15.5C10.5 14 13.5 12.5 15 11.5" stroke="#6f421b" strokeWidth="1" strokeLinecap="round"/>
                              <path d="M8 12C10.5 10 15.5 8 18 6C15.5 8 10.5 10.5 8 12Z" stroke="#8b5a2b" strokeWidth="2" strokeLinecap="round" fill="#d2b48c"/>
                              <path d="M10.5 10C12.5 9 14.5 8 16 7.5" stroke="#6f421b" strokeWidth="1" strokeLinecap="round"/>
                            </svg>
                            Cumin Seed!
                          </span>
                        )}
                      </div>
                    )}

                    {/* Upside Down Tapered Red Cup Glass (Uses Perspective 3D Taper) */}
                    <div style={{
                      width: 80,
                      height: 100,
                      borderRadius: "16px 16px 4px 4px",
                      background: "linear-gradient(to right, #90161f 0%, #ff4d5a 30%, #e63946 70%, #801119 100%)",
                      boxShadow: "inset 0 4px 8px rgba(255,255,255,0.25), 0 10px 20px rgba(230, 57, 70, 0.25)",
                      transform: isSelected 
                        ? "perspective(300px) rotateX(15deg) translateY(-55px)" 
                        : "perspective(300px) rotateX(15deg) translateY(0)",
                      transformOrigin: "center top",
                      transition: "transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      position: "relative",
                      zIndex: 2,
                    }}>
                      {/* Glass Shine Glare line overlay */}
                      <div style={{
                        position: "absolute", left: "25%", top: 0, bottom: 0, width: 8,
                        background: "linear-gradient(to right, rgba(255,255,255,0.4), rgba(255,255,255,0))",
                        pointerEvents: "none"
                      }} />
                      {/* Tapered bottom rim indicator */}
                      <div style={{
                        position: "absolute", bottom: 0, left: 0, right: 0, height: 4,
                        background: "#801119", borderRadius: "0 0 4px 4px"
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Game feedback text */}
            <p style={{
              fontSize: "0.85rem", color: revealedIndex !== null && revealedIndex === winningIndex ? "#2ecc71" : "#555",
              fontWeight: 800, margin: "10px 0 0", minHeight: 20
            }}>
              {gameFeedback}
            </p>
            
            {deleteAttempts > 0 && (
              <p style={{ fontSize: "0.72rem", color: "#e63946", fontWeight: 700, marginTop: 6 }}>
                Wrong guesses: {deleteAttempts} (resets are painful)
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Logout Game Overlay ── */}
      {showLogoutGame && (
        <LogoutGame 
          onConfirm={() => {
            localStorage.removeItem("currentUser");
            localStorage.removeItem("foody_cart");
            navigate("/foody");
            window.location.reload();
          }} 
          onCancel={() => setShowLogoutGame(false)} 
        />
      )}

      {/* ── Main Profile Container ── */}
      <div style={{
        background: "white",
        borderRadius: 32,
        padding: "2.5rem",
        maxWidth: 500,
        width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.06)",
        position: "relative",
      }}>
        {/* Back Link */}
        <button
          onClick={() => navigate("/foody")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            color: "#888",
            fontSize: "0.85rem",
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: "1.5rem",
            padding: 0,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = "#333"}
          onMouseLeave={(e) => e.currentTarget.style.color = "#888"}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        {/* Profile Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "#e63946",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
            fontSize: 32,
            color: "white",
            fontWeight: 800,
            boxShadow: "0 10px 25px rgba(230, 57, 70, 0.2)",
          }}>
            {currentUser.name ? currentUser.name[0].toUpperCase() : "U"}
          </div>
          <h2 style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "1.8rem", margin: "0 0 6px", color: "#222" }}>
            User Profile
          </h2>
          <p style={{ color: "#aaa", fontSize: "0.85rem", margin: 0, fontStyle: "italic", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "inline-block", verticalAlign: "middle" }}>
              <path d="M6 18C8.5 15.5 14.5 12.5 17 9.5C14.5 12 8.5 15 6 18Z" stroke="#8b5a2b" strokeWidth="2" strokeLinecap="round" fill="#b48352"/>
              <path d="M8.5 15.5C10.5 14 13.5 12.5 15 11.5" stroke="#6f421b" strokeWidth="1" strokeLinecap="round"/>
              <path d="M8 12C10.5 10 15.5 8 18 6C15.5 8 10.5 10.5 8 12Z" stroke="#8b5a2b" strokeWidth="2" strokeLinecap="round" fill="#d2b48c"/>
              <path d="M10.5 10C12.5 9 14.5 8 16 7.5" stroke="#6f421b" strokeWidth="1" strokeLinecap="round"/>
            </svg>
            Codename: Cumin
          </p>
        </div>

        {/* User Info Block */}
        <div style={{
          background: "#fdfbfb",
          borderRadius: 20,
          padding: "1.5rem",
          marginBottom: "2rem",
          border: "1px solid #f0ece8",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
            <User size={18} style={{ color: "#e63946" }} />
            <div>
              <p style={{ fontSize: "0.75rem", color: "#aaa", margin: 0, fontWeight: 700, textTransform: "uppercase" }}>Full Name</p>
              <p style={{ fontSize: "0.95rem", color: "#333", margin: 0, fontWeight: 700 }}>{currentUser.name}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Mail size={18} style={{ color: "#e63946" }} />
            <div>
              <p style={{ fontSize: "0.75rem", color: "#aaa", margin: 0, fontWeight: 700, textTransform: "uppercase" }}>Email Address</p>
              <p style={{ fontSize: "0.95rem", color: "#333", margin: 0, fontWeight: 700 }}>{currentUser.email}</p>
            </div>
          </div>
        </div>

        <div style={{ height: "1px", background: "#f0ece8", margin: "2rem 0" }} />

        {/* Reset Password Form */}
        <form onSubmit={handleResetPassword}>
          <h3 style={{
            fontSize: "1.1rem",
            fontWeight: 800,
            marginBottom: "1.2rem",
            color: "#333",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <ShieldAlert size={18} style={{ color: "#e63946" }} />
            Reset your password
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Email input */}
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#bbb", zIndex: 2 }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                style={{
                  width: "100%",
                  background: "#f5f1f1",
                  border: "2px solid transparent",
                  borderRadius: 100,
                  padding: "12px 16px 12px 42px",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* New Password input */}
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#bbb", zIndex: 2 }} />
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                required
                style={{
                  width: "100%",
                  background: "#f5f1f1",
                  border: "2px solid transparent",
                  borderRadius: 100,
                  padding: "12px 42px 12px 42px",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
              {newPassword.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: "absolute",
                    right: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#bbb",
                    cursor: "pointer",
                    zIndex: 5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    outline: "none",
                  }}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>

            {/* Confirm Password input */}
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#bbb", zIndex: 2 }} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                style={{
                  width: "100%",
                  background: "#f5f1f1",
                  border: "2px solid transparent",
                  borderRadius: 100,
                  padding: "12px 42px 12px 42px",
                  fontSize: "0.9rem",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
              {confirmPassword.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#bbb",
                    cursor: "pointer",
                    zIndex: 5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    outline: "none",
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              background: "#fff0f1",
              border: "1px solid #ffd6d6",
              borderRadius: 14,
              padding: "10px 14px",
              marginTop: "1.2rem",
              color: "#e63946",
              fontSize: "0.8rem",
              fontWeight: 600,
              lineHeight: 1.4,
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#f0fff4",
              border: "1px solid #b2f5c8",
              borderRadius: 14,
              padding: "10px 14px",
              marginTop: "1.2rem",
              color: "#2ecc71",
              fontSize: "0.8rem",
              fontWeight: 600,
            }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Actions */}
          <div style={{ display: "flex", gap: 12, marginTop: "1.8rem" }}>
            <button
              type="submit"
              style={{
                flex: 1,
                background: "#e63946",
                color: "white",
                border: "none",
                borderRadius: 100,
                padding: "0.85rem",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#b3212c"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#e63946"}
            >
              Reset Password
            </button>
            <button
              type="button"
              onClick={() => navigate("/foody")}
              style={{
                flex: 1,
                background: "#f5f1f1",
                color: "#555",
                border: "none",
                borderRadius: 100,
                padding: "0.85rem",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#e8e4e0"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#f5f1f1"}
            >
              Cancel
            </button>
          </div>
        </form>

        <div style={{ height: "1px", background: "#f0ece8", margin: "2rem 0" }} />

        {/* Delete Account and Logout Block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={startDeleteGame}
            style={{
              width: "100%",
              background: "none",
              border: "2px solid #e63946",
              borderRadius: 100,
              padding: "0.85rem",
              fontSize: "0.9rem",
              color: "#e63946",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.2s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e63946";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "#e63946";
            }}
          >
            <Trash2 size={16} /> Delete Account
          </button>
          
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              background: "#f5f1f1",
              border: "none",
              borderRadius: 100,
              padding: "0.85rem",
              fontSize: "0.9rem",
              color: "#555",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.2s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e8e4e0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f5f1f1";
            }}
          >
            <LogOut size={16} /> Log Out (bye Cumin)
          </button>
        </div>
      </div>
    </div>
  );
}
