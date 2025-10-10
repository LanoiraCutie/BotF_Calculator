class GameViewer {
    constructor() {
        this.socket = null;
        this.gameState = {};
        this.connected = false;
        this.lastSkills = {
            player1: null,
            player2: null,
            player3: null,
            player4: null,
            boss: null
        };
        this.currentBackground = 'Background.png';
        this.currentMusic = null;
        this.audioContext = null;
        this.currentBoss = null;
        this.init();
    }

    init() {
        this.connectToAdmin();
        this.setupUI();
        this.initializeSpecialItems();
        this.initializeAudio();
    }

    initializeAudio() {
        // Create audio context for better control
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported, using HTML5 audio');
        }

        // Create audio element for music
        this.currentMusic = document.createElement('audio');
        this.currentMusic.loop = true;
        this.currentMusic.volume = 0.5; // Set default volume
        this.currentMusic.preload = 'auto';

        // Add audio element to page (hidden)
        this.currentMusic.style.display = 'none';
        document.body.appendChild(this.currentMusic);

        console.log('Audio system initialized');
    }

    getBossMusic(bossName) {
        const musicMap = {
            'Bathala': 'KALUWALHATIAN.mp3',
            'Mayari': 'BUNDOK_PULAG.mp3',
            'Apolaki': 'DARAGANG_MAGAYON.mp3',
            'Bakunawa': 'DAGAT_KABISAYAAN.mp3',
            'Minokawa': 'DAGAT_KABISAYAAN.mp3',
            'Manananggal': 'BUNDOK_PULAG.mp3',
            'Tiyanak': 'DARAGANG_MAGAYON.mp3',
            'Siren': 'DAGAT_KABISAYAAN.mp3',
            'Kapre': 'KALUWALHATIAN.mp3'
        };

        const musicFile = musicMap[bossName];
        console.log(`🎵 getBossMusic: ${bossName} → ${musicFile}`);
        return musicFile || null;
    }

    playBossMusic(bossName) {
        console.log(`🎵 playBossMusic called with: ${bossName}`);

        const musicFile = this.getBossMusic(bossName);
        console.log(`🎵 Music file for ${bossName}:`, musicFile);

        if (!musicFile) {
            console.log(`🎵 No music found for boss: ${bossName}`);
            this.stopMusic();
            return;
        }

        const musicPath = `asset/BGMUSIC/NEW MAP OST/${musicFile}`;
        console.log(`🎵 Full music path: ${musicPath}`);

        // Check if the SAME music file is already playing (not just includes, but exact match)
        const currentSrc = this.currentMusic.src;
        const currentFileName = currentSrc ? currentSrc.split('/').pop() : '';
        const isCurrentlyPlaying = !this.currentMusic.paused && !this.currentMusic.ended;
        const isSameFile = currentFileName === musicFile;

        console.log(`🎵 Current file: "${currentFileName}"`);
        console.log(`🎵 Target file: "${musicFile}"`);
        console.log(`🎵 Files match: ${isSameFile}`);
        console.log(`🎵 Currently playing: ${isCurrentlyPlaying}`);

        if (isSameFile && isCurrentlyPlaying) {
            console.log(`🎵 Same music file already playing: ${musicFile}. Continuing playback.`);
            return;
        }

        console.log(`🎵 Loading and playing music for ${bossName}: ${musicFile}`);

        // Stop current music and load new one
        this.currentMusic.pause();
        this.currentMusic.currentTime = 0;
        this.currentMusic.src = musicPath;

        // Add event listeners for debugging (but only once)
        if (!this.currentMusic.hasAttribute('data-listeners-added')) {
            this.currentMusic.addEventListener('loadstart', () => {
                console.log(`🎵 Started loading: ${musicFile}`);
            });

            this.currentMusic.addEventListener('canplay', () => {
                console.log(`🎵 Can play: ${musicFile}`);
            });

            this.currentMusic.addEventListener('error', (e) => {
                console.error(`🎵 Audio error for ${musicFile}:`, e);
                console.error('Audio error code:', this.currentMusic.error?.code);
                console.error('Audio error message:', this.currentMusic.error?.message);
            });

            this.currentMusic.addEventListener('play', () => {
                console.log(`🎵 Music started playing: ${musicFile}`);
            });

            this.currentMusic.setAttribute('data-listeners-added', 'true');
        }

        // Handle loading and playing
        const playPromise = this.currentMusic.play();

        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log(`🎵 Successfully started music: ${musicFile}`);
                })
                .catch(error => {
                    console.error(`🎵 Failed to play music ${musicFile}:`, error);

                    // Try to enable audio on user interaction
                    if (error.name === 'NotAllowedError') {
                        console.log('🎵 Setting up user interaction audio');
                        this.setupUserInteractionAudio();
                    }
                });
        }
    }

    setupUserInteractionAudio() {
        const enableAudio = () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            // Try to play the current music
            if (this.currentMusic.src && this.currentMusic.paused) {
                const playPromise = this.currentMusic.play();
                if (playPromise !== undefined) {
                    playPromise.catch(console.error);
                }
            }

            // Remove event listeners after first interaction
            document.removeEventListener('click', enableAudio);
            document.removeEventListener('keydown', enableAudio);
            document.removeEventListener('touchstart', enableAudio);
        };

        // Add event listeners for user interaction
        document.addEventListener('click', enableAudio);
        document.addEventListener('keydown', enableAudio);
        document.addEventListener('touchstart', enableAudio);

        console.log('Audio will be enabled on user interaction');
    }

    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
            console.log('Music stopped');
        }
    }

    connectToAdmin() {
        this.pollForUpdates();
        this.updateConnectionStatus(false);
    }

    pollForUpdates() {
        setInterval(() => {
            try {
                const gameData = localStorage.getItem('botf_game_state');
                if (gameData) {
                    const newState = JSON.parse(gameData);

                    // Debug: Log the game state
                    console.log('Game state received:', {
                        currentBoss: newState.currentBoss,
                        bakunawaPhase2Active: newState.bakunawaPhase2Active
                    });

                    // Check for state changes BEFORE updating this.gameState
                    const oldBoss = this.currentBoss;
                    const newBoss = this.getBossFromGameState(newState);

                    // Always update the UI and state
                    this.gameState = newState;
                    this.updateUI(newState);
                    this.updateConnectionStatus(true);

                    // Check for boss change and handle music
                    if (oldBoss !== newBoss) {
                        console.log('Boss change detected:', { oldBoss, newBoss });
                        this.currentBoss = newBoss;
                        this.handleBossChange(newBoss, newState);
                    }
                } else {
                    console.log('No game state found in localStorage');
                    this.updateConnectionStatus(false);
                }
            } catch (error) {
                console.error('Error polling game state:', error);
                this.updateConnectionStatus(false);
            }
        }, 500);
    }

    getBossFromGameState(gameState) {
        // Try to get boss from currentBoss field first
        if (gameState.currentBoss) {
            console.log('🎵 Boss from gameState.currentBoss:', gameState.currentBoss);
            return gameState.currentBoss;
        }

        console.log('🎵 No boss found in gameState, returning null');
        return null;
    }

    handleBossChange(newBoss, gameState) {
        console.log(`🎵 handleBossChange called with boss: ${newBoss}`);
        console.log('🎵 Minokawa phase active:', gameState.bakunawaPhase2Active);

        // Store what music we should be playing
        let targetMusicBoss = null;

        // Handle Minokawa phase first
        this.handleMinokawaPhase(gameState);

        // Then handle music
        if (gameState.bakunawaPhase2Active) {
            console.log('🎵 Should play Minokawa music for dual boss phase');
            targetMusicBoss = 'Minokawa';
        } else if (newBoss) {
            console.log('🎵 Should play normal boss music:', newBoss);
            targetMusicBoss = newBoss;
        } else {
            console.log('🎵 No boss selected, stopping music');
            this.stopMusic();
            return;
        }

        // Get the music file that should be playing
        const targetMusicFile = this.getBossMusic(targetMusicBoss);
        const currentSrc = this.currentMusic.src;
        const isCurrentlyPlaying = !this.currentMusic.paused && !this.currentMusic.ended;

        // IMPROVED: Better file name comparison
        const currentFileName = currentSrc ? currentSrc.split('/').pop() : '';
        const targetFileName = targetMusicFile || '';
        const isSameFile = currentFileName === targetFileName;

        console.log(`🎵 Current playing: ${currentFileName}`);
        console.log(`🎵 Target music: ${targetFileName}`);
        console.log(`🎵 Same file check: ${isSameFile}`);
        console.log(`🎵 Currently playing: ${isCurrentlyPlaying}`);

        if (targetMusicFile && isSameFile && isCurrentlyPlaying) {
            console.log(`🎵 Target music ${targetMusicFile} is already playing. No change needed.`);
            return;
        }

        // Different music needed, change it
        console.log(`🎵 Changing music to: ${targetMusicBoss}`);
        this.playBossMusic(targetMusicBoss);
    }

    updateConnectionStatus(connected) {
        const status = document.getElementById('connection-status');
        if (status) {
            if (connected !== this.connected) {
                this.connected = connected;
                if (connected) {
                    status.textContent = 'Connected';
                    status.className = 'connection-status connected';
                } else {
                    status.textContent = 'Disconnected';
                    status.className = 'connection-status';
                }
            }
        } else {
            // Create connection status element if it doesn't exist
            if (connected !== this.connected) {
                this.connected = connected;
                console.log(`Connection status: ${connected ? 'Connected' : 'Disconnected'}`);
            }
        }
    }

    updateUI(gameState) {
        this.updateRound(gameState.currentRound);
        this.updateHeroes(gameState);
        this.updateBoss(gameState);
        this.updateActionLog(gameState.actionLog);
        this.updateGlobalDungeonBuffs(gameState);
        this.handleMinokawaPhase(gameState); // Handle phase transition
        if (gameState.actionLog && gameState.actionLog.length > 0) {
            this.updateLastSkills(gameState.actionLog);
        }
    }

    // NEW: Handle Minokawa phase transition
    handleMinokawaPhase(gameState) {
        const isMinokawaActive = gameState.bakunawaPhase2Active;
        const shouldChangeBackground = isMinokawaActive && this.currentBackground !== 'Background_Mino.png';
        const shouldRevertBackground = !isMinokawaActive && this.currentBackground !== 'Background.png';

        // Change background when phase changes
        if (shouldChangeBackground) {
            this.changeBackground('Background_Mino.png'); // Make sure this matches your actual file
            this.updateBossLayoutForMinokawa(gameState);

            this.playBossMusic('Minokawa');
        } else if (shouldRevertBackground) {
            this.changeBackground('Background.png');
            this.updateBossLayoutForSingle(gameState);

            if (this.currentBoss) {
                this.playBossMusic(this.currentBoss);
            }
        }
    }

    // Change background image
    changeBackground(backgroundFile) {
        // Target the correct element that has the background in CSS
        const fixedLayout = document.querySelector('.fixed-layout');
        if (fixedLayout) {
            fixedLayout.style.backgroundImage = `url('asset/${backgroundFile}')`;
            fixedLayout.style.backgroundSize = 'cover';
            fixedLayout.style.backgroundPosition = 'center';
            fixedLayout.style.backgroundRepeat = 'no-repeat';
            this.currentBackground = backgroundFile;
            console.log(`Background changed to: ${backgroundFile}`);
        } else {
            console.error('Fixed layout container not found for background change');
        }
    }

    // Update boss layout for Minokawa phase (dual bosses)
    updateBossLayoutForMinokawa(gameState) {
        const bossSection = document.querySelector('.boss-section');
        if (!bossSection) return;

        // Clear existing content
        bossSection.innerHTML = '';

        // Create dual boss grid layout with FIXED PIXEL dimensions
        bossSection.style.cssText = `
        position: relative;
        display: grid;
        grid-template-columns: 200px 200px;
        grid-template-rows: auto auto;
        gap: 0 23px;
        padding: 340px 73px 90px 80px;
        width: 576px;
        height: 650px;
    `;

        // Bakunawa (left side) - FIXED DIMENSIONS
        const bakunawaCard = document.createElement('div');
        bakunawaCard.className = 'boss-card';
        bakunawaCard.id = 'boss-card';
        bakunawaCard.style.cssText = 'grid-column: 1; grid-row: 1; width: 200px;';
        bakunawaCard.innerHTML = `
        <!-- Boss portrait -->
        <div class="boss-portrait-dual">
            <img src="asset/ALL CARDS/BOSS CARDS/bakunawaFinal.jpg" alt="Bakunawa" class="boss-image-dual">
        </div>

        <!-- Boss stats -->
        <div class="boss-stats-dual">
            <div class="hp-section">
                <div class="hp-bar boss-hp">
                    <div class="hp-fill" id="hp-boss"></div>
                </div>
                <div class="hp-text">
                    <span>HP: <span id="stats-hp-boss">${gameState.playersStats?.boss?.hp || 0}</span></span>
                    <div class="def-text">
                        <span>DEF: <span id="stats-def-boss">${gameState.playersStats?.boss?.def || 0}</span></span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Status effects -->
        <div class="status-effects-section-dual">
            <div class="status-effects buffs" id="status-effects-boss-buffs"></div>
            <div class="status-effects debuffs" id="status-effects-boss-debuffs"></div>
        </div>
    `;

        // Minokawa (right side) - FIXED DIMENSIONS
        const minokawaCard = document.createElement('div');
        minokawaCard.className = 'boss-card';
        minokawaCard.id = 'boss2-card';
        minokawaCard.style.cssText = 'grid-column: 2; grid-row: 1; width: 200px;';
        minokawaCard.innerHTML = `
        <!-- Boss portrait -->
        <div class="boss-portrait-dual">
            <img src="asset/ALL CARDS/BOSS CARDS/minokawaFinal.jpg" alt="Minokawa" class="boss-image-dual">
        </div>

        <!-- Boss stats -->
        <div class="boss-stats-dual">
            <div class="hp-section">
                <div class="hp-bar boss-hp">
                    <div class="hp-fill" id="hp-boss2"></div>
                </div>
                <div class="hp-text">
                    <span>HP: <span id="stats-hp-boss2">${gameState.playersStats?.boss2?.hp || 0}</span></span>
                    <div class="def-text">
                        <span>DEF: <span id="stats-def-boss2">${gameState.playersStats?.boss2?.def || 0}</span></span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Status effects -->
        <div class="status-effects-section-dual">
            <div class="status-effects buffs" id="status-effects-boss2-buffs"></div>
            <div class="status-effects debuffs" id="status-effects-boss2-debuffs"></div>
        </div>
    `;

        // Single Active Skill section (spans both columns) - FIXED DIMENSIONS
        const activeSkillSection = document.createElement('div');
        activeSkillSection.className = 'boss-active-skill-unified';

        // Force exact positioning for fixed layout
        activeSkillSection.style.cssText = `
        grid-column: 1 / 3;
        grid-row: 2;
        width: 521px;
        height: 60px;
        text-align: center;
        padding: 20px;
        border-radius: 12px;
        margin-top: 10px;
        box-sizing: border-box;
        position: relative;
    `;

        activeSkillSection.innerHTML = `
        <div class="active-skill-section" style="margin: 0; padding: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
            <div class="active-skill" id="active-skill-boss" style="width: 100%; display: flex; justify-content: center; align-items: center;">
                <span class="skill-name" style="font-size: 21px; font-weight: bold; color: #da70d6; text-align: center; width: 100%;">No recent boss action</span>
            </div>
        </div>
    `;

        // Add all elements to boss section
        bossSection.appendChild(bakunawaCard);
        bossSection.appendChild(minokawaCard);
        bossSection.appendChild(activeSkillSection);

        // Update HP bars and status effects
        this.updateBossHP(gameState.playersStats?.boss, 'boss');
        this.updateBossHP(gameState.playersStats?.boss2, 'boss2');
        this.updateBossStatusEffects(gameState);
        this.updateMinokawaStatusEffects(gameState);
    }

    // Update boss layout for single boss
    updateBossLayoutForSingle(gameState) {
        const bossSection = document.querySelector('.boss-section');
        if (!bossSection) return;

        // Reset to single boss layout
        bossSection.style.display = 'flex';
        bossSection.style.flexDirection = 'column';
        bossSection.style.gridTemplateColumns = '';
        bossSection.style.gridTemplateRows = '';
        bossSection.style.padding = '340px 40px 90px 20px';

        // Clear and recreate single boss layout
        bossSection.innerHTML = `
            <div class="boss-card" id="boss-card">
                <!-- RED: Boss portrait -->
                <div class="boss-portrait">
                    <img src="asset/ALL CARDS/BOSS CARDS/${gameState.currentBoss?.toLowerCase() || 'bathala'}Final.jpg" alt="Boss" class="boss-image" id="boss-image">
                </div>

                <!-- DARK RED: Boss stats -->
                <div class="boss-stats">
                    <div class="hp-section">
                        <div class="hp-bar boss-hp">
                            <div class="hp-fill" id="hp-boss"></div>
                        </div>
                        <div class="hp-text">
                            <span>HP: <span id="stats-hp-boss">${gameState.playersStats?.boss?.hp || 0}</span></span>
                            <div class="def-text">
                                <span>DEF: <span id="stats-def-boss">${gameState.playersStats?.boss?.def || 0}</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PURPLE: Active skill (text only) -->
                <div class="active-skill-section">
                    <div class="active-skill" id="active-skill-boss">
                        <span class="skill-name">None</span>
                    </div>
                </div>

                <!-- WHITE: Status effects -->
                <div class="status-effects-section">
                    <div class="status-effects buffs" id="status-effects-boss-buffs"></div>
                    <div class="status-effects debuffs" id="status-effects-boss-debuffs"></div>
                </div>
            </div>
        `;

        // Update HP bar and status effects
        this.updateBossHP(gameState.playersStats?.boss, 'boss');
        this.updateBossStatusEffects(gameState);
    }

    updateRound(round) {
        const roundDisplay = document.getElementById('round-display');
        if (roundDisplay) {
            roundDisplay.textContent = round || 1;
        }
    }

    updateHeroes(gameState) {
        const { playersStats } = gameState;
        ['player1', 'player2', 'player3', 'player4'].forEach(player => {
            if (playersStats[player]) {
                this.updateHeroHP(player, playersStats[player]);
                this.updateHeroCard(player, playersStats[player]);
                this.updateHeroStatusEffects(player, gameState);
            }
        });
    }

    updateBoss(gameState) {
        const { playersStats, currentBoss } = gameState;

        // Update boss name and image (for single boss mode)
        const bossName = document.getElementById('boss-name');
        const bossImage = document.getElementById('boss-image');
        if (bossName && currentBoss) {
            bossName.textContent = currentBoss;
        }
        if (bossImage && currentBoss) {
            bossImage.src = `asset/ALL CARDS/BOSS CARDS/${currentBoss.toLowerCase()}Final.jpg`;
            bossImage.alt = currentBoss;
        }

        // Update boss stats
        if (playersStats.boss) {
            this.updateBossHP(playersStats.boss, 'boss');
            this.updateBossCard(playersStats.boss, 'boss');
            this.updateBossStatusEffects(gameState);
        }

        // Update Minokawa stats if active
        if (gameState.bakunawaPhase2Active && playersStats.boss2) {
            this.updateBossHP(playersStats.boss2, 'boss2');
            this.updateBossCard(playersStats.boss2, 'boss2');
            this.updateMinokawaStatusEffects(gameState);
        }
    }

    // NEW: Update global dungeon buffs display
    updateGlobalDungeonBuffs(gameState) {
        const dungeonBuffs = [
            {
                id: 'special-items-1',
                active: gameState.dungeonBuff1Active,
                name: 'Dagat ng Kabisayaan',
                image: 'Balaraw.jpg',
                buff: '+15% DMG'
            },
            {
                id: 'special-items-2',
                active: gameState.dungeonBuff2Active,
                name: 'Daragang Magayon',
                image: 'Kalasag.jpg',
                buff: '+25% DEF'
            },
            {
                id: 'special-items-3',
                active: gameState.dungeonBuff3Active,
                name: 'Bundok Pulag',
                image: 'Agos-Oras.jpg',
                buff: 'No CD'
            }
        ];

        // Update each special item slot
        dungeonBuffs.forEach(buff => {
            this.renderGlobalDungeonBuff(buff);
        });

        // Keep slot 4 empty
        this.renderEmptySlot('special-items-4');
    }

    renderGlobalDungeonBuff(buff) {
        const container = document.getElementById(buff.id);
        if (!container) return;

        // Clear the container
        container.innerHTML = '';

        if (buff.active) {
            // Show the dungeon buff image on the left
            const buffDiv = document.createElement('div');
            buffDiv.className = 'special-item';
            buffDiv.innerHTML = `
                <img src="asset/ALL CARDS/SPECIAL ITEM CARDS/${buff.image}" alt="${buff.name}" 
                     onerror="this.src='asset/items/default.png'">
            `;
            buffDiv.title = buff.name;
            container.appendChild(buffDiv);

            // Show the buff indicator on the right ONLY when active
            const buffTextDiv = document.createElement('div');
            buffTextDiv.className = 'special-item-text';
            buffTextDiv.textContent = buff.buff;
            buffTextDiv.title = `${buff.name} - ${buff.buff}`;
            container.appendChild(buffTextDiv);
        } else {
            // Show empty state - no buff text when inactive
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'special-item-text empty';
            emptyDiv.textContent = '';
            container.appendChild(emptyDiv);
        }
    }

    renderEmptySlot(slotId) {
        const container = document.getElementById(slotId);
        if (!container) return;

        // Clear the container
        container.innerHTML = '';

        // Show reserved/blank state
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'special-item-text';
        emptyDiv.textContent = '';
        emptyDiv.style.color = '#00ff00';
        emptyDiv.style.fontSize = '0.6rem';
        emptyDiv.style.textAlign = 'center';
        emptyDiv.style.opacity = '0.3';
        container.appendChild(emptyDiv);
    }

    updateHeroHP(player, stats) {
        const hpFill = document.getElementById(`hp-${player}`);
        const hpLabel = document.getElementById(`stats-hp-${player}`);
        const shieldFill = document.getElementById(`shield-${player}`);
        const shieldLabel = document.getElementById(`stats-shield-${player}`);

        if (hpFill && stats) {
            const maxHP = stats.maxHp || stats.hp || 1;
            const currentHP = Math.max(0, stats.hp || 0);
            const shieldAmount = Math.max(0, stats.shield || 0);

            // Update HP bar
            const hpPercent = (currentHP / maxHP) * 100;
            hpFill.style.width = `${hpPercent}%`;

            // Update shield
            if (shieldFill) {
                const shieldPercent = (shieldAmount / maxHP) * 100;
                shieldFill.style.width = `${shieldPercent}%`;
                shieldFill.style.display = shieldAmount > 0 ? 'block' : 'none';
            }

            // Update labels
            if (hpLabel) hpLabel.textContent = currentHP;
            if (shieldLabel) shieldLabel.textContent = shieldAmount;
        }
    }

    updateBossHP(stats, bossId = 'boss') {
        const hpFill = document.getElementById(`hp-${bossId}`);
        const hpLabel = document.getElementById(`stats-hp-${bossId}`);
        const defLabel = document.getElementById(`stats-def-${bossId}`);

        if (hpFill && stats) {
            const maxHP = stats.maxHp || stats.hp || 1;
            const currentHP = Math.max(0, stats.hp || 0);

            // Update HP bar
            const hpPercent = (currentHP / maxHP) * 100;
            hpFill.style.width = `${hpPercent}%`;

            // Update labels
            if (hpLabel) hpLabel.textContent = currentHP;
            if (defLabel) defLabel.textContent = stats.def || 0;
        }
    }

    updateHeroCard(player, stats) {
        const card = document.getElementById(`${player}-card`);
        if (card && stats) {
            if (stats.hp <= 0) {
                card.classList.add('dead');
            } else {
                card.classList.remove('dead');
            }
        }
    }

    updateBossCard(stats, bossId = 'boss') {
        const card = document.getElementById(`${bossId}-card`);
        if (card && stats) {
            if (stats.hp <= 0) {
                card.classList.add('dead');
            } else {
                card.classList.remove('dead');
            }
        }
    }

    initializeSpecialItems() {
        // Initialize all special items as empty
        for (let i = 1; i <= 3; i++) {
            this.renderGlobalDungeonBuff({
                id: `special-items-${i}`,
                active: false,
                name: 'Empty',
                image: 'default.png'
            });
        }

        // Initialize slot 4 as reserved
        this.renderEmptySlot('special-items-4');
    }

    updateLastSkills(actionLog) {
        if (!actionLog || actionLog.length === 0) return;

        // Parse recent actions to find last skills used
        const recentActions = actionLog.slice(-10);

        recentActions.forEach(action => {
            // Parse player skills
            const playerMatch = action.match(/(player\d+) used (.+?):/);
            if (playerMatch) {
                const [, player, skillName] = playerMatch;
                this.updateActiveSkill(player, skillName);
            }
            // Parse boss skills - IMPROVED REGEX to catch both bosses
            const bossMatch = action.match(/(Bakunawa|Minokawa|Bathala|Mayari|Apolaki|Manananggal|Tiyanak|Siren|Kapre) used (.+?):/);
            if (bossMatch) {
                const [, bossName, skillName] = bossMatch;
                // Always update the unified boss skill display with boss name
                this.updateActiveSkill('boss', `${bossName}: ${skillName}`);
            }
        });
    }

    updateActiveSkill(entity, skillName) {
        let cleanSkillName = skillName;

        // Remove common target suffixes
        cleanSkillName = cleanSkillName.replace(/ on .+$/i, ''); // Remove " on boss", " on player1", etc.
        cleanSkillName = cleanSkillName.replace(/ to .+$/i, ''); // Remove " to boss", " to player1", etc.
        cleanSkillName = cleanSkillName.trim();

        if (cleanSkillName !== this.lastSkills[entity]) {
            this.lastSkills[entity] = cleanSkillName;
            let charname = '';
            switch (entity) {
                case 'player1':
                    charname = 'Mandirigma';
                    break;
                case 'player2':
                    charname = 'Bagani';
                    break;
                case 'player3':
                    charname = 'Babaylan';
                    break;
                case 'player4':
                    charname = 'Mangangayaw';
                    break;
                case 'boss':
                    this.setActiveSkillDisplay(entity, cleanSkillName);
                    return;
            }

            const skillContainer = document.getElementById(`active-skill-${entity}`);
            if (skillContainer) {
                const skillImage = skillContainer.querySelector('.skill-image');
                const skillNameSpan = skillContainer.querySelector('.skill-name');

                if (skillImage) {
                    // Use cleaned skill name for image path
                    skillImage.src = `asset/ALL CARDS/SKILL CARDS/${charname}/${charname}${cleanSkillName.replace(/ /g, '_').replace('\’', '')}.jpg`;
                    skillImage.alt = cleanSkillName;
                }
                if (skillNameSpan) {
                    skillNameSpan.textContent = cleanSkillName;
                }
            }
        }
    }

    setActiveSkillDisplay(entity, skillName) {
        const skillContainer = document.getElementById(`active-skill-${entity}`);
        if (skillContainer) {
            const skillNameSpan = skillContainer.querySelector('.skill-name');
            if (skillNameSpan) {
                skillNameSpan.textContent = skillName;
            }
        }
    }

    updateHeroStatusEffects(player, gameState) {
        const buffsContainer = document.getElementById(`status-effects-${player}-buffs`);
        const debuffsContainer = document.getElementById(`status-effects-${player}-debuffs`);

        if (!buffsContainer || !debuffsContainer) return;

        // Clear both containers
        buffsContainer.innerHTML = '';
        debuffsContainer.innerHTML = '';

        const effects = this.collectEntityEffects(player, gameState);

        // Separate buffs and debuffs
        const buffs = effects.filter(effect => effect.type === 'buff');
        const debuffs = effects.filter(effect => effect.type === 'debuff');

        // Render buffs in upper container
        this.renderStatusEffects(buffsContainer, buffs);

        // Render debuffs in lower container
        this.renderStatusEffects(debuffsContainer, debuffs);
    }

    updateBossStatusEffects(gameState) {
        const buffsContainer = document.getElementById('status-effects-boss-buffs');
        const debuffsContainer = document.getElementById('status-effects-boss-debuffs');

        if (!buffsContainer || !debuffsContainer) return;

        // Clear both containers
        buffsContainer.innerHTML = '';
        debuffsContainer.innerHTML = '';

        const effects = this.collectEntityEffects('boss', gameState);

        // Separate buffs and debuffs
        const buffs = effects.filter(effect => effect.type === 'buff');
        const debuffs = effects.filter(effect => effect.type === 'debuff');

        // Render buffs in upper container
        this.renderStatusEffects(buffsContainer, buffs);

        // Render debuffs in lower container
        this.renderStatusEffects(debuffsContainer, debuffs);
    }

    // NEW: Update Minokawa status effects
    updateMinokawaStatusEffects(gameState) {
        const buffsContainer = document.getElementById('status-effects-boss2-buffs');
        const debuffsContainer = document.getElementById('status-effects-boss2-debuffs');

        if (!buffsContainer || !debuffsContainer) return;

        // Clear both containers
        buffsContainer.innerHTML = '';
        debuffsContainer.innerHTML = '';

        const effects = this.collectEntityEffects('boss2', gameState);

        // Separate buffs and debuffs
        const buffs = effects.filter(effect => effect.type === 'buff');
        const debuffs = effects.filter(effect => effect.type === 'debuff');

        // Render buffs in upper container
        this.renderStatusEffects(buffsContainer, buffs);

        // Render debuffs in lower container
        this.renderStatusEffects(debuffsContainer, debuffs);
    }

    renderStatusEffects(container, effects) {
        effects.forEach(effect => {
            const effectDiv = document.createElement('div');
            effectDiv.className = `status-effect ${effect.type}`;
            effectDiv.title = effect.description;

            if (effect.turns === '∞') {
                effectDiv.textContent = effect.name;
            } else {
                effectDiv.innerHTML = `${effect.name} <span class="turns">(${effect.turns})</span>`;
            }

            container.appendChild(effectDiv);
        });
    }

    collectEntityEffects(entity, gameState) {
        const effects = [];
        const {
            mandirigmaRageBuff, baganiLastStandBuff, blessingBuff, focusAimBuff,
            bathalaMandateBuff, daybreakFuryBuff, strengthenedBuff, bossInvulnerable,
            bonecrackedDebuffs, bindDebuffs, moonfallDebuffs, eyeDragonDebuffs, devouredDebuffs,
            dungeonBuff1Active, dungeonBuff2Active, dungeonBuff3Active
        } = gameState;

        // Buffs
        if (entity === 'player1' && mandirigmaRageBuff?.turnsLeft > 0) {
            effects.push({
                name: 'Rage',
                type: 'buff',
                turns: mandirigmaRageBuff.turnsLeft,
                description: 'dmg+50%, defignore+20%'
            });
        }

        if (entity === 'player2' && baganiLastStandBuff?.turnsLeft > 0) {
            effects.push({
                name: 'Last Stand',
                type: 'buff',
                turns: baganiLastStandBuff.turnsLeft,
                description: 'def+50%'
            });
        }

        if (blessingBuff?.[entity] > 0) {
            effects.push({
                name: 'Blessing',
                type: 'buff',
                turns: blessingBuff[entity],
                description: 'dmg+20%'
            });
        }

        if (focusAimBuff?.[entity]?.turnsLeft > 0) {
            effects.push({
                name: 'Focus Aim',
                type: 'buff',
                turns: focusAimBuff[entity].turnsLeft,
                description: 'defignore+20%'
            });
        }

        if ((entity === 'boss' || entity === 'boss2') && bathalaMandateBuff?.turnsLeft > 0) {
            effects.push({
                name: "Heaven's Mandate",
                type: 'buff',
                turns: bathalaMandateBuff.turnsLeft,
                description: 'def+30%'
            });
        }

        if ((entity === 'boss' || entity === 'boss2') && daybreakFuryBuff?.turnsLeft > 0) {
            effects.push({
                name: 'Daybreak Fury',
                type: 'buff',
                turns: daybreakFuryBuff.turnsLeft,
                description: 'atk+40%, defignore+20%'
            });
        }

        if ((entity === 'boss' || entity === 'boss2') && strengthenedBuff?.boss?.attacksLeft > 0) {
            effects.push({
                name: 'Strengthened',
                type: 'buff',
                turns: strengthenedBuff.boss.attacksLeft,
                description: 'next dmg x2'
            });
        }

        if ((entity === 'boss' || entity === 'boss2') && bossInvulnerable?.turnsLeft > 0) {
            effects.push({
                name: 'Invulnerable',
                type: 'buff',
                turns: bossInvulnerable.turnsLeft,
                description: 'immune to damage'
            });
        }

        // Debuffs
        if (bonecrackedDebuffs?.[entity]) {
            effects.push({
                name: 'Bone Cracked',
                type: 'debuff',
                turns: bonecrackedDebuffs[entity].turnsLeft,
                description: 'def-10%'
            });
        }

        if (bindDebuffs?.[entity]) {
            effects.push({
                name: 'Bind',
                type: 'debuff',
                turns: bindDebuffs[entity].turnsLeft,
                description: 'def-15%'
            });
        }

        if (moonfallDebuffs?.[entity]) {
            effects.push({
                name: 'Moonfall',
                type: 'debuff',
                turns: moonfallDebuffs[entity].turnsLeft,
                description: 'def-20%'
            });
        }

        if (eyeDragonDebuffs?.[entity]) {
            effects.push({
                name: 'Eye of the Dragon',
                type: 'debuff',
                turns: eyeDragonDebuffs[entity].turnsLeft,
                description: 'def-10%'
            });
        }

        if (devouredDebuffs?.[entity]) {
            effects.push({
                name: 'Devoured',
                type: 'debuff',
                turns: devouredDebuffs[entity].turnsLeft,
                description: 'DoT 20%MAG'
            });
        }

        return effects;
    }

    updateActionLog(actionLog) {
        const logContainer = document.getElementById('action-log');
        if (!logContainer || !actionLog) return;

        logContainer.innerHTML = '';

        const recentActions = actionLog.slice(-50);
        recentActions.forEach(action => {
            const actionDiv = document.createElement('div');
            actionDiv.textContent = action;
            actionDiv.style.marginBottom = '3px';
            actionDiv.style.color = this.getActionColor(action);
            logContainer.appendChild(actionDiv);
        });

        logContainer.scrollTop = logContainer.scrollHeight;
    }

    getActionColor(action) {
        if (action.includes('healed') || action.includes('Heal')) {
            return '#90EE90';
        } else if (action.includes('Dealt') || action.includes('damage')) {
            return '#FFB6C1';
        } else if (action.includes('buff') || action.includes('Buff')) {
            return '#87CEEB';
        } else if (action.includes('debuff') || action.includes('Debuff')) {
            return '#DDA0DD';
        } else if (action.includes('defeated') || action.includes('died')) {
            return '#FF6B6B';
        }
        return '#f9f9f9';
    }

    setupUI() {
        console.log('Game Viewer initialized with Minokawa phase support');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GameViewer();
});