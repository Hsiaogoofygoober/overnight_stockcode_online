import os
import subprocess


class GitPublisher:
    """切換到指定 repo 目錄，commit 並 push 到 GitHub。"""

    def __init__(self, repo_dir):
        self.repo_dir = repo_dir

    def push(self, commit_message):
        original_dir = os.getcwd()
        try:
            os.chdir(self.repo_dir)
            print(f"切換到目錄:{self.repo_dir}")
            print("開始推送到 GitHub...")
            subprocess.run(["git", "add", "-A"], check=True)
            subprocess.run(["git", "commit", "-m", commit_message], check=False)
            subprocess.run(["git", "push", "origin", "master"], check=True)
            print("✅ 已將更新推送到 GitHub 並刷新緩存。")
        except subprocess.CalledProcessError as e:
            print(f"❌ 推送失敗,錯誤代碼 {e.returncode}:{e}")
        finally:
            os.chdir(original_dir)
