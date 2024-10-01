
const resultCanvas = document.querySelector("#result");
const resultContext = resultCanvas.getContext("2d");

const image = new Image();
// image.src = "image/野獣先輩.png";
// image.src = "image/0000000000000000000000000000000000000000000000000000000000000000000.png";
image.src = "image/test.png";

image.onload = () => {
    let count = 300;
    // let isStroke = true;
    let isStroke = false;
    let isFill = true;
    // let shape = "rect";
    let shape = "circle";

    const result = imageToFractal(image, shape, count, isFill, isStroke);

    resultCanvas.width = result.width;
    resultCanvas.height = result.height;
    resultContext.drawImage(result, 0, 0);
};



