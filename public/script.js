const BAND_DATA_URL = "data/important_stock_codes.json";
const BBW_DATA_URL = "data/short_bbw.json";

// 資料檔由本機排程直接覆寫成固定檔名；檔案還不存在(404)時回傳 null，其他錯誤才丟例外
async function fetchDataFile(url) {
  const resp = await fetch(url, { cache: "no-store" });
  if (resp.status === 404) return null;
  if (!resp.ok) throw new Error(`下載失敗 (${resp.status})`);
  return resp.json();
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
    const data = await fetchDataFile(BAND_DATA_URL);
    if (!data) {
      setState(bandUlElement, "尚未找到資料檔案");
      setCount(bandCountElement, 0);
      return;
    }

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
    const data = await fetchDataFile(BBW_DATA_URL);
    if (!data) {
      setState(bbwList, "尚未找到資料檔案");
      setCount(bbwCountElement, 0);
      return;
    }

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
