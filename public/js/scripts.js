// alert("JavaScript is working!");
let authorLinks = document.querySelectorAll("a.author-link");

for (authorLink of authorLinks) {
  authorLink.addEventListener("click", getAuthorInfo);
}

async function getAuthorInfo(e) {
    e.preventDefault();
  let url = `/quotes/author/${this.id}`;
  let resp = await fetch(url);
  let data = await resp.json();
  // console.log(data);
  let authorInfo = document.getElementById("authorInfo");
  authorInfo.innerHTML = `<h1> ${data[0].firstName}
                                 ${data[0].lastName} </h1>`;
  authorInfo.innerHTML += `<img src="${data[0].portrait}" width="200"><br>`;

  var myModal = new bootstrap.Modal(document.getElementById("authorModal"));
  myModal.show();
}
