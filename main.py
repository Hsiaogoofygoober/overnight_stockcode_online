import pymssql
import time
import threading
from stock_instant_price_info import instant_stock_info
from get_stock_code import get_stock_code_from_csv,get_band_stock_code_from_csv
import pandas as pd
import datetime
from linebot import LineBotApi
from linebot.models import TextSendMessage
from linebot.v3.messaging import MessagingApi
import json
import os
import random
REPO_DIR = 'D:\db_backups\overnight_stockcode_online'
# 提交并推送到 GitHub，同时刷新 CDN 缓存
def push_to_github(json_filename):    
    # 添加文件并提交到仓库
    os.system(f"git add -A")
    os.system(f'git commit -m "Update {json_filename}"')  # 提交更改
    os.system("git push origin master")  # 推送到 gh-pages 分支
    
    print("已将更新推送到 GitHub，并刷新缓存。")
    
def remove_old_json_files(JSON_FILE):
    print(JSON_FILE)
    try:
        # 取得倉庫目錄中所有 JSON 文件
        files_in_repo = os.listdir(REPO_DIR)
        json_files = [f for f in files_in_repo if f.endswith(".json") and os.path.join(REPO_DIR, f)!= JSON_FILE]
        
        # 刪除過時的 JSON 文件
        for file in json_files:
            file_path = os.path.join(REPO_DIR, file)
            os.remove(file_path)
            print(f"{file} 已刪除")
    except Exception as e:
        print(f"刪除過時文件時出現錯誤: {e}")
        
def remove_old_json_files(JSON_FILE):
    print(JSON_FILE)
    try:
        # 取得倉庫目錄中所有 JSON 文件
        files_in_repo = os.listdir(REPO_DIR)

        # 只挑出前綴為 important_stock_codes 且不是當前 JSON_FILE 的檔案
        json_files = [
            f for f in files_in_repo
            if f.startswith("important_stock_codes") 
            and f.endswith(".json")
            and os.path.join(REPO_DIR, f) != JSON_FILE
        ]

        # 刪除過時的 JSON 文件
        for file in json_files:
            file_path = os.path.join(REPO_DIR, file)
            os.remove(file_path)
            print(f"{file} 已刪除")

    except Exception as e:
        print(f"刪除過時文件時出現錯誤: {e}")

        

    
# 建立一個 DataFrame，用來存儲最新的股價資訊
# stock_df = pd.DataFrame(columns=['stock_code','name','o','h','l','c','KPattern','recent_pressure','band','overnight_pressure'])
stock_df = pd.DataFrame(columns=['stock_code','name','o','h','l','c','MA15','band'])
stock_df.set_index('stock_code', inplace=True)



if __name__ == "__main__":
    db_settings = {
            "host": "127.0.0.1",
            "user": "user",
            "password": "291800",
            "database": "ncu_database",
            "charset": "utf8"
        }

    # 連接到資料庫
    conn = pymssql.connect(**db_settings)
    cursor = conn.cursor()
    today = datetime.date.today()
    today_date = today.strftime('%Y-%m-%d')
    query = "SELECT * FROM dbo.calendar WHERE date = %s AND day_of_stock = -1"
    cursor.execute(query, (today_date,))
    # 取得查詢結果
    result = cursor.fetchone()

    if result is None:
        overnight_stock_codes = set()
        band_stock_codes = set()
        # 獲取當前時間
        flag = True
        url = ''
        count = 0
        # stock_codes = get_stock_code_from_csv()
        stock_codes = get_band_stock_code_from_csv()

        for stock_data in stock_codes:
            # stock_df.loc[stock_data['stock_code']] = [stock_data['name'], 0., 0., 0., 0., 0,stock_data['recent_pressure'],0,stock_data['overnight_pressure']]
            stock_df.loc[stock_data['stock_code']] = [stock_data['name'], 0., 0., 0., 0.,stock_data['MA15'],0]   
        length = len(stock_codes)
        
        while (flag):
            current_time = datetime.datetime.now()
            # 檢查當前小時和分鐘是否是 13:25
            if current_time.hour == 13 and current_time.minute == 25:
                flag = False
            # 呼叫背景執行的函數
            for index, stock_data in enumerate(stock_codes):
                if index % 100 == 0 or index ==length-1:
                    url += f"{stock_data['type']}_{stock_data['stock_code']}.tw"
                    url_1 = f'https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch={url}&json=1&delay=0'
                    instant_stock_info(url_1,stock_df)
                    time.sleep(random.uniform(0.1, 0.5))
                    url = ''
                
                else:
                    url += f"{stock_data['type']}_{stock_data['stock_code']}.tw|"
            # 暫存上次的 important_stock_codes 值
            previous_overnight_stock_codes = overnight_stock_codes.copy()
            previous_band_stock_codes = band_stock_codes.copy()
            # Update important_stock_codes with unique stock codes where KPattern == 1
            overnight_stock_codes.clear()  # 清空集合
            band_stock_codes.clear()  # 清空集合
            # 使用 zip 将 index 和 name 配对
            # overnight_stock_codes = set(zip(stock_df[stock_df['KPattern'] == 1].index, 
            #                                 stock_df[stock_df['KPattern'] == 1]['name']))
            band_stock_codes = set(zip(stock_df[stock_df['band'] == 1].index, 
                                            stock_df[stock_df['band'] == 1]['name']))
            #important_stock_codes_list = list(important_stock_codes)
            if overnight_stock_codes != previous_overnight_stock_codes or band_stock_codes != previous_band_stock_codes:
                # 創建要寫入 JSON 的字典
                # 将 set 转换为字典
                data_to_save = {'波段(縮口突破)': {code: name for code, name in band_stock_codes}}

                # 生成新的 JSON 文件名（添加时间戳）
                timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
                json_filename = f"D:\db_backups\overnight_stockcode_online\important_stock_codes_{timestamp}.json"

                # 將字典寫入 JSON 檔案
                with open(json_filename, 'w', encoding='utf-8') as json_file:
                    json.dump(data_to_save, json_file, ensure_ascii=False, indent=4)
                remove_old_json_files(json_filename)    
                push_to_github(json_filename)
                print(timestamp)
            
            time.sleep(3)

