async function getLatestJsonFile() {
  const repoOwner = "Hsiaogoofygoober"; // 仓库拥有者
  const repoName = "overnight_stockcode_online"; // 仓库名称
  const branch = "master"; // 分支名称

  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents?ref=${branch}`;

  try {
      const response = await fetch(apiUrl);
      const files = await response.json();
      if (Array.isArray(files)) {
          // 按文件名（即时间戳）排序，并选择最新的文件
          const sortedFiles = files.filter(file => file.name.startsWith('important_stock_codes_'))
                                    .sort((a, b) => b.name.localeCompare(a.name)); // 根据文件名排序
          const latestFile = sortedFiles[0];
          return latestFile.download_url; // 获取最新文件的下载链接
      }
  } catch (error) {
      console.error("Error fetching file list from GitHub:", error);
  }
}

async function fetchStockList() {
  const jsonUrl = await getLatestJsonFile(); // 获取最新的 JSON 文件 URL
  if (!jsonUrl) {
      console.error("No JSON file found.");
      return;
  }

  try {
      const response = await fetch(jsonUrl);
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const overnightStockList = data["隔日沖名單"];
      const bandStockList = data["波段(縮口突破)"];
      const overnightUlElement = document.getElementById("overnight-stock-list");
      const bandUlElement = document.getElementById("band-stock-list");

      overnightUlElement.innerHTML = "";  // 清空列表内容
      bandUlElement.innerHTML = "";  // 清空列表内容
      
      for (const stockCode in overnightStockList) {
          if (overnightStockList.hasOwnProperty(stockCode)) {
              const stockName = overnightStockList[stockCode];
              const li = document.createElement("li");
              li.textContent = `${stockCode} - ${stockName}`;
              overnightUlElement.appendChild(li);
          }
      }
      for (const stockCode in bandStockList) {
        if (bandStockList.hasOwnProperty(stockCode)) {
            const stockName = bandStockList[stockCode];
            const li = document.createElement("li");
            li.textContent = `${stockCode} - ${stockName}`;
            bandUlElement.appendChild(li);
        }
    }
  } catch (error) {
      console.error("Failed to fetch stock list:", error);
  }
}

fetchStockList();

async function getLatestShortBBWJson() {
  const repoOwner = "Hsiaogoofygoober";
  const repoName = "overnight_stockcode_online";
  const branch = "master";
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents?ref=${branch}`;

  const resp = await fetch(apiUrl);
  if (!resp.ok) throw new Error("GitHub API 失敗");
  const files = await resp.json();

  const targets = files
    .filter(f => f.name.startsWith("short_bbw_") && f.name.endsWith(".json"))
    .sort((a, b) => b.name.localeCompare(a.name)); // 依檔名(含時間戳)排序，取最新

  return targets.length ? targets[0].download_url : null;
}

// 2) 下載並渲染
async function fetchAndRenderShortBBW() {
  try {
    const url = await getLatestShortBBWJson();
    if (!url) {
      console.warn("尚未找到 short_bbw_* JSON 檔");
      return;
    }

    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`下載失敗 ${resp.status}`);
    const data = await resp.json();

    const shortList = document.getElementById("short-list");
    const bbwList = document.getElementById("bbw-list");
    shortList.innerHTML = "";
    bbwList.innerHTML = "";

    /* =========================
       放空日內波（Object）
       ========================= */
    const shortObj = data["放空日內波"] || {};
    Object.entries(shortObj).forEach(([code, name]) => {
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
      badge.textContent = "放空";

      li.appendChild(left);
      li.appendChild(badge);
      shortList.appendChild(li);
    });

    /* =========================
       縮口（Object）
       ========================= */
    const bbwObj = data["縮口"] || {};
    Object.entries(bbwObj).forEach(([code, name]) => {
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
      badge.textContent = "縮口";

      li.appendChild(left);
      li.appendChild(badge);
      bbwList.appendChild(li);
    });

    console.log("更新時間：", data["更新時間"]);
  } catch (e) {
    console.error(e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // 1) 先抓資料並渲染四個清單
  //    - 這兩行分別是你原先的函式
  fetchStockList();          // 讀 important_stock_codes_*.json → 填 overnight/band
  fetchAndRenderShortBBW();  // 讀 short_bbw_*.json → 填 short/bbw

  // 2) 分頁切換（用 data-target 指向 section id）
  const buttons = document.querySelectorAll(".tab-btn");
  const pages = document.querySelectorAll(".stock-list-container");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");

      // active 狀態切換
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // 顯示對應頁面
      pages.forEach(sec => {
        if (sec.id === targetId) sec.classList.add("active");
        else sec.classList.remove("active");
      });
    });
  });
});

