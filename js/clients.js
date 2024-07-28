document.addEventListener("DOMContentLoaded", function() {
  const clientForm = document.getElementById("clientForm");
  const editClientForm = document.getElementById("editClientForm");
  const deleteClientForm = document.getElementById("deleteClientForm");
  const addClientButton = document.getElementById("addClientButton");
  const editClientButton = document.getElementById("editClientButton");
  const deleteClientButton = document.getElementById("deleteClientButton");
  const printClientButton = document.getElementById("printClientButton");
  const formSection = document.getElementById("formSection");
  const editSection = document.getElementById("editSection");
  const deleteSection = document.getElementById("deleteSection");
  const clientList = document.getElementById("clientList");
  const searchInput = document.getElementById("searchInput");
  const printButton = document.getElementById("printButton");

  function toggleSection(section) {
    const sections = [formSection, editSection, deleteSection];
    sections.forEach(sec => sec.classList.add('hidden'));
    if (section) section.classList.remove('hidden');
  }

  addClientButton.addEventListener("click", () => {
    toggleSection(formSection);
  });

  editClientButton.addEventListener("click", () => {
    populateEditSelect();
    toggleSection(editSection);
  });

  deleteClientButton.addEventListener("click", () => {
    populateDeleteSelect();
    toggleSection(deleteSection);
  });

  printClientButton.addEventListener("click", () => {
    window.print();
  });

  clientForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const client = {
      name: document.getElementById("clientName").value,
      address: document.getElementById("clientAddress").value,
      phone: document.getElementById("clientPhone").value,
      email: document.getElementById("clientEmail").value,
      taxID: document.getElementById("clientTaxID").value,
      ice: document.getElementById("clientICE").value,
      paymentMethod: document.getElementById("paymentMethod").value,
      notes: document.getElementById("additionalNotes").value
    };

    let clients = JSON.parse(localStorage.getItem('clients')) || [];
    clients.push(client);
    localStorage.setItem('clients', JSON.stringify(clients));

    alert("Client ajouté avec succès !");
    clientForm.reset();
    toggleSection(null);
    loadClients();
  });

  editClientForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const select = document.getElementById("editClientSelect");
    const selectedIndex = select.selectedIndex;
    if (selectedIndex < 0) return;
    const clientId = select.options[selectedIndex].value;

    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    const client = clients.find(client => client.name === clientId);
    if (!client) return;

    client.name = document.getElementById("editClientName").value;
    client.address = document.getElementById("editClientAddress").value;
    client.phone = document.getElementById("editClientPhone").value;
    client.email = document.getElementById("editClientEmail").value;
    client.taxID = document.getElementById("editClientTaxID").value;
    client.ice = document.getElementById("editClientICE").value;
    client.paymentMethod = document.getElementById("editPaymentMethod").value;
    client.notes = document.getElementById("editAdditionalNotes").value;

    localStorage.setItem('clients', JSON.stringify(clients));

    alert("Client mis à jour avec succès !");
    toggleSection(null);
    loadClients();
  });

  deleteClientForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const select = document.getElementById("deleteClientSelect");
    const selectedIndex = select.selectedIndex;
    if (selectedIndex < 0) return;
    const clientId = select.options[selectedIndex].value;

    let clients = JSON.parse(localStorage.getItem('clients')) || [];
    clients = clients.filter(client => client.name !== clientId);
    localStorage.setItem('clients', JSON.stringify(clients));

    alert("Client supprimé avec succès !");
    toggleSection(null);
    loadClients();
  });

  function loadClients() {
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    clientList.innerHTML = '';
    clients.forEach(client => {
      const clientDiv = document.createElement("div");
      clientDiv.classList.add("client-info");

      let clientHTML = `
        <h3>${client.name}</h3>
        <p>Adresse: ${client.address}</p>
        <p>Téléphone: ${client.phone}</p>
        <p>Email: ${client.email}</p>
        <p>Numéro d'identification fiscale: ${client.taxID}</p>
        <p>ICE: ${client.ice}</p>
        <p>Mode de paiement: ${client.paymentMethod}</p>
        <p>Notes: ${client.notes}</p>
      `;

      clientDiv.innerHTML = clientHTML;
      clientList.appendChild(clientDiv);
    });
  }

  function populateEditSelect() {
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    const select = document.getElementById("editClientSelect");
    select.innerHTML = '';
    clients.forEach(client => {
      const option = document.createElement("option");
      option.value = client.name;
      option.textContent = client.name;
      select.appendChild(option);
    });

    select.addEventListener("change", function() {
      const selectedIndex = select.selectedIndex;
      if (selectedIndex < 0) return;
      const clientId = select.options[selectedIndex].value;

      const client = clients.find(client => client.name === clientId);
      if (!client) return;

      document.getElementById("editClientName").value = client.name;
      document.getElementById("editClientAddress").value = client.address;
      document.getElementById("editClientPhone").value = client.phone;
      document.getElementById("editClientEmail").value = client.email;
      document.getElementById("editClientTaxID").value = client.taxID;
      document.getElementById("editClientICE").value = client.ice;
      document.getElementById("editPaymentMethod").value = client.paymentMethod;
      document.getElementById("editAdditionalNotes").value = client.notes;
    });

    select.dispatchEvent(new Event("change"));
  }

  function populateDeleteSelect() {
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    const select = document.getElementById("deleteClientSelect");
    select.innerHTML = '';
    clients.forEach(client => {
      const option = document.createElement("option");
      option.value = client.name;
      option.textContent = client.name;
      select.appendChild(option);
    });
  }

  function filterClients() {
    const searchTerm = searchInput.value.toLowerCase();
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    clientList.innerHTML = '';
    clients.forEach(client => {
      if (client.name.toLowerCase().includes(searchTerm) ||
          client.address.toLowerCase().includes(searchTerm) ||
          client.phone.toLowerCase().includes(searchTerm) ||
          client.email.toLowerCase().includes(searchTerm) ||
          client.taxID.toLowerCase().includes(searchTerm) ||
          client.ice.toLowerCase().includes(searchTerm) ||
          client.paymentMethod.toLowerCase().includes(searchTerm) ||
          (client.notes && client.notes.toLowerCase().includes(searchTerm))) {
        const clientDiv = document.createElement("div");
        clientDiv.classList.add("client-info");

        let clientHTML = `
          <h3>${client.name}</h3>
          <p>Adresse: ${client.address}</p>
          <p>Téléphone: ${client.phone}</p>
          <p>Email: ${client.email}</p>
          <p>Numéro d'identification fiscale: ${client.taxID}</p>
          <p>ICE: ${client.ice}</p>
          <p>Mode de paiement: ${client.paymentMethod}</p>
          <p>Notes: ${client.notes}</p>
        `;

        clientDiv.innerHTML = clientHTML;
        clientList.appendChild(clientDiv);
      }
    });
  }

  searchInput.addEventListener("input", filterClients);

  loadClients();
});
