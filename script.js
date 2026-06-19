// ===== STATE =====
let currentInput = "";    // What user is currently typing
let previousInput = "";   // First number (saved when operator pressed)
let operator = null;      // Current operation (+, -, *, /)
let history = [];         // Calculation history

// ===== DOM ELEMENTS =====
const currentDisplay  = document.getElementById("current");
const previousDisplay = document.getElementById("previous");
const historyPanel    = document.getElementById("historyPanel");
const historyList     = document.getElementById("historyList");
const historyEmpty    = document.getElementById("historyEmpty");
const body = document.body;

// ===== THEME =====
const THEME_DEFAULT = "midnight";

function setTheme(theme) {
  body.setAttribute("data-theme", theme);
  document.querySelectorAll(".theme-dot").forEach(dot => {
    dot.classList.toggle("active", dot.dataset.t === theme);
  });
}

document.querySelectorAll(".theme-dot").forEach(dot => {
  dot.addEventListener("click", () => setTheme(dot.dataset.t));
});

// ===== UPDATE DISPLAY =====
function updateDisplay(animate = false) {
  currentDisplay.textContent = currentInput || "0";
  previousDisplay.innerHTML = previousInput
    ? `${previousInput}<span class="op-pill">${getOperatorSymbol(operator)}</span>`
    : "";

  if (animate) {
    currentDisplay.classList.remove("pulse");
    void currentDisplay.offsetWidth; // restart animation
    currentDisplay.classList.add("pulse");
  }
}

function getOperatorSymbol(op) {
  const symbols = { "+": "+", "-": "−", "*": "×", "/": "÷", "%": "%" };
  return symbols[op] || "";
}

// ===== INPUT A DIGIT =====
function inputDigit(digit) {
  // Prevent multiple decimal points
  if (digit === "." && currentInput.includes(".")) return;

  // Clear error state on new input
  currentDisplay.classList.remove("error");

  // Prevent leading zeros (but allow "0.")
  if (currentInput === "0" && digit !== ".") {
    currentInput = digit;
  } else if (currentInput === "Error") {
    currentInput = digit === "." ? "0." : digit;
  } else {
    currentInput += digit;
  }
  updateDisplay(true);
}

// ===== INPUT AN OPERATOR =====
function inputOperator(op) {
  // If there's a pending operation and user typed a new number, compute first
  if (operator && currentInput) {
    calculate();
  }

  // Save current number and set the operator
  if (currentInput) {
    previousInput = currentInput;
    currentInput = "";
  }
  operator = op;
  updateDisplay();
}

// ===== CALCULATE =====
function calculate() {
  if (!previousInput || !currentInput || !operator) return;

  const prev = parseFloat(previousInput);
  const curr = parseFloat(currentInput);
  const expr = `${previousInput} ${getOperatorSymbol(operator)} ${currentInput}`;
  let result;

  switch (operator) {
    case "+": result = prev + curr; break;
    case "-": result = prev - curr; break;
    case "*": result = prev * curr; break;
    case "/":
      if (curr === 0) {
        currentInput = "Error";
        previousInput = "";
        operator = null;
        updateDisplay();
        currentDisplay.classList.add("error");
        return;
      }
      result = prev / curr;
      break;
    case "%": result = prev % curr; break;
    default: return;
  }

  // Format result: avoid super long decimals
  const resultStr = String(parseFloat(result.toFixed(10)));
  
  // Save to history
  history.unshift({ expr, result: resultStr });
  renderHistory();

  currentInput = resultStr;
  previousInput = "";
  operator = null;
  updateDisplay(true);
}

// ===== HISTORY =====
function renderHistory() {
  if (history.length === 0) {
    historyEmpty.style.display = "block";
    // Remove all items
    Array.from(historyList.querySelectorAll(".h-item")).forEach(el => el.remove());
    return;
  }
  historyEmpty.style.display = "none";
  // Remove existing items
  Array.from(historyList.querySelectorAll(".h-item")).forEach(el => el.remove());
  history.forEach(entry => {
    const item = document.createElement("div");
    item.className = "h-item";
    item.innerHTML = `<span class="h-expr">${entry.expr}</span><span class="h-result">= ${entry.result}</span>`;
    item.addEventListener("click", () => {
      currentInput = entry.result;
      currentDisplay.classList.remove("error");
      updateDisplay(true);
      closeHistoryPanel();
    });
    historyList.appendChild(item);
  });
}

function openHistoryPanel() {
  historyPanel.classList.add("open");
}
function closeHistoryPanel() {
  historyPanel.classList.remove("open");
}

document.getElementById("historyToggle").addEventListener("click", () => {
  historyPanel.classList.contains("open") ? closeHistoryPanel() : openHistoryPanel();
});
document.getElementById("closeHistory").addEventListener("click", closeHistoryPanel);
document.getElementById("clearHistory").addEventListener("click", () => {
  history = [];
  renderHistory();
});

// ===== SCIENTIFIC FUNCTIONS =====
function applyScientific(fn) {
  const val = parseFloat(currentInput || "0");
  let result;
  let label = "";

  switch (fn) {
    case "sin":   result = Math.sin(val * Math.PI / 180); label = `sin(${val}°)`; break;
    case "cos":   result = Math.cos(val * Math.PI / 180); label = `cos(${val}°)`; break;
    case "tan":
      if (Math.abs(Math.cos(val * Math.PI / 180)) < 1e-10) {
        currentInput = "Error"; currentDisplay.classList.add("error"); updateDisplay(); return;
      }
      result = Math.tan(val * Math.PI / 180); label = `tan(${val}°)`; break;
    case "sqrt":
      if (val < 0) { currentInput = "Error"; currentDisplay.classList.add("error"); updateDisplay(); return; }
      result = Math.sqrt(val); label = `√(${val})`; break;
    case "square": result = val * val; label = `${val}²`; break;
    case "inv":
      if (val === 0) { currentInput = "Error"; currentDisplay.classList.add("error"); updateDisplay(); return; }
      result = 1 / val; label = `1/${val}`; break;
    case "log":
      if (val <= 0) { currentInput = "Error"; currentDisplay.classList.add("error"); updateDisplay(); return; }
      result = Math.log10(val); label = `log(${val})`; break;
    case "ln":
      if (val <= 0) { currentInput = "Error"; currentDisplay.classList.add("error"); updateDisplay(); return; }
      result = Math.log(val); label = `ln(${val})`; break;
    case "pi":
      currentInput = String(Math.PI); updateDisplay(true); return;
    default: return;
  }

  const resultStr = String(parseFloat(result.toFixed(10)));
  history.unshift({ expr: label, result: resultStr });
  renderHistory();
  currentInput = resultStr;
  previousInput = "";
  operator = null;
  currentDisplay.classList.remove("error");
  updateDisplay(true);
}

document.querySelectorAll(".sci").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.add("active-flash");
    setTimeout(() => btn.classList.remove("active-flash"), 200);
    applyScientific(btn.dataset.sci);
  });
});


function clearAll() {
  currentInput = "";
  previousInput = "";
  operator = null;
  currentDisplay.classList.remove("error");
  updateDisplay();
}

function deleteLast() {
  if (currentInput === "Error") {
    currentInput = "";
    currentDisplay.classList.remove("error");
  } else {
    currentInput = currentInput.slice(0, -1);
  }
  updateDisplay();
}

// ===== RIPPLE EFFECT =====
function addRipple(e, btn) {
  const circle = document.createElement("span");
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = (e.clientX ?? rect.left + rect.width / 2) - rect.left - size / 2;
  const y = (e.clientY ?? rect.top + rect.height / 2) - rect.top - size / 2;

  circle.className = "ripple";
  circle.style.width = circle.style.height = `${size}px`;
  circle.style.left = `${x}px`;
  circle.style.top = `${y}px`;
  btn.appendChild(circle);

  requestAnimationFrame(() => circle.classList.add("go"));
  circle.addEventListener("animationend", () => circle.remove());
}

document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", (e) => addRipple(e, btn));
});

// ===== EVENT LISTENERS =====
// Number buttons
document.querySelectorAll(".num").forEach(btn => {
  btn.addEventListener("click", () => inputDigit(btn.dataset.num));
});

// Operator buttons
document.querySelectorAll(".op").forEach(btn => {
  btn.addEventListener("click", () => inputOperator(btn.dataset.op));
});

// Equals, Clear, Delete
document.querySelector(".equals").addEventListener("click", calculate);
document.querySelector(".clear").addEventListener("click", clearAll);
document.querySelector(".delete").addEventListener("click", deleteLast);

// ===== KEYBOARD SUPPORT =====
document.addEventListener("keydown", (e) => {
  if ((e.key >= "0" && e.key <= "9") || e.key === ".") inputDigit(e.key);
  else if (e.key === "+") inputOperator("+");
  else if (e.key === "-") inputOperator("-");
  else if (e.key === "*") inputOperator("*");
  else if (e.key === "/") { e.preventDefault(); inputOperator("/"); }
  else if (e.key === "%") inputOperator("%");
  else if (e.key === "Enter" || e.key === "=") calculate();
  else if (e.key === "Escape") clearAll();
  else if (e.key === "Backspace") deleteLast();
});

// Init
setTheme(THEME_DEFAULT);
updateDisplay();
