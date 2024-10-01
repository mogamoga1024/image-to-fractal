
const resultCanvas = document.querySelector("#result");
const resultContext = resultCanvas.getContext("2d");

const image = new Image();
image.src = "image/野獣先輩.png";
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
    // todo
}

