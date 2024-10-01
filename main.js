
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

    const blockList = quarterSplit({
        startX: 0, startY: 0,
        width: imageData.width,
        height: imageData.height
    });

    for (const block of blockList) {
        drawAverage(imageData, block);
    }
}

function quarterSplit(block) {
    const {startX, startY, width, height} = block;

    if (width < 2 || height < 2) {
        return [];
    }

    const halfWidth1 = Math.floor(width / 2);
    const halfWidth2 = width - halfWidth1;
    const halfHeight1 = Math.floor(height / 2);
    const halfHeight2 = height - halfHeight1;

    return [
        {startX: startX,              startY: startY,               width: halfWidth1, height: halfHeight1},
        {startX: startX + halfWidth1, startY: startY,               width: halfWidth2, height: halfHeight1},
        {startX: startX,              startY: startY + halfHeight1, width: halfWidth1, height: halfHeight2},
        {startX: startX + halfWidth1, startY: startY + halfHeight1, width: halfWidth2, height: halfHeight2},
    ];
}

function drawAverage(imageData, block) {
    const data = imageData.data;
    const imageWidth = imageData.width;
    const startX = block.startX;
    const endX = block.startX + block.width;
    const startY = block.startY;
    const endY = block.startY + block.height;
    const pixelCount = block.width * block.height;

    let averageR = 0;
    let averageG = 0;
    let averageB = 0;
    for (let x = startX; x < endX; x++) {
        for (let y = startY; y < endY; y++) {
            const i = x * 4 + (imageWidth * 4) * y;
            averageR += data[i + 0];
            averageG += data[i + 1];
            averageB += data[i + 2];
        }
    }
    averageR = averageR / pixelCount;
    averageG = averageG / pixelCount;
    averageB = averageB / pixelCount;

    for (let x = startX; x < endX; x++) {
        for (let y = startY; y < endY; y++) {
            const i = x * 4 + (imageWidth * 4) * y;
            data[i + 0] = averageR;
            data[i + 1] = averageG;
            data[i + 2] = averageB;
        }
    }
}

