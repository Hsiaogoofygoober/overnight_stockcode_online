// 跨頁面共用的小工具，index.html / market-analysis.html 都會載入這支檔案。

function setState(ulElement, message) {
  ulElement.innerHTML = "";
  const li = document.createElement("li");
  li.className = "state-row";
  li.textContent = message;
  ulElement.appendChild(li);
}

function setCount(countElement, n) {
  countElement.textContent = n > 0 ? `共 ${n} 檔` : "";
}

function showUpdateTime(timeText) {
  if (!timeText) return;
  const el = document.getElementById("update-time");
  if (el) el.textContent = `最後更新：${timeText}`;
}
