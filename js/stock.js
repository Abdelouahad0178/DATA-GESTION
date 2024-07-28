document.addEventListener("DOMContentLoaded", function() {
  const stockForm = document.getElementById("stockForm");
  const stockTable = document.getElementById("stockTable").getElementsByTagName("tbody")[0];
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
    const stockItems = JSON.parse(localStorage.getItem('stockItems')) || [];
    selectElement.innerHTML = '';
    stockItems.forEach((stockItem, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${stockItem.item} - ${stockItem.supplier}`;
      selectElement.appendChild(option);
    });
  }

  function loadStockItems() {
    const stockItems = JSON.parse(localStorage.getItem('stockItems')) || [];
    stockItems.forEach((stockItem, index) => {
      addStockItemToTable(stockItem, index);
    });
  }

  function saveStockItems(stockItems) {
    localStorage.setItem('stockItems', JSON.stringify(stockItems));
  }

  function addStockItemToTable(stockItem, index) {
    const row = stockTable.insertRow();
    row.setAttribute('data-index', index);
    row.insertCell(0).textContent = stockItem.ref || '';
    row.insertCell(1).textContent = stockItem.supplier || '';
    row.insertCell(2).textContent = stockItem.item || '';
    row.insertCell(3).textContent = stockItem.quantity || 0;
    row.insertCell(4).textContent = stockItem.date || '';

    const actionsCell = row.insertCell(5);
    actionsCell.classList.add('no-print');
    const editButton = document.createElement('button');
    editButton.textContent = 'Modifier';
    editButton.classList.add('actionButton');
    editButton.addEventListener('click', () => editStockItem(index));
    actionsCell.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Supprimer';
    deleteButton.classList.add('actionButton');
    deleteButton.addEventListener('click', () => deleteStockItem(index));
    actionsCell.appendChild(deleteButton);
  }

  function clearTable() {
    stockTable.innerHTML = '';
  }

  function resetForm() {
    stockForm.reset();
    currentEditIndex = null;
    document.getElementById("submitButton").textContent = "Ajouter";
  }

  stockForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const ref = document.getElementById("ref").value;
    const supplier = document.getElementById("supplier").value;
    const item = document.getElementById("item").value;
    const quantity = parseFloat(document.getElementById("quantity").value) || 0;
    const date = document.getElementById("date").value;

    const stockItem = { ref, supplier, item, quantity, date };
    const stockItems = JSON.parse(localStorage.getItem('stockItems')) || [];

    if (currentEditIndex !== null) {
      stockItems[currentEditIndex] = stockItem;
    } else {
      stockItems.push(stockItem);
    }

    saveStockItems(stockItems);
    clearTable();
    loadStockItems();
    resetForm();
  });

  function editStockItem(index) {
    const stockItems = JSON.parse(localStorage.getItem('stockItems')) || [];
    const stockItem = stockItems[index];

    document.getElementById("ref").value = stockItem.ref;
    document.getElementById("supplier").value = stockItem.supplier;
    document.getElementById("item").value = stockItem.item;
    document.getElementById("quantity").value = stockItem.quantity;
    document.getElementById("date").value = stockItem.date;

    currentEditIndex = index;
    document.getElementById("submitButton").textContent = "Mettre à jour";
  }

  editSelect.addEventListener('change', function() {
    const index = editSelect.value;
    editStockItem(index);
    toggleSection(formSection);
  });

  function deleteStockItem(index) {
    const stockItems = JSON.parse(localStorage.getItem('stockItems')) || [];
    stockItems.splice(index, 1);
    saveStockItems(stockItems);
    clearTable();
    loadStockItems();
  }

  deleteSelect.addEventListener('change', function() {
    const index = deleteSelect.value;
    deleteStockItem(index);
    toggleSection(deleteSection);
  });

  function applySearchAndFilter() {
    const searchTerm = searchInput.value.toLowerCase();
    const searchType = searchTypeSelect.value;
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    const stockItems = JSON.parse(localStorage.getItem('stockItems')) || [];
    clearTable();

    let filteredStockItems = stockItems.filter(stockItem => {
      const matchesSearchTerm = stockItem[searchType].toLowerCase().includes(searchTerm);
      const stockItemDate = new Date(stockItem.date);
      const isWithinDateRange = (!startDateInput.value || stockItemDate >= startDate) && (!endDateInput.value || stockItemDate <= endDate);

      return matchesSearchTerm && isWithinDateRange;
    });

    filteredStockItems.forEach((stockItem, index) => {
      addStockItemToTable(stockItem, index);
    });

    if (searchTerm) {
      searchValue = filteredStockItems.length > 0 ? filteredStockItems[0][searchType] : searchTerm;
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
    loadStockItems();
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
    printWindow.document.write('<html><head><title>Liste des Stocks</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('table { width: 100%; border-collapse: collapse; }');
    printWindow.document.write('th, td { padding: 8px; border: 1px solid black; }');
    printWindow.document.write('thead { background-color: #4CAF50; color: white; }');
    printWindow.document.write('th:nth-child(6), td:nth-child(6) { display: none; }'); // Hide Actions column
    printWindow.document.write('</style></head><body>');
    printWindow.document.write('<h1>Liste des Stocks</h1>');
    if (searchValue) {
      printWindow.document.write(`<p>${searchTypeSelect.value === 'item' ? 'Article' : 'Fournisseur'}: ${searchValue}</p>`);
    }
    if (startDateInput && startDateInput.value || endDateInput && endDateInput.value) {
      printWindow.document.write(`<p>De: ${startDateInput.value || 'N/A'} À: ${endDateInput.value || 'N/A'}</p>`);
    }
    printWindow.document.write(document.getElementById("stockTable").outerHTML);
    printWindow.document.close();
    printWindow.print();
  });

  loadStockItems();
});
