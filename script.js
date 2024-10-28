let database = {};

// Fungsi untuk memuat file Excel dari server
async function loadExcelFromServer() {
  try {
    const response = await fetch("DatabaseBillAI.xlsx");
    if (!response.ok) throw new Error("Failed to fetch Excel file");

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    for (let i = 1; i < json.length; i++) {
      const question = json[i][0].toLowerCase();
      const answer = json[i][1];
      if (question && answer) {
        database[question] = answer;
      }
    }
  } catch (error) {
    console.error("Error loading Excel file:", error);
  }
}

// Fungsi untuk menangani ketika tombol "Enter" ditekan
function handleKeyPress(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

// Fungsi menampilkan pesan dari pengguna dan memproses balasan
function sendMessage() {
  const userInput = document.getElementById("user-input").value.trim();
  if (!userInput) return;

  const messages = document.getElementById("chat-box");
  const userMessage = document.createElement("div");
  userMessage.className = "message user";
  userMessage.textContent = userInput;

  messages.appendChild(userMessage);
  document.getElementById("user-input").value = ""; // Kosongkan input setelah mengirim
  messages.scrollTop = messages.scrollHeight; // Scroll ke bawah

  const aiResponse = getResponse(userInput);
  displayTypingResponse(aiResponse, messages);
}

// Fungsi animasi mengetik satu per satu untuk jawaban bot
function typeWriterEffect(text, element) {
  let index = 0;
  function type() {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
      setTimeout(type, 50); // Kecepatan mengetik (50ms)
    }
  }
  type();
}

// Fungsi menampilkan jawaban bot dengan efek mesin tik
function displayTypingResponse(responseText, messages) {
  const responseMessage = document.createElement("div");
  responseMessage.className = "message bot";
  messages.appendChild(responseMessage);
  messages.scrollTop = messages.scrollHeight; // Scroll ke bawah seiring penambahan teks

  typeWriterEffect(responseText, responseMessage);
}

// Fungsi untuk mendapatkan jawaban dari database
function getResponse(input) {
  return database[input.toLowerCase()] || "Maaf, saya tidak mengerti.";
}

// Panggil fungsi untuk memuat file Excel saat halaman dimuat
document.addEventListener("DOMContentLoaded", loadExcelFromServer);

// Fungsi untuk login
function login() {
  const username = document.getElementById("username").value.trim();
  if (!username) {
    alert("Masukkan username Anda");
    return;
  }

  // Simpan username di localStorage
  localStorage.setItem("username", username);

  // Alihkan ke chat jika login berhasil
  document.getElementById("login-container").style.display = "none";
  document.getElementById("chat-container").style.display = "flex";

  // Load chat history jika ada
  loadChatHistory();
}

// Fungsi untuk logout
function logout() {
  localStorage.removeItem("username");
  localStorage.removeItem("chatHistory");

  document.getElementById("login-container").style.display = "flex";
  document.getElementById("chat-container").style.display = "none";
}

// Fungsi untuk memuat database dari file Excel
async function loadExcelFromServer() {
  try {
    const response = await fetch("DatabaseBillAI.xlsx");
    if (!response.ok) throw new Error("Failed to fetch Excel file");

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    for (let i = 1; i < json.length; i++) {
      const question = json[i][0].toLowerCase();
      const answer = json[i][1];
      if (question && answer) {
        database[question] = answer;
      }
    }
  } catch (error) {
    console.error("Error loading Excel file:", error);
  }
}

// Fungsi untuk menyimpan dan memuat riwayat chat
function saveChatHistory() {
  const chatBox = document.getElementById("chat-box");
  localStorage.setItem("chatHistory", chatBox.innerHTML);
}

function loadChatHistory() {
  const chatHistory = localStorage.getItem("chatHistory");
  if (chatHistory) {
    document.getElementById("chat-box").innerHTML = chatHistory;
  }
}

// Fungsi untuk menangani enter key
function handleKeyPress(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

// Fungsi untuk mengirim pesan
function sendMessage() {
  const userInput = document.getElementById("user-input").value.trim();
  if (!userInput) return;

  const messages = document.getElementById("chat-box");
  const userMessage = document.createElement("div");
  userMessage.className = "message user";
  userMessage.textContent = userInput;

  messages.appendChild(userMessage);
  document.getElementById("user-input").value = "";
  messages.scrollTop = messages.scrollHeight;

  const aiResponse = getResponse(userInput);
  displayTypingResponse(aiResponse, messages);

  saveChatHistory(); // Simpan setiap chat yang dikirim
}

// Fungsi untuk menampilkan respons dengan animasi mesin tik
function displayTypingResponse(responseText, messages) {
  const responseMessage = document.createElement("div");
  responseMessage.className = "message bot";

  let index = 0;
  const interval = setInterval(() => {
    responseMessage.textContent = responseText.slice(0, index);
    index++;
    if (index > responseText.length) {
      clearInterval(interval);
    }
  }, 50);

  messages.appendChild(responseMessage);
  messages.scrollTop = messages.scrollHeight;

  saveChatHistory(); // Simpan setiap chat yang diterima
}

// Fungsi untuk mendapatkan respons dengan fuzzy matching
function getResponse(input) {
  input = input.toLowerCase();
  if (database[input]) return database[input];

  // Fuzzy matching
  let bestMatch = "";
  let highestSimilarity = 0;

  for (const question in database) {
    const similarity = calculateSimilarity(input, question);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = question;
    }
  }

  return highestSimilarity > 0.6
    ? database[bestMatch]
    : "Maaf, saya tidak mengerti.";
}

// Fungsi sederhana untuk menghitung kesamaan (menggunakan Levenshtein Distance)
function calculateSimilarity(a, b) {
  if (a === b) return 1.0;
  if (!a.length || !b.length) return 0.0;

  let longer = a.length > b.length ? a : b;
  let shorter = a.length > b.length ? b : a;

  return (longer.length - levenshtein(longer, shorter)) / longer.length;
}

function levenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
    }
  }
  return matrix[b.length][a.length];
}

// Panggil fungsi untuk memuat file Excel saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  loadExcelFromServer();

  // Check if user is already logged in
  const username = localStorage.getItem("username");
  if (username) {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("chat-container").style.display = "flex";
    loadChatHistory();
  }
});
