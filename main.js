
const resultCanvas = document.querySelector("#result");
const resultContext = resultCanvas.getContext("2d");

const image = new Image();
// image.src = "image/野獣先輩.png";
// image.src = "image/0000000000000000000000000000000000000000000000000000000000000000000.png";
image.src = "image/test.png";
image.onload = () => {
    main();
};

function main() {
    const result = imageToFractal(image);

    resultCanvas.width = result.width;
    resultCanvas.height = result.height;
    resultContext.drawImage(result, 0, 0);
}

function imageToFractal(image) {
    const dstCanvas = new OffscreenCanvas(image.naturalWidth, image.naturalHeight);
    const dstContext = dstCanvas.getContext("2d");

    let blockList = [];

    {
        const srcCanvas = new OffscreenCanvas(image.naturalWidth, image.naturalHeight);
        const srcContext = srcCanvas.getContext("2d");
        srcContext.drawImage(image, 0, 0);
        const imageData = srcContext.getImageData(0, 0, srcCanvas.width, srcCanvas.height);

        // 分割する
        const quarterBlockList = quarterSplit({
            startX: 0, startY: 0,
            width: imageData.width,
            height: imageData.height
        });
        blockList = blockList.concat(quarterBlockList);
        // 平均値で塗る
        for (const block of quarterBlockList) {
            drawAverage(imageData, block);
        }
        dstContext.putImageData(imageData, 0, 0);
    }

    for (let i = 0; i < 200; i++) {
        // もっとも粗いブロックを探す
        const roughBlock = blockList.reduce((result, block) => {
            return result.roughness < block.roughness ? block : result;
        }, blockList[0]);
        blockList.splice(blockList.indexOf(roughBlock), 1); // todo 計算量減らせる

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
        blockList = blockList.concat(quarterBlockList);
        // 平均値で塗る
        for (const block of quarterBlockList) {
            drawAverage(imageData, block);
        }
        dstContext.putImageData(imageData, roughBlock.startX, roughBlock.startY);
    }

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

function drawAverage(imageData, block) {
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
            if (isNaN(averageR)) debugger; // todo assert
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
            data[i + 0] = averageR;
            data[i + 1] = averageG;
            data[i + 2] = averageB;
        }
    }

    let roughnessSum = 0;
    for (const {r, g, b} of colorList) {
        roughnessSum += Math.abs(averageR - r) + Math.abs(averageG - g) + Math.abs(averageB - b);
    }
    block.roughness = roughnessSum / colorList.length;
}

