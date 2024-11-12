let OPENAI_API_KEY = localStorage.getItem("openai_api_key") || "";
let chatHistory = JSON.parse(localStorage.getItem("chat_history") || "[]");

// 페이지 로드 시 API 키와 채팅 내역 확인
document.addEventListener("DOMContentLoaded", () => {
  if (OPENAI_API_KEY) {
    document.getElementById("apiKeyContainer").style.display = "none";
    document.getElementById("chatContainer").style.display = "block";
    // 저장된 채팅 내역 불러오기
    chatHistory.forEach((msg) => {
      addMessage(msg.content, msg.sender, false);
    });
  }
});

async function validateApiKey() {
  const apiKeyInput = document.getElementById("apiKeyInput");
  const apiKey = apiKeyInput.value.trim();
  const errorMessage = document.getElementById("apiKeyError");

  if (!apiKey.startsWith("sk-")) {
    errorMessage.textContent = "유효한 API 키 형식이 아닙니다.";
    errorMessage.style.display = "block";
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      OPENAI_API_KEY = apiKey;
      localStorage.setItem("openai_api_key", apiKey);
      document.getElementById("apiKeyContainer").style.display = "none";
      document.getElementById("chatContainer").style.display = "block";
      errorMessage.style.display = "none";
    } else {
      errorMessage.textContent = "유효하지 않은 API 키입니다.";
      errorMessage.style.display = "block";
    }
  } catch (error) {
    errorMessage.textContent = "연결 중 오류가 발생했습니다.";
    errorMessage.style.display = "block";
  }
}

function addMessage(message, sender, save = true) {
  const chatMessages = document.getElementById("chatMessages");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", `${sender}-message`);
  messageDiv.textContent = message;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  if (save) {
    // 새 메시지를 채팅 기록에 저장
    chatHistory.push({ content: message, sender: sender });
    localStorage.setItem("chat_history", JSON.stringify(chatHistory));
  }
}

// 로그아웃 기능 추가
function logout() {
  localStorage.removeItem("openai_api_key");
  localStorage.removeItem("chat_history");
  OPENAI_API_KEY = "";
  chatHistory = [];
  document.getElementById("chatMessages").innerHTML = "";
  document.getElementById("apiKeyContainer").style.display = "block";
  document.getElementById("chatContainer").style.display = "none";
}

async function sendMessage() {
  const userInput = document.getElementById("userInput");
  const message = userInput.value.trim();

  if (!message) return;

  // 사용자 메시지 표시
  addMessage(message, "user");
  userInput.value = "";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // AI 응답 표시
    addMessage(aiResponse, "ai");
  } catch (error) {
    console.error("Error:", error);
    addMessage("죄송합니다. 오류가 발생했습니다.", "ai");
  }
}

// Enter 키로 메시지 전송
document.getElementById("userInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

// API 키 입력창에서 Enter 키 처리
document.getElementById("apiKeyInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    validateApiKey();
  }
});
