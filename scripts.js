




const co = document.getElementById("co"),
  ci = document.getElementById("ci");
let mx = 0,
  my = 0,
  ox = 0,
  oy = 0;
document.addEventListener("mousemove", (e) => {
  mx = e.clientX;
  my = e.clientY;
  ci.style.left = mx + "px";
  ci.style.top = my + "px";
});
(function raf() {
  ox += (mx - ox) * 0.12;
  oy += (my - oy) * 0.12;
  co.style.left = ox + "px";
  co.style.top = oy + "px";
  requestAnimationFrame(raf);
})();

/* MOBILE NAV */
document
  .getElementById("mb")
  .addEventListener("click", () =>
    document.getElementById("mn").classList.toggle("open"),
  );
function cm() {
  document.getElementById("mn").classList.remove("open");
}

/* PARTICLES */
(function () {
  const c = document.getElementById("particles");
  function spawn() {
    const p = document.createElement("div");
    p.className = "particle";
    const x = Math.random() * 100,
      dur = 4 + Math.random() * 8,
      delay = Math.random() * 6,
      size = 1 + Math.random() * 2.5;
    p.style.cssText =
      "left:" +
      x +
      "%;width:" +
      size +
      "px;height:" +
      size +
      "px;animation-duration:" +
      dur +
      "s;animation-delay:" +
      delay +
      "s;opacity:0";
    c.appendChild(p);
    setTimeout(() => p.remove(), (dur + delay) * 1000 + 500);
  }
  for (let i = 0; i < 18; i++) spawn();
  setInterval(spawn, 600);
})();

/* COUNTERS */
function animCount(el, target, dur) {
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    el.textContent = Math.floor(p * target);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}
setTimeout(() => {
  animCount(document.getElementById("c1"), 30, 1200);
  animCount(document.getElementById("c2"), 5, 900);
  animCount(document.getElementById("c3"), 3, 700);
}, 400);

/* REVEAL */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add("on"), i * 65);
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.08 },
);
document.querySelectorAll(".rv,.rv2").forEach((el) => io.observe(el));

/* ============ CONTACT FORM — bound to the deployed Vercel API ============
   Points at the Express contact server, deployed to Vercel as a
   serverless function. The server emails the submission through one
   of up to 3 rotating Gmail accounts via Nodemailer — if one account
   fails (e.g. hits its daily send cap), the server tries the next.
   The frontend here just calls one endpoint and reports success/failure.
*/
const CONTACT_API_URL = "https://server-host-chi.vercel.app/api/contact";

function showFormError(msg) {
  const err = document.getElementById("cf-error");
  err.textContent = msg;
  err.style.display = "block";
}
function clearFormError() {
  const err = document.getElementById("cf-error");
  err.style.display = "none";
  err.textContent = "";
}

async function sendContactForm() {
  clearFormError();
  const name = document.getElementById("cf-name").value.trim();
  const email = document.getElementById("cf-email").value.trim();
  const subject = document.getElementById("cf-subject").value.trim();
  const message = document.getElementById("cf-message").value.trim();

  if (!name || !email || !message) {
    showFormError("Please fill in your name, email, and message.");
    return;
  }

  const btn = document.getElementById("sb");
  const label = document.getElementById("st");
  btn.disabled = true;
  btn.style.opacity = "0.7";
  label.textContent = "Sending...";

  try {
    const res = await fetch(CONTACT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, subject, message }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      throw new Error(
        data.message || "Server responded with status " + res.status,
      );
    }

    label.textContent = "Sent \u2713";
    btn.style.background = "#16a34a";
    btn.style.boxShadow = "0 4px 22px rgba(22,163,74,.35)";
    document.getElementById("cf-name").value = "";
    document.getElementById("cf-email").value = "";
    document.getElementById("cf-subject").value = "";
    document.getElementById("cf-message").value = "";
    setTimeout(() => {
      label.textContent = "Send Message";
      btn.style.background = "";
      btn.style.boxShadow = "";
      btn.disabled = false;
      btn.style.opacity = "";
    }, 3000);
  } catch (e) {
    label.textContent = "Send Message";
    btn.disabled = false;
    btn.style.opacity = "";
    showFormError(
      "Couldn't send your message right now (" +
        e.message +
        "). Please try again later or email asraful@email.com directly.",
    );
    console.error("Contact form send failed:", e);
  }
}

document.getElementById("sb").addEventListener("click", sendContactForm);

/* ============ AI CHAT WIDGET — calls your own backend, no keys here ============
   All API keys and the system prompt now live server-side in
   /api/chat on the same Vercel project as the contact form.
   This file never touches a secret.
*/
const CHAT_API_URL = "https://server-host-chi.vercel.app/api/chat";

let chatHistory = [];

function getTime() {
  const n = new Date();
  return (
    n.getHours().toString().padStart(2, "0") +
    ":" +
    n.getMinutes().toString().padStart(2, "0")
  );
}
function appendMessage(role, text) {
  const box = document.getElementById("chatMessages"),
    isUser = role === "user";
  const div = document.createElement("div");
  div.className = "msg" + (isUser ? " msg-user" : "");
  div.innerHTML =
    '<div class="msg-avatar ' +
    (isUser ? "ma-user" : "ma-ai") +
    '">' +
    (isUser ? "You" : "AI") +
    '</div><div><div class="msg-bubble ' +
    (isUser ? "mb-user" : "mb-ai") +
    '">' +
    text.replace(/\n/g, "<br>") +
    '</div><div class="msg-time">' +
    getTime() +
    "</div></div>";
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}
function setTyping(show) {
  document.getElementById("typingIndicator").classList.toggle("show", show);
  document.getElementById("chatMessages").scrollTop = 9999;
}

async function sendMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  input.style.height = "auto";
  document.getElementById("sendBtn").disabled = true;
  appendMessage("user", text);
  setTyping(true);

  try {
    const res = await fetch(CHAT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history: chatHistory }),
    });
    const data = await res.json().catch(() => ({}));

    setTyping(false);
    if (!res.ok || data.success === false) {
      throw new Error(data.message || "Server error");
    }

    chatHistory.push({ role: "user", content: text });
    chatHistory.push({ role: "assistant", content: data.reply });
    appendMessage("assistant", data.reply);
  } catch (e) {
    setTyping(false);
    appendMessage(
      "assistant",
      "\u274c Sorry, I couldn't get a response right now. Please try again later.",
    );
    console.error("Chat send failed:", e);
  } finally {
    document.getElementById("sendBtn").disabled = false;
    input.focus();
  }
}

function sendSuggestion(btn) {
  document.getElementById("chatInput").value = btn.textContent;
  sendMessage();
}
function clearChat() {
  chatHistory = [];
  document.getElementById("chatMessages").innerHTML = "";
  appendMessage(
    "assistant",
    "\uD83D\uDC4B Chat cleared! How can I help you learn more about Asraful?",
  );
}
document.getElementById("chatInput").addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = Math.min(this.scrollHeight, 100) + "px";
});
document.getElementById("sendBtn").addEventListener("click", sendMessage);
window.addEventListener("DOMContentLoaded", () => {
  appendMessage(
    "assistant",
    "\uD83D\uDC4B Hi! I'm Asraful's AI assistant. Ask me anything about his skills (30+ technologies!), projects, or how to hire him.",
  );
});
