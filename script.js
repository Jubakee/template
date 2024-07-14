let count = 0;
let energy = 5000; // Starting energy value
const maxEnergy = 5000; // Maximum energy value
const energyRechargeRate = 1; // Energy recharge rate
const rechargeInterval = 3000; // Recharge every 3 seconds
let lastUpdateTime = Date.now(); // Track last update time
let level = 1; // Starting level
let coinsPerClick = 1; // Coins earned per click

// Function to calculate the level-up threshold
function calculateLevelUpThreshold(level) {
    if (level === 1) return 300;
    if (level === 2) return 500;
    if (level === 3) return 800;
    if (level === 4) return 1200;
    if (level === 5) return 1600;
    // For levels 6 and above, increase the threshold exponentially
    return Math.floor(300 * Math.pow(2, level - 1)); // Example: 300, 600, 1200, 2400, etc.
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

    animateCounter(document.getElementById('count'));

    // Play sound and provide haptic feedback
    playClickSound();
    provideFeedback(touches, coinsPerClick); // Pass coinsPerClick to provideFeedback
}

function updateLevel() {
    const levelUpThreshold = calculateLevelUpThreshold(level); // Get the current threshold
    while (count >= levelUpThreshold) {
        level++;
        coinsPerClick = level; // Increase coins per click
        updateLevelDisplay(); // Update level display
    }
}

function updateLevelDisplay() {
    const levelDisplay = document.getElementById('level-value');
    levelDisplay.innerText = `Level: ${level}`; // Correctly update the displayed level
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
    feedback.style.left = `${x}px`;
    feedback.style.top = `${y - 30}px`;
    document.body.appendChild(feedback);

    // Fade out effect
    setTimeout(() => {
        feedback.style.opacity = 0;
    }, 300);
    setTimeout(() => {
        feedback.remove();
    }, 600);
}

function updateEnergyBar() {
    const energyFill = document.getElementById('energy-fill');
    const energyValue = document.getElementById('energy-count');
    energyFill.style.width = `${(energy / maxEnergy) * 100}%`;
    energyValue.innerText = energy; // Update the energy value text
}

function rechargeEnergy() {
    if (energy < maxEnergy) {
        energy += energyRechargeRate;
        energy = Math.min(energy, maxEnergy); // Cap energy at max
        updateEnergyBar();
    }
}

setInterval(rechargeEnergy, rechargeInterval);

function showTab(tabId) {
    document.querySelectorAll('main').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active-tab');
    });
    document.getElementById(tabId).classList.add('active');
    document.getElementById(tabId + '-btn').classList.add('active-tab');
}

window.onload = loadCounter;

function playClickSound() {
    const audio = new Audio('./assets/click-sound.mp3');
    audio.play();
}

function provideFeedback(touches, coinsPerClick) {
    const cabbageImage = document.querySelector('#clickable-image img');
    cabbageImage.classList.add('clicked');
    setTimeout(() => {
        cabbageImage.classList.remove('clicked');
    }, 300);

    // Create feedback for each touch
    for (let i = 0; i < touches.length; i++) {
        createFeedback(touches[i].clientX, touches[i].clientY, coinsPerClick); // Pass coinsPerClick
    }
}

Telegram.WebApp.setHeaderColor('secondary_bg_color');
