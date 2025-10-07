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
        this.init();
    }

    init() {
        this.connectToAdmin();
        this.setupUI();
        this.initializeSpecialItems();
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
                    if (JSON.stringify(newState) !== JSON.stringify(this.gameState)) {
                        this.gameState = newState;
                        this.updateUI(newState);
                        this.updateConnectionStatus(true);
                    }
                }
            } catch (error) {
                console.error('Error polling game state:', error);
                this.updateConnectionStatus(false);
            }
        }, 500);
    }

    updateConnectionStatus(connected) {
        const status = document.getElementById('connection-status');
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
    }

    updateUI(gameState) {
        this.updateRound(gameState.currentRound);
        this.updateHeroes(gameState);
        this.updateBoss(gameState);
        this.updateActionLog(gameState.actionLog);
        this.updateLastSkills(gameState.actionLog);
        this.updateGlobalDungeonBuffs(gameState); // Update global dungeon buffs
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

        // Update boss name and image
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
            this.updateBossHP(playersStats.boss);
            this.updateBossCard(playersStats.boss);
            this.updateBossStatusEffects(gameState);
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

    updateBossHP(stats) {
        const hpFill = document.getElementById('hp-boss');
        const hpLabel = document.getElementById('stats-hp-boss');
        const defLabel = document.getElementById('stats-def-boss');

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

    updateBossCard(stats) {
        const card = document.getElementById('boss-card');
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

            // Parse boss skills
            const bossMatch = action.match(/(\w+) used (.+?):/);
            if (bossMatch && !bossMatch[1].startsWith('player')) {
                const [, boss, skillName] = bossMatch;
                this.updateActiveSkill('boss', skillName);
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

        if (entity === 'boss' && bathalaMandateBuff?.turnsLeft > 0) {
            effects.push({
                name: "Heaven's Mandate",
                type: 'buff',
                turns: bathalaMandateBuff.turnsLeft,
                description: 'def+30%'
            });
        }

        if (entity === 'boss' && daybreakFuryBuff?.turnsLeft > 0) {
            effects.push({
                name: 'Daybreak Fury',
                type: 'buff',
                turns: daybreakFuryBuff.turnsLeft,
                description: 'atk+40%, defignore+20%'
            });
        }

        if (entity === 'boss' && strengthenedBuff?.boss?.attacksLeft > 0) {
            effects.push({
                name: 'Strengthened',
                type: 'buff',
                turns: strengthenedBuff.boss.attacksLeft,
                description: 'next dmg x2'
            });
        }

        if (entity === 'boss' && bossInvulnerable?.turnsLeft > 0) {
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
        console.log('Game Viewer initialized with global dungeon buffs');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GameViewer();
});