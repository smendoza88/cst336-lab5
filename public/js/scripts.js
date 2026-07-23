// alert("JavaScript is working!");
let authorLinks = document.querySelectorAll('a');
for (authorLink of authorLinks) {
    authorLink.addEventListener("click", getAuthorInfo);
}

function getAuthorInfo(){
    alert(this.id);
}