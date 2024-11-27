// GitHub Raw JSON 文件的 URL
const jsonUrl = "https://raw.githubusercontent.com/zachhsiao/my-stocks/main/important_stock_codes.json";

// 动态获取 JSON 文件并更新页面内容
async function fetchStockList() {
  try {
    const response = await fetch(jsonUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const stockList = data["隔日沖名單"];
    const ulElement = document.getElementById("stock-list");

    // 清空列表内容
    ulElement.innerHTML = "";

    // 动态添加股票代码
    stockList.forEach(stockCode => {
      const li = document.createElement("li");
      li.textContent = stockCode;
      ulElement.appendChild(li);
    });
  } catch (error) {
    console.error("Failed to fetch stock list:", error);
  }
}

// 页面加载时调用
fetchStockList();