let count = 0;
let energy = 5000; // Starting energy value
const maxEnergy = 5000; // Maximum energy value
const energyRechargeRate = 1; // Energy recharge rate
const rechargeInterval = 3000; // Recharge every 3 seconds
let lastUpdateTime = Date.now(); // Track last update time
let level = 1; // Starting level
const levelUpThreshold = 5000; // Coins needed to level up
let coinsPerClick = 1; // Coins earned per click
let inventory = [];

const items = [
    { name: 'Hat 1', image: './assets/hat1.png', stats: '+20 💵 per hour', type: 'item', borderColor: 'red', status: 'unequipped' },
    { name: 'Hat 2', image: './assets/hat2.png', stats: '+50 💵 per hour', type: 'item', borderColor: 'blue', status: 'unequipped' },
    { name: 'Hat 3', image: './assets/hat3.png', stats: '+30 💵 per hour', type: 'item', borderColor: 'green', status: 'unequipped' },
    { name: 'Hat 4', image: './assets/hat4.png', stats: '+40 💵 per hour', type: 'item', borderColor: 'teal', status: 'unequipped' },
    { name: 'Hat 5', image: './assets/hat5.png', stats: '+25 💵 per hour', type: 'item', borderColor: 'purple', status: 'unequipped' }
];



Telegram.WebApp.ready();
Telegram.WebApp.expand();

function resetGame() {
    count = 0;
    energy = 5000; // Reset energy to starting value
    level = 1; // Reset level to starting value
    coinsPerClick = 1; // Reset coins per click
    inventory = [];
    // Clear saved data from local storage
    localStorage.removeItem('kimchiCounter');
    localStorage.removeItem('kimchiEnergy');
    localStorage.removeItem('lastUpdateTime');
    localStorage.removeItem('inventory'); // Clear inventory from local storage


    // Update the UI
    document.getElementById('count').innerText = count;
    updateEnergyBar();
    updateLevelDisplay();
}


// Ensure event listeners are attached after content loads
window.addEventListener('load', () => {
   // resetGame();
    loadCounter();
    startRechargeTimer(); // Start the recharge timer
    setupTabEventListeners(); // Setup tab event listeners
    displayInventory();
    displayEquippedItems(); // Display the equipped items

});

function showTab(tabId) {
    // Hide all tabs
    const tabs = document.querySelectorAll('main');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    // Show the selected tab
    const activeTab = document.getElementById(tabId);
    activeTab.classList.add('active');

    // Update active tab class for footer buttons
    const buttons = document.querySelectorAll('.tab');
    buttons.forEach(button => {
        button.classList.remove('active-tab');
    });
    document.getElementById(tabId + '-btn').classList.add('active-tab');

    // Update header counter when switching tabs
    document.getElementById('count').innerText = count; // Update header
}

// Attach event listeners for tabs with touch support
function setupTabEventListeners() {
    const tabButtons = document.querySelectorAll('.tab');

    tabButtons.forEach(button => {
        const tabId = button.id.replace('-btn', '');
        
        button.addEventListener('click', () => showTab(tabId));
        // button.addEventListener('touchstart', (event) => {
        //     event.preventDefault(); // Prevent default behavior
        //     showTab(tabId);
        // });
    });
}

function openHatChest() {
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const hatChestIndex = inventory.findIndex(item => item.name === 'Hat Chest');

    if (hatChestIndex !== -1) {
        // Remove the Hat Chest from inventory
        inventory.splice(hatChestIndex, 1);

        // Select a random item from the items array
        const newItem = items[Math.floor(Math.random() * items.length)];
        //console.log(newItem.name, newItem.image, newItem.stats, newItem.type, newItem.borderColor, newItem.status);

        // Add the new item to the inventory
        inventory.push(newItem);
        localStorage.setItem('inventory', JSON.stringify(inventory));

        // Update the UI to show the new item
        displayInventory();

        closePopup();


        // Display the new item in the popup as an item popup
       // showItemPopup(newItem.name, newItem.image, newItem.stats, newItem.type, newItem.borderColor, newItem.status);

        // // Optionally, show some animation or effect to indicate the item change
        // const popupContent = document.querySelector('.popup-content');
        // popupContent.classList.add('item-reveal-animation'); // Add a CSS class for animation
        // setTimeout(() => {
        //     popupContent.classList.remove('item-reveal-animation'); // Remove the class after animation
        // }, 1000); // Adjust duration to match your animation
    }
}


let currentPage = 1; // Keep track of the current page
const itemsPerPage = 9; // Set the number of items per page

function displayInventory() {
    const inventoryList = document.getElementById('inventory-list');
    inventoryList.innerHTML = ''; // Clear existing items

    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const totalPages = Math.ceil(inventory.length / itemsPerPage); // Calculate total pages

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, inventory.length);

    for (let i = startIndex; i < endIndex; i++) {
        const item = inventory[i];
        const li = document.createElement('li');
        li.className = 'inventory-item';
        li.style.borderColor = item.borderColor; // Set the border color
        li.style.borderWidth = '5px'; // Optional: Set the border width
        li.style.borderStyle = 'solid'; // Optional: Set the border style
        li.style.padding = '10px'; // Optional: Inner spacing
        li.style.margin = '5px'; // Optional: Spacing between items
        li.style.borderRadius = '5px'; // Optional: Rounded corners
        
        li.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="inventory-item-image" onclick="handlePopup('${item.name}', '${item.image}', '${item.stats}', '${item.type}', '${item.borderColor}', '${item.status}')" />
            <div class="inventory-item-title">${item.name}</div>
            <div class="inventory-item-status" style="font-size: 12px; color: gray;">${item.status === 'equipped' ? '(equipped)' : ''}</div>
        `;

        inventoryList.appendChild(li);
    }

    // Display pagination controls
    displayPagination(totalPages);
}


function displayPagination(totalPages) {
    const pagination = document.getElementById('pagination-controls');
    pagination.innerHTML = ''; // Clear existing pagination controls

    // Create previous button
    const prevButton = document.createElement('button');
    prevButton.innerText = 'Previous';
    prevButton.disabled = currentPage === 1; // Disable if on the first page
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            displayInventory(); // Refresh the inventory display
        }
    };
    pagination.appendChild(prevButton);

    // Page indicator
    const pageIndicator = document.createElement('span');
    pageIndicator.innerText = ` ${currentPage} / ${totalPages} `;
    pagination.appendChild(pageIndicator);

    // Create next button
    const nextButton = document.createElement('button');
    nextButton.innerText = 'Next';
    nextButton.disabled = currentPage === totalPages; // Disable if on the last page
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayInventory(); // Refresh the inventory display
        }
    };
    pagination.appendChild(nextButton);
}



function handlePopup(name, image, stats, type, borderColor, status) {
    if (type === 'chest') {
        showChestPopup(name, image, stats, type, borderColor, status);
    } else {
        showItemPopup(name, image, stats, type, borderColor, status);
    }
    
    const equipButton = document.getElementById('equip-button');
    equipButton.onclick = function() {
        equipItem(name, image, stats, type, borderColor, status);

        console.log(inventory)
        //displayInventory();
    };


}



function showChestPopup(name, image, stats,type, borderColor, status) {
    document.getElementById('popup-title').innerText = name;
    document.getElementById('popup-image').src = image;
    document.getElementById('popup-stats').innerText = stats; // Set the stats text

    const chestPopupContent = document.querySelector('.popup-content');
    chestPopupContent.style.borderColor = borderColor; // Set the border color
    chestPopupContent.style.borderWidth = '5px'; // Optional: Set the border width
    chestPopupContent.style.borderStyle = 'solid'; // Optional: Set the border style

    document.getElementById('chest-popup').style.display = 'block';


    
}


function showItemPopup(name, image, stats,type, borderColor, status) {
    document.getElementById('item-popup-title').innerText = name;
    document.getElementById('item-popup-image').src = image;
    document.getElementById('item-popup-stats').innerText = stats;

    const itemPopupContent = document.querySelector('.item-popup-content');
    itemPopupContent.style.borderColor = borderColor; // Set the border color
    itemPopupContent.style.borderWidth = '5px'; // Optional: Set the border width
    itemPopupContent.style.borderStyle = 'solid'; // Optional: Set the border style

if (status === 'equipped') {
    document.getElementById('equip-button').textContent = "Unequip"; // Change button text to "Unequip"
    document.getElementById('equip-button').style.backgroundColor = 'red'; // Change button background to red
} else {
    document.getElementById('equip-button').textContent = "Equip"; // Reset button text to "Equip"
    document.getElementById('equip-button').style.backgroundColor = ''; // Reset button background color
}


    document.getElementById('item-popup').style.display = 'block';
}



function closePopup() {
    document.getElementById('chest-popup').style.display = 'none';
}




function closeItemPopup() {
    document.getElementById('item-popup').style.display = 'none'; // Hide the item popup
}

function equipItem(name, image, stats, type, borderColor) {
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    
    // Get the currently equipped item
    const equippedItem = inventory.find(item => item.status === 'equipped');
    
    // Check if the item being clicked is currently equipped
    const currentItem = inventory.find(item => item.name === name);

    if (equippedItem) {
        if (equippedItem.name === name) {
            // If the item is already equipped, unequip it
            equippedItem.status = 'unequipped'; // Change status to unequipped
            localStorage.setItem('inventory', JSON.stringify(inventory)); // Save updated inventory
            showItemPopup(name, image, stats, type, borderColor, equippedItem.status);
            console.log('Unequipped Item:', { status: equippedItem.status });
            displayInventory(); // Refresh inventory display
            displayEquippedItems(); // Refresh equipped items display
            closeItemPopup(); // Close the popup
            return; // Exit the function
        } else {
            // Ask for confirmation to unequip the currently equipped item
            const confirmUnequip = confirm(`You already have ${equippedItem.name} equipped. Do you want to unequip it and equip ${name} instead?`);
            if (confirmUnequip) {
                // If confirmed, unequip the currently equipped item
                equippedItem.status = 'unequipped';
                localStorage.setItem('inventory', JSON.stringify(inventory)); // Save updated inventory

                // Equip the new item
                currentItem.status = 'equipped'; // Change status to equipped
                localStorage.setItem('inventory', JSON.stringify(inventory)); // Save updated inventory
                showItemPopup(name, image, stats, type, borderColor, currentItem.status);
                console.log('Equipped Item:', { status: currentItem.status });
            } else {
                return; // Exit if the user does not confirm
            }
        }
    } else {
        // If no item is equipped, equip the new item
        if (currentItem) {
            currentItem.status = 'equipped'; // Change status to equipped
            localStorage.setItem('inventory', JSON.stringify(inventory)); // Save updated inventory
            showItemPopup(name, image, stats, type, borderColor, currentItem.status);
            console.log('Equipped Item:', { status: currentItem.status });
        }
    }

    // Refresh the displayed inventory
    displayInventory();
    displayEquippedItems(); // Refresh equipped items display
    closeItemPopup();
}

function displayEquippedItems() {
    const equippedItemsContainer = document.getElementById('tab4');
    equippedItemsContainer.innerHTML = '<h2>Avatar</h2>'; // Clear existing items

    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const equippedItems = inventory.filter(item => item.status === 'equipped');

    equippedItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'equipped-item';
        itemElement.style.borderColor = item.borderColor; // Set the border color
        itemElement.style.borderWidth = '5px'; // Optional: Set the border width
        itemElement.style.borderStyle = 'solid'; // Optional: Set the border style
        itemElement.style.padding = '10px'; // Optional: Inner spacing
        itemElement.style.margin = '5px'; // Optional: Spacing between items
        itemElement.style.borderRadius = '5px'; // Optional: Rounded corners

        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="equipped-item-image" />
            <div class="equipped-item-title">${item.name}</div>
            <div class="equipped-item-stats">${item.stats}</div>
        `;

        equippedItemsContainer.appendChild(itemElement);

        // Extract the numeric value from item.stats
        const statValue = parseInt(item.stats.match(/\+(\d+)/)[1]); // Extract the number from "+25 gold per hour"

        // Increment the coin count every hour based on the equipped item's stat
        setInterval(() => {
            count += statValue;
            localStorage.setItem('kimchiCounter', JSON.stringify(count));
            // Update your UI to show the new coin count if needed
        }, 1000); // 3600000 ms = 1 hour

    });
}



function loadCounter() {
    const savedCount = localStorage.getItem('kimchiCounter');
    const savedEnergy = localStorage.getItem('kimchiEnergy');
    const savedLastUpdate = localStorage.getItem('lastUpdateTime');

    if (savedCount) {
        count = parseInt(savedCount, 10);
        document.getElementById('count').innerText = count;
    }

    if (savedEnergy) {
        energy = Math.min(parseInt(savedEnergy, 10), maxEnergy); // Cap energy at max
    }

    if (savedLastUpdate) {
        lastUpdateTime = parseInt(savedLastUpdate, 10);
        const elapsedTime = Date.now() - lastUpdateTime;
        energy += Math.floor(elapsedTime / rechargeInterval) * energyRechargeRate;
        energy = Math.min(energy, maxEnergy); // Cap energy at max
    }

    updateEnergyBar(); // Initialize energy bar display
    updateLevelDisplay(); // Initialize level display
}

function saveCounter() {
    localStorage.setItem('kimchiCounter', count);
    localStorage.setItem('kimchiEnergy', energy);
    localStorage.setItem('lastUpdateTime', Date.now()); // Update last update time
}

function imageClicked(event) {
    event.preventDefault();
    const touches = event.touches || [{ clientX: event.clientX, clientY: event.clientY }];
    const touchCount = touches.length;

    if (energy <= 0) {
        alert("Not enough energy to click the cabbage!");
        return;
    }

    updateGameState(touchCount);
    animateCabbage();
    provideFeedback(touches, coinsPerClick);
}

function updateGameState(touchCount) {
    count += touchCount * coinsPerClick;
    energy = Math.max(0, energy - touchCount); // Prevent negative energy
    document.getElementById('count').innerText = count;
    saveCounter();
    updateEnergyBar();
    updateLevel();
}

function animateCabbage() {
    const cabbageImage = document.querySelector('#clickable-image img');
    
    // Reset any existing animation
    cabbageImage.classList.remove('clicked');
    
    // Trigger reflow to restart the animation
    void cabbageImage.offsetWidth;
    
    // Add the animation class
    cabbageImage.classList.add('clicked');

    // Remove the highlight class after animation duration
    setTimeout(() => {
        cabbageImage.classList.remove('clicked');
    }, 300); // Adjust this duration to match your CSS animation duration
}

document.getElementById("clickable-image").addEventListener("touchstart", function(event) {
    imageClicked(event);
    navigator.vibrate(100); // Vibrate on touch
});

function updateLevel() {
    while (count >= level * levelUpThreshold) {
        level++;
        coinsPerClick = level; // Increase coins per click
        updateLevelDisplay(); // Update level display
    }
}

function updateLevelDisplay() {
    const levelDisplay = document.getElementById('level-value');
    levelDisplay.innerText = `Lvl: ${level}`; // Correctly update the displayed level
}

function animateCounter(countElement) {
    countElement.style.transform = 'scale(1.2)'; // Scale up
    setTimeout(() => {
        countElement.style.transform = 'scale(1)'; // Scale back down
    }, 300); // Duration of the scale effect
}

function createFeedback(x, y, amount) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback';
    feedback.innerText = `+${amount}`; // Display the amount of coins
    feedback.style.position = 'absolute'; // Positioning for animation
    feedback.style.left = `${x}px`;
    feedback.style.top = `${y}px`;
    feedback.style.opacity = 1; // Start fully visible
    document.body.appendChild(feedback);

    // Animation for moving up and fading out
    feedback.animate([
        { transform: 'translateY(0)', opacity: 1 }, // Start position
        { transform: 'translateY(-30px)', opacity: 0 } // End position
    ], {
        duration: 600, // Total duration of the animation
        easing: 'ease-out',
        fill: 'forwards' // Retain the final state
    });

    // Remove the feedback element after animation
    setTimeout(() => {
        feedback.remove();
    }, 600);
}

function updateEnergyBar() {
    const energyFill = document.getElementById('energy-fill');
    const energyValue = document.getElementById('energy-count');
    energyFill.style.width = `${(energy / maxEnergy) * 100}%`;
    energyValue.innerText = energy;
}

function rechargeEnergy() {
    const now = Date.now();
    const elapsedTime = now - lastUpdateTime;
    const rechargeAmount = Math.floor(elapsedTime / rechargeInterval) * energyRechargeRate;

    if (rechargeAmount > 0) {
        energy = Math.min(energy + rechargeAmount, maxEnergy);
        lastUpdateTime = now;
        updateEnergyBar();
        saveCounter(); // Save the updated energy value
    }
}

function startRechargeTimer() {
    setInterval(rechargeEnergy, rechargeInterval);
}

function playClickSound() {
    const clickSound = new Audio('click-sound.mp3');
    clickSound.play();
}

function provideFeedback(touches, amount) {
    for (const touch of touches) {
        createFeedback(touch.clientX, touch.clientY, amount); // Pass amount to createFeedback
    }
}

// Wait for the DOM to load before adding event listeners
document.addEventListener('DOMContentLoaded', () => {
    const purchaseButton = document.getElementById('purchase-hat-chest');
    
    if (purchaseButton) {
        purchaseButton.addEventListener('click', confirmPurchase);
    }
});

function confirmPurchase() {
    const cost = 1; // Cost of the item
    const savedCount = parseInt(localStorage.getItem('kimchiCounter'), 10) || 0;

    if (savedCount >= cost) {
        const confirmMessage = `Are you sure you want to purchase the Hat Chest for ${cost} coins?`;
        const userConfirm = confirm(confirmMessage);

        if (userConfirm) {
            // Proceed with the purchase
            handlePurchaseHatChest();
        }
    } else {
        alert('Not enough coins!');
    }
}

function handlePurchaseHatChest() {
    const cost = 1; // Cost of the item
    const savedCount = parseInt(localStorage.getItem('kimchiCounter'), 10) || 0;

    // Deduct coins
    const count = savedCount - cost;
    localStorage.setItem('kimchiCounter', count);

    // Update inventory with item name and image URL
    let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    
    // Add "Hat Chest" at a specific position (e.g., end of the inventory)
    inventory.push({ 
        name: 'Hat Chest', 
        image: './assets/chest.png', 
        stats: 'Open to receive a random Hat!', 
        type: 'chest', 
        borderColor: 'gold',
        position: inventory.length // Save current position
    });
    localStorage.setItem('inventory', JSON.stringify(inventory));

    // Update displayed count
    document.getElementById('count').innerText = count;

    // Display inventory
    displayInventory(inventory);

    // Ask the user if they would like to view their inventory
    const telegramMessage = "Purchase complete! Would you like to view your inventory?";
    const userResponse = confirm(telegramMessage); // Replace with appropriate Telegram API call if needed

    if (userResponse) {
        // Logic to show inventory, e.g., switch to inventory tab
        showTab('tab3'); // Assuming 'tab3' is your inventory tab ID
    }
}


// document.addEventListener('visibilitychange', () => {
//     if (document.hidden) {
//         clearInterval(rechargeIntervalId); // Pause recharge
//     } else {
//         startRechargeTimer(); // Restart recharge
//     }
// });
