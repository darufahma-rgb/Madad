/* Talqeeh — ekstraksi teks PDF & kompres foto (dipakai Siap Imtihan & AI Partner) */

const PDFJS_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174';
let pdfJsPromise = null;

const loadPdfJs = () => {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (!pdfJsPromise) {
    pdfJsPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${PDFJS_BASE}/pdf.min.js`;
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/pdf.worker.min.js`;
        resolve(window.pdfjsLib);
      };
      script.onerror = () => {
        pdfJsPromise = null;
        reject(new Error('Gagal memuat pembaca PDF'));
      };
      document.head.appendChild(script);
    });
  }
  return pdfJsPromise;
};

// pages === null berarti PDF melebihi maxPages dan tidak diekstrak.
const extractPdfPages = async (file, maxPages = 30) => {
  const pdfjs = await loadPdfJs();
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  if (pdf.numPages > maxPages) return { numPages: pdf.numPages, pages: null };

  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    let pageText = '';
    let lastY = null;
    for (const item of textContent.items) {
      if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) pageText += '\n';
      pageText += item.str;
      lastY = item.transform[5];
    }
    if (pageText.trim()) pages.push(pageText.trim());
  }
  return { numPages: pdf.numPages, pages };
};

const compressImage = (file, maxSizeMB = 1.5) => new Promise((resolve) => {
  if (file.size <= maxSizeMB * 1024 * 1024) { resolve(file); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.sqrt((maxSizeMB * 1024 * 1024) / file.size);
      canvas.width  = Math.floor(img.width  * ratio);
      canvas.height = Math.floor(img.height * ratio);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        blob => resolve(new File([blob], file.name, { type: 'image/jpeg' })),
        'image/jpeg', 0.85
      );
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (e) => resolve(e.target.result.split(',')[1]);
  reader.onerror = () => reject(new Error('Gagal membaca file'));
  reader.readAsDataURL(file);
});

Object.assign(window, { extractPdfPages, compressImage, fileToBase64 });
