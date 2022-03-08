const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const fs = require("fs");


async function getWidthOfPDF(path) {
    try {
        // Some PDFs need external cmaps.
        const CMAP_URL = "../node_modules/pdfjs-dist/cmaps/";
        const CMAP_PACKED = true;

        // Where the standard fonts are located.
        const STANDARD_FONT_DATA_URL = "../node_modules/pdfjs-dist/standard_fonts/";

        const data = new Uint8Array(fs.readFileSync(path));
        console.log('# PDF found on file system - ' + path);
        // Load the PDF file.
        const loadingTask = pdfjsLib.getDocument({
            data, cMapUrl: CMAP_URL, cMapPacked: CMAP_PACKED, standardFontDataUrl: STANDARD_FONT_DATA_URL,
        });
        const pdfDocument = await loadingTask.promise;
        console.log("# PDF document loaded.");
        // Get the first page.
        const page = await pdfDocument.getPage(1);
        let viewport = await page.getViewport({scale: 1.0});
        let widthInInches = viewport.width / 72 * page.userUnit;
        console.log(widthInInches);
        return widthInInches;
    } catch (err) {
        console.log(err);
        console.log('An error occurred while trying to get the width');
    }
}

async function renamePdf(dir, file, width) {
    const widthFormatted = "w" + width + "__";

    if(!file.startsWith(widthFormatted)) {
        await fs.rename(dir + file, dir + widthFormatted + file, function (err) {
            if(err) {
                console.log('Error while renaming');
                console.log(err);
            }
        });
    }
    else {
        console.log("File has already been formatted.");
    }
}



(async function () {
    const fsPromise = fs.promises;
    const path = __dirname + '/input/';
    try {
        // Get list of files in the input directory with pdf extension
        let files = await fsPromise.readdir(path);
        files = files.filter(path => path.endsWith('.pdf'));

        for (const file of files) {
            let width = await getWidthOfPDF(path + file);
            await renamePdf(path, file, width);
        }


    } catch (err) {
        console.log(err);
        console.log('Could not read files from folder path provided - ' + path);
    }
})();