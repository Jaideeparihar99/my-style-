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
const today = new Date().toDateString();

// Check if logged in on load
window.addEventListener("DOMContentLoaded", function() {
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = savedUser;
    loadUserHabits();
    showApp();
    initializeDashboard();
  } else {
    showLogin();
  }
});

// ===== AUTHENTICATION =====
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
    initializeDashboard();
    document.getElementById("loginForm").reset();
  } else {
    alert("Invalid credentials");
  }
}

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

function logout() {
  if (confirm("Logout?")) {
    currentUser = null;
    localStorage.removeItem("currentUser");
    habits = [];
    showLogin();
    document.getElementById("loginForm").reset();
  }
}

// ===== UI NAVIGATION =====
function showLogin() {
  document.getElementById("loginSection").classList.remove("hidden");
  document.getElementById("appSection").classList.add("hidden");
}

function showApp() {
  document.getElementById("loginSection").classList.add("hidden");
  document.getElementById("appSection").classList.remove("hidden");
}

function switchTab(tabName) {
  document.querySelectorAll(".tab-content").forEach(tab => {
    tab.classList.add("hidden");
  });

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  const tabId = "tab" + tabName.charAt(0).toUpperCase() + tabName.slice(1);
  const tab = document.getElementById(tabId);
  if (tab) {
    tab.classList.remove("hidden");
  }

  event.target.classList.add("active");

  if (tabName === "statistics") loadStatisticsTab();
  else if (tabName === "calendar") loadCalendarTab();
  else if (tabName === "todaysfocus") loadTodaysFocusTab();
  else if (tabName === "achievements") loadAchievementsTab();
  else if (tabName === "weeklyreport") loadWeeklyReportTab();
  else if (tabName === "rewards") loadRewardsTab();
  else if (tabName === "settings") loadSettingsTab();
}

// ===== HABIT MANAGEMENT =====
function loadUserHabits() {
  const data = localStorage.getItem("habits_" + currentUser);
  habits = data ? JSON.parse(data) : [];
}

function saveUserHabits() {
  localStorage.setItem("habits_" + currentUser, JSON.stringify(habits));
}

function addHabit() {
  const input = document.getElementById("habitInput");
  const value = input.value.trim();

  if (!value) return;

  habits.push({
    name: value,
    done: false,
    streak: 0,
    lastCompletedDate: null,
    createdDate: today
  });

  input.value = "";
  renderHabits();
}

function toggleHabit(index) {
  habits[index].done = !habits[index].done;
  updateStreak(habits[index]);
  renderHabits();
}

function deleteHabit(index) {
  if (confirm("Delete this habit?")) {
    habits.splice(index, 1);
    renderHabits();
  }
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
            ${habit.done ? '<span class="text-white text-sm">✓</span>' : ""}
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

// ===== TAB FUNCTIONS =====
function initializeDashboard() {
  renderHabits();
  document.getElementById("currentUserDisplay").textContent = currentUser;
}

function loadStatisticsTab() {
  const statsDiv = document.getElementById("habitStats");
  const streaksDiv = document.getElementById("topStreaks");
  
  if (habits.length === 0) {
    statsDiv.innerHTML = '<p class="text-slate-400">No habits tracked yet</p>';
    streaksDiv.innerHTML = '<p class="text-slate-400">No streaks yet</p>';
    return;
  }

  let statsHTML = '';
  habits.forEach(h => {
    statsHTML += `
      <div class="flex justify-between items-center p-3 bg-white/5 rounded-lg">
        <span class="text-white font-semibold">${h.name}</span>
        <div class="text-right">
          <p class="text-cyan-300 font-bold">🔥 ${h.streak}</p>
          <p class="text-slate-400 text-xs">${h.done ? '✓ Done' : '○ Pending'}</p>
        </div>
      </div>
    `;
  });
  statsDiv.innerHTML = statsHTML;

  const sorted = [...habits].sort((a, b) => b.streak - a.streak).slice(0, 3);
  let streaksHTML = '';
  sorted.forEach((h, i) => {
    streaksHTML += `
      <div class="flex justify-between items-center">
        <p class="text-white font-semibold">${i + 1}. ${h.name}</p>
        <p class="text-orange-300 font-bold">🔥 ${h.streak} days</p>
      </div>
    `;
  });
  streaksDiv.innerHTML = streaksHTML;
}

function loadAchievementsTab() {
  const maxStreak = Math.max(...habits.map(h => h.streak), 0);
  
  if (maxStreak >= 7) {
    document.getElementById("achievement7").classList.remove("opacity-50", "border-dashed");
    document.getElementById("achievement7").classList.add("opacity-100", "shadow-lg", "shadow-orange-500/30", "border-solid");
  }
  if (maxStreak >= 14) {
    document.getElementById("achievement14").classList.remove("opacity-50", "border-dashed");
    document.getElementById("achievement14").classList.add("opacity-100", "shadow-lg", "shadow-blue-500/30", "border-solid");
  }
  if (maxStreak >= 30) {
    document.getElementById("achievement30").classList.remove("opacity-50", "border-dashed");
    document.getElementById("achievement30").classList.add("opacity-100", "shadow-lg", "shadow-purple-500/30", "border-solid");
  }
  if (maxStreak >= 100) {
    document.getElementById("achievement100").classList.remove("opacity-50", "border-dashed");
    document.getElementById("achievement100").classList.add("opacity-100", "shadow-lg", "shadow-yellow-500/30", "border-solid");
  }
  if (habits.length >= 5) {
    document.getElementById("achievement5habits").classList.remove("opacity-50", "border-dashed");
    document.getElementById("achievement5habits").classList.add("opacity-100", "shadow-lg", "shadow-emerald-500/30", "border-solid");
  }
  const completed = habits.filter(h => h.done).length;
  if (habits.length > 0 && completed === habits.length) {
    document.getElementById("achievement100percent").classList.remove("opacity-50", "border-dashed");
    document.getElementById("achievement100percent").classList.add("opacity-100", "shadow-lg", "shadow-green-500/30", "border-solid");
  }
}

function loadCalendarTab() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = '';
  const today_date = new Date();
  const year = today_date.getFullYear();
  const month = today_date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let i = 0; i < firstDay; i++) {
    calendar.innerHTML += '<div class="text-slate-700 text-center"></div>';
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${month + 1}/${day}/${year}`;
    const completed = habits.filter(h => h.lastCompletedDate === dateStr).length;
    const dayDiv = document.createElement('div');
    dayDiv.className = `text-center p-2 rounded ${
      completed > 0 ? 'bg-emerald-500/30 border border-emerald-500' : 'bg-white/5 border border-white/10'
    }`;
    dayDiv.innerHTML = `<p class="text-white font-semibold text-sm">${day}</p>`;
    calendar.appendChild(dayDiv);
  }
}

function loadTodaysFocusTab() {
  document.getElementById("todayDate").textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const todayHabitsDiv = document.getElementById("todayHabits");
  
  if (habits.length === 0) {
    todayHabitsDiv.innerHTML = '<div class="glass rounded-lg p-8 text-center text-slate-300">No habits yet!</div>';
    return;
  }
  
  let html = '';
  habits.forEach((habit, index) => {
    html += `
      <div class="glass rounded-lg p-5 flex items-center justify-between">
        <div class="flex items-center gap-4 flex-1">
          <button onclick="toggleHabit(${index})" class="flex-shrink-0 w-8 h-8 rounded-full border-2 border-cyan-400 flex items-center justify-center hover:bg-cyan-400/20 ${
            habit.done ? "bg-emerald-500 border-emerald-500" : ""
          }">
            ${habit.done ? '<span class="text-white">✓</span>' : ""}
          </button>
          <div>
            <p class="text-white font-semibold">${habit.name}</p>
            <p class="text-cyan-300 text-sm">🔥 ${habit.streak} day streak</p>
          </div>
        </div>
        <div class="${habit.done ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'} px-4 py-2 rounded font-semibold">
          ${habit.done ? '✓ Done' : '○ Pending'}
        </div>
      </div>
    `;
  });
  todayHabitsDiv.innerHTML = html;
}

function loadWeeklyReportTab() {
  const weeklyStatsDiv = document.getElementById("weeklyStats");
  
  if (habits.length === 0) {
    weeklyStatsDiv.innerHTML = '<p class="text-slate-400">No data yet</p>';
    return;
  }
  
  let html = '<div class="space-y-3">';
  habits.forEach(h => {
    const avgDone = h.streak > 0 ? Math.round((h.streak / 7) * 100) : 0;
    html += `
      <div class="flex justify-between items-center p-3 bg-white/5 rounded-lg">
        <span class="text-white font-semibold">${h.name}</span>
        <div class="flex items-center gap-3">
          <div class="w-32 bg-white/10 rounded-full h-2">
            <div class="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style="width: ${Math.min(avgDone, 100)}%"></div>
          </div>
          <span class="text-cyan-300 font-bold min-w-fit">${Math.min(avgDone, 100)}%</span>
        </div>
      </div>
    `;
  });
  html += '</div>';
  weeklyStatsDiv.innerHTML = html;
}

function loadRewardsTab() {
  const totalPoints = habits.reduce((sum, h) => sum + (h.streak * 10), 0);
  document.getElementById("totalPoints").textContent = totalPoints;
}

function loadSettingsTab() {
  document.getElementById("currentUserDisplay").textContent = currentUser;
}

// ===== UTILITY FUNCTIONS =====
function exportData() {
  const data = {
    username: currentUser,
    habits: habits,
    exportDate: new Date().toLocaleString()
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `habit-tracker-${currentUser}-${new Date().getTime()}.json`;
  link.click();
  alert("Data exported successfully!");
}

function resetAllData() {
  if (confirm("Are you sure? This will delete all your habits!")) {
    if (confirm("Really really sure?")) {
      habits = [];
      saveUserHabits();
      renderHabits();
      alert("All data cleared!");
    }
  }
}

// Attach login form submit
document.addEventListener("DOMContentLoaded", function() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
});
