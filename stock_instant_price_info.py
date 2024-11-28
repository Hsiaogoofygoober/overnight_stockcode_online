import requests
import time
import pandas as pd
import re
def calculate_kpattern(o,h,l,c,y,v):
    body = abs(c-o)
    kpattern = 0
    # if c > o:
    #     upperShadow = h - c
    #     lowerShadow = o - l
    # else:
    #     upperShadow = h - o
    #     lowerShadow = c - l
    #漲幅大於7% 上引線小於1%
    if (c > o) and (body > (h - l) * 0.6) and ((c-y) > y*0.065) and v > 1000:
        kpattern = 1
        
    return kpattern


def instant_stock_info(url,stock_df):
    # API 網址
    max_retries = 5  # 設置重試次數
    for attempt in range(max_retries):
        try:
            response = requests.get(url, timeout=10)  # 設置 timeout
            response.raise_for_status()  # 檢查是否出現 HTTP 錯誤
            data = response.json()  # 成功取得資料時返回 JSON 格式的數據
            break  # 成功後跳出迴圈
        except requests.exceptions.RequestException as e:
            print(f"嘗試第 {attempt + 1} 次失敗: {e}")
            if attempt < max_retries - 1:  # 若非最後一次重試則等待一段時間
                time.sleep(2)  # 等待 2 秒後重試
            else:
                print("所有重試均失敗，無法取得資料")
                data = None  # 若重試皆失敗，將 data 設置為 None
                
    # 處理資料並插入資料表
    for item in data['msgArray']:
        if "@" in item:
            stock_code = re.sub(r'\D', '', item["@"])
        else:
            # 處理缺少 @ 鍵的情況，例如設置 stock_code 為 None 或其他值
            continue
        # 如果 item['o'] 不存在則跳過
        if 'o' not in item:
            continue
        if item['o'] != '-':
            o = float(item['o'])
        else:
            o = 0.
        if item['h'] != '-':
            h = float(item['h'])
        else:
            h = 0.
        if item['l'] != '-':
            l = float(item['l'])
        else:
            l = 0.
        if item['y'] != '-':
            y = float(item['y'])
        else:
            y = 0.
        if item['z'] != '-':
            c = float(item['z'])
        else:
            c = stock_df.loc[stock_code, 'c']
        if item['v'] != '-':
            v = int(item['v'])
        else:
            v = 0
        kpattern = calculate_kpattern(o,h,l,c,y,v)
        # 直接使用 .loc 方法根據索引更新資料
        stock_df.loc[stock_code] = [stock_df.loc[stock_code, 'name'], o, h, l, c, kpattern]
