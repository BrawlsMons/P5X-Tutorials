// Card Game Logic
class CardGame {
    constructor() {
        // Load saved data or set defaults
        this.money = this.loadMoney();
        this.lastClaim = parseInt(localStorage.getItem('cardgame_last_claim')) || 0;
        this.collection = JSON.parse(localStorage.getItem('cardgame_collection')) || {};
        this.inventory = JSON.parse(localStorage.getItem('cardgame_inventory')) || {};
        
        this.characters = [
            { id: 'ann', name: 'Ann Takamaki', codename: 'Panther', rarity: 5, role: 'Sweeper', image: 'P5X_Ann.webp' },
            { id: 'wonder', name: 'Nagisa Kamishiro', codename: 'Wonder', rarity: 5, role: 'Assassin', image: 'P5X_Wonder.webp' },
            { id: 'joker', name: 'Ren Amamiya', codename: 'Joker', rarity: 5, role: 'Strategist', image: 'P5X_Joker.webp' },
            { id: 'morgana', name: 'Morgana', codename: 'Mona', rarity: 5, role: 'Medic', image: 'P5X_Morgana.webp' },
            { id: 'haruna', name: 'Haruna Nishimori', codename: 'Riddle', rarity: 5, role: 'Strategist', image: 'P5X_Haruna.webp' },
            
            { id: 'skull', name: 'Ryuji Sakamoto', codename: 'Skull', rarity: 4, role: 'Assassin', image: 'P5X_Skull.webp' },
            { id: 'rin', name: 'Yaoling Li', codename: 'Rin', rarity: 4, role: 'Saboteur', image: 'P5X_Yaoling_Li_Rin.webp' },
            { id: 'okyann', name: 'Kayo Tomiyama', codename: 'Okyann', rarity: 4, role: 'Navigator', image: 'P5X_Okyann.webp' },
            { id: 'key', name: 'Kiyoshi Kurotani', codename: 'Key', rarity: 4, role: 'Saboteur', image: 'P5X_Kii.webp' },
            { id: 'kotone', name: 'Kotone Montagne', codename: 'Mont', rarity: 4, role: 'Assassin', image: 'P5X_Kotone.webp' },
            { id: 'leo', name: 'Leo Kamiyama', codename: 'Leon', rarity: 4, role: 'Strategist', image: 'P5X_Leo.webp' },
            { id: 'cattle', name: 'Lufel', codename: 'Cattle', rarity: 4, role: 'Medic', image: 'P5X_Cattle.webp' },
            { id: 'closer', name: 'Motoha Arai', codename: 'Closer', rarity: 4, role: 'Sweeper', image: 'P5X_Closer.webp' },
            { id: 'fleuret', name: 'Seiji Shiratori', codename: 'Fleuret', rarity: 4, role: 'Assassin', image: 'P5X_Seiji_Shiratori_Seiji.webp' },
            
            { id: 'miyu', name: 'Miyu Sahara', codename: 'Puppet', rarity: 3, role: 'Navigator', image: 'Miyu_Sawara.webp' },
            { id: 'shun', name: 'Shun Kano', codename: 'Soy', rarity: 3, role: 'Guardian', image: 'Shun_Kanou.webp' },
            { id: 'kotomo', name: 'Tomoko Noge', codename: 'Moko', rarity: 3, role: 'Strategist', image: 'P5X_Kotomo.webp' },
            { id: 'toshiya', name: 'Toshiya Sumi', codename: 'Sepia', rarity: 3, role: 'Assassin', image: 'Toshiya_Sumi_29.webp' },
            { id: 'yukimi', name: 'Yukimi Fujikawa', codename: 'Yuki', rarity: 3, role: 'Guardian', image: 'P5X_Yukimi_Fujikawa_Yuki.webp' }
        ];
        
        this.packPrice = 100;
        this.claimAmount = 500;
        this.claimCooldown = 60 * 60 * 1000; // 1 hour in milliseconds
        
        this.currentTab = 'shop';
        this.currentFilter = 'all';
        
        this.init();
    }
    
    init() {
        // Ensure game data is saved immediately
        this.saveGame();
        this.updateDisplay();
        this.bindEvents();
        this.updateClaimTimer();
        this.generateCollection();
        this.generateInventory();
        
        // Update timer every second
        setInterval(() => this.updateClaimTimer(), 1000);
    }
    
    loadMoney() {
        const savedMoney = localStorage.getItem('cardgame_money');
        console.log('Loading money from localStorage:', savedMoney);
        
        if (savedMoney !== null) {
            const money = parseInt(savedMoney);
            if (!isNaN(money) && money >= 0) {
                console.log('Loaded money:', money);
                return money;
            }
        }
        // Default starting money if no valid save data
        console.log('Using default starting money: 500');
        return 500;
    }
    
    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });
        
        // Buy pack button
        document.getElementById('buy-pack').addEventListener('click', () => {
            this.buyPack();
        });
        
        // Claim money button
        document.getElementById('claim-money').addEventListener('click', () => {
            this.claimMoney();
        });
        
        // Close modal
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Rarity filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rarity = e.target.dataset.rarity;
                this.setFilter(rarity);
            });
        });
        
        // Close modal on outside click
        document.getElementById('pack-modal').addEventListener('click', (e) => {
            if (e.target.id === 'pack-modal') {
                this.closeModal();
            }
        });
    }
    
    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tab}-tab`).classList.add('active');
        
        this.currentTab = tab;
        
        if (tab === 'collection') {
            this.generateCollection();
        } else if (tab === 'inventory') {
            this.generateInventory();
        }
    }
    
    setFilter(rarity) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-rarity="${rarity}"]`).classList.add('active');
        
        this.currentFilter = rarity;
        this.generateCollection();
    }
    
    updateDisplay() {
        document.getElementById('money-amount').textContent = this.money;
        
        // Save money every time it's displayed (ensures it's always saved)
        this.saveGame();
        
        // Update buy button state
        const buyBtn = document.getElementById('buy-pack');
        if (this.money < this.packPrice) {
            buyBtn.disabled = true;
            buyBtn.textContent = 'Not enough money';
        } else {
            buyBtn.disabled = false;
            buyBtn.textContent = 'Buy Pack';
        }
        
        // Update collection stats
        const totalCards = Object.values(this.inventory).reduce((sum, count) => sum + count, 0);
        const uniqueCards = Object.keys(this.collection).length;
        const maxCards = this.characters.length;
        const collectionRate = Math.round((uniqueCards / maxCards) * 100);
        
        document.getElementById('total-cards').textContent = totalCards;
        document.getElementById('unique-cards').textContent = uniqueCards;
        document.getElementById('max-cards').textContent = maxCards;
        document.getElementById('collection-rate').textContent = collectionRate + '%';
        document.getElementById('inventory-count').textContent = totalCards;
    }
    
    updateClaimTimer() {
        const now = Date.now();
        const timeSinceLastClaim = now - this.lastClaim;
        const timeUntilClaim = this.claimCooldown - timeSinceLastClaim;
        
        const claimBtn = document.getElementById('claim-money');
        const timerDisplay = document.getElementById('claim-timer');
        
        if (timeUntilClaim <= 0) {
            claimBtn.disabled = false;
            claimBtn.style.display = 'block';
            timerDisplay.textContent = 'Ready to claim!';
            timerDisplay.style.color = '#4ade80';
        } else {
            claimBtn.disabled = true;
            claimBtn.style.display = 'none';
            
            const minutes = Math.floor(timeUntilClaim / (1000 * 60));
            const seconds = Math.floor((timeUntilClaim % (1000 * 60)) / 1000);
            timerDisplay.textContent = `Next claim in: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            timerDisplay.style.color = '#9ca3af';
        }
    }
    
    claimMoney() {
        const now = Date.now();
        const timeSinceLastClaim = now - this.lastClaim;
        
        if (timeSinceLastClaim >= this.claimCooldown) {
            this.money += this.claimAmount;
            this.lastClaim = now;
            this.saveGame();
            this.updateDisplay();
            
            // Show money animation
            this.showMoneyAnimation();
        }
    }
    
    showMoneyAnimation() {
        const moneyCounter = document.querySelector('.money-counter');
        moneyCounter.style.animation = 'none';
        moneyCounter.offsetHeight; // Trigger reflow
        moneyCounter.style.animation = 'moneyPulse 0.5s ease-in-out';
        
        // Create floating text
        const floatingText = document.createElement('div');
        floatingText.textContent = '+500$';
        floatingText.style.position = 'absolute';
        floatingText.style.color = '#4ade80';
        floatingText.style.fontWeight = 'bold';
        floatingText.style.fontSize = '1.5rem';
        floatingText.style.pointerEvents = 'none';
        floatingText.style.animation = 'floatUp 2s ease-out forwards';
        
        const rect = moneyCounter.getBoundingClientRect();
        floatingText.style.left = rect.left + rect.width / 2 + 'px';
        floatingText.style.top = rect.top + 'px';
        
        document.body.appendChild(floatingText);
        
        setTimeout(() => {
            document.body.removeChild(floatingText);
        }, 2000);
        
        // Add CSS for float animation
        if (!document.querySelector('#float-animation-style')) {
            const style = document.createElement('style');
            style.id = 'float-animation-style';
            style.textContent = `
                @keyframes floatUp {
                    0% { transform: translateY(0) translateX(-50%); opacity: 1; }
                    100% { transform: translateY(-100px) translateX(-50%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    buyPack() {
        if (this.money < this.packPrice) return;
        
        this.money -= this.packPrice;
        this.saveGame();
        this.updateDisplay();
        
        // Generate 3 random cards
        const cards = this.generateRandomCards(3);
        this.openPack(cards);
    }
    
    generateRandomCards(count) {
        const cards = [];
        
        for (let i = 0; i < count; i++) {
            const character = this.getRandomCharacter();
            cards.push(character);
            
            // Add to inventory
            if (!this.inventory[character.id]) {
                this.inventory[character.id] = 0;
            }
            this.inventory[character.id]++;
            
            // Add to collection
            this.collection[character.id] = true;
        }
        
        this.saveGame();
        return cards;
    }
    
    getRandomCharacter() {
        const rand = Math.random() * 100;
        
        // 2% chance for 5-star
        if (rand < 2) {
            const fiveStars = this.characters.filter(c => c.rarity === 5);
            return fiveStars[Math.floor(Math.random() * fiveStars.length)];
        }
        // 15% chance for 4-star
        else if (rand < 17) {
            const fourStars = this.characters.filter(c => c.rarity === 4);
            return fourStars[Math.floor(Math.random() * fourStars.length)];
        }
        // 83% chance for 3-star
        else {
            const threeStars = this.characters.filter(c => c.rarity === 3);
            return threeStars[Math.floor(Math.random() * threeStars.length)];
        }
    }
    
    openPack(cards) {
        const modal = document.getElementById('pack-modal');
        const revealedCards = document.getElementById('revealed-cards');
        const packImg = document.getElementById('pack-img');
        const closeBtn = document.getElementById('close-modal');
        
        // Clear previous cards
        revealedCards.innerHTML = '';
        closeBtn.style.display = 'none';
        
        // Show modal
        modal.classList.add('show');
        
        // Start pack animation
        packImg.classList.add('opening');
        
        setTimeout(() => {
            // Hide pack image
            packImg.style.opacity = '0';
            
            // Show cards one by one
            cards.forEach((card, index) => {
                setTimeout(() => {
                    const cardElement = this.createCardElement(card, true);
                    cardElement.classList.add('revealed-card');
                    revealedCards.appendChild(cardElement);
                    
                    // Show close button after last card
                    if (index === cards.length - 1) {
                        setTimeout(() => {
                            closeBtn.style.display = 'block';
                        }, 800);
                    }
                }, index * 200);
            });
        }, 1000);
    }
    
    closeModal() {
        const modal = document.getElementById('pack-modal');
        const packImg = document.getElementById('pack-img');
        
        modal.classList.remove('show');
        packImg.classList.remove('opening');
        packImg.style.opacity = '1';
        
        this.updateDisplay();
        this.generateInventory();
    }
    
    generateCollection() {
        const grid = document.getElementById('collection-grid');
        grid.innerHTML = '';
        
        let filteredCharacters = this.characters;
        if (this.currentFilter !== 'all') {
            filteredCharacters = this.characters.filter(c => c.rarity.toString() === this.currentFilter);
        }
        
        filteredCharacters.forEach(character => {
            const cardElement = this.createCardElement(character, false);
            
            if (!this.collection[character.id]) {
                cardElement.classList.add('not-owned');
            }
            
            grid.appendChild(cardElement);
        });
    }
    
    generateInventory() {
        const grid = document.getElementById('inventory-grid');
        grid.innerHTML = '';
        
        Object.keys(this.inventory).forEach(characterId => {
            const character = this.characters.find(c => c.id === characterId);
            const count = this.inventory[characterId];
            
            if (count > 0) {
                const cardElement = this.createCardElement(character, false);
                const countElement = cardElement.querySelector('.card-count');
                countElement.textContent = `x${count}`;
                grid.appendChild(cardElement);
            }
        });
    }
    
    createCardElement(character, isRevealed = false) {
        const card = document.createElement('div');
        card.className = `card rarity-${character.rarity}`;
        
        const stars = '★'.repeat(character.rarity);
        
        card.innerHTML = `
            <img src="assets/characters/${character.image}" alt="${character.name}" class="card-image">
            <div class="card-name">${character.name}</div>
            <div class="card-rarity rarity-${character.rarity}">${stars}</div>
            <div class="card-role">${character.role}</div>
            <div class="card-count">x${this.inventory[character.id] || 0}</div>
        `;
        
        if (isRevealed) {
            card.classList.add('revealed-card');
            
            // Add special effects for high rarity cards
            if (character.rarity === 5) {
                card.style.animation = 'legendaryGlow 2s ease-in-out infinite';
            }
        }
        
        return card;
    }
    
    saveGame() {
        try {
            localStorage.setItem('cardgame_money', this.money.toString());
            localStorage.setItem('cardgame_last_claim', this.lastClaim.toString());
            localStorage.setItem('cardgame_collection', JSON.stringify(this.collection));
            localStorage.setItem('cardgame_inventory', JSON.stringify(this.inventory));
            
            // Debug logging (remove in production)
            console.log('Game saved - Money:', this.money, 'Last Claim:', this.lastClaim);
        } catch (error) {
            console.error('Error saving game:', error);
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.game-container')) {
        const game = new CardGame();
        
        // Save game when page is about to unload
        window.addEventListener('beforeunload', () => {
            game.saveGame();
        });
        
        // Save game periodically (every 10 seconds)
        setInterval(() => {
            game.saveGame();
        }, 10000);
    }
});
