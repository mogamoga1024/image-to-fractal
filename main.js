
// ◇◇◇ DOM ◇◇◇

const inputFileDom = document.querySelector("#input-file");
const radioRectDom = document.querySelector("#radio-rect");
const radioCircleDom = document.querySelector("#radio-circle");
const checkStrokeDom = document.querySelector("#check-stroke");
const checkFillDom = document.querySelector("#check-fill");
const resultCanvas = document.querySelector("#result");
const resultContext = resultCanvas.getContext("2d");

radioRectDom.checked = true;
checkStrokeDom.checked = true;
checkFillDom.checked = true;

// ◇◇◇ 変数 ◇◇◇

let image = null;
let count = 500;
let isStroke = true;
let isFill = true;
let shape = "rect";
let opacity = 1;

// ◇◇◇ 初期表示 ◇◇◇

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

// ◇◇◇ フラクタル画像生成処理 ◇◇◇

function drawFractal() {
    const result = imageToFractal(image, shape, count, isFill, isStroke, opacity);

    resultCanvas.width = result.width;
    resultCanvas.height = result.height;
    resultContext.drawImage(result, 0, 0);
}

