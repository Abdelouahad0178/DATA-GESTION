document.addEventListener("DOMContentLoaded", function() {
  console.log("JavaScript is working!");
  // Ajoutez ici les fonctionnalités JavaScript
});

/* gestion de stock */
document.addEventListener("DOMContentLoaded", function() {
  const stockForm = document.getElementById("stockForm");
  const stockList = document.getElementById("stockList");

  stockForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const item = document.getElementById("item").value;
    const quantity = document.getElementById("quantity").value;
    
    const listItem = document.createElement("li");
    listItem.textContent = `${item} - Quantité: ${quantity}`;
    stockList.appendChild(listItem);

    stockForm.reset();
  });
});
