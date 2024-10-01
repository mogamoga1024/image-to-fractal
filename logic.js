
function imageToFractal(image, shape, count, isFill, isStroke) {
    const srcCanvas = new OffscreenCanvas(image.naturalWidth, image.naturalHeight);
    const srcContext = srcCanvas.getContext("2d");
    srcContext.drawImage(image, 0, 0);
    const imageData = srcContext.getImageData(0, 0, srcCanvas.width, srcCanvas.height);

    let blockList = [];
    const originalPixelCount = srcCanvas.width * srcCanvas.height;

    let roughBlock = {
        startX: 0,
        startY: 0,
        width: srcCanvas.width,
        height: srcCanvas.height
    };

    for (let i = 0; i < count; i++) {
        let roughBlockIndex = 0;
        if (blockList.length > 0) {
            // 粗いブロックを探す
            roughBlock = blockList[0];
            for (let i = 0; i < blockList.length; i++) {
                const block = blockList[i];
                if (roughBlock.roughness < block.roughness) {
                    roughBlockIndex = i;
                    roughBlock = block;
                }
            }
        }
        
        // 粗いブロックを分割する
        const quarterBlockList = quarterSplit(roughBlock);
        if (quarterBlockList.length === 0) {
            break;
        }

        if (blockList.length > 0) {
            blockList.splice(roughBlockIndex, 1);
        }
        blockList = blockList.concat(quarterBlockList);
        
        // 平均値などを求める
        for (const block of quarterBlockList) {
            calcAverage(imageData, block, originalPixelCount);
        }
    }

    const dstCanvas = new OffscreenCanvas(image.naturalWidth, image.naturalHeight);
    const dstContext = dstCanvas.getContext("2d");

    if (shape === "rect") {
        // 平均値で塗る
        for (const block of blockList) {
            drawBlock(imageData, block, isStroke, isFill);
        }

        if (isStroke) {
            // 下に線を引く
            for (let x = 0; x < imageData.width; x++) {
                const i = x * 4 + (imageData.width * 4) * (imageData.height - 1);
                imageData.data[i + 0] = 0;
                imageData.data[i + 1] = 0;
                imageData.data[i + 2] = 0;
            }
            // 右に線を引く
            for (let y = 0; y < imageData.height; y++) {
                const i = (imageData.width - 1) * 4 + (imageData.width * 4) * y;
                imageData.data[i + 0] = 0;
                imageData.data[i + 1] = 0;
                imageData.data[i + 2] = 0;
            }
        }

        dstContext.putImageData(imageData, 0, 0);
    }
    else if (shape === "circle") {
        // 平均値で塗る
        if (isFill) for (const block of blockList) {
            drawCircle(dstContext, block, "fill");
        }
        if (isStroke) for (const block of blockList) {
            drawCircle(dstContext, block, "stroke");
        }
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
        {startX: startX,              startY: startY,               width: halfWidth1, height: halfHeight1},
        {startX: startX + halfWidth1, startY: startY,               width: halfWidth2, height: halfHeight1},
        {startX: startX,              startY: startY + halfHeight1, width: halfWidth1, height: halfHeight2},
        {startX: startX + halfWidth1, startY: startY + halfHeight1, width: halfWidth2, height: halfHeight2},
    ];
}

function calcAverage(imageData, block, originalPixelCount) {
    const data = imageData.data;
    const imageWidth = imageData.width;
    let startX = block.startX;
    let startY = block.startY;
    let endX = block.startX + block.width - 1;
    let endY = block.startY + block.height - 1;
    const pixelCount = block.width * block.height;

    const colorList = [];

    let totalR = 0;
    let totalG = 0;
    let totalB = 0;
    for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
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
            totalR += data[i + 0];
            totalG += data[i + 1];
            totalB += data[i + 2];
            colorList.push({
                r: data[i + 0],
                g: data[i + 1],
                b: data[i + 2]
            });
        }
    }
    block.r = totalR / pixelCount;
    block.g = totalG / pixelCount;
    block.b = totalB / pixelCount;

    let roughnessSum = 0;
    for (const {r, g, b} of colorList) {
        roughnessSum += Math.abs(block.r - r) + Math.abs(block.g - g) + Math.abs(block.b - b);
    }
    block.roughness = (roughnessSum / colorList.length) * (pixelCount / originalPixelCount);
}

function drawBlock(imageData, block, isStroke, isFill) {
    const data = imageData.data;
    const imageWidth = imageData.width;
    const startX = block.startX;
    const startY = block.startY;
    const endX = block.startX + block.width - 1;
    const endY = block.startY + block.height - 1;

    for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
            const i = x * 4 + (imageWidth * 4) * y;
            if (isStroke && (x === startX || y === startY)) {
                data[i + 0] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
            }
            else if (isFill) {
                data[i + 0] = block.r;
                data[i + 1] = block.g;
                data[i + 2] = block.b;
            }
            else {
                data[i + 0] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
            }
        }
    }
}

function drawCircle(context, block, type) {
    const startX = block.startX;
    const startY = block.startY;

    const radius = Math.max(block.width / 2, block.height / 2);
    const centerX = startX + block.width / 2;
    const centerY = startY + block.height / 2;

    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);

    if (type === "stroke") {
        context.strokeStyle = "black";
        context.lineWidth = 1;
        context.stroke();
    }
    else if (type === "fill") {
        context.fillStyle = `rgba(${block.r}, ${block.g}, ${block.b}, 0.99)`;
        context.fill();
    }
}
