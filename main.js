
const resultCanvas = document.querySelector("#result");
const resultContext = resultCanvas.getContext("2d");

const image = new Image();
image.src = "image/野獣先輩.png";
// image.src = "image/0000000000000000000000000000000000000000000000000000000000000000000.png";
// image.src = "image/test.png";
image.onload = () => {
    main();
};

let count = 150;
let isStroke = true;
let isFill = true;

function main() {
    const result = imageToFractal(image, count);

    resultCanvas.width = result.width;
    resultCanvas.height = result.height;
    resultContext.drawImage(result, 0, 0);
}

function imageToFractal(image, count) {
    const dstCanvas = new OffscreenCanvas(image.naturalWidth, image.naturalHeight);
    const dstContext = dstCanvas.getContext("2d");

    let blockList = [];
    const originalPixelCount = dstCanvas.width * dstCanvas.height;

    let roughBlock = {
        startX: 0,
        startY: 0,
        width: dstCanvas.width,
        height: dstCanvas.height
    };

    for (let i = 0; i < count; i++) {
        if (blockList.length > 0) {
            // もっとも粗いブロックを探す
            let roughBlockIndex = 0;
            roughBlock = blockList[0];
            for (let i = 0; i < blockList.length; i++) {
                const block = blockList[i];
                if (roughBlock.roughness < block.roughness) {
                    roughBlockIndex = i;
                    roughBlock = block;
                }
            }
            blockList.splice(roughBlockIndex, 1);
        }
        
        const srcCanvas = new OffscreenCanvas(roughBlock.width, roughBlock.height);
        const srcContext = srcCanvas.getContext("2d");
        srcContext.drawImage(
            image,
            roughBlock.startX, roughBlock.startY, roughBlock.width, roughBlock.height,
            0, 0, roughBlock.width, roughBlock.height
        );
        const imageData = srcContext.getImageData(0, 0, srcCanvas.width, srcCanvas.height);

        // 分割する
        const quarterBlockList = quarterSplit(roughBlock);
        if (quarterBlockList.length === 0) {
            break;
        }
        blockList = blockList.concat(quarterBlockList);
        // 平均値で塗る
        for (const block of quarterBlockList) {
            drawAverage(imageData, block, originalPixelCount, isStroke, isFill);
        }
        dstContext.putImageData(imageData, roughBlock.startX, roughBlock.startY);
    }

    // 下と右に線を引く
    const imageData = dstContext.getImageData(0, 0, dstCanvas.width, dstCanvas.height);
    for (let x = 0; x < imageData.width; x++) {
        const i = x * 4 + (imageData.width * 4) * (imageData.height - 1);
        imageData.data[i + 0] = 0;
        imageData.data[i + 1] = 0;
        imageData.data[i + 2] = 0;
    }
    for (let y = 0; y < imageData.height; y++) {
        const i = (imageData.width - 1) * 4 + (imageData.width * 4) * y;
        imageData.data[i + 0] = 0;
        imageData.data[i + 1] = 0;
        imageData.data[i + 2] = 0;
    }
    dstContext.putImageData(imageData, 0, 0);

    return dstCanvas;
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
        {section: 1, startX: startX,              startY: startY,               width: halfWidth1, height: halfHeight1},
        {section: 2, startX: startX + halfWidth1, startY: startY,               width: halfWidth2, height: halfHeight1},
        {section: 3, startX: startX,              startY: startY + halfHeight1, width: halfWidth1, height: halfHeight2},
        {section: 4, startX: startX + halfWidth1, startY: startY + halfHeight1, width: halfWidth2, height: halfHeight2},
    ];
}

function drawAverage(imageData, block, originalPixelCount, isStroke, isFill) {
    const data = imageData.data;
    const imageWidth = imageData.width;
    const imageHeight = imageData.height;
    let startX = 0;
    let startY = 0;
    let endX = block.width;
    let endY = block.height;
    const pixelCount = block.width * block.height;

    if (block.section === 1) {
        // noop
    }
    else if (block.section === 2) {
        startX = imageWidth - block.width;
        endX = imageWidth;
    }
    else if (block.section === 3) {
        startY = imageHeight - block.height;
        endY = imageHeight;
    }
    else if (block.section === 4) {
        startX = imageWidth - block.width;
        startY = imageHeight - block.height;
        endX = imageWidth;
        endY = imageHeight;
    }

    const colorList = [];

    let averageR = 0;
    let averageG = 0;
    let averageB = 0;
    for (let x = startX; x < endX; x++) {
        for (let y = startY; y < endY; y++) {
            const i = x * 4 + (imageWidth * 4) * y;
            // 透明な黒は白にする
            if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0 && data[i + 3] === 0) {
                data[i + 0] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
            }
            if (data[i + 3] !== 255) {
                data[i + 3] = 255;
            }
            averageR += data[i + 0];
            averageG += data[i + 1];
            averageB += data[i + 2];
            colorList.push({
                r: data[i + 0],
                g: data[i + 1],
                b: data[i + 2]
            });
        }
    }
    averageR = averageR / pixelCount;
    averageG = averageG / pixelCount;
    averageB = averageB / pixelCount;

    for (let x = startX; x < endX; x++) {
        for (let y = startY; y < endY; y++) {
            const i = x * 4 + (imageWidth * 4) * y;
            if (isStroke && (x === startX || y === startY)) {
                data[i + 0] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
            }
            else if (isFill) {
                data[i + 0] = averageR;
                data[i + 1] = averageG;
                data[i + 2] = averageB;
            }
            else {
                data[i + 0] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
            }
        }
    }

    let roughnessSum = 0;
    for (const {r, g, b} of colorList) {
        roughnessSum += Math.abs(averageR - r) + Math.abs(averageG - g) + Math.abs(averageB - b);
    }
    block.roughness = (roughnessSum / colorList.length) * (pixelCount / originalPixelCount);
}

