// GitHub Raw JSON 文件的 URL
const jsonUrl = "https://raw.githubusercontent.com/Hsiaogoofygoober/overnight_stockcode_online/refs/heads/gh-pages/important_stock_codes.json";

// 动态获取 JSON 文件并更新页面内容
async function fetchStockList() {
    try {
        // 获取 JSON 数据
        const response = await fetch(jsonUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // 解析 JSON 数据
        const data = await response.json();
        const stockList = data["隔日沖名單"];
        const ulElement = document.getElementById("stock-list");

        // 清空列表内容
        ulElement.innerHTML = "";

        // 动态添加股票代码和名称
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

// 页面加载时调用
fetchStockList();

// 加载 JSON 数据
fetch('./important_stock_codes.json')
    .then(response => response.json())
    .then(data => {
        const list = document.getElementById('stock-list');
        data['隔日沖名單'].forEach(code => {
            const li = document.createElement('li');
            li.textContent = code;
            list.appendChild(li);
        });
    })
    .catch(err => console.error('Error loading JSON:', err));
