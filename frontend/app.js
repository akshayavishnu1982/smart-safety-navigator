const API_BASE = "/api";
const toast = document.getElementById("toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Something went wrong. Please try again.");
  return payload;
}

document.getElementById("mobileMenu").addEventListener("click", () => {
  document.querySelector(".sidebar").classList.toggle("open");
});
document.querySelectorAll(".nav-link").forEach(link => link.addEventListener("click", () => {
  document.querySelector(".sidebar").classList.remove("open");
}));

const checklistItems = [...document.querySelectorAll("#checklist input[type=checkbox]")];
function updateChecklist() {
  const done = checklistItems.filter(item => item.checked).length;
  document.getElementById("progressBar").style.width = `${done / checklistItems.length * 100}%`;
  document.getElementById("progressText").textContent = `${done} of ${checklistItems.length} complete`;
}
checklistItems.forEach(item => item.addEventListener("change", updateChecklist));

document.getElementById("routeForm").addEventListener("submit", async event => {
  event.preventDefault();
  const result = document.getElementById("routeResult");
  const from = document.getElementById("routeFrom").value.trim();
  const to = document.getElementById("routeTo").value.trim();
  const preference = document.getElementById("routePreference").value;
  if (!from || !to) return;
  result.classList.remove("hidden");
  result.textContent = "Preparing your journey plan…";
  try {
    const data = await apiRequest("/journey-plan", {
      method: "POST", body: JSON.stringify({ from, to, preference })
    });
    result.replaceChildren();
    const heading = document.createElement("h3");
    heading.textContent = `Journey plan: ${data.from} → ${data.to}`;
    const intro = document.createElement("p");
    intro.textContent = data.message;
    const list = document.createElement("ul");
    data.tips.forEach(tip => {
      const li = document.createElement("li");
      li.textContent = tip;
      list.appendChild(li);
    });
    result.append(heading, intro, list);
  } catch (error) {
    result.textContent = error.message;
  }
});

function addReportCard(report) {
  const card = document.createElement("article");
  card.className = "report-item";
  const top = document.createElement("div");
  top.className = "report-item-top";
  const category = document.createElement("span");
  category.className = "report-category";
  category.textContent = report.category;
  const date = document.createElement("span");
  date.className = "report-time";
  date.textContent = new Date(report.created_at).toLocaleString();
  top.append(category, date);
  const title = document.createElement("h3");
  title.textContent = report.area;
  const description = document.createElement("p");
  description.textContent = report.description;
  card.append(top, title, description);
  return card;
}

async function loadReports() {
  const list = document.getElementById("reportsList");
  try {
    const data = await apiRequest("/reports");
    list.replaceChildren();
    document.getElementById("reportCount").textContent = `${data.reports.length} report${data.reports.length === 1 ? "" : "s"}`;
    if (!data.reports.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "No reports yet. Community reports will appear here.";
      list.appendChild(empty);
      return;
    }
    data.reports.forEach(report => list.appendChild(addReportCard(report)));
  } catch (error) {
    list.textContent = "Could not load reports. Check that the backend and database are configured.";
  }
}

document.getElementById("reportForm").addEventListener("submit", async event => {
  event.preventDefault();
  const message = document.getElementById("reportMessage");
  const submitButton = event.currentTarget.querySelector("button[type=submit]");
  const report = {
    area: document.getElementById("reportArea").value.trim(),
    category: document.getElementById("reportCategory").value,
    description: document.getElementById("reportDescription").value.trim()
  };
  if (!report.area || !report.description) return;
  submitButton.disabled = true;
  message.textContent = "Submitting report…";
  try {
    await apiRequest("/reports", { method: "POST", body: JSON.stringify(report) });
    event.currentTarget.reset();
    message.textContent = "Report submitted successfully.";
    showToast("Your community report was saved.");
    await loadReports();
  } catch (error) {
    message.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
});

const quickReplies = [
  { matches: ["checklist", "prepare", "journey"], answer: "Before leaving: check your route and alternatives, charge your phone, tell someone you trust about your plans when appropriate, and know how to contact local emergency services." },
  { matches: ["emergency", "urgent", "danger", "help"], answer: "If danger is immediate, contact local emergency services now. In India, dial 112. If possible, move to a staffed, well-lit public place and ask a trusted person for help. Do not rely on this demo assistant for emergency response." },
  { matches: ["dark", "night", "evening", "walking"], answer: "When travelling after dark, consider well-lit and populated routes, check transport options ahead of time, keep your phone charged, and let someone you trust know your plans. These are general tips, not a guarantee of safety." },
  { matches: ["report", "lighting", "road", "hazard"], answer: "For a community report, describe the public location and observation factually. Avoid names, phone numbers, exact home addresses, accusations you cannot verify, or other personal information." },
  { matches: ["route", "navigate", "travel"], answer: "Plan your start and destination before leaving, consider familiar and busy public areas, check transport availability, and keep an alternative plan. This demo does not access live maps or verify route conditions." }
];

function getAssistantReply(message) {
  const text = message.toLowerCase();
  const match = quickReplies.find(item => item.matches.some(keyword => text.includes(keyword)));
  return match ? match.answer : "I can offer general tips about journey preparation, emergency readiness, travelling after dark, and community reports. Tell me which topic you need. I cannot monitor your location, verify live conditions, or contact emergency services.";
}

function appendChatMessage(message, sender) {
  const windowElement = document.getElementById("chatWindow");
  const row = document.createElement("div");
  row.className = `chat-message ${sender === "user" ? "user-message" : "bot-message"}`;
  const avatar = document.createElement("span");
  avatar.className = "chat-avatar";
  avatar.textContent = sender === "user" ? "You" : "✧";
  const content = document.createElement("div");
  const title = document.createElement("strong");
  title.textContent = sender === "user" ? "You" : "Safety assistant";
  const body = document.createElement("p");
  body.textContent = message;
  content.append(title, body);
  row.append(avatar, content);
  windowElement.appendChild(row);
  windowElement.scrollTop = windowElement.scrollHeight;
}

document.getElementById("chatForm").addEventListener("submit", event => {
  event.preventDefault();
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  if (!message) return;
  appendChatMessage(message, "user");
  input.value = "";
  appendChatMessage(getAssistantReply(message), "bot");
});

document.querySelectorAll(".suggestion").forEach(button => button.addEventListener("click", () => {
  appendChatMessage(button.textContent, "user");
  appendChatMessage(getAssistantReply(button.textContent), "bot");
}));

loadReports();
