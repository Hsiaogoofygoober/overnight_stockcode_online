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
      const bandStockList = data["波段(壓力突破)"];
      const bandUlElement = document.getElementById("band-stock-list");

      bandUlElement.innerHTML = "";  // 清空列表内容

      for (const stockCode in bandStockList) {
          if (bandStockList.hasOwnProperty(stockCode)) {
              // 💡 關鍵變更：這裏的 target 是一整包物件
              const stockInfo = bandStockList[stockCode]; 
              const stockName = stockInfo.name;
              
              // 讀取壓力區間的天花板與地板，如果後端傳 NULL 則顯示 "未設定"
              const bottom = stockInfo.support_bottom !== null ? stockInfo.support_bottom : "無";
              const top = stockInfo.support_top !== null ? stockInfo.support_top : "無";

              const li = document.createElement("li");
              
              // 渲染畫面：格式化加上 壓力區間 (Bottom ~ Top)
              li.textContent = `${stockCode} - ${stockName} | 壓力區間: [${bottom} ~ ${top}]`;
              
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

    const bbwList = document.getElementById("bbw-list");
    bbwList.innerHTML = "";

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

