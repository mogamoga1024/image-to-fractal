
// ◇◇◇ DOM ◇◇◇

const inputFileDom = document.querySelector("#input-file");
const radioRectDom = document.querySelector("#radio-rect");
const radioCircleDom = document.querySelector("#radio-circle");
const checkStrokeDom = document.querySelector("#check-stroke");
const checkFillDom = document.querySelector("#check-fill");
const inputCountDom = document.querySelector("#input-count");
const inputOpacityDom = document.querySelector("#input-opacity");
const resultCanvas = document.querySelector("#result");
const resultContext = resultCanvas.getContext("2d");

// ◇◇◇ 変数 ◇◇◇

let image = null;
let count = 500;
const countDefault = 500;
const countMin = 1;
const countMax = 3000;
let isStroke = true;
let isFill = true;
let shape = "rect";
let opacity = 1;

let isProcessing = false;

// ◇◇◇ 初期表示 ◇◇◇

radioRectDom.checked = true;
checkStrokeDom.checked = true;
checkFillDom.checked = true;
inputCountDom.value = count;
inputCountDom.min = countMin;
inputCountDom.max = countMax;
inputOpacityDom.value = 1;

{
    image = new Image();
    image.src = "Lenna.png";
    image.onload = () => {
        drawFractal();
    };
}

// ◇◇◇ イベント ◇◇◇

inputFileDom.onchange = e => {
    const imageFile = e.target.files[0];
    
    if (!imageFile.type.startsWith("image")) {
        alert("画像ファイルを選択してください。");
        return;
    }

    image = new Image();
    image.onload = () => {
        drawFractal();
        URL.revokeObjectURL(image.src);
    };
    image.onerror = () => {
        alert("画像の読み込みに失敗しました。");
        URL.revokeObjectURL(image.src);
    };
    image.src = URL.createObjectURL(imageFile);
};

radioRectDom.onchange = () => {
    shape = "rect";
    drawFractal();
};
radioCircleDom.onchange = () => {
    shape = "circle";
    drawFractal();
};
checkStrokeDom.onchange = () => {
    isStroke = !isStroke;
    drawFractal();
};
checkFillDom.onchange = () => {
    isFill = !isFill;
    drawFractal();
};

inputCountDom.onblur = e => {
    count = Number(e.target.value);
    if (isNaN(count)) {
        count = countDefault;
    }
    count = Math.floor(count);
    if (count < countMin) {
        count = countMin;
    }
    else if (count > countMax) {
        count = countMax;
    }
    e.target.value = count;
    drawFractal();
};
inputOpacityDom.onblur = e => {
    opacity = Number(e.target.value);
    if (isNaN(opacity)) {
        opacity = 1;
    }
    if (opacity < 0) {
        opacity = 0;
    }
    else if (opacity > 1) {
        opacity = 1;
    }
    e.target.value = opacity;
    drawFractal();
};



// ◇◇◇ フラクタル画像生成処理 ◇◇◇

function drawFractal() {
    if (isProcessing) {
        return;
    }
    isProcessing = true;
    setDisabled(true);
    // あまり好きな方法ではない
    setTimeout(() => {
        const result = imageToFractal(image, shape, count, isFill, isStroke, opacity);
        resultCanvas.width = result.width;
        resultCanvas.height = result.height;
        resultContext.drawImage(result, 0, 0);
        isProcessing = false;
        setDisabled(false);
    }, 0);
}

// ◇◇◇ 便利関数 ◇◇◇

function setDisabled(disabled) {
    inputFileDom.disabled = disabled;
    radioRectDom.disabled = disabled;
    radioCircleDom.disabled = disabled;
    checkStrokeDom.disabled = disabled;
    checkFillDom.disabled = disabled;
    inputCountDom.disabled = disabled;
    inputOpacityDom.disabled = disabled;
}

