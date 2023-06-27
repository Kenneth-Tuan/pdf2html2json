const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const util = require("util");

const articles = { list: [] };

// 輸入資料夾路徑和輸出資料夾路徑
const inputDir = "./input";
const outputDir = "./output";

const readFileAsync = util.promisify(fs.readFile);

// 建立輸出資料夾
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

async function readFiles(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // 如果是目錄，遞迴處理子目錄
      this.category = path.join(file);
      await readFiles(filePath); // 使用 await 等待遞迴操作完成
    } else if (path.extname(file) === ".html") {
      // 如果是 HTML 檔案，進行轉換
      await convertHtmlToJson(filePath, this.category); // 使用 await 等待轉換操作完成
    }
  }

  fs.writeFile(
    "./output/articles.json",
    JSON.stringify(articles),
    "utf8",
    function () {
      // 在寫入完成後執行的程式碼
      console.log("Write file completed.");
    }
  );
}

// 將 DOCX 檔案轉換為 HTML
async function convertHtmlToJson(filePath, fileCategory) {
  try {
    const fileJSON = {
      title: "",
      category: fileCategory,
      content: "",
    };

    const data = await readFileAsync(filePath);
    const html = data.toString("utf-8");
    const { document } = new JSDOM(html).window;
    fileJSON.title = document.title;
    fileJSON.content = document.body.innerHTML;

    articles.list.push(fileJSON);

    console.log(`Converted ${filePath} to articles object`);
  } catch (error) {
    console.error(`Error converting ${filePath}: ${error}`);
  }
}

// 開始處理檔案夾
readFiles(inputDir);
