let habits = JSON.parse(localStorage.getItem("habits")) || [];

function renderHabits() {
  const list = document.getElementById("habitList");
  list.innerHTML = "";

  habits.forEach((habit, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      ${habit.name} 🔥 ${habit.streak}
      <button class="done" onclick="completeHabit(${index})">Done</button>
    `;

    list.appendChild(li);
  });
}

function addHabit() {
  const input = document.getElementById("habitInput");
  if (input.value === "") return;

  habits.push({ name: input.value, streak: 0 });
  localStorage.setItem("habits", JSON.stringify(habits));

  input.value = "";
  renderHabits();
}

function completeHabit(index) {
  habits[index].streak++;
  localStorage.setItem("habits", JSON.stringify(habits));
  renderHabits();
}

// Fake AI (for now)
function askAI() {
  const input = document.getElementById("aiInput").value;
  const output = document.getElementById("aiOutput");

  if (input.includes("habit")) {
    output.innerText = "Try waking up early, exercising, and reading daily!";
  } else {
    output.innerText = "Stay consistent bro 💪";
  }
}

// Load on start
renderHabits();