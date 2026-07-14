import pymssql

from db_config import DB_SETTINGS


class Database:
    """輕量包裝 pymssql 連線生命週期，供各腳本類別以組合方式使用。"""

    def __init__(self, settings=None):
        self.settings = settings or DB_SETTINGS
        self.conn = None

    def connect(self):
        self.conn = pymssql.connect(**self.settings)
        return self.conn

    def cursor(self):
        if self.conn is None:
            self.connect()
        return self.conn.cursor()

    def commit(self):
        self.conn.commit()

    def rollback(self):
        self.conn.rollback()

    def close(self):
        if self.conn is not None:
            self.conn.close()
            self.conn = None

    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
