document.addEventListener("DOMContentLoaded", function() {
  const factureContent = document.getElementById("factureContent");
  const printButton = document.getElementById("printButton");
  const cancelButton = document.getElementById("cancelButton");

  function loadFacture() {
    const factureData = JSON.parse(localStorage.getItem('factureData'));

    if (!factureData) {
      factureContent.innerHTML = '<p>Aucune facture disponible</p>';
      return;
    }

    const factureHTML = `
      <h3>Facture N°: ${factureData.numero}</h3>
      <p>Date: ${factureData.date}</p>
      <p>Client: ${factureData.clientNom}</p>
      <p>Code: ${factureData.code}</p>
      <p>ICE Client: ${factureData.iceClient}</p>
      <p>Mode de Règlement: ${factureData.modeReglement}</p>
      <table class="styled-table">
        <thead>
          <tr>
            <th>Désignation</th>
            <th>Prix Unitaire HT</th>
            <th>Quantité</th>
            <th>Montant HT</th>
            <th>TVA</th>
            <th>Total TTC</th>
          </tr>
        </thead>
        <tbody>
          ${factureData.items.map(item => `
            <tr>
              <td>${item.designation}</td>
              <td>${item.prixHT}</td>
              <td>${item.quantite}</td>
              <td>${item.montantHT}</td>
              <td>${item.tva}</td>
              <td>${item.totalTTC}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p>Total HT: ${factureData.totalHT}</p>
      <p>Total TVA: ${factureData.totalTVA}</p>
      <p>Total TTC: ${factureData.totalTTC}</p>
      <p>Remise: ${factureData.remise}</p>
      <p>Droit de Timbre: ${factureData.droitTimbre}</p>
      <p>Net à Payer: ${factureData.nap}</p>
      <p>La présente facture est arrêtée à la somme de : ${factureData.napLettre}</p>
    `;

    factureContent.innerHTML = factureHTML;
  }

  printButton.addEventListener('click', function() {
    window.print();
  });

  cancelButton.addEventListener('click', function() {
    window.location.href = '/pages/ventes.html'; // Redirige vers la page de gestion des ventes
  });

  loadFacture();
});
