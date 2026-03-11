function getRandomColor(){
    const randomNum = Math.floor(Math.random()*16777216);
    const hexString = randomNum.toString(16);
    const paddedHex = hexString.padStart(6,"0");
    return `#${paddedHex}`;
}

const colorDisplay = document.getElementById("color-code"); 
const randomBtn = document.getElementById("random-btn");
const copyBtn = document.getElementById("copy-btn");
const toast = document.getElementById("toast");

function changecolor(){
    const newColor = getRandomColor();
    document.body.style.backgroundColor = newColor;
    colorDisplay.textContent = newColor.toUpperCase();
}

function copyColor(){
    const color = colorDisplay.textContent;
    navigator.clipboard.writeText(color).then(()=>{
        toast.classList.add("show");
        setTimeout(()=>toast.classList.remove("show"),1500);
    });
}

randomBtn.addEventListener("click",changecolor);
copyBtn.addEventListener("click",copyColor);

colorDisplay.addEventListener("click",copyColor);

document.addEventListener("keydown",(e)=>{
    if(e.code=="space"){
        e.preventDefault();
        changecolor();
    }
});