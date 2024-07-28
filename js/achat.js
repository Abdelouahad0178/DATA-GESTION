document.addEventListener("DOMContentLoaded", function() {
  const achatForm = document.getElementById("achatForm");
  const achatTable = document.getElementById("achatTable").getElementsByTagName("tbody")[0];
  const searchInput = document.getElementById("search");
  const searchTypeSelect = document.getElementById("searchType");
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");
  const filterButton = document.getElementById("filterButton");
  const searchResult = document.getElementById("searchResult");
  const printButton = document.getElementById("printMenuButton");
  const showFormButton = document.getElementById("showFormButton");
  const searchMenuButton = document.getElementById("searchMenuButton");
  const filterMenuButton = document.getElementById("filterMenuButton");
  const editMenuButton = document.getElementById("editMenuButton");
  const deleteMenuButton = document.getElementById("deleteMenuButton");
  const formSection = document.getElementById("formSection");
  const searchSection = document.getElementById("searchSection");
  const filterSection = document.getElementById("filterSection");
  const editSection = document.getElementById("editSection");
  const deleteSection = document.getElementById("deleteSection");
  const editSelect = document.getElementById("editSelect");
  const deleteSelect = document.getElementById("deleteSelect");
  let currentEditIndex = null;
  let searchValue = ''; // Variable to store the search value
  let isFiltered = false;

  function toggleSection(section) {
    const sections = [formSection, searchSection, filterSection, editSection, deleteSection];
    sections.forEach(sec => sec.classList.add('hidden'));
    section.classList.remove('hidden');
  }

  showFormButton.addEventListener("click", () => {
    toggleSection(formSection);
  });

  searchMenuButton.addEventListener("click", () => {
    toggleSection(searchSection);
  });

  filterMenuButton.addEventListener("click", () => {
    toggleSection(filterSection);
  });

  editMenuButton.addEventListener("click", () => {
    populateSelect(editSelect);
    toggleSection(editSection);
  });

  deleteMenuButton.addEventListener("click", () => {
    populateSelect(deleteSelect);
    toggleSection(deleteSection);
  });

  function populateSelect(selectElement) {
    const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    selectElement.innerHTML = '';
    purchases.forEach((purchase, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${purchase.item} - ${purchase.supplier}`;
      selectElement.appendChild(option);
    });
  }

  function loadPurchases() {
    const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    purchases.forEach((purchase, index) => {
      addPurchaseToTable(purchase, index);
    });
  }

  function savePurchases(purchases) {
    localStorage.setItem('purchases', JSON.stringify(purchases));
  }

  function addPurchaseToTable(purchase, index) {
    const row = achatTable.insertRow();
    row.setAttribute('data-index', index);
    row.insertCell(0).textContent = purchase.ref || '';
    row.insertCell(1).textContent = purchase.item || '';
    row.insertCell(2).textContent = purchase.supplier || '';
    row.insertCell(3).textContent = purchase.quantity || 0;
    row.insertCell(4).textContent = (purchase.price !== undefined && purchase.price !== null) ? purchase.price.toFixed(2) : '0.00';
    row.insertCell(5).textContent = purchase.date || '';
    row.insertCell(6).textContent = (purchase.quantity !== undefined && purchase.quantity !== null && purchase.price !== undefined && purchase.price !== null) ? (purchase.quantity * purchase.price).toFixed(2) : '0.00';

    const actionsCell = row.insertCell(7);
    actionsCell.classList.add('no-print');
    const editButton = document.createElement('button');
    editButton.textContent = 'Modifier';
    editButton.classList.add('actionButton');
    editButton.addEventListener('click', () => editPurchase(index));
    actionsCell.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Supprimer';
    deleteButton.classList.add('actionButton');
    deleteButton.addEventListener('click', () => deletePurchase(index));
    actionsCell.appendChild(deleteButton);
  }

  function clearTable() {
    achatTable.innerHTML = '';
  }

  function resetForm() {
    achatForm.reset();
    currentEditIndex = null;
    document.getElementById("submitButton").textContent = "Ajouter";
  }

  achatForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const ref = document.getElementById("ref").value;
    const item = document.getElementById("item").value;
    const supplier = document.getElementById("supplier").value;
    const quantity = parseFloat(document.getElementById("quantity").value) || 0;
    const price = parseFloat(document.getElementById("price").value) || 0;
    const date = document.getElementById("date").value;

    const purchase = { ref, item, supplier, quantity, price, date };
    const purchases = JSON.parse(localStorage.getItem('purchases')) || [];

    if (currentEditIndex !== null) {
      purchases[currentEditIndex] = purchase;
    } else {
      purchases.push(purchase);
    }

    savePurchases(purchases);
    updateStock(purchases);
    clearTable();
    loadPurchases();
    resetForm();
  });

  function editPurchase(index) {
    const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    const purchase = purchases[index];

    document.getElementById("ref").value = purchase.ref;
    document.getElementById("item").value = purchase.item;
    document.getElementById("supplier").value = purchase.supplier;
    document.getElementById("quantity").value = purchase.quantity;
    document.getElementById("price").value = purchase.price;
    document.getElementById("date").value = purchase.date;

    currentEditIndex = index;
    document.getElementById("submitButton").textContent = "Mettre à jour";
  }

  editSelect.addEventListener('change', function() {
    const index = editSelect.value;
    editPurchase(index);
    toggleSection(formSection);
  });

  function deletePurchase(index) {
    const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    purchases.splice(index, 1);
    savePurchases(purchases);
    updateStock(purchases);
    clearTable();
    loadPurchases();
  }

  deleteSelect.addEventListener('change', function() {
    const index = deleteSelect.value;
    deletePurchase(index);
    toggleSection(deleteSection);
  });

  function updateStock(purchases) {
    const stockItems = purchases.map(purchase => ({
      ref: purchase.ref,
      supplier: purchase.supplier,
      item: purchase.item,
      quantity: purchase.quantity,
      date: purchase.date
    }));
    localStorage.setItem('stockItems', JSON.stringify(stockItems));
  }

  function applySearchAndFilter() {
    const searchTerm = searchInput.value.toLowerCase();
    const searchType = searchTypeSelect.value;
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    clearTable();

    let filteredPurchases = purchases.filter(purchase => {
      const matchesSearchTerm = purchase[searchType].toLowerCase().includes(searchTerm);
      const purchaseDate = new Date(purchase.date);
      const isWithinDateRange = (!startDateInput.value || purchaseDate >= startDate) && (!endDateInput.value || purchaseDate <= endDate);

      return matchesSearchTerm && isWithinDateRange;
    });

    filteredPurchases.forEach((purchase, index) => {
      addPurchaseToTable(purchase, index);
    });

    if (searchTerm) {
      searchValue = filteredPurchases.length > 0 ? filteredPurchases[0][searchType] : searchTerm;
      searchResult.textContent = `${searchType === 'item' ? 'Article' : 'Fournisseur'}: ${searchValue}`;
    } else {
      searchResult.textContent = '';
    }

    if (startDateInput.value || endDateInput.value) {
      searchResult.textContent += ` De: ${startDateInput.value || 'N/A'} À: ${endDateInput.value || 'N/A'}`;
    }
  }

  function resetFilters() {
    searchInput.value = '';
    startDateInput.value = '';
    endDateInput.value = '';
    searchResult.textContent = '';
    isFiltered = false;
    filterButton.textContent = 'Filtrer';
    clearTable();
    loadPurchases();
  }

  filterButton.addEventListener('click', function() {
    if (isFiltered) {
      resetFilters();
    } else {
      isFiltered = true;
      filterButton.textContent = 'No-Filtre';
      applySearchAndFilter();
    }
  });

  searchInput.addEventListener('input', function() {
    if (searchInput.value === '') {
      resetFilters();
    } else {
      applySearchAndFilter();
    }
  });

  searchTypeSelect.addEventListener('change', function() {
    applySearchAndFilter();
  });

  startDateInput.addEventListener('change', function() {
    if (isFiltered) {
      applySearchAndFilter();
    }
  });

  endDateInput.addEventListener('change', function() {
    if (isFiltered) {
      applySearchAndFilter();
    }
  });

  printButton.addEventListener('click', function() {
    const printWindow = window.open('', '', 'height=500, width=800');
    printWindow.document.write('<html><head><title>Liste des Achats</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('table { width: 100%; border-collapse: collapse; }');
    printWindow.document.write('th, td { padding: 8px; border: 1px solid black; }');
    printWindow.document.write('thead { background-color: #4CAF50; color: white; }');
    printWindow.document.write('th:nth-child(8), td:nth-child(8) { display: none; }'); // Hide Actions column
    printWindow.document.write('</style></head><body>');
    printWindow.document.write('<h1>Liste des Achats</h1>');
    if (searchValue) {
      printWindow.document.write(`<p>${searchTypeSelect.value === 'item' ? 'Article' : 'Fournisseur'}: ${searchValue}</p>`);
    }
    if (startDateInput.value || endDateInput.value) {
      printWindow.document.write(`<p>De: ${startDateInput.value || 'N/A'} À: ${endDateInput.value || 'N/A'}</p>`);
    }
    printWindow.document.write(document.getElementById("achatTable").outerHTML);
    printWindow.document.close();
    printWindow.print();
  });

  loadPurchases();
});
