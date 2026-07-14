import time
import datetime
import json
import os
import random

import pandas as pd

from db import Database
from git_publisher import GitPublisher
from get_stock_code import StockCodeRepository
from stock_instant_price_info import InstantPriceFetcher


class IntradayBandMonitor:
    """盤中輪詢即時報價，偵測波段突破(band==1)的股票並推送到 GitHub。"""

    REPO_DIR = "D:/db_backups/overnight_stockcode_online"
    STOP_HOUR = 13
    STOP_MINUTE = 25
    POLL_INTERVAL_SECONDS = 30
    BATCH_SIZE = 100

    def __init__(self):
        self.db = Database()
        self.stock_code_repo = StockCodeRepository()
        self.price_fetcher = InstantPriceFetcher()

        # 建立一個 DataFrame，用來存儲最新的股價資訊
        self.stock_df = pd.DataFrame(columns=['stock_code', 'name', 'o', 'h', 'l', 'c', 'support_bottom', 'support_top', 'band'])
        self.stock_df.set_index('stock_code', inplace=True)
        self.previous_band_dict = {}

    def is_trading_day(self):
        with self.db as db:
            cursor = db.cursor()
            today_date = datetime.date.today().strftime('%Y-%m-%d')
            cursor.execute(
                "SELECT * FROM dbo.calendar WHERE date = %s AND day_of_stock = -1",
                (today_date,)
            )
            # 取得查詢結果：檢查今天是否在假日列表中
            return cursor.fetchone() is None

    def remove_old_json_files(self, json_file):
        print(json_file)
        try:
            # 取得倉庫目錄中所有 JSON 文件
            files_in_repo = os.listdir(self.REPO_DIR)

            # 只挑出前綴為 important_stock_codes 且不是當前 json_file 的檔案
            json_files = [
                f for f in files_in_repo
                if f.startswith("important_stock_codes")
                and f.endswith(".json")
                and os.path.join(self.REPO_DIR, f) != json_file
            ]

            # 刪除過時的 JSON 文件
            for file in json_files:
                file_path = os.path.join(self.REPO_DIR, file)
                os.remove(file_path)
                print(f"{file} 已刪除")

        except Exception as e:
            print(f"刪除過時文件時出現錯誤: {e}")

    def poll_once(self, stock_codes, length):
        url = ''
        for index, stock_data in enumerate(stock_codes):
            if index % self.BATCH_SIZE == 0 or index == length - 1:
                url += f"{stock_data['type']}_{stock_data['stock_code']}.tw"
                url_1 = f'https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch={url}&json=1&delay=0'
                self.price_fetcher.fetch(url_1, self.stock_df)
                time.sleep(random.uniform(0.1, 0.5))
                url = ''
            else:
                url += f"{stock_data['type']}_{stock_data['stock_code']}.tw|"

    def save_and_publish(self, filtered_df):
        # 建立精細的 JSON 嵌套字典結構，把支撐區間塞進去
        band_details = {}
        for code, row in filtered_df.iterrows():
            band_details[code] = {
                "name": row['name'],
                "support_bottom": float(row['support_bottom']) if pd.notnull(row['support_bottom']) else None,
                "support_top": float(row['support_top']) if pd.notnull(row['support_top']) else None
            }

        data_to_save = {'波段(壓力突破)': band_details}

        # 生成新的 JSON 文件名並推送
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        json_filename = os.path.join(self.REPO_DIR, f"important_stock_codes_{timestamp}.json")

        with open(json_filename, 'w', encoding='utf-8') as json_file:
            json.dump(data_to_save, json_file, ensure_ascii=False, indent=4)

        self.remove_old_json_files(json_filename)
        GitPublisher(self.REPO_DIR).push(f"Update {json_filename}")
        print(timestamp)

    def run(self):
        if not self.is_trading_day():
            return

        stock_codes = self.stock_code_repo.get_band_stock_code_from_csv()
        for stock_data in stock_codes:
            self.stock_df.loc[stock_data['stock_code']] = [
                stock_data['name'], 0., 0., 0., 0.,
                stock_data['support_bottom'], stock_data['support_top'], 0.
            ]
        length = len(stock_codes)

        flag = True
        while flag:
            current_time = datetime.datetime.now()
            # 檢查當前小時和分鐘是否是 13:25
            if current_time.hour == self.STOP_HOUR and current_time.minute == self.STOP_MINUTE:
                flag = False

            self.poll_once(stock_codes, length)

            # 1. 篩選出目前符合波段突破條件 (band == 1) 的子 DataFrame
            filtered_df = self.stock_df[self.stock_df['band'] == 1]

            # 2. 建立這輪的股票清單對比字典（用來判斷股票名單有沒有變動）
            current_band_dict = {
                code: row['name'] for code, row in filtered_df.iterrows()
            }

            # 3. 如果名單與上一輪不同，才寫檔並推送
            if current_band_dict != self.previous_band_dict:
                self.previous_band_dict = current_band_dict.copy()
                self.save_and_publish(filtered_df)

            time.sleep(self.POLL_INTERVAL_SECONDS)  # 每 30 秒檢查一次


if __name__ == "__main__":
    IntradayBandMonitor().run()
