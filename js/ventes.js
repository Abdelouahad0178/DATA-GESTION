document.addEventListener("DOMContentLoaded", function() {
  const venteForm = document.getElementById("venteForm");
  const venteTable = document.getElementById("venteTable").getElementsByTagName("tbody")[0];
  const clientTypeSelect = document.getElementById("clientType");
  const factureTypeSelect = document.getElementById("factureType");
  const newClientForm = document.getElementById("newClientForm");
  const existingClientForm = document.getElementById("existingClientForm");
  const existingClientSelect = document.getElementById("existingClient");
  const newFactureForm = document.getElementById("newFactureForm");
  const existingFactureForm = document.getElementById("existingFactureForm");
  const existingFactureSelect = document.getElementById("existingFacture");
  const searchInput = document.getElementById("search");
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
    const ventes = JSON.parse(localStorage.getItem('ventes')) || [];
    selectElement.innerHTML = '';
    ventes.forEach((vente, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${vente.item} - ${vente.client}`;
      selectElement.appendChild(option);
    });
  }

  function loadClients() {
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    existingClientSelect.innerHTML = '<option value="" disabled selected>Choisir un client</option>';
    clients.forEach(client => {
      const option = document.createElement('option');
      option.value = client.name;
      option.textContent = client.name;
      existingClientSelect.appendChild(option);
    });
  }

  function loadFactures() {
    const factures = JSON.parse(localStorage.getItem('factures')) || [];
    existingFactureSelect.innerHTML = '<option value="" disabled selected>Choisir une facture</option>';
    factures.forEach(facture => {
      const option = document.createElement('option');
      option.value = facture.number;
      option.textContent = facture.number;
      existingFactureSelect.appendChild(option);
    });
  }

  function loadVentes() {
    const ventes = JSON.parse(localStorage.getItem('ventes')) || [];
    ventes.forEach((vente, index) => {
      addVenteToTable(vente, index);
    });
  }

  function saveVentes(ventes) {
    localStorage.setItem('ventes', JSON.stringify(ventes));
  }

  function addVenteToTable(vente, index) {
    const row = venteTable.insertRow();
    row.setAttribute('data-index', index);
    row.insertCell(0).textContent = vente.client || '';
    row.insertCell(1).textContent = vente.facture || '';
    row.insertCell(2).textContent = vente.item || '';
    row.insertCell(3).textContent = vente.quantity || 0;
    row.insertCell(4).textContent = (vente.price !== undefined && vente.price !== null) ? vente.price.toFixed(2) : '0.00';
    row.insertCell(5).textContent = (vente.quantity !== undefined && vente.quantity !== null && vente.price !== undefined && vente.price !== null) ? (vente.quantity * vente.price).toFixed(2) : '0.00';

    const actionsCell = row.insertCell(6);
    actionsCell.classList.add('no-print');
    const editButton = document.createElement('button');
    editButton.textContent = 'Modifier';
    editButton.classList.add('actionButton');
    editButton.addEventListener('click', () => editVente(index));
    actionsCell.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Supprimer';
    deleteButton.classList.add('actionButton');
    deleteButton.addEventListener('click', () => deleteVente(index));
    actionsCell.appendChild(deleteButton);
  }

  function clearTable() {
    venteTable.innerHTML = '';
  }

  function resetForm() {
    venteForm.reset();
    currentEditIndex = null;
    document.getElementById("submitButton").textContent = "Ajouter";
  }

  function updateStock(item, quantity) {
    const stock = JSON.parse(localStorage.getItem('stockItems')) || [];
    const stockItem = stock.find(stockItem => stockItem.item === item);
    if (stockItem) {
      stockItem.quantity -= quantity;
    }
    localStorage.setItem('stockItems', JSON.stringify(stock));
  }

  venteForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const clientType = clientTypeSelect.value;
    const factureType = factureTypeSelect.value;
    const item = document.getElementById("item").value;
    const quantity = parseFloat(document.getElementById("quantity").value) || 0;
    const price = parseFloat(document.getElementById("price").value) || 0;
    let client, facture;

    if (clientType === 'new') {
      client = document.getElementById("newClientName").value;
      const clients = JSON.parse(localStorage.getItem('clients')) || [];
      clients.push({ name: client });
      localStorage.setItem('clients', JSON.stringify(clients));
    } else {
      client = existingClientSelect.value;
    }

    if (factureType === 'new') {
      facture = document.getElementById("newFactureNumber").value;
      const factures = JSON.parse(localStorage.getItem('factures')) || [];
      factures.push({ number: facture });
      localStorage.setItem('factures', JSON.stringify(factures));
    } else {
      facture = existingFactureSelect.value;
    }

    const vente = { client, facture, item, quantity, price };
    const ventes = JSON.parse(localStorage.getItem('ventes')) || [];

    if (currentEditIndex !== null) {
      ventes[currentEditIndex] = vente;
    } else {
      ventes.push(vente);
    }

    saveVentes(ventes);
    updateStock(item, quantity);
    clearTable();
    loadVentes();
    resetForm();
  });

  clientTypeSelect.addEventListener('change', function() {
    if (clientTypeSelect.value === 'new') {
      newClientForm.classList.remove('hidden');
      existingClientForm.classList.add('hidden');
    } else {
      newClientForm.classList.add('hidden');
      existingClientForm.classList.remove('hidden');
    }
  });

  factureTypeSelect.addEventListener('change', function() {
    if (factureTypeSelect.value === 'new') {
      newFactureForm.classList.remove('hidden');
      existingFactureForm.classList.add('hidden');
    } else {
      newFactureForm.classList.add('hidden');
      existingFactureForm.classList.remove('hidden');
    }
  });

  function editVente(index) {
    const ventes = JSON.parse(localStorage.getItem('ventes')) || [];
    const vente = ventes[index];

    if (vente.clientType === 'new') {
      clientTypeSelect.value = 'new';
      newClientForm.classList.remove('hidden');
      existingClientForm.classList.add('hidden');
      document.getElementById("newClientName").value = vente.client;
    } else {
      clientTypeSelect.value = 'existing';
      newClientForm.classList.add('hidden');
      existingClientForm.classList.remove('hidden');
      existingClientSelect.value = vente.client;
    }

    if (vente.factureType === 'new') {
      factureTypeSelect.value = 'new';
      newFactureForm.classList.remove('hidden');
      existingFactureForm.classList.add('hidden');
      document.getElementById("newFactureNumber").value = vente.facture;
    } else {
      factureTypeSelect.value = 'existing';
      newFactureForm.classList.add('hidden');
      existingFactureForm.classList.remove('hidden');
      existingFactureSelect.value = vente.facture;
    }

    document.getElementById("item").value = vente.item;
    document.getElementById("quantity").value = vente.quantity;
    document.getElementById("price").value = vente.price;

    currentEditIndex = index;
    document.getElementById("submitButton").textContent = "Mettre à jour";
  }

  editSelect.addEventListener('change', function() {
    const index = editSelect.value;
    editVente(index);
    toggleSection(formSection);
  });

  function deleteVente(index) {
    const ventes = JSON.parse(localStorage.getItem('ventes')) || [];
    ventes.splice(index, 1);
    saveVentes(ventes);
    clearTable();
    loadVentes();
  }

  deleteSelect.addEventListener('change', function() {
    const index = deleteSelect.value;
    deleteVente(index);
    toggleSection(deleteSection);
  });

  function applySearchAndFilter() {
    const searchTerm = searchInput.value.toLowerCase();
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    const ventes = JSON.parse(localStorage.getItem('ventes')) || [];
    clearTable();

    let filteredVentes = ventes.filter(vente => {
      const matchesSearchTerm = vente.item.toLowerCase().includes(searchTerm) || vente.client.toLowerCase().includes(searchTerm);
      const venteDate = new Date(vente.date);
      const isWithinDateRange = (!startDateInput.value || venteDate >= startDate) && (!endDateInput.value || venteDate <= endDate);

      return matchesSearchTerm && isWithinDateRange;
    });

    filteredVentes.forEach((vente, index) => {
      addVenteToTable(vente, index);
    });

    if (searchTerm) {
      searchValue = filteredVentes.length > 0 ? filteredVentes[0].item : searchTerm;
      searchResult.textContent = `Recherche: ${searchValue}`;
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
    loadVentes();
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
    printWindow.document.write('<html><head><title>Liste des Ventes</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('table { width: 100%; border-collapse: collapse; }');
    printWindow.document.write('th, td { padding: 8px; border: 1px solid black; }');
    printWindow.document.write('thead { background-color: #4CAF50; color: white; }');
    printWindow.document.write('th:nth-child(7), td:nth-child(7) { display: none; }'); // Hide Actions column
    printWindow.document.write('</style></head><body>');
    printWindow.document.write('<h1>Liste des Ventes</h1>');
    if (searchValue) {
      printWindow.document.write(`<p>Recherche: ${searchValue}</p>`);
    }
    if (startDateInput.value || endDateInput.value) {
      printWindow.document.write(`<p>De: ${startDateInput.value || 'N/A'} À: ${endDateInput.value || 'N/A'}</p>`);
    }
    printWindow.document.write(document.getElementById("venteTable").outerHTML);
    printWindow.document.close();
    printWindow.print();
  });

  loadClients();
  loadFactures();
  loadVentes();
});
