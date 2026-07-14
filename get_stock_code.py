import csv


class StockCodeRepository:
    """讀取根目錄輸出的選股 CSV 檔案。"""

    ROOT_DIR = "D:/db_backups"

    def get_stock_code_from_csv(self):
        path = f"{self.ROOT_DIR}/stock_code.csv"
        stock = []
        try:
            with open(path, mode="r", encoding="utf-8") as csv_file:
                csv_reader = csv.DictReader(csv_file)
                for row in csv_reader:
                    # 確保 "stock_code" 和 "type" 欄位都存在
                    if "stock_code" in row and "type" in row and "name" in row:
                        stock.append({
                            "stock_code": row["stock_code"].strip(),
                            "type": row["type"].strip(),
                            "name": row["name"].strip(),
                            "recent_pressure": row["recent_pressure"].strip(),
                            "overnight_pressure": row["overnight_pressure"].strip(),
                        })
                    else:
                        print("The file does not contain 'stock_code' or 'type' columns.")
                        break
        except FileNotFoundError:
            print(f"File {path} not found.")
        except KeyError as e:
            print(f"The file does not contain the required column: {e}")
        return stock

    def get_band_stock_code_from_csv(self):
        path = f"{self.ROOT_DIR}/band_stock_code.csv"
        stock = []
        try:
            with open(path, mode="r", encoding="utf-8-sig") as csv_file:
                csv_reader = csv.DictReader(csv_file)
                for row in csv_reader:
                    # 確保 "stock_code" 和 "type" 欄位都存在
                    if "stock_code" in row and "type" in row and "name" in row:
                        stock.append({
                            "stock_code": row["stock_code"].strip(),
                            "type": row["type"].strip(),
                            "name": row["name"].strip(),
                            "support_bottom": row["support_bottom"].strip(),
                            "support_top": row["support_top"].strip(),
                        })
                    else:
                        print("The file does not contain 'stock_code' or 'type' columns.")
                        break
        except FileNotFoundError:
            print(f"File {path} not found.")
        except KeyError as e:
            print(f"The file does not contain the required column: {e}")
        return stock


if __name__ == "__main__":
    stock = StockCodeRepository().get_band_stock_code_from_csv()
    print(stock)
