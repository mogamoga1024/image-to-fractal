
const resultCanvas = document.querySelector("#result");
const resultContext = resultCanvas.getContext("2d");

const image = new Image();
image.src = "image/野獣先輩.png";
// image.src = "image/0000000000000000000000000000000000000000000000000000000000000000000.png";
image.onload = () => {
    main();
};

function main() {
    const srcCanvas = new OffscreenCanvas(image.naturalWidth, image.naturalHeight);
    const srcContext = srcCanvas.getContext("2d");
    
    srcContext.drawImage(image, 0, 0);
    const imageData = srcContext.getImageData(0, 0, srcCanvas.width, srcCanvas.height);

    imageToFractal(imageData);

    resultCanvas.width = srcCanvas.width;
    resultCanvas.height = srcCanvas.height;
    resultContext.putImageData(imageData, 0, 0);
}

function imageToFractal(imageData) {
    const data = imageData.data;

    // 透明な黒は白に
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i + 0];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        if (r + g + b + a === 0) {
            data[i + 0] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
            data[i + 3] = 255;
        }
    }

    
}

