const REPO_OWNER = "Hsiaogoofygoober";
const REPO_NAME = "overnight_stockcode_online";
const BRANCH = "master";
const CONTENTS_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents?ref=${BRANCH}`;

let repoFilesPromise = null;

// 只打一次 GitHub contents API，兩個清單共用結果，避免重複請求撞到 rate limit
function getRepoFiles() {
  if (!repoFilesPromise) {
    repoFilesPromise = fetch(CONTENTS_API).then(resp => {
      if (!resp.ok) throw new Error(`GitHub API 失敗 (${resp.status})`);
      return resp.json();
    });
  }
  return repoFilesPromise;
}

async function getLatestFileUrl(prefix) {
  const files = await getRepoFiles();
  if (!Array.isArray(files)) return null;
  const matched = files
    .filter(f => f.name.startsWith(prefix) && f.name.endsWith(".json"))
    .sort((a, b) => b.name.localeCompare(a.name)); // 檔名含時間戳，字串排序即可取得最新
  return matched.length ? matched[0].download_url : null;
}

function makeStockItem(code, name, badgeText) {
  const li = document.createElement("li");

  const left = document.createElement("div");
  left.className = "item-left";

  const codeSpan = document.createElement("span");
  codeSpan.className = "ticker";
  codeSpan.textContent = code;

  const nameSpan = document.createElement("span");
  nameSpan.className = "name";
  nameSpan.textContent = name;

  left.appendChild(codeSpan);
  left.appendChild(nameSpan);

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = badgeText;

  li.appendChild(left);
  li.appendChild(badge);
  return li;
}

async function fetchAndRenderBand() {
  const bandUlElement = document.getElementById("band-stock-list");
  const bandCountElement = document.getElementById("band-count");

  try {
    const jsonUrl = await getLatestFileUrl("important_stock_codes_");
    if (!jsonUrl) {
      setState(bandUlElement, "尚未找到資料檔案");
      setCount(bandCountElement, 0);
      return;
    }

    const response = await fetch(jsonUrl);
    if (!response.ok) throw new Error(`下載失敗 (${response.status})`);

    const data = await response.json();
    const bandStockList = data["波段(壓力突破)"] || {};

    const entries = Object.entries(bandStockList);
    bandUlElement.innerHTML = "";

    if (entries.length === 0) {
      setState(bandUlElement, "目前沒有符合條件的股票");
      setCount(bandCountElement, 0);
      return;
    }

    entries.forEach(([stockCode, stockInfo]) => {
      const bottom = stockInfo.support_bottom ?? "無";
      const top = stockInfo.support_top ?? "無";
      const li = makeStockItem(stockCode, stockInfo.name, `壓力區間 ${bottom} ~ ${top}`);
      bandUlElement.appendChild(li);
    });

    setCount(bandCountElement, entries.length);
  } catch (error) {
    console.error("Failed to fetch band stock list:", error);
    setState(bandUlElement, "資料載入失敗，請稍後再試");
    setCount(bandCountElement, 0);
  }
}

async function fetchAndRenderShortBBW() {
  const bbwList = document.getElementById("bbw-list");
  const bbwCountElement = document.getElementById("bbw-count");

  try {
    const url = await getLatestFileUrl("short_bbw_");
    if (!url) {
      setState(bbwList, "尚未找到資料檔案");
      setCount(bbwCountElement, 0);
      return;
    }

    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`下載失敗 (${resp.status})`);
    const data = await resp.json();

    const bbwObj = data["縮口"] || {};
    const entries = Object.entries(bbwObj);
    bbwList.innerHTML = "";
    showUpdateTime(data["更新時間"]);

    if (entries.length === 0) {
      setState(bbwList, "目前沒有符合條件的股票");
      setCount(bbwCountElement, 0);
      return;
    }

    entries.forEach(([code, stockInfo]) => {
      const bottom = stockInfo.support_bottom ?? "無";
      const top = stockInfo.support_top ?? "無";
      const li = makeStockItem(code, stockInfo.name, `壓力區間 ${bottom} ~ ${top}`);
      bbwList.appendChild(li);
    });

    setCount(bbwCountElement, entries.length);
  } catch (error) {
    console.error("Failed to fetch short BBW list:", error);
    setState(bbwList, "資料載入失敗，請稍後再試");
    setCount(bbwCountElement, 0);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchAndRenderBand();
  fetchAndRenderShortBBW();

  const buttons = document.querySelectorAll(".tab-btn");
  const pages = document.querySelectorAll(".stock-list-container");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");

      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      pages.forEach(sec => {
        sec.classList.toggle("active", sec.id === targetId);
      });
    });
  });
});
