
const inputFileDom = document.querySelector("#input-file");
const resultCanvas = document.querySelector("#result");
const resultContext = resultCanvas.getContext("2d");

inputFileDom.onchange = e => {
    const imageFile = e.target.files[0];
    
    if (!imageFile.type.startsWith("image")) {
        alert("画像ファイルを選択してください。");
        return;
    }

    const image = new Image();
    image.onload = () => {
        drawFractal(image);
        URL.revokeObjectURL(image.src);
    };
    image.onerror = () => {
        alert("画像の読み込みに失敗しました。");
        URL.revokeObjectURL(image.src);
    };
    image.src = URL.createObjectURL(imageFile);
};

{
    const image = new Image();
    // image.src = "image/野獣先輩.png";
    // image.src = "image/0000000000000000000000000000000000000000000000000000000000000000000.png";
    // image.src = "image/test.png";
    image.src = "Lenna.png";
    image.onload = () => {
        drawFractal(image);
    };
}

function drawFractal(image) {
    let count = 1000;
    let isStroke = true;
    // let isStroke = false;
    // let isFill = true;
    let isFill = false;
    let shape = "rect";
    // let shape = "circle";
    let opacity = 1;

    const result = imageToFractal(image, shape, count, isFill, isStroke, opacity);

    resultCanvas.width = result.width;
    resultCanvas.height = result.height;
    resultContext.drawImage(result, 0, 0);
}

