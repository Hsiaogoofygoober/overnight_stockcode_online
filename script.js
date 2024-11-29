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
// 每隔 60 秒检查一次更新
setInterval(fetchStockList, 5000); // 5 s