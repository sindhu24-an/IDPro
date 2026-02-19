let pdfDoc = null;
let currentPage = 1;
let canvas = document.getElementById("pdf-canvas");
let ctx = canvas.getContext("2d");

const upload = document.getElementById("pdf-upload");
const output = document.getElementById("output");

upload.addEventListener("change", function(e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function() {
    const typedarray = new Uint8Array(this.result);

    pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
      pdfDoc = pdf;
      showPDF(currentPage);
    });
  };

  reader.readAsArrayBuffer(file);
});

function showPDF(pageNumber) {
  pdfDoc.getPage(pageNumber).then(function(page) {
    const viewport = page.getViewport({ scale: 1.5 });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    page.render(renderContext);
  });
}

document.getElementById("prev").addEventListener("click", function() {
  if (currentPage <= 1) return;
  currentPage--;
  showPDF(currentPage);
});

document.getElementById("next").addEventListener("click", function() {
  if (currentPage >= pdfDoc.numPages) return;
  currentPage++;
  showPDF(currentPage);
});

document.getElementById("extract").addEventListener("click", async function() {

  output.value = "Extracting text... Please wait ⏳";

  const worker = await Tesseract.createWorker();

  await worker.loadLanguage("eng");
  await worker.initialize("eng");

  const { data: { text } } = await worker.recognize(canvas);

  output.value = text;

  await worker.terminate();
});
