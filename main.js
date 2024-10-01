
const resultCanvas = document.querySelector("#result");
const resultContext = resultCanvas.getContext("2d");

const image = new Image();
image.src = "image/野獣先輩.png";
image.onload = () => {
    main();
};

function main() {
    resultCanvas.width = image.naturalWidth;
    resultCanvas.height = image.naturalHeight;
    
    resultContext.drawImage(image, 0, 0);
}

