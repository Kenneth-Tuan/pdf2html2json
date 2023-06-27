const fs = require("fs");
const path = require("path");
const pdfjsLib = require("pdfjs-dist");
const { JSDOM } = require("jsdom");

// 輸入資料夾路徑和輸出資料夾路徑
const inputDir = "./input";
const outputDir = "./output";

// 建立輸出資料夾
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// 轉換 PDF 檔案為 HTML
function convertPdfToHtml(pdfPath, outputFolderPath) {
  const filename = path.basename(pdfPath, ".pdf");
  const outputFilePath = path.join(outputFolderPath, `${filename}.html`);

  const loadingTask = pdfjsLib.getDocument(pdfPath);
  console.log(loadingTask);
  loadingTask.promise
    .then((pdf) => {
      const totalPages = pdf.numPages;
      const pagesPromises = [];

      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        pagesPromises.push(
          pdf.getPage(pageNumber).then((page) => {
            const viewport = page.getViewport({ scale: 1.0 });
            // const canvasFactory = new pdfjsLib.DOMCanvasFactory();

            return page.getOperatorList().then((opList) => {
              const svgGfx = new pdfjsLib.SVGGraphics(
                page.commonObjs,
                page.objs
              );
              return svgGfx.getSVG(opList, viewport).then((svg) => {
                const svgData = new XMLSerializer().serializeToString(svg);
                return svgData;
              });
            });
          })
        );
      }

      Promise.all(pagesPromises).then((pageContents) => {
        const html = `<html><body>${pageContents.join("")}</body></html>`;
        fs.writeFileSync(outputFilePath, html);

        console.log(`Converted ${pdfPath} to ${outputFilePath}`);
      });
    })
    .catch((error) => {
      console.error(`Error converting ${pdfPath}: ${error}`);
    });
}

// 讀取輸入資料夾中的 PDF 檔案並進行轉換
// fs.readdirSync(inputDir).forEach((file) => {
//   const filePath = path.join(inputDir, file);
//   if (path.extname(file) === ".pdf") {
//     convertPdfToHtml(filePath, outputDir);
//   }
// });

fs.readFile("./input/10904878.html", function (error, data) {
  if (error) {
    console.log(error);
    return;
  }

  const html = data.toString("utf-8");

  const { document } = new JSDOM(html).window;
  const heading = document.title;
  const body = document.body.innerHTML;

  console.log(heading, body);
});
