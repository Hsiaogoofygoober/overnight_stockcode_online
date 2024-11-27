const jsonUrl = "https://raw.githubusercontent.com/Hsiaogoofygoober/overnight_stockcode_online/gh-pages/important_stock_codes.json?t=" + new Date().getTime();

async function fetchStockList() {
    try {
        const response = await fetch(jsonUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const stockList = data["隔日沖名單"];
        const ulElement = document.getElementById("stock-list");

        ulElement.innerHTML = "";  // 清空列表内容

        for (const stockCode in stockList) {
            if (stockList.hasOwnProperty(stockCode)) {
                const stockName = stockList[stockCode];
                const li = document.createElement("li");
                li.textContent = `${stockCode} - ${stockName}`;
                ulElement.appendChild(li);
            }
        }
    } catch (error) {
        console.error("Failed to fetch stock list:", error);
    }
}

fetchStockList();
