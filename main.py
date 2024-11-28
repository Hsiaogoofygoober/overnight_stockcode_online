import pymssql
import time
import threading
from stock_instant_price_info import instant_stock_info
from get_stock_code import get_stock_code_from_csv
import pandas as pd
from datetime import datetime
from linebot import LineBotApi
from linebot.models import TextSendMessage
from linebot.v3.messaging import MessagingApi
import json
import os

# 提交并推送到 GitHub，同时刷新 CDN 缓存
def push_to_github(json_filename):
    # 伪修改 JSON 文件：重命名并恢复
    os.system("rename important_stock_codes.json important_stock_codes.json.bak")  # 重命名为备份文件
    os.system("rename important_stock_codes.json.bak important_stock_codes.json")  # 恢复原文件
    
    # 添加文件并提交到仓库
    os.system(f"git add {json_filename}")
    os.system(f'git commit -m "Update {json_filename}"')  # 提交更改
    os.system("git push origin master")  # 推送到 gh-pages 分支
    
    print("已将更新推送到 GitHub，并刷新缓存。")

    
# 建立一個 DataFrame，用來存儲最新的股價資訊
stock_df = pd.DataFrame(columns=['stock_code','name','o','h','l','c','KPattern'])
stock_df.set_index('stock_code', inplace=True)

if __name__ == "__main__":
    important_stock_codes = set()
    # 獲取當前時間
    flag = True
    url = ''
    count = 0
    stock_codes = get_stock_code_from_csv()
    # 將 '3363' 股票代號的數值更新到 stock_df
    for stock_data in stock_codes:
        stock_df.loc[stock_data['stock_code']] = [stock_data['name'], 0., 0., 0., 0., 0]   
    length = len(stock_codes)
    
    while (flag):
        current_time = datetime.now()
        # 檢查當前小時和分鐘是否是 13:25
        if current_time.hour == 13 and current_time.minute == 25:
            flag = False
        # 呼叫背景執行的函數
        for index, stock_data in enumerate(stock_codes):
            if index % 100 == 0 or index ==length-1:
                url += f"{stock_data['type']}_{stock_data['stock_code']}.tw"
                url_1 = f'https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch={url}&json=1&delay=0'
                instant_stock_info(url_1,stock_df)
                url = ''
            
            else:
                url += f"{stock_data['type']}_{stock_data['stock_code']}.tw|"
        # 暫存上次的 important_stock_codes 值
        previous_important_stock_codes = important_stock_codes.copy()
        # Update important_stock_codes with unique stock codes where KPattern == 1
        important_stock_codes.clear()  # 清空集合
        # 使用 zip 将 index 和 name 配对
        important_stock_codes = set(zip(stock_df[stock_df['KPattern'] == 1].index, 
                                        stock_df[stock_df['KPattern'] == 1]['name']))
        #important_stock_codes_list = list(important_stock_codes)
        # if important_stock_codes != previous_important_stock_codes:
        #     # 創建要寫入 JSON 的字典
        #     # 将 set 转换为字典
        #     data_to_save = {'隔日沖名單': {code: name for code, name in important_stock_codes}}
        #     data_to_save = {'隔日沖名單': {'1111' : 'name'}}

        #     # 指定檔案名稱
        #     file_name = 'D:\db_backups\overnight_stockcode_online\important_stock_codes.json'

        #     # 將字典寫入 JSON 檔案
        #     with open(file_name, 'w', encoding='utf-8') as json_file:
        #         json.dump(data_to_save, json_file, ensure_ascii=False, indent=4)
                
        #     push_to_github()
        count += 1
        if count == 1:
            # 創建要寫入 JSON 的字典
            # 将 set 转换为字典
            data_to_save = {'隔日沖名單': {'2222' : 'name'}}
            # 生成新的 JSON 文件名（添加时间戳）
            timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
            json_filename = f"D:\db_backups\overnight_stockcode_online\important_stock_codes_{timestamp}.json"
            # 指定檔案名稱
            #file_name = 'D:\db_backups\overnight_stockcode_online\important_stock_codes.json'
            print(json_filename)
            # 將字典寫入 JSON 檔案
            with open(json_filename, 'w', encoding='utf-8') as json_file:
                json.dump(data_to_save, json_file, ensure_ascii=False, indent=4)
                
            push_to_github(json_filename)
        
        time.sleep(3)

