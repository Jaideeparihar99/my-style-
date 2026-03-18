let habits = JSON.parse(localStorage.getItem("habits")) || [];

function renderHabits() {
  const list = document.getElementById("habitList");
  list.innerHTML = "";

  habits.forEach((habit, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span onclick="toggleHabit(${index})" class="${habit.done ? 'completed' : ''}">
        ${habit.name}
      </span>
      <button onclick="deleteHabit(${index})">❌</button>
    `;

    list.appendChild(li);
  });

  localStorage.setItem("habits", JSON.stringify(habits));
}

function addHabit() {
  const input = document.getElementById("habitInput");
  const value = input.value.trim();

  if (value === "") return;

  habits.push({ name: value, done: false });
  input.value = "";

  renderHabits();
}

function toggleHabit(index) {
  habits[index].done = !habits[index].done;
  renderHabits();
}

function deleteHabit(index) {
  habits.splice(index, 1);
  renderHabits();
}

// Load on start
renderHabits();
