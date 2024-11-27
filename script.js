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
