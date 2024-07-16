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
    //resetGame();
    loadCounter();
    startRechargeTimer(); // Start the recharge timer
    setupTabEventListeners(); // Setup tab event listeners
    displayInventory();
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
        button.addEventListener('touchstart', (event) => {
            event.preventDefault(); // Prevent default behavior
            showTab(tabId);
        });
    });
}

function displayInventory() {
    const inventoryList = document.getElementById('inventory-list');
    inventoryList.innerHTML = ''; // Clear existing items

    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    inventory.forEach(item => {
        const li = document.createElement('li');
        li.className = 'inventory-item';
        li.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="inventory-item-image" onclick="showItemPopup('${item.name}', '${item.image}', '${item.stats}')" />
            <div class="inventory-item-title">${item.name}</div>
        `;
        inventoryList.appendChild(li);
    });
}

function showItemPopup(name, image, stats) {
    document.getElementById('popup-title').innerText = name;
    document.getElementById('popup-image').src = image;
    document.getElementById('popup-stats').innerText = stats; // Set the stats text
    document.getElementById('item-popup').style.display = 'block';
}

function closePopup() {
    document.getElementById('item-popup').style.display = 'none';
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
    event.preventDefault(); // Prevent default behavior
    const touches = event.touches || [{ clientX: event.clientX, clientY: event.clientY }];
    const touchCount = touches.length;

    if (touchCount > 1) return; // Prevent multiple touches

    if (energy <= 0) {
        alert("Not enough energy to click the cabbage!");
        return; // Prevent clicking if energy is 0
    }

    count += touchCount * coinsPerClick; // Increment count based on the number of touches
    energy -= touchCount; // Reduce energy with each click
    energy = Math.max(energy, 0); // Prevent negative energy

    document.getElementById('count').innerText = count;
    saveCounter();
    updateEnergyBar(); // Update energy bar display
    updateLevel(); // Check for level up

    // Reset and play animation
    const cabbageImage = document.querySelector('#clickable-image img');
    cabbageImage.classList.remove('clicked'); // Reset any existing animation
    void cabbageImage.offsetWidth; // Trigger reflow
    cabbageImage.classList.add('clicked'); // Add highlight class for animation

    animateCounter(document.getElementById('count'));

    // Play sound and provide haptic feedback
    playClickSound();
    provideFeedback(touches, coinsPerClick); // Pass coinsPerClick to provideFeedback

    // Remove the highlight class after animation duration
    setTimeout(() => {
        cabbageImage.classList.remove('clicked');
    }, 300); // Match this duration with your CSS animation duration
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
        purchaseButton.addEventListener('click', handlePurchaseHatChest);
    }
});

function handlePurchaseHatChest() {
    const cost = 10; // Cost of the item
    const savedCount = parseInt(localStorage.getItem('kimchiCounter'), 10) || 0;

    if (savedCount >= cost) {
        // Deduct coins
        count = savedCount - cost;
        localStorage.setItem('kimchiCounter', count);
        
        // Update inventory with item name and image URL
        let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
        inventory.push({ name: 'Hat Chest', image: './assets/chest.png', stats: '+10 Per Hour' }); // Update with your image path
        localStorage.setItem('inventory', JSON.stringify(inventory));

        // Update displayed count
        document.getElementById('count').innerText = count;

        // Display inventory
        displayInventory();

        // Telegram popup
        const telegramMessage = "Purchase complete! Would you like to view your inventory?";
        const userResponse = confirm(telegramMessage); // Replace with appropriate Telegram API call if needed

        if (userResponse) {
            // Logic to show inventory, e.g., switch to inventory tab
            showTab('tab2'); // Assuming 'tab2' is your inventory tab ID
        }
    } else {
        alert('Not enough coins!');
    }
}
