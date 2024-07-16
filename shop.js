// Wait for the DOM to load before adding event listeners
document.addEventListener('DOMContentLoaded', () => {
    const purchaseButton = document.getElementById('purchase-hat-chest');
    
    if (purchaseButton) {
        purchaseButton.addEventListener('click', handlePurchaseHatChest);
    }
});

function handlePurchaseHatChest() {

    console.log("hi")
}

