import csv

def get_stock_code_from_csv():
    stock = []
    try:
        with open("D:\db_backups\stock_code.csv", mode="r", encoding="utf-8") as csv_file:
            csv_reader = csv.DictReader(csv_file)
            for row in csv_reader:
                # 確保 "stock_code" 和 "type" 欄位都存在
                if "stock_code" in row and "type" in row and "name" in row:
                    stock.append({"stock_code": row["stock_code"].strip(), "type": row["type"].strip(), "name": row["name"].strip(), "recent_pressure": row["recent_pressure"].strip(), "overnight_pressure": row["overnight_pressure"].strip()})
                else:
                    print("The file does not contain 'stock_code' or 'type' columns.")
                    break
    except FileNotFoundError:
        print("File ../stock_code.csv not found.")
    except KeyError as e:
        print(f"The file does not contain the required column: {e}")
    return stock

def get_band_stock_code_from_csv():
    stock = []
    try:
        with open("D:/db_backups/band_stock_code.csv", mode="r", encoding="utf-8-sig") as csv_file:
            csv_reader = csv.DictReader(csv_file)
            for row in csv_reader:
                # 確保 "stock_code" 和 "type" 欄位都存在
                if "stock_code" in row and "type" in row and "name" in row:
                    stock.append({"stock_code": row["stock_code"].strip(), "type": row["type"].strip(), "name": row["name"].strip(), "MA15": row["MA15"].strip()})
                else:
                    print("The file does not contain 'stock_code' or 'type' columns.")
                    break
    except FileNotFoundError:
        print("File ../stock_code.csv not found.")
    except KeyError as e:
        print(f"The file does not contain the required column: {e}")
    return stock

if __name__ == "__main__":
    stock = get_band_stock_code_from_csv()
    print(stock)
