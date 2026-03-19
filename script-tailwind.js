// Scroll effect
window.addEventListener('scroll', function() {
  if (window.scrollY > 50) {
    document.body.classList.add('scrolled');
  } else {
    document.body.classList.remove('scrolled');
  }
});

// User management
let currentUser = null;
let users = JSON.parse(localStorage.getItem("users")) || {};
let habits = [];
let editingIndex = -1;

const today = new Date().toDateString();

// Check if logged in on load
window.addEventListener("DOMContentLoaded", function() {
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = savedUser;
    loadUserHabits();
    showApp();
  } else {
    showLogin();
  }
});

// Login
function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Please enter username and password");
    return;
  }

  if (users[username] && users[username] === password) {
    currentUser = username;
    localStorage.setItem("currentUser", username);
    loadUserHabits();
    showApp();
    document.getElementById("loginForm").reset();
  } else {
    alert("Invalid credentials");
  }
}

// Signup
function handleSignup() {
  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value.trim();

  if (!username || !password) {
    alert("Please fill all fields");
    return;
  }

  if (users[username]) {
    alert("Username already exists");
    return;
  }

  if (password.length < 4) {
    alert("Password must be at least 4 characters");
    return;
  }

  users[username] = password;
  localStorage.setItem("users", JSON.stringify(users));
  alert("Account created! Now login.");
  toggleSignup();
  document.getElementById("signupUsername").value = "";
  document.getElementById("signupPassword").value = "";
}

function toggleSignup() {
  document.getElementById("signupForm").classList.toggle("hidden");
}

// Logout
function logout() {
  if (confirm("Logout?")) {
    currentUser = null;
    localStorage.removeItem("currentUser");
    habits = [];
    showLogin();
    document.getElementById("loginForm").reset();
  }
}

// Show/Hide
function showLogin() {
  document.getElementById("loginSection").classList.remove("hidden");
  document.getElementById("appSection").classList.add("hidden");
}

function showApp() {
  document.getElementById("loginSection").classList.add("hidden");
  document.getElementById("appSection").classList.remove("hidden");
  renderHabits();
}

// Load user habits
function loadUserHabits() {
  const data = localStorage.getItem("habits_" + currentUser);
  habits = data ? JSON.parse(data) : [];
}

// Save user habits
function saveUserHabits() {
  localStorage.setItem("habits_" + currentUser, JSON.stringify(habits));
}

// Habit functions
function initializeHabit(habit) {
  if (!habit.streak) habit.streak = 0;
  if (!habit.lastCompletedDate) habit.lastCompletedDate = null;
  return habit;
}

function updateStreak(habit) {
  if (habit.done) {
    if (habit.lastCompletedDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (habit.lastCompletedDate === yesterday.toDateString()) {
        habit.streak++;
      } else {
        habit.streak = 1;
      }
      
      habit.lastCompletedDate = today;
    }
  } else {
    if (habit.lastCompletedDate === today) {
      habit.lastCompletedDate = null;
    }
  }
}

function renderHabits() {
  const list = document.getElementById("habitList");
  list.innerHTML = "";

  if (habits.length === 0) {
    list.innerHTML = '<div class="glass rounded-lg p-8 text-center text-slate-300">No habits yet. Add one to get started! 🚀</div>';
    updateStatistics();
    return;
  }

  habits.forEach((habit, index) => {
    habit = initializeHabit(habit);
    updateStreak(habit);

    const li = document.createElement("div");
    li.className = `glass rounded-lg p-5 flex items-center justify-between group hover:shadow-lg hover:shadow-cyan-500/20 ${
      habit.done ? "opacity-75" : ""
    }`;

    li.innerHTML = `
      <div class="flex-1">
        <div class="flex items-center gap-4">
          <button onclick="toggleHabit(${index})" class="flex-shrink-0 w-6 h-6 rounded-full border-2 border-cyan-400 flex items-center justify-center hover:bg-cyan-400/20 ${
            habit.done ? "bg-emerald-500 border-emerald-500" : ""
          }">
            ${habit.done ? '<span class="text-white">✓</span>' : ""}
          </button>
          <div>
            <p class="text-white font-semibold ${habit.done ? "line-through opacity-60" : ""}">${habit.name}</p>
            <p class="text-cyan-300 text-sm">🔥 ${habit.streak} day streak</p>
          </div>
        </div>
      </div>
      <div class="flex gap-2 opacity-0 group-hover:opacity-100">
        <button onclick="deleteHabit(${index})" class="bg-red-600/50 hover:bg-red-600 text-white px-3 py-2 rounded text-sm">
          Delete
        </button>
      </div>
    `;

    list.appendChild(li);
  });

  updateStatistics();
  saveUserHabits();
}

function updateStatistics() {
  const total = habits.length;
  const completed = habits.filter(h => h.done).length;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById("totalHabits").textContent = total;
  document.getElementById("completedToday").textContent = completed;
  document.getElementById("completionRate").textContent = rate + "%";

  const progressBar = document.getElementById("progressBar");
  progressBar.style.width = rate + "%";
  progressBar.textContent = rate > 0 ? rate + "%" : "";
}

function addHabit() {
  const input = document.getElementById("habitInput");
  const value = input.value.trim();

  if (!value) return;

  habits.push({
    name: value,
    done: false,
    streak: 0,
    lastCompletedDate: null
  });

  input.value = "";
  renderHabits();
}

function toggleHabit(index) {
  habits[index].done = !habits[index].done;
  renderHabits();
}

function deleteHabit(index) {
  if (confirm("Delete this habit?")) {
    habits.splice(index, 1);
    renderHabits();
  }
}

// Attach login form submit
document.addEventListener("DOMContentLoaded", function() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
});
