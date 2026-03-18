let habits = JSON.parse(localStorage.getItem("habits")) || [];
let editingIndex = -1;

const today = new Date().toDateString();

function initializeHabit(habit) {
  if (!habit.createdDate) habit.createdDate = today;
  if (!habit.streak) habit.streak = 0;
  if (!habit.lastCompletedDate) habit.lastCompletedDate = null;
  if (!habit.history) habit.history = {};
  return habit;
}

function updateStreak(habit) {
  if (habit.done) {
    if (habit.lastCompletedDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (habit.lastCompletedDate === yesterday.toDateString()) {
        habit.streak++;
      } else if (habit.lastCompletedDate !== today) {
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

  habits.forEach((habit, index) => {
    habit = initializeHabit(habit);
    updateStreak(habit);

    const li = document.createElement("li");
    li.className = habit.done ? "completed" : "";

    li.innerHTML = `
      <div class="habit-info">
        <div class="habit-name">${habit.name}</div>
        <div class="habit-streak">🔥 ${habit.streak} day streak</div>
      </div>
      <div class="habit-actions">
        <button class="btn-toggle" onclick="toggleHabit(${index})">${habit.done ? "✓" : "○"}</button>
        <button class="btn-edit" onclick="openEditModal(${index})">✏️</button>
        <button class="btn-delete" onclick="deleteHabit(${index})">❌</button>
      </div>
    `;

    list.appendChild(li);
  });

  updateStatistics();
  saveData();
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

  if (value === "") return;

  const newHabit = {
    name: value,
    done: false,
    createdDate: today,
    streak: 0,
    lastCompletedDate: null,
    history: {}
  };

  habits.push(newHabit);
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

function openEditModal(index) {
  editingIndex = index;
  const modal = document.getElementById("editModal");
  const input = document.getElementById("editInput");
  input.value = habits[index].name;
  modal.style.display = "block";
  input.focus();
}

function closeEditModal() {
  const modal = document.getElementById("editModal");
  modal.style.display = "none";
  editingIndex = -1;
}

function saveEdit() {
  const input = document.getElementById("editInput");
  const newName = input.value.trim();

  if (newName === "") {
    alert("Habit name cannot be empty");
    return;
  }

  if (editingIndex !== -1) {
    habits[editingIndex].name = newName;
    closeEditModal();
    renderHabits();
  }
}

window.onclick = function (event) {
  const modal = document.getElementById("editModal");
  if (event.target === modal) {
    closeEditModal();
  }
};

document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    const modal = document.getElementById("editModal");
    if (modal.style.display === "block") {
      saveEdit();
    }
  }
});

function saveData() {
  localStorage.setItem("habits", JSON.stringify(habits));
}

// Load on start
renderHabits();
