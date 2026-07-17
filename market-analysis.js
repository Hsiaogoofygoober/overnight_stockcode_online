const DRIVE_FILES_API = "https://www.googleapis.com/drive/v3/files";
const PAGE_SIZE = 20;

// tokensForPage[i] = 要抓第 i 頁(0-based) 需要帶的 pageToken；第 0 頁固定是 undefined。
let tokensForPage = [undefined];
let currentPageIndex = 0;
let hasNextPage = false;

function formatSize(bytes) {
  const n = Number(bytes);
  if (!bytes || Number.isNaN(n)) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatModifiedTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("zh-TW");
}

function makeFileItem(file) {
  const li = document.createElement("li");

  const left = document.createElement("div");
  left.className = "item-left";

  const nameLink = document.createElement("a");
  nameLink.className = "name";
  nameLink.href = file.webViewLink || "#";
  nameLink.target = "_blank";
  nameLink.rel = "noopener noreferrer";
  nameLink.textContent = file.name;

  left.appendChild(nameLink);

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = [formatModifiedTime(file.modifiedTime), formatSize(file.size)]
    .filter(Boolean)
    .join(" · ");

  li.appendChild(left);
  li.appendChild(badge);
  return li;
}

function updatePagerUI() {
  const prevBtn = document.getElementById("prev-page-btn");
  const nextBtn = document.getElementById("next-page-btn");
  const pageLabel = document.getElementById("page-label");

  prevBtn.disabled = currentPageIndex === 0;
  nextBtn.disabled = !hasNextPage;
  pageLabel.textContent = `第 ${currentPageIndex + 1} 頁`;
}

async function fetchPage(pageIndex) {
  const listElement = document.getElementById("file-list");
  const countElement = document.getElementById("file-count");

  setState(listElement, "載入中…");

  const params = new URLSearchParams({
    q: `'${DRIVE_CONFIG.folderId}' in parents and trashed = false and mimeType = 'application/pdf'`,
    fields: "nextPageToken, files(id,name,mimeType,modifiedTime,webViewLink,iconLink,size)",
    orderBy: "modifiedTime desc",
    pageSize: String(PAGE_SIZE),
    key: DRIVE_CONFIG.apiKey,
  });
  const pageToken = tokensForPage[pageIndex];
  if (pageToken) params.set("pageToken", pageToken);

  try {
    const response = await fetch(`${DRIVE_FILES_API}?${params.toString()}`);
    if (!response.ok) throw new Error(`Drive API 失敗 (${response.status})`);

    const data = await response.json();
    const files = data.files || [];

    listElement.innerHTML = "";
    if (files.length === 0) {
      setState(listElement, "資料夾內沒有 PDF 檔案");
      setCount(countElement, 0);
    } else {
      files.forEach(file => listElement.appendChild(makeFileItem(file)));
      setCount(countElement, files.length);
    }

    currentPageIndex = pageIndex;
    hasNextPage = Boolean(data.nextPageToken);
    if (hasNextPage) tokensForPage[pageIndex + 1] = data.nextPageToken;
    updatePagerUI();
  } catch (error) {
    console.error("Failed to fetch market analysis files:", error);
    setState(listElement, "資料載入失敗，請稍後再試");
    setCount(countElement, 0);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchPage(0);

  document.getElementById("prev-page-btn").addEventListener("click", () => {
    if (currentPageIndex > 0) fetchPage(currentPageIndex - 1);
  });
  document.getElementById("next-page-btn").addEventListener("click", () => {
    if (hasNextPage) fetchPage(currentPageIndex + 1);
  });
});
