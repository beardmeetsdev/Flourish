const STORAGE_KEY = "flourishHistory";

const groups = [
  {
    name: "Emotional Well-being",
    key: "emotional",
    questions: [
      "During the past month, how often did you feel happy?",
      "During the past month, how often did you feel interested in life?",
      "During the past month, how often did you feel satisfied with life?"
    ]
  },
  {
    name: "Social Well-being",
    key: "social",
    questions: [
      "During the past month, how often did you feel that you had something important to contribute to society?",
      "During the past month, how often did you feel that you belonged to a community?",
      "During the past month, how often did you feel that society was becoming a better place for people?",
      "During the past month, how often did you feel that people are basically good?",
      "During the past month, how often did you feel that the way our society works made sense to you?"
    ]
  },
  {
    name: "Psychological Well-being",
    key: "psychological",
    questions: [
      "During the past month, how often did you like most parts of your personality?",
      "During the past month, how often were you good at managing the responsibilities of your daily life?",
      "During the past month, how often did you have warm and trusting relationships with others?",
      "During the past month, how often did you feel challenged to grow and become a better person?",
      "During the past month, how often did you feel confident to think or express your own ideas and opinions?",
      "During the past month, how often did you feel your life had a sense of direction or meaning?"
    ]
  }
];

const form = document.getElementById("assessment-form");
const resultCard = document.getElementById("result-card");
const result = document.getElementById("result");
const historyList = document.getElementById("history-list");

function buildForm() {
  groups.forEach((group) => {
    const section = document.createElement("section");
    section.className = "card question-group";
    const groupHeading = document.createElement("h2");
    groupHeading.textContent = group.name;
    section.appendChild(groupHeading);

    group.questions.forEach((question, qIndex) => {
      const id = `${group.key}-${qIndex}`;
      const wrapper = document.createElement("fieldset");
      wrapper.className = "question";
      const legend = document.createElement("legend");
      legend.textContent = question;
      wrapper.appendChild(legend);

      const options = document.createElement("div");
      options.className = "options";

      for (let score = 0; score <= 5; score += 1) {
        const optionId = `${id}-${score}`;
        const label = document.createElement("label");
        label.setAttribute("for", optionId);
        const input = document.createElement("input");
        input.id = optionId;
        input.type = "radio";
        input.name = id;
        input.value = String(score);
        input.required = true;

        label.appendChild(input);
        label.appendChild(document.createTextNode(String(score)));
        options.appendChild(label);
      }

      wrapper.appendChild(options);
      section.appendChild(wrapper);
    });

    form.appendChild(section);
  });

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = "Submit Today's Assessment";
  form.appendChild(submit);
}

function calculateStatus(responses) {
  const emotionalScores = responses.slice(0, 3);
  const socialAndPsychologicalScores = responses.slice(3);

  const emotionalMet = emotionalScores.some((score) => score >= 4);
  const socialPsychMet = socialAndPsychologicalScores.filter((score) => score >= 4).length >= 6;

  return emotionalMet && socialPsychMet ? "Flourishing" : "Languishing";
}

function renderResult(status) {
  const isFlourishing = status === "Flourishing";
  resultCard.classList.remove("initial", "flourishing", "languishing");
  resultCard.classList.add(isFlourishing ? "flourishing" : "languishing");
  result.className = "";
  result.textContent = "";

  const statusText = document.createElement("p");
  statusText.className = `status ${isFlourishing ? "flourishing" : "languishing"}`;
  statusText.textContent = status;

  const message = document.createElement("p");
  message.textContent = isFlourishing
    ? "You met the flourishing criteria today."
    : "You did not meet the full flourishing criteria today.";

  result.appendChild(statusText);
  result.appendChild(message);
}

function getHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function addRecord(status, responses) {
  const today = new Date();
  const submittedAt = today.toISOString();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const history = getHistory();
  const record = { date, submittedAt, status, responses };
  history.unshift(record);

  saveHistory(history);
  return history;
}

function renderHistory() {
  const history = getHistory();
  historyList.innerHTML = "";

  if (!history.length) {
    const item = document.createElement("li");
    item.textContent = "No submissions yet.";
    historyList.appendChild(item);
    return;
  }

  history.forEach((entry) => {
    const item = document.createElement("li");
    const date = document.createElement("span");
    const timeSuffix = entry.submittedAt
      ? ` ${new Date(entry.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      : "";
    date.textContent = `${String(entry.date)}${timeSuffix}`;

    const status = document.createElement("strong");
    status.textContent = String(entry.status);

    item.appendChild(date);
    item.appendChild(status);
    historyList.appendChild(item);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const responses = [];

  groups.forEach((group) => {
    group.questions.forEach((_, qIndex) => {
      const name = `${group.key}-${qIndex}`;
      const selected = form.querySelector(`input[name="${name}"]:checked`);
      responses.push(Number(selected.value));
    });
  });

  const status = calculateStatus(responses);
  renderResult(status);
  addRecord(status, responses);
  renderHistory();
});

buildForm();
renderHistory();
