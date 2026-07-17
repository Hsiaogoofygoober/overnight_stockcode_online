// 這支檔案會被 GitHub Pages 公開放送，裡面的 API 金鑰任何人開「檢視原始碼」都看得到。
// 因為目標資料夾本來就設成「知道連結的人可檢視」，金鑰能讀到的資料本來就是公開的，
// 唯一風險是別人拿這把金鑰去打自己的用量，所以務必到 Google Cloud Console
// -> 憑證 -> 這把金鑰 -> 應用程式限制 選「網站」，只允許你的 GitHub Pages 網域
// (例如 https://hsiaogoofygoober.github.io/*)，否則任何人都能盜用配額。
const DRIVE_CONFIG = {
  apiKey: "AIzaSyDXQOE_MO56KeDDUMOXU9t8fhpezoSR99w",
  folderId: "197NOlkbxrmwv4ZmIpw0EPoZhN-ijmmkK",
};
