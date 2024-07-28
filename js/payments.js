document.addEventListener("DOMContentLoaded", function() {
  const clientSelect = document.getElementById("client");
  const invoiceSelect = document.getElementById("invoice");
  const paymentForm = document.getElementById("paymentForm");
  const paymentTable = document.getElementById("paymentTable").getElementsByTagName("tbody")[0];
  const printButton = document.getElementById("printButton");
  const totalBalanceElement = document.getElementById("totalBalance");
  const showFormButton = document.getElementById("showFormButton");
  const editMenuButton = document.getElementById("editMenuButton");
  const deleteMenuButton = document.getElementById("deleteMenuButton");
  const formSection = document.getElementById("formSection");
  const editSection = document.getElementById("editSection");
  const deleteSection = document.getElementById("deleteSection");
  const editClientSelect = document.getElementById("editClientSelect");
  const editInvoiceSelect = document.getElementById("editInvoiceSelect");
  const deleteClientSelect = document.getElementById("deleteClientSelect");
  const deleteInvoiceSelect = document.getElementById("deleteInvoiceSelect");
  const searchClientInput = document.getElementById("searchClientInput");
  let currentPayments = [];
  let currentEditIndex = null;

  function toggleSection(section) {
    const sections = [formSection, editSection, deleteSection];
    sections.forEach(sec => sec.classList.add('hidden'));
    section.classList.remove('hidden');
  }

  showFormButton.addEventListener("click", () => {
    toggleSection(formSection);
  });

  editMenuButton.addEventListener("click", () => {
    populateSelect(editClientSelect);
    toggleSection(editSection);
  });

  deleteMenuButton.addEventListener("click", () => {
    populateSelect(deleteClientSelect);
    toggleSection(deleteSection);
  });

  function populateSelect(selectElement) {
    const factures = JSON.parse(localStorage.getItem('factures')) || [];
    const clients = [...new Set(factures.map(facture => facture.clientNom))];
    selectElement.innerHTML = '';
    clients.forEach(client => {
      const option = document.createElement('option');
      option.value = client;
      option.textContent = client;
      selectElement.appendChild(option);
    });
  }

  function populateInvoiceSelect(client, selectElement) {
    const factures = JSON.parse(localStorage.getItem('factures')) || [];
    const clientInvoices = factures.filter(facture => facture.clientNom === client);
    selectElement.innerHTML = '<option value="" disabled selected>Choisir un N° Facture</option>';
    clientInvoices.forEach(invoice => {
      const option = document.createElement("option");
      option.value = JSON.stringify(invoice);
      option.textContent = invoice.numero;
      selectElement.appendChild(option);
    });
  }

  function loadClients() {
    const factures = JSON.parse(localStorage.getItem('factures')) || [];
    const clients = [...new Set(factures.map(facture => facture.clientNom))];
    clients.forEach(client => {
      const option = document.createElement("option");
      option.value = client;
      option.textContent = client;
      clientSelect.appendChild(option);
    });
  }

  function loadInvoicesForClient(client) {
    populateInvoiceSelect(client, invoiceSelect);
  }

  function savePayments(payments) {
    localStorage.setItem('payments', JSON.stringify(payments));
  }

  function addPaymentToTable(payment, index) {
    const row = paymentTable.insertRow();
    row.setAttribute('data-index', index);
    row.insertCell(0).textContent = payment.client || '';
    row.insertCell(1).textContent = payment.invoiceNumber || '';
    row.insertCell(2).textContent = payment.total || '0.00';
    row.insertCell(3).textContent = payment.paidAmount || '0.00';
    row.insertCell(4).textContent = payment.balance || '0.00';

    const actionsCell = row.insertCell(5);
    const editButton = document.createElement('button');
    editButton.textContent = 'Modifier';
    editButton.addEventListener('click', () => editPayment(index));
    actionsCell.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Supprimer';
    deleteButton.addEventListener('click', () => deletePayment(index));
    actionsCell.appendChild(deleteButton);
  }

  function clearTable(table) {
    table.innerHTML = '';
  }

  function resetForm() {
    paymentForm.reset();
    invoiceSelect.innerHTML = '<option value="" disabled selected>Choisir un N° Facture</option>';
    currentEditIndex = null;
    document.getElementById("addPaymentButton").textContent = "Ajouter";
  }

  function deletePayment(index) {
    currentPayments.splice(index, 1);
    savePayments(currentPayments);
    filterPaymentsByClient(clientSelect.value);
    updateTotalBalance(clientSelect.value);
  }

  function editPayment(index) {
    const payment = currentPayments[index];
    const client = payment.client;

    clientSelect.value = client;
    loadInvoicesForClient(client);

    document.getElementById("invoice").value = JSON.stringify(payment);
    document.getElementById("paidAmount").value = payment.paidAmount;

    currentEditIndex = index;
    document.getElementById("addPaymentButton").textContent = "Mettre à jour";
  }

  clientSelect.addEventListener('change', function() {
    const client = clientSelect.value;
    loadInvoicesForClient(client);
    filterPaymentsByClient(client);
  });

  paymentForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const invoice = JSON.parse(invoiceSelect.value);
    const paidAmount = parseFloat(document.getElementById("paidAmount").value) || 0;
    const total = parseFloat(invoice.totalTTC).toFixed(2);
    const balance = (total - paidAmount).toFixed(2);

    const payment = {
      client: invoice.clientNom,
      invoiceNumber: invoice.numero,
      total: total,
      paidAmount: paidAmount.toFixed(2),
      balance: balance
    };

    if (currentEditIndex !== null) {
      currentPayments[currentEditIndex] = payment;
    } else {
      currentPayments.push(payment);
    }

    savePayments(currentPayments);
    filterPaymentsByClient(invoice.clientNom);
    resetForm();
    updateTotalBalance(invoice.clientNom);
  });

  printButton.addEventListener('click', function() {
    window.print();
  });

  searchClientInput.addEventListener("input", filterPayments);

  editClientSelect.addEventListener('change', function() {
    const client = editClientSelect.value;
    populateInvoiceSelect(client, editInvoiceSelect);
  });

  deleteClientSelect.addEventListener('change', function() {
    const client = deleteClientSelect.value;
    populateInvoiceSelect(client, deleteInvoiceSelect);
  });

  editInvoiceSelect.addEventListener('change', function() {
    const invoice = JSON.parse(editInvoiceSelect.value);
    editPayment(currentPayments.findIndex(payment => payment.invoiceNumber === invoice.numero && payment.client === invoice.clientNom));
    toggleSection(formSection);
  });

  deleteInvoiceSelect.addEventListener('change', function() {
    const invoice = JSON.parse(deleteInvoiceSelect.value);
    deletePayment(currentPayments.findIndex(payment => payment.invoiceNumber === invoice.numero && payment.client === invoice.clientNom));
    toggleSection(deleteSection);
  });

  function loadPayments() {
    currentPayments = JSON.parse(localStorage.getItem('payments')) || [];
    filterPayments();
  }

  function filterPayments() {
    const searchTerm = searchClientInput.value.toLowerCase();
    clearTable(paymentTable);
    const filteredPayments = currentPayments.filter(payment => payment.client.toLowerCase().includes(searchTerm));
    filteredPayments.forEach((payment, i) => addPaymentToTable(payment, i));
    updateTotalBalance();
  }

  function filterPaymentsByClient(client) {
    clearTable(paymentTable);
    const filteredPayments = currentPayments.filter(payment => payment.client === client);
    filteredPayments.forEach((payment, i) => addPaymentToTable(payment, i));
    updateTotalBalance(client);
  }

  function updateTotalBalance(client) {
    const filteredPayments = currentPayments.filter(payment => payment.client === client);
    const totalBalance = filteredPayments.reduce((sum, payment) => sum + parseFloat(payment.balance), 0);
    totalBalanceElement.textContent = `Total à payer: ${totalBalance.toFixed(2)}`;
  }

  loadClients();
  loadPayments();
});
