"use strict";

let classificationList = document.querySelector("#classificationList");
classificationList.addEventListener("change", function () {
  let classification_id = classificationList.value;
  console.log(`classification_id is: ${classification_id}`);
  let classIdURL = "/inv/getInventory/" + classification_id;
  fetch(classIdURL)
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
      throw Error("Network response was not OK");
    })
    .then(function (data) {
      console.log(data);
      buildInventoryList(data);
    })
    .catch(function (error) {
      console.log("There was a problem: ", error.message);
    });
});

// Build inventory items into HTML table components and inject into DOM
function buildInventoryList(data) {
  let inventoryDisplay = document.getElementById("inventoryDisplay");
  // Set up the table labels
  let dataTable = "<thead>";
  dataTable += "<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>";
  dataTable += "</thead>";
  // Set up the table body
  dataTable += "<tbody>";
  // Iterate over all vehicles in the array and put each in a row
  data.forEach(function (element) {
    console.log(element.inv_id + ", " + element.inv_model);
    dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`;
    dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`;
    dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td></tr>`;
  });
  dataTable += "</tbody>";
  // Display the contents in the Inventory Management view
  inventoryDisplay.innerHTML = dataTable;
}

// Inside inventory.js, where the table is built
function populateTable(inventoryData) {
  const table = document.getElementById("inventoryDisplay");
  table.innerHTML = `
    <thead>
      <tr><th>Make</th><th>Model</th><th>Year</th><th>Price</th><th>Actions</th></tr>
    </thead>
    <tbody>
      ${inventoryData
        .map(
          (item) => `
        <tr>
          <td>${item.inv_make}</td>
          <td>${item.inv_model}</td>
          <td>${item.inv_year}</td>
          <td>$${item.inv_price.toFixed(2)}</td>
          <td>
            <a href="/inv/update/${item.inv_id}" class="modify-link">Modify</a>
            <button class="delete-btn" data-inv-id="${item.inv_id}">Delete</button>
          </td>
        </tr>
      `,
        )
        .join("")}
    </tbody>
  `;
  // Add event listeners after table is populated
  addDeleteListeners();
}

function addDeleteListeners() {
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const invId = e.target.getAttribute("data-inv-id");
      if (
        confirm(
          "Are you sure you want to delete this item? This action cannot be undone.",
        )
      ) {
        await handleDelete(invId);
      }
    });
  });
}

async function handleDelete(invId) {
  try {
    const response = await fetch(`/inv/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inv_id: invId }),
    });
    const result = await response.json();
    if (result.success) {
      alert("Item deleted successfully.");
      // Refresh the table or remove the row
      const row = document
        .querySelector(`button[data-inv-id="${invId}"]`)
        .closest("tr");
      if (row) row.remove();
    } else {
      alert("Delete failed. Please try again.");
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    alert("An error occurred. Please try again.");
  }
}
