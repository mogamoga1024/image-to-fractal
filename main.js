
// ◇◇◇ DOM ◇◇◇

const inputFileDom = document.querySelector("#input-file");
const radioRectDom = document.querySelector("#radio-rect");
const radioCircleDom = document.querySelector("#radio-circle");
const resultCanvas = document.querySelector("#result");
const resultContext = resultCanvas.getContext("2d");

radioRectDom.checked = true;

// ◇◇◇ 変数 ◇◇◇

let image = null;
let count = 500;
let isStroke = true;
// let isStroke = false;
let isFill = true;
// let isFill = false;
let shape = "rect";
// let shape = "circle";
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

// ◇◇◇ フラクタル画像生成処理 ◇◇◇

function drawFractal() {
    const result = imageToFractal(image, shape, count, isFill, isStroke, opacity);

    resultCanvas.width = result.width;
    resultCanvas.height = result.height;
    resultContext.drawImage(result, 0, 0);
}

