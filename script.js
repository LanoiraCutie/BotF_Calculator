const playersStats = {
    player1: { hp: 100, atk: 20, def: 10 },
    player2: { hp: 100, atk: 25, def: 15 },
    player3: { hp: 100, atk: 30, def: 20 },
    player4: { hp: 100, atk: 35, def: 25 },
    boss: { hp: 200, atk: 50, mag: 50, def: 30 },
    boss2: { hp: 0, atk: 0, mag: 0, def: 0, maxHp: 0 }
};

const presets = {
    player1: {
        glassCanon: { hp: 650, atk: 120, def: 60 }, // Glass Canon
        bruiser: { hp: 800, atk: 90, def: 90 },     // Bruiser
        berserker: { hp: 700, atk: 100, def: 75 }   // Berserker
    },
    player2: {
        wall: { hp: 1050, atk: 30, def: 250 },          // Wall
        juggernaut: { hp: 1000, atk: 60, def: 190 },    // Juggernaut
        damageSoaker: { hp: 1200, atk: 40, def: 160 }   // Damage Soaker
    },
    player3: {
        pureHealer: { hp: 500, mag: 220, def: 70 },       // Pure Healer
        supportCleric: { hp: 650, mag: 200, def: 80 },    // Support Cleric
        battlePriest: { hp: 800, mag: 180, def: 130 }     // Battle Priest
    },
    player4: {
        sniper: { hp: 600, atk: 110, def: 50 },       // Sniper
        ranger: { hp: 700, atk: 90, def: 100 },       // Ranger
        hunter: { hp: 750, atk: 100, def: 80 }        // Hunter
    },
    boss: {
        Bathala: { hp: 2800, atk: 110, mag: 250, def: 200 },
        Mayari: { hp: 2100, atk: 300, mag: 120, def: 180 },
        Apolaki: { hp: 1700, atk: 360, mag: 70, def: 150 },
        Bakunawa: { hp: 2000, atk: 40, mag: 300, def: 190 },
        Minokawa: { hp: 2000, atk: 300, mag: 40, def: 190 }, // Total HP: Inherit from Bakunawa (See Bakunawa: Eat the Sun and Moon)
        Manananggal: { hp: 900, atk: 230, mag: 35, def: 100 },      // Assassin Type
        Tiyanak: { hp: 1150, atk: 50, mag: 195, def: 125 },         // Trickster
        Siren: { hp: 1000, atk: 20, mag: 240, def: 80 },            // Mage
        Kapre: { hp: 1300, atk: 200, mag: 0, def: 150 },            // Tank
    }
};

const playerSkills = {
    player1: [
        { name: "Attack", flatdamage: 50, damagePercent: 1.5, cooldown: 1, description: "Deals fair damage." },
        { name: "Heavy Attack", damagePercent: 3.34, cooldown: 2, bonecracked_if_active: true, duration: 1, reduce_enemyDEF: 0.1, description: "Deals heavy damage." },
        { name: "All-in Attack", damagePercent: 8.34, cooldown: 3, description: "Deals massive damage." },
        { name: "Rest", remove_debuff: true, cooldown: 3, description: "Removes negative status effects for self." },
        { name: "Berserk", HP_requirement_from_maxHP_below: 0.51, mandirigma_rage: true, dmgMultiplier_increase: 0.5, defIgnore: 0.2, duration: 3, cooldown: 4, description: "Increases damage for 2 turns." }
    ],
    player2: [
        { name: "Shield Bash", flatdamage: 50, damagePercent: 1, cooldown: 1, description: "Deals small damage to the boss." },
        { name: "Fortify", maxHp_perc: 0.3, cooldown: 4, description: "Gain shield for himself for 2 turns." },
        { name: "Last Stand", HP_requirement_from_maxHP_below: 0.2, last_stand: true, defIncrease: 0.5, cooldown: 4, description: "Gain defense, if low HP for 3 turns." },
        { name: "Guardian’s Oath", currHP_sac: 0.25, currHP_shield: 0.25, cooldown: 4, description: "Sacrifice HP, shield all allies, unstackable." }
    ],
    player3: [
        { name: "Heal", heal_flat: 100, magPercent_heal: 0.5, self_heal: 0.5, cooldown: 2, description: "Restore HP to ally, and heals self." },
        { name: "Blessing", blessing: true, duration: 2, dmgMultiplier_increase: 0.5, cooldown: 3, description: "Buffs ally dmg (2 turns)." },
        { name: "Mana Surge", damagePercent: 1, cooldown: 2, description: "Deals damage to the enemy." },
        { name: "Purify", remove_debuff: true, hitsAll: true, cooldown: 2, description: "Removes all debuff to all players." },
        { name: "Sacrifice", Hpflat_sac: 200, heal_flat: 50, magPercent_heal: 1, cooldown: 3, description: "Lose HP, heal all allies HP" },
    ],
    player4: [
        { name: "Quick Shot", flatdamage: 150, damagePercent: 1.5, cooldown: 1, description: "Deals fair damage." },
        { name: "Piercing Arrow", damagePercent: 2.25, defIgnore: 1, cooldown: 3, description: "Deals big damage, ignores defense." },
        { name: "Volley", flatdamage: 50, damagePercent: 1, cooldown: 1, description: "Deals fair damage to all enemies." },
        { name: "Focus Aim", focused_aim: true, duration: 2, defIgnore_buff: 0.2, cooldown: 4, description: "Next 2 attacks ignore some DEF." },
        { name: "Explosive Arrow", flatdamage: 300, damagePercent: 5, cooldown: 3, description: "Deals massive damage to all enemies." }
    ]
};

const bossSkills = {
    Bathala: [
        { name: "Heaven's Mandate (Buff)", heavens_mandate: true, def_increase: 0.3, remove_debuff: true, duration: 3, description: "Increase DEF 30% for 3 turns, removes debuff, unstackable" },
        { name: "Skyhammer (Single Target)", magPercentDamage: 1.75, description: "175% MAG on a player, 30% chance to stun 1p" },
        { name: "Thunderous Decree (AoE)", magPercentDamage: 1.25, hitsAll: true, description: "125% MAG on all players, 30% stun 2p" },
        { name: "Celestial Judgement (Ultimate)", damagePercent: 1, magPercentDamage: 1, dmgMultiplier: 3, description: "combine ATK and MAG with a multiplier of 3.0, rest 1 turn" }
    ],
    Mayari: [
        { name: "Moonlight Grace (Heal)", healPercent_maxHp: 0.25, description: "Heals self for 25% of max HP." },
        { name: "Lunar Strike (Single Target)", damagePercent: 1.15, magPercentDamage: 0.2, description: "115% ATK + 20% MAG." },
        { name: "Moonfall Spear (Single Target, Debuff)", damagePercent: 1.05, moonfall_debuff: true, reduce_enemyDEF: 0.2, duration: 2, description: "Deals 105% ATK + Moonfall to a player." },
        { name: "Tide of Night (Buff, Low AoE Damage)", enemyDamage_currHp: 0.3, invulnerable_turn: 1, remove_debuff: true, hitsAll: true, description: "Creates a mist that will damage all its opponent 30% to its current HP, remove debuff" }
    ],
    Apolaki: [
        { name: "Solar Flare Slash (Damage)", damagePercent: 1.75, description: "Deals 175% ATK to a player." },
        { name: "Radiant Charge (Dash Attack)", damagePercent: 0.8, magPercentDamage: 1, hitsAll: true, description: "Deals 80% ATK + 100% MAG to all players." },
        { name: "Daybreak Fury (Self Buff)", daybreak_fury: true, atk_increase: 0.4, defIgnore_buff: 0.2, currHP_sac: 0.3, duration: 1, description: "Increase 40% of its ATK and ignores 20% DEF for the next turn. Sacrifice 30% current HP" },
        { name: "Sunburst Nova (AoE Burst)", damagePercent: 1, magPercentDamage: 1.25, dmgMultiplier: 1.2, hitsAll: true, description: "Deals 1.2x(100% ATK + 125% MAG), dealing AOE damage to all enemies." }
    ],
    Bakunawa: [
        { name: "Eclipse Fang (Damage, Lifesteal)", healFrom_mag: 50, healFrom_magPerc: 1, magPercentDamage: 1.10, description: "Deals 110% MAG as damage to a single target, heals itself for 50 (+100%) MAG." },
        { name: "Serpent’s Coil (Debuff, Slight Damage)", bind_debuff: true, reduce_enemyDEF: 0.15, duration: 2, flatdamage: 50, damagePercent: 1.5, description: "Deal 50 (+150%) ATK damage, binds enemy" },
        { name: "Lunar Devour (AoE, Debuff)", magPercentDamage: 0.8, hitsAll: true, devoured_debuff: true, devoured_dot_magperc: 0.2, duration: 2, description: "Deal 80% MAG to all enemies. Each enemy hit gets Devoured." },
        { name: "Shadow Dive (Counter)", strengthened: true, strengthened_attack_num: 1, strengthened_attack_mult: 2, description: "Bakunawa will recharge its inner magical power, next attack deals double damage." }
    ],
    Minokawa: [
        { name: "Solar Devour (Single Damage)", damagePercent: 0.9, defIgnore: 0.1, description: "Deal 90% ATK, ignore 10% DEF." },
        { name: "Wing Tempest (AOE Damage)", damagePercent: 0.8, hitsAll: true, eye_dragon: true, duration: 2, reduce_enemyDEF: 0.1, description: "Deals 80% ATK damage to all enemies. Each target that are hit by this gets inflicted by Eye of the Dragon" },
        { name: "Brave Slash (Magic AOE)", damagePercent: 0.8, magPercentDamage: 1, hitsAll: true, description: "Create a powerful air slash, dealing 80% ATK + 100% MAG." },
        { name: "Sky’s Wrath (Single Damage, Heal)", damagePercent: 1.8, maxHp_heal_if_defeatedhero: 0.2, description: "Deals 180% ATK to one target, if the target is defeated, it heals itself 20% of its max HP" }
    ],
    Manananggal: [
        { name: "Batwing Slash", damagePercent: 1.2, description: "Deals 1.2x ATK to one enemy." },
        { name: "Blood Splash", damagePercent: 1.5, description: "Deals 1.5x ATK to single enemies." },
        { name: "Split Body", damagePercent: 1.6, hitsAll: true, description: "Deals 1.6x ATK to all enemies." }
    ],
    Tiyanak: [
        { name: "Claw Latch", magPercentDamage: 1.2, description: "Deals 1.2x MAG to one enemy." },
        { name: "Blood Hex", magPercentDamage: 1.5, description: "Deals 1.5x MAG to single enemies." },
        { name: "Demonic Wail", magPercentDamage: 1.6, hitsAll: true, description: "Deals 1.6x MAG to all enemies." }
    ],
    Siren: [
        { name: "Drowning Current", magPercentDamage: 1.2, description: "Deals 1.2x MAG to one enemy." },
        { name: "Tidal Surge", magPercentDamage: 1.5, description: "Deals 1.5x MAG to single enemies." },
        { name: "Moonlight Hymn", magPercentDamage: 1.6, hitsAll: true, description: "Deals 1.6x MAG to all enemies." }
    ],
    Kapre: [
        { name: "Tree Smash", damagePercent: 1.2, description: "Deals 1.2x ATK to one enemy." },
        { name: "Uproot Smash", damagePercent: 1.5, description: "Deals 1.5x ATK to single enemies." },
        { name: "Forest Wrath", damagePercent: 1.6, hitsAll: true, description: "Deals 1.6x ATK to all enemies." }
    ]

};
// Expose bossSkills and playersStats to global scope for HTML dynamic updates
window.bossSkills = bossSkills;
window.playersStats = playersStats;
window.bakunawaPhase2Active = false;

// Global buff flags
window.deadEntities = new Set(); // tracks which entities are dead
window.critActive = false;
window.bathalaMandateBuff = { turnsLeft: 0, defIncrease: 0 };
window.mandirigmaRageBuff = { turnsLeft: 0, dmgIncrease: 0, defIgnore: 0 }; // Replace checkbox system
window.baganiLastStandBuff = { turnsLeft: 0, defIncrease: 0 }; // Replace checkbox system
window.blessingBuff = {}; // blessingBuff[playerId] = remainingTurns
window.focusAimBuff = {};  // focusAimBuff[playerId] = { attacksLeft, defIgnore }
window.moonfallDebuffs = {}; // moonfallDebuffs[playerId] = remainingTurns
window.bindDebuffs = {}; // bindDebuffs[playerId] = { turnsLeft, defReduce }
window.devouredDebuffs = {}; // devouredDebuffs[playerId] = { turnsLeft, dotMagPerc }
window.strengthenedBuff = {}; // strengthenedBuff[bossId] = { attacksLeft, multiplier }
window.bossInvulnerable = { turnsLeft: 0 };
window.daybreakFuryBuff = { turnsLeft: 0, atkIncrease: 0, defIgnore: 0 };
window.eyeDragonDebuffs = {}; // eyeDragonDebuffs[playerId] = { turnsLeft, defReduce }
window.dungeonBuff1Active = false; // +15% DMG to all players
window.dungeonBuff2Active = false; // +25% DEF to all players  
window.dungeonBuff3Active = false; // No cooldown for all skills
window.currentBossName = null; // Track current boss for change detection
window.deadBosses = new Set(); // Track which bosses have been permanently defeated
window.deadPlayers = new Set(); // Track which players have been permanently defeated
window.bonecrackedDebuffs = {}; // bonecrackedDebuffs[targetId] = { turnsLeft, defReduce }

function resetAllBuffsDebuffsAndCooldowns() {
    console.log('Resetting all buffs, debuffs, and cooldowns due to boss change...');

    // Reset all player cooldowns
    ['player1', 'player2', 'player3', 'player4'].forEach(player => {
        cooldowns[player] = {};
    });

    // Clear all buff/debuff timers (but preserve checkbox-activated ones)
    const preserveDungeon1 = window.dungeonBuff1Active;
    const preserveDungeon2 = window.dungeonBuff2Active;
    const preserveDungeon3 = window.dungeonBuff3Active;
    const preserveCrit = window.critActive;

    // Reset boss buffs/debuffs
    window.bathalaMandateBuff = { turnsLeft: 0, defIncrease: 0 };
    window.daybreakFuryBuff = { turnsLeft: 0, atkIncrease: 0, defIgnore: 0 };
    window.strengthenedBuff = {};
    window.bossInvulnerable = { turnsLeft: 0 };

    // Reset player buffs/debuffs
    window.mandirigmaRageBuff = { turnsLeft: 0, dmgIncrease: 0, defIgnore: 0 };
    window.baganiLastStandBuff = { turnsLeft: 0, defIncrease: 0 };
    window.blessingBuff = {};
    window.focusAimBuff = {};

    // Clear all debuffs
    window.bindDebuffs = {};
    window.devouredDebuffs = {};
    window.eyeDragonDebuffs = {};
    window.moonfallDebuffs = {};
    window.bonecrackedDebuffs = {};

    // Clear all shields
    ['player1', 'player2', 'player3', 'player4', 'boss', 'boss2'].forEach(entity => {
        if (playersStats[entity]) {
            playersStats[entity].shield = 0;
            playersStats[entity].shieldStacks = [];
        }
    });

    // Restore checkbox-activated buffs
    window.dungeonBuff1Active = preserveDungeon1;
    window.dungeonBuff2Active = preserveDungeon2;
    window.dungeonBuff3Active = preserveDungeon3;
    window.critActive = preserveCrit;

    // Preserve dead bosses before clearing deadEntities
    const bossSelect = document.getElementById('preset-entity');
    const selectedPreset = bossSelect ? bossSelect.value : null;
    const shouldKeepBossDead = selectedPreset && window.deadBosses.has(selectedPreset);

    // Clear dead entities (resurrect all)
    window.deadEntities.clear();

    // Immediately re-add boss to deadEntities if it should stay dead
    if (shouldKeepBossDead) {
        window.deadEntities.add('boss');
        playersStats.boss.hp = 0; // Ensure HP is also 0
    }

    // Reset HP to max for all entities (except bosses - let applyPreset handle them)
    ['player1', 'player2', 'player3', 'player4', 'boss'].forEach(entity => {
        if (playersStats[entity] && playersStats[entity].maxHp) {
            if (entity === 'boss') {
                // Only reset boss HP if it's not supposed to stay dead
                if (!window.deadEntities.has('boss')) {
                    playersStats[entity].hp = playersStats[entity].maxHp;
                }
                // If boss should stay dead, leave HP at 0
            } else if (window.deadPlayers.has(entity)) {
                // Keep dead players dead
                playersStats[entity].hp = 0;
                window.deadEntities.add(entity);
                console.log(`${entity} remains dead from previous defeat.`);
            } else {
                // Resurrect alive players
                playersStats[entity].hp = playersStats[entity].maxHp;
            }
        }
    });

    // Update all UI elements
    ['player1', 'player2', 'player3', 'player4', 'boss'].forEach(entity => {
        updateHPAndShieldUI(entity);
        const label = document.getElementById(`stats-hp-${entity}`);
        const hpBar = document.getElementById(`hp-${entity}`);

        if ((entity === 'boss' && window.deadEntities.has('boss')) ||
            (entity !== 'boss' && window.deadPlayers.has(entity))) {
            // Show dead state
            if (label) label.innerText = '0 (DEAD)';
            if (hpBar) {
                hpBar.style.width = '0%';
                hpBar.style.backgroundColor = '#666';
            }
        } else {
            // Show alive state
            if (label) label.innerText = playersStats[entity].hp;
            if (hpBar && entity === 'boss') {
                hpBar.style.backgroundColor = '#4caf50';
            }
        }
    });

    // Update skill descriptions to show reset cooldowns
    updateAllSkillCooldownDescriptions();

    // Update status effects UI
    updateAllStatusEffectsUI();

    console.log('Reset complete: All buffs, debuffs, shields, and cooldowns cleared. HP restored to max.');
}

function isMiniboss(bossName) {
    const minibosses = ['Manananggal', 'Tiyanak', 'Siren', 'Kapre'];
    return minibosses.includes(bossName);
}

function preserveMinibossState() {
    console.log('Preserving state for miniboss transition...');
    
    // Store current player HP values
    const preservedPlayerHP = {};
    ['player1', 'player2', 'player3', 'player4'].forEach(player => {
        if (playersStats[player]) {
            preservedPlayerHP[player] = playersStats[player].hp;
        }
    });

    // Store current cooldowns
    const preservedCooldowns = {};
    ['player1', 'player2', 'player3', 'player4'].forEach(player => {
        preservedCooldowns[player] = { ...cooldowns[player] };
    });

    return { preservedPlayerHP, preservedCooldowns };
}

function restoreMinibossState(preservedState) {
    console.log('Restoring state after miniboss transition...');
    
    const { preservedPlayerHP, preservedCooldowns } = preservedState;

    // Restore player HP
    Object.keys(preservedPlayerHP).forEach(player => {
        if (playersStats[player]) {
            playersStats[player].hp = preservedPlayerHP[player];
            updateHPAndShieldUI(player);
            
            const label = document.getElementById(`stats-hp-${player}`);
            if (label) label.innerText = playersStats[player].hp;
        }
    });

    // Restore cooldowns
    Object.keys(preservedCooldowns).forEach(player => {
        cooldowns[player] = { ...preservedCooldowns[player] };
    });

    // Update UI to reflect restored cooldowns
    updateAllSkillCooldownDescriptions();
    
    console.log('Miniboss state restoration complete.');
}

// Status effect update function
function updateStatusEffectsUI(entity) {
    const container = document.getElementById(`status-effects-${entity}`);
    if (!container) return;

    container.innerHTML = ''; // Clear existing effects

    const effects = [];

    // Check buffs (green)
    if (entity === 'player1' && window.mandirigmaRageBuff?.turnsLeft > 0) {
        effects.push({
            name: 'Rage',
            type: 'buff',
            turns: window.mandirigmaRageBuff.turnsLeft,
            description: 'dmg+50%, defignore+20%'
        });
    }

    if (entity === 'player2' && window.baganiLastStandBuff?.turnsLeft > 0) {
        effects.push({
            name: 'Last Stand',
            type: 'buff',
            turns: window.baganiLastStandBuff.turnsLeft,
            description: 'def+50%'
        });
    }

    if (window.blessingBuff && window.blessingBuff[entity] > 0) {
        effects.push({
            name: 'Blessing',
            type: 'buff',
            turns: window.blessingBuff[entity],
            description: 'dmg+20%'
        });
    }

    if (window.focusAimBuff && window.focusAimBuff[entity]?.turnsLeft > 0) {
        effects.push({
            name: 'Focus Aim',
            type: 'buff',
            turns: window.focusAimBuff[entity].turnsLeft,
            description: 'defignore+20%'
        });
    }

    if (entity === 'boss' && window.bathalaMandateBuff?.turnsLeft > 0) {
        effects.push({
            name: "Heaven's Mandate",
            type: 'buff',
            turns: window.bathalaMandateBuff.turnsLeft,
            description: 'def+30%'
        });
    }

    if (entity === 'boss' && window.daybreakFuryBuff?.turnsLeft > 0) {
        effects.push({
            name: 'Daybreak Fury',
            type: 'buff',
            turns: window.daybreakFuryBuff.turnsLeft,
            description: 'atk+40%, defignore+20%'
        });
    }

    if (entity === 'boss' && window.strengthenedBuff?.boss?.attacksLeft > 0) {
        effects.push({
            name: 'Strengthened',
            type: 'buff',
            turns: window.strengthenedBuff.boss.attacksLeft,
            description: 'next dmg x2'
        });
    }

    if (entity === 'boss' && window.bossInvulnerable?.turnsLeft > 0) {
        effects.push({
            name: 'Invulnerable',
            type: 'buff',
            turns: window.bossInvulnerable.turnsLeft,
            description: 'immune to damage'
        });
    }

    // Check debuffs (red)
    if (window.bonecrackedDebuffs && window.bonecrackedDebuffs[entity]) {
        effects.push({
            name: 'Bone Cracked',
            type: 'debuff',
            turns: window.bonecrackedDebuffs[entity].turnsLeft,
            description: 'def-10%'
        });
    }

    if (window.bindDebuffs && window.bindDebuffs[entity]) {
        effects.push({
            name: 'Bind',
            type: 'debuff',
            turns: window.bindDebuffs[entity].turnsLeft,
            description: 'def-15%'
        });
    }

    if (window.moonfallDebuffs && window.moonfallDebuffs[entity]) {
        effects.push({
            name: 'Moonfall',
            type: 'debuff',
            turns: window.moonfallDebuffs[entity].turnsLeft,
            description: 'def-20%'
        });
    }

    if (window.eyeDragonDebuffs && window.eyeDragonDebuffs[entity]) {
        effects.push({
            name: 'Eye of the Dragon',
            type: 'debuff',
            turns: window.eyeDragonDebuffs[entity].turnsLeft,
            description: 'def-10%'
        });
    }

    if (window.devouredDebuffs && window.devouredDebuffs[entity]) {
        effects.push({
            name: 'Devoured',
            type: 'debuff',
            turns: window.devouredDebuffs[entity].turnsLeft,
            description: 'DoT 20%MAG'
        });
    }

    // Global dungeon buffs (only show on players if active)
    if (entity !== 'boss' && entity !== 'boss2') {
        if (window.dungeonBuff1Active) {
            effects.push({
                name: 'Dagat Buff',
                type: 'buff',
                turns: '∞',
                description: 'dmg+15%'
            });
        }

        if (window.dungeonBuff2Active) {
            effects.push({
                name: 'Daragang Buff',
                type: 'buff',
                turns: '∞',
                description: 'def+25%'
            });
        }

        if (window.dungeonBuff3Active) {
            effects.push({
                name: 'Bundok Buff',
                type: 'buff',
                turns: '∞',
                description: 'no cooldown'
            });
        }
    }

    // Create DOM elements for each effect
    effects.forEach(effect => {
        const effectDiv = document.createElement('div');
        effectDiv.className = `status-effect ${effect.type}`;
        effectDiv.title = effect.description; // Tooltip

        if (effect.turns === '∞') {
            effectDiv.textContent = effect.name;
        } else {
            effectDiv.innerHTML = `${effect.name} <span class="turns">(${effect.turns})</span>`;
        }

        container.appendChild(effectDiv);
    });
}

// Update all entities' status effects
function updateAllStatusEffectsUI() {
    updateStatusEffectsUI('player1');
    updateStatusEffectsUI('player2');
    updateStatusEffectsUI('player3');
    updateStatusEffectsUI('player4');
    updateStatusEffectsUI('boss');
    if (window.bakunawaPhase2Active) {
        updateStatusEffectsUI('boss2');
    }
}

function cleanseBossDebuffs() {
    if (window.bonecrackedDebuffs && window.bonecrackedDebuffs['boss']) {
        delete window.bonecrackedDebuffs['boss'];
        logDamage(`Removed Bone Cracked debuff from boss.`);
    }
    // Remove any DEF-reducing or negative flags applied to boss
    if (window.moonfallDebuffs && window.moonfallDebuffs['boss']) {
        delete window.moonfallDebuffs['boss'];
        logDamage(`Removed Moonfall debuff from boss.`);
    }
    ['player1', 'player2', 'player3', 'player4'].forEach(player => {
        if (window.bonecrackedDebuffs && window.bonecrackedDebuffs[player]) {
            delete window.bonecrackedDebuffs[player];
            logDamage(`Removed Bone Cracked debuff from ${player}.`);
        }
    });
    // Add any other boss debuffs here as needed
    console.log("Boss debuffs cleansed.");
}

function checkBakunawaPhase() {
    if (window.bakunawaPhase2Active) return;

    const bossSelect = document.getElementById('preset-entity');
    const selectedPreset = bossSelect ? bossSelect.value : '';
    if (selectedPreset !== 'Bakunawa') return;

    const bakunawaHp = playersStats.boss.hp || 0;
    const bakunawaMaxHp = playersStats.boss.maxHp || playersStats.boss.hp || 1;
    const threshold = bakunawaMaxHp * 0.5;

    if (bakunawaHp <= threshold && bakunawaHp > 0) {
        window.bakunawaPhase2Active = true;

        const minokawaHp = Math.round(bakunawaHp * 0.5);
        playersStats.boss2 = {
            hp: minokawaHp,
            maxHp: bakunawaMaxHp,
            atk: playersStats.boss.atk || 0,
            mag: playersStats.boss.mag || 0,
            def: playersStats.boss.def || 0
        };

        const healAmount = Math.round(bakunawaMaxHp * 0.2);
        playersStats.boss.hp = Math.min(bakunawaMaxHp, playersStats.boss.hp + healAmount);
        playersStats.boss2.hp = Math.min(bakunawaMaxHp, playersStats.boss2.hp + healAmount);

        logDamage(`Phase 2: Minokawa spawned with ${minokawaHp} HP! Both bosses healed for ${healAmount}.`);

        // Update UI and targeting
        updateBossUI();
        updatePlayerTargetDropdowns();
        return true;
    }
    return false;
}

function updateBossUI() {
    const bossContainer = document.querySelector('.boss-container');
    if (!bossContainer) return;

    const existingPresetSelect = bossContainer.querySelector('#preset-entity');
    const currentPreset = existingPresetSelect ? existingPresetSelect.value : 'Bakunawa';

    if (window.bakunawaPhase2Active) {
        // Phase 2: Show both bosses with their skills
        bossContainer.innerHTML = `
            <h2>Bakunawa</h2>
            <label for="preset-entity">Select Preset:</label>
            <select id="preset-entity" onchange="applyPreset('boss')">
                <option value="Bathala" ${currentPreset === 'Bathala' ? 'selected' : ''}>Bathala</option>
                <option value="Mayari" ${currentPreset === 'Mayari' ? 'selected' : ''}>Mayari</option>
                <option value="Apolaki" ${currentPreset === 'Apolaki' ? 'selected' : ''}>Apolaki</option>
                <option value="Bakunawa" ${currentPreset === 'Bakunawa' ? 'selected' : ''}>Bakunawa</option>
                <option value="Manananggal" ${currentPreset === 'Manananggal' ? 'selected' : ''}>Manananggal</option>
                <option value="Tiyanak" ${currentPreset === 'Tiyanak' ? 'selected' : ''}>Tiyanak</option>
                <option value="Siren" ${currentPreset === 'Siren' ? 'selected' : ''}>Siren</option>
                <option value="Kapre" ${currentPreset === 'Kapre' ? 'selected' : ''}>Kapre</option>
            </select>
            <div class="hp-bar">
                <div class="hp-fill" id="hp-boss"></div>
            </div>
            <div class="stats">
                <div class="stat">HP: <span id="stats-hp-boss">${playersStats.boss.hp}</span></div>
                <div class="stat">ATK: <span id="stats-atk-boss">${playersStats.boss.atk}</span></div>
                <div class="stat">MAG: <span id="stats-mag-boss">${playersStats.boss.mag}</span></div>
                <div class="stat">DEF: <span id="stats-def-boss">${playersStats.boss.def}</span></div>
            </div>
            <div class="status-effects" id="status-effects-boss"></div>
            
            <label for="entity-target">Target:</label>
            <select id="entity-target">
                <option value="player1">Mandirigma</option>
                <option value="player2">Bagani</option>
                <option value="player3">Babaylan</option>
                <option value="player4">Mangangayaw</option>
            </select>
            <h3 align="center">Bakunawa Skills</h3>
            <div class="boss-skills" id="bakunawa-skills">
                
            </div>
            
            <h2>Minokawa</h2>
            <div class="hp-bar">
                <div class="hp-fill" id="hp-boss2"></div>
            </div>
            <div class="stats">
                <div class="stat">HP: <span id="stats-hp-boss2">${playersStats.boss2.hp}</span></div>
                <div class="stat">ATK: <span id="stats-atk-boss2">${playersStats.boss2.atk}</span></div>
                <div class="stat">MAG: <span id="stats-mag-boss2">${playersStats.boss2.mag}</span></div>
                <div class="stat">DEF: <span id="stats-def-boss2">${playersStats.boss2.def}</span></div>
            </div>
            <div class="status-effects" id="status-effects-boss2"></div>
            
            <label for="minokawa-target">Target:</label>
            <select id="minokawa-target">
                <option value="player1">Mandirigma</option>
                <option value="player2">Bagani</option>
                <option value="player3">Babaylan</option>
                <option value="player4">Mangangayaw</option>
            </select>
            <h3 align="center">Minokawa Skills</h3>
            <div class="boss-skills" id="minokawa-skills">
                
            </div>
            
            <div id="damage-log"></div>
            <div class="logo-container">
                <img src="asset/Balangay of the Forgotten.png" alt="Balangay of the Forgotten" class="game-logo">
            </div>
        `;

        // Add Bakunawa skills
        const bakunawaSkillsContainer = document.getElementById('bakunawa-skills');
        const bakunawaSkills = window.bossSkills['Bakunawa'] || [];
        bakunawaSkills.forEach((skill, index) => {
            const skillDiv = document.createElement('div');
            skillDiv.className = 'skill';
            skillDiv.innerHTML = `
                <button onclick="entityAttack(${index})">${skill.name}</button>
                <div class="skill-description">${skill.description}</div>
            `;
            bakunawaSkillsContainer.appendChild(skillDiv);
        });

        // Add Minokawa skills
        const minokawaSkillsContainer = document.getElementById('minokawa-skills');
        const minokawaSkills = window.bossSkills['Minokawa'] || [];
        minokawaSkills.forEach((skill, index) => {
            const skillDiv = document.createElement('div');
            skillDiv.className = 'skill';
            skillDiv.innerHTML = `
                <button onclick="minokawaAttack(${index})">${skill.name}</button>
                <div class="skill-description">${skill.description}</div>
            `;
            minokawaSkillsContainer.appendChild(skillDiv);
        });

    } else {
        // Phase 1: Single boss
        bossContainer.innerHTML = `
            <h2>Boss</h2>
            <label for="preset-entity">Select Preset:</label>
            <select id="preset-entity" onchange="applyPreset('boss')">
                <option value="Bathala" ${currentPreset === 'Bathala' ? 'selected' : ''}>Bathala</option>
                <option value="Mayari" ${currentPreset === 'Mayari' ? 'selected' : ''}>Mayari</option>
                <option value="Apolaki" ${currentPreset === 'Apolaki' ? 'selected' : ''}>Apolaki</option>
                <option value="Bakunawa" ${currentPreset === 'Bakunawa' ? 'selected' : ''}>Bakunawa</option>
                <option value="Manananggal" ${currentPreset === 'Manananggal' ? 'selected' : ''}>Manananggal</option>
                <option value="Tiyanak" ${currentPreset === 'Tiyanak' ? 'selected' : ''}>Tiyanak</option>
                <option value="Siren" ${currentPreset === 'Siren' ? 'selected' : ''}>Siren</option>
                <option value="Kapre" ${currentPreset === 'Kapre' ? 'selected' : ''}>Kapre</option>
            </select>
            <div class="hp-bar">
                <div class="hp-fill" id="hp-boss"></div>
            </div>
            <div class="stats">
                <div class="stat">HP: <span id="stats-hp-boss">${playersStats.boss.hp}</span></div>
                <div class="stat">ATK: <span id="stats-atk-boss">${playersStats.boss.atk}</span></div>
                <div class="stat">MAG: <span id="stats-mag-boss">${playersStats.boss.mag}</span></div>
                <div class="stat">DEF: <span id="stats-def-boss">${playersStats.boss.def}</span></div>
            </div>
            <div class="status-effects" id="status-effects-boss"></div>
            
            <label for="entity-target">Target:</label>
            <select id="entity-target">
                <option value="player1">Mandirigma</option>
                <option value="player2">Bagani</option>
                <option value="player3">Babaylan</option>
                <option value="player4">Mangangayaw</option>
            </select>
            
            <h3 align="center">${currentPreset} Skills</h3>
            <div class="boss-skills">
            </div>
            
            <div id="damage-log"></div>
            <div class="logo-container">
                <img src="asset/Balangay of the Forgotten.png" alt="Balangay of the Forgotten" class="game-logo">
            </div>
        `;

        // Add single boss skills
        const skillsContainer = bossContainer.querySelector('.skills') || bossContainer.querySelector('.boss-skills');
        const skills = window.bossSkills[currentPreset] || [];
        skills.forEach((skill, index) => {
            const skillDiv = document.createElement('div');
            skillDiv.className = 'skill';
            skillDiv.innerHTML = `
                <button onclick="entityAttack(${index})">${skill.name}</button>
                <div class="skill-description">${skill.description}</div>
            `;
            skillsContainer.appendChild(skillDiv);
        });
    }

    // Update HP bars
    updateHPAndShieldUI('boss');
    if (window.bakunawaPhase2Active) {
        updateHPAndShieldUI('boss2');
    }

    setTimeout(() => updateAllStatusEffectsUI(), 50);
}

function minokawaAttack(skillIndex) {
    if (isDead('boss2')) {
        console.log('Minokawa cannot act: entity is dead.');
        return;
    }

    const target = document.getElementById('minokawa-target')?.value || 'player1';
    const skills = bossSkills['Minokawa'];
    if (!skills || !skills[skillIndex]) {
        console.log('Minokawa skill not found, index:', skillIndex);
        return;
    }
    const skill = skills[skillIndex];

    // Wing Tempest - AoE damage + Eye of the Dragon debuff
    if (skill.eye_dragon) {
        ['player1', 'player2', 'player3', 'player4'].forEach(p => {
            const dmg = calculateDamage(
                'boss2',
                p,
                skill.damagePercent || 0,
                skill.flatdamage || 0,
                skill.magPercentDamage || 0,
                skill.defIgnore || 0
            );
            adjustHP(p, -dmg);

            // Apply Eye of the Dragon debuff
            if (!window.eyeDragonDebuffs) window.eyeDragonDebuffs = {};
            window.eyeDragonDebuffs[p] = {
                turnsLeft: skill.duration || 2,
                defReduce: skill.reduce_enemyDEF || 0.1
            };

            logDamage(`Minokawa used ${skill.name} on ${p}: Dealt ${dmg} damage and applied Eye of the Dragon (-${(window.eyeDragonDebuffs[p].defReduce * 100)}% DEF) for ${window.eyeDragonDebuffs[p].turnsLeft} turns.`);
        });
        updateAllStatusEffectsUI();
        return;
    }

    // Sky's Wrath - damage + conditional heal if target dies
    if (skill.maxHp_heal_if_defeatedhero) {
        const originalHP = playersStats[target].hp || 0;

        const dmg = calculateDamage(
            'boss2',
            target,
            skill.damagePercent || 0,
            skill.flatdamage || 0,
            skill.magPercentDamage || 0,
            skill.defIgnore || 0
        );

        adjustHP(target, -dmg);
        logDamage(`Minokawa used ${skill.name} on ${target}: Dealt ${dmg} damage.`);

        // Check if target was defeated (HP reduced to 0)
        const newHP = playersStats[target].hp || 0;
        if (originalHP > 0 && newHP <= 0) {
            const minokawaMaxHp = playersStats.boss2.maxHp || 1;
            const healAmount = Math.round(minokawaMaxHp * (skill.maxHp_heal_if_defeatedhero || 0));
            adjustHP('boss2', healAmount);
            logDamage(`${target} was defeated! Minokawa healed for ${healAmount} HP (${(skill.maxHp_heal_if_defeatedhero * 100)}% max HP).`);
        }
        return;
    }

    // Generic damage handling (Solar Devour, Brave Slash)
    const applyDamage = (victim) => {
        const dmg = calculateDamage(
            'boss2',
            victim,
            skill.damagePercent || 0,
            skill.flatdamage || 0,
            skill.magPercentDamage || 0,
            skill.defIgnore || 0  // Solar Devour has defIgnore: 0.1
        );
        adjustHP(victim, -dmg);
        logDamage(`Minokawa used ${skill.name} on ${victim}: ${skill.description} (Dealt ${dmg})`);
    };

    if (skill.hitsAll) {
        ['player1', 'player2', 'player3', 'player4'].forEach(applyDamage);
    } else {
        applyDamage(target);
    }
}

// Functions to handle buff/debuff durations
function tickBonecrackedDebuffs() {
    if (!window.bonecrackedDebuffs) return;
    Object.keys(window.bonecrackedDebuffs).forEach(entity => {
        window.bonecrackedDebuffs[entity].turnsLeft = Math.max(0, (window.bonecrackedDebuffs[entity].turnsLeft || 0) - 1);
        if (window.bonecrackedDebuffs[entity].turnsLeft <= 0) {
            delete window.bonecrackedDebuffs[entity];
            console.log(`Bone Cracked debuff expired on ${entity}.`);
        }
    });
}

function tickMandirigmaRageBuff() {
    if (!window.mandirigmaRageBuff) return;
    if (window.mandirigmaRageBuff.turnsLeft > 0) {
        window.mandirigmaRageBuff.turnsLeft -= 1;
        if (window.mandirigmaRageBuff.turnsLeft <= 0) {
            window.mandirigmaRageBuff.dmgIncrease = 0;
            window.mandirigmaRageBuff.defIgnore = 0;
            logDamage('Mandirigma Rage expired.');
        }
    }
}

function tickBaganiLastStandBuff() {
    if (!window.baganiLastStandBuff) return;
    if (window.baganiLastStandBuff.turnsLeft > 0) {
        window.baganiLastStandBuff.turnsLeft -= 1;
        if (window.baganiLastStandBuff.turnsLeft <= 0) {
            window.baganiLastStandBuff.defIncrease = 0;
            logDamage('Bagani Last Stand expired.');
        }
    }
}

// Add debuff cleanse function
function cleansePlayerDebuffs(player) {
    // Remove DEF-reducing debuffs
    if (window.bonecrackedDebuffs && window.bonecrackedDebuffs[player]) {
        delete window.bonecrackedDebuffs[player];
        logDamage(`Removed Bone Cracked debuff from ${player}.`);
    }
    if (window.bindDebuffs && window.bindDebuffs[player]) {
        delete window.bindDebuffs[player];
        logDamage(`Removed Bind debuff from ${player}.`);
    }
    if (window.moonfallDebuffs && window.moonfallDebuffs[player]) {
        delete window.moonfallDebuffs[player];
        logDamage(`Removed Moonfall debuff from ${player}.`);
    }
    if (window.eyeDragonDebuffs && window.eyeDragonDebuffs[player]) {
        delete window.eyeDragonDebuffs[player];
        logDamage(`Removed Eye of the Dragon debuff from ${player}.`);
    }
    // Remove DoT debuffs
    if (window.devouredDebuffs && window.devouredDebuffs[player]) {
        delete window.devouredDebuffs[player];
        logDamage(`Removed Devoured DoT from ${player}.`);
    }
}

function cleanseAllPlayersDebuffs() {
    ['player1', 'player2', 'player3', 'player4'].forEach(p => {
        cleansePlayerDebuffs(p);
    });
    console.log('All player debuffs cleansed.');
}

function tickEyeDragonDebuffs() {
    if (!window.eyeDragonDebuffs) return;
    Object.keys(window.eyeDragonDebuffs).forEach(p => {
        window.eyeDragonDebuffs[p].turnsLeft = Math.max(0, (window.eyeDragonDebuffs[p].turnsLeft || 0) - 1);
        if (window.eyeDragonDebuffs[p].turnsLeft <= 0) {
            delete window.eyeDragonDebuffs[p];
            console.log(`Eye of the Dragon debuff expired on ${p}.`);
        }
    });
}

function tickBindDebuffs() {
    if (!window.bindDebuffs) return;
    Object.keys(window.bindDebuffs).forEach(p => {
        window.bindDebuffs[p].turnsLeft = Math.max(0, (window.bindDebuffs[p].turnsLeft || 0) - 1);
        if (window.bindDebuffs[p].turnsLeft <= 0) {
            delete window.bindDebuffs[p];
            console.log(`Bind debuff expired on ${p}.`);
        }
    });
}

function tickDevouredDebuffs() {
    if (!window.devouredDebuffs) return;
    const bossMag = playersStats.boss.mag || 0;

    Object.keys(window.devouredDebuffs).forEach(p => {
        const debuff = window.devouredDebuffs[p];

        // Apply DoT damage
        const dotDamage = Math.round(bossMag * (debuff.dotMagPerc || 0));
        if (dotDamage > 0) {
            adjustHP(p, -dotDamage);
            console.log(`${p} takes ${dotDamage} Devoured DoT damage.`);
        }

        // Tick down duration
        debuff.turnsLeft = Math.max(0, (debuff.turnsLeft || 0) - 1);
        if (debuff.turnsLeft <= 0) {
            delete window.devouredDebuffs[p];
            console.log(`Devoured debuff expired on ${p}.`);
        }
    });
}

function tickDaybreakFuryBuff() {
    if (!window.daybreakFuryBuff) return;
    if (window.daybreakFuryBuff.turnsLeft > 0) {
        window.daybreakFuryBuff.turnsLeft -= 1;
        if (window.daybreakFuryBuff.turnsLeft <= 0) {
            window.daybreakFuryBuff.atkIncrease = 0;
            window.daybreakFuryBuff.defIgnore = 0;
            console.log('Daybreak Fury expired.');
        }
    }
}

function tickBossInvulnerable() {
    if (!window.bossInvulnerable) return;
    if (window.bossInvulnerable.turnsLeft > 0) {
        window.bossInvulnerable.turnsLeft -= 1;
        if (window.bossInvulnerable.turnsLeft <= 0) {
            console.log("Boss is no longer invulnerable.");
        }
    }
}

function tickMoonfallDebuffs() {
    if (!window.moonfallDebuffs) return;
    Object.keys(window.moonfallDebuffs).forEach(p => {
        window.moonfallDebuffs[p].turnsLeft = Math.max(0, (window.moonfallDebuffs[p].turnsLeft || 0) - 1);
        if (window.moonfallDebuffs[p].turnsLeft <= 0) {
            delete window.moonfallDebuffs[p];
            console.log(`Moonfall debuff expired on ${p}.`);
        }
    });
}

function tickBathalaMandateBuff() {
    if (!window.bathalaMandateBuff) return;
    if (window.bathalaMandateBuff.turnsLeft > 0) {
        window.bathalaMandateBuff.turnsLeft -= 1;
        if (window.bathalaMandateBuff.turnsLeft <= 0) {
            window.bathalaMandateBuff.defIncrease = 0;
            console.log("Heaven's Mandate expired.");
        }
    }
}

function tickBlessingBuffs() {
    if (!window.blessingBuff) return;
    Object.keys(window.blessingBuff).forEach(p => {
        window.blessingBuff[p] = Math.max(0, window.blessingBuff[p] - 1);
        if (window.blessingBuff[p] === 0) delete window.blessingBuff[p];
    });
}

function tickFocusAimBuffs() {
    if (!window.focusAimBuff) return;
    Object.keys(window.focusAimBuff).forEach(p => {
        window.focusAimBuff[p].turnsLeft = Math.max(0, (window.focusAimBuff[p].turnsLeft || 0) - 1);
        if (window.focusAimBuff[p].turnsLeft <= 0) delete window.focusAimBuff[p];
    });
}

window.calculateDamage = function (
    attacker,
    target,
    damagePercent,
    flatdamage = 0,
    magPercentDamage = 0,
    defIgnore = 0,
    options = {}
) {
    // Check for boss invulnerability
    if (target === 'boss' && window.bossInvulnerable?.turnsLeft > 0 && attacker !== 'boss') {
        logDamage(`Damage prevented: boss invulnerable (${window.bossInvulnerable.turnsLeft} turns left).`);
        return 0;
    }

    const dmgMultiplier = options.dmgMultiplier || 1;
    let targetStats = playersStats[target];
    let def = (targetStats.def || 0);
    let daybreakActive = false;
    if (attacker === 'boss' &&
        window.daybreakFuryBuff &&
        window.daybreakFuryBuff.turnsLeft > 0 &&
        (window.daybreakFuryBuff.atkIncrease > 0 || window.daybreakFuryBuff.defIgnore > 0)) {
        daybreakActive = true;
    }

    /*
      DEF calculation order:
        1. Apply DEF buffs
        2. Apply DEF reductions
        3. Apply DEF ignore (from skills/buffs)
    */
    // Apply DEF buffs
    if (target === 'boss') {
        if (window.bathalaMandateBuff && window.bathalaMandateBuff.turnsLeft > 0) {
            def = Math.round(def * (1 + (window.bathalaMandateBuff.defIncrease || 0)));
        }
    }

    if (target === 'player2' && window.baganiLastStandBuff && window.baganiLastStandBuff.turnsLeft > 0) {
        def = Math.round(def * (1 + (window.baganiLastStandBuff.defIncrease || 0)));
    }

    if (target !== 'boss' && target !== 'boss2' && window.dungeonBuff2Active) {
        def = Math.round(def * 1.25);
    }


    // DEF reductions
    // Bone Cracked debuff (DEF reduction)
    if (window.bonecrackedDebuffs && window.bonecrackedDebuffs[target]) {
        const red = window.bonecrackedDebuffs[target].defReduce || 0;
        def = def * (1 - red);
    }

    // Eye of the Dragon debuff (DEF reduction)
    if (target !== 'boss' && target !== 'boss2' && window.eyeDragonDebuffs && window.eyeDragonDebuffs[target]) {
        const red = window.eyeDragonDebuffs[target].defReduce || 0;
        def = def * (1 - red);
    }

    // Bind debuff (DEF reduction)
    if (target !== 'boss' && window.bindDebuffs && window.bindDebuffs[target]) {
        const red = window.bindDebuffs[target].defReduce || 0;
        def = def * (1 - red);
    }

    // Moonfall debuff
    if (target !== 'boss' && window.moonfallDebuffs && window.moonfallDebuffs[target]) {
        const red = window.moonfallDebuffs[target].defReduce || 0;
        def = def * (1 - red);
    }

    // DEF ignore
    // Focus Aim (turn based extra DEF ignore)
    if (attacker !== 'boss' && window.focusAimBuff && window.focusAimBuff[attacker]?.turnsLeft > 0) {
        const extra = window.focusAimBuff[attacker].defIgnore || 0;
        def = def * (1 - extra);
    }

    // Mandirigma Rage
    let rageActive = false;
    if (attacker === 'player1' && window.mandirigmaRageBuff && window.mandirigmaRageBuff.turnsLeft > 0) {
        def = def * (1 - (window.mandirigmaRageBuff.defIgnore || 0));
        rageActive = true;
    }

    // Skill-based DEF ignore (e.g. Piercing Arrow)
    if (attacker === 'boss' && daybreakActive && window.daybreakFuryBuff.defIgnore > 0) {
        def = def * (1 - window.daybreakFuryBuff.defIgnore);
    }

    if (attacker !== 'boss' && window.focusAimBuff && window.focusAimBuff[attacker]?.turnsLeft > 0) {
        const extra = window.focusAimBuff[attacker].defIgnore || 0;
        def = def * (1 - extra);
    }

    def = def * (1 - defIgnore);

    let dmg = 0;

    if (attacker === 'boss') {
        let atk = playersStats[attacker].atk || 0;
        const mag = playersStats[attacker].mag || 0;
        if (daybreakActive && window.daybreakFuryBuff.atkIncrease > 0) {
            atk = atk * (1 + window.daybreakFuryBuff.atkIncrease);
        }

        // Normal boss formula OR special combined multiplier (Celestial Judgement)
        if (dmgMultiplier !== 1) {
            // Special: combine ATK and MAG first, then multiply, then mitigate
            const combined = (atk * (damagePercent || 0)) + (mag * (magPercentDamage || 0));
            const preMit = combined * dmgMultiplier;
            dmg = preMit / (1.5 * (1 + (def * 0.01)));
        } else {
            const atkDamage = ((flatdamage || 0) + (atk * (damagePercent || 0))) / (1.5 * (1 + (def * 0.01)));
            const magDamage = ((flatdamage || 0) + (mag * (magPercentDamage || 0))) / (1.5 * (1 + (def * 0.01)));
            dmg = atkDamage + magDamage;
        }

        // Apply strengthened buff (before final rounding)
        if (window.strengthenedBuff && window.strengthenedBuff[attacker] && window.strengthenedBuff[attacker].attacksLeft > 0) {
            const mult = window.strengthenedBuff[attacker].multiplier || 1;
            dmg *= mult;

            // Consume one attack
            window.strengthenedBuff[attacker].attacksLeft -= 1;
            if (window.strengthenedBuff[attacker].attacksLeft <= 0) {
                delete window.strengthenedBuff[attacker];
            }

            console.log(`Strengthened buff applied: damage multiplied by ${mult}`);
        }

        dmg = Math.max(1, Math.round(dmg));
    } else {
        const attackerATK = playersStats[attacker].mag || playersStats[attacker].atk;
        let numerator = (flatdamage || 0) + attackerATK * (damagePercent || 0);

        // Blessing pre-mitigation
        if (window.blessingBuff && window.blessingBuff[attacker] > 0) {
            numerator *= 1.2;
        }
        // Mandirigma Rage +50% (applied pre-mitigation)
        if (rageActive) {
            numerator *= (1 + (window.mandirigmaRageBuff.dmgIncrease || 0));
        }
        if (window.dungeonBuff1Active) {
            numerator *= 1.15;
        }

        dmg = numerator / (1 + def * 0.01);
        dmg = Math.max(1, Math.round(dmg));
    }

    // Crit (post-mitigation)
    if (window.critActive) {
        dmg = Math.round(dmg * 1.5);
    }

    let logMsg = `Damage calculation: attacker=${attacker}, target=${target}, dmg=${dmg}`;
    if (rageActive) logMsg += " [Mandirigma Rage]";
    if (window.critActive) logMsg += " [CRIT]";
    if (dmgMultiplier !== 1 && attacker === 'boss') logMsg += ` [Multiplier x${dmgMultiplier}]`;
    if (daybreakActive) logMsg += ' [Daybreak Fury]';
    if (window.dungeonBuff1Active && attacker !== 'boss') logMsg += ' [Dungeon Buff +15% DMG]';
    if (window.dungeonBuff2Active && target !== 'boss' && target !== 'boss2') logMsg += ' [Dungeon Buff +25% DEF]';
    console.log(logMsg);

    return dmg;
};

// Editable heal cooldowns (in rounds)
const healCooldowns = {
    player2: 2,
    player3: (typeof playerSkills !== 'undefined' && playerSkills.player3 && playerSkills.player3[4] && typeof playerSkills.player3[4].cooldown === 'number') ? playerSkills.player3[4].cooldown : 2
};

// --- Round & Cooldowns ---
let currentRound = 1;
// cooldowns[playerId][skillKey] = remaining rounds
const cooldowns = {
    player1: {},
    player2: {},
    player3: {},
    player4: {}
};

function getSkillKey(player, skillIndex) {
    return `idx-${skillIndex}`;
}

function isOnCooldown(player, skillKey) {
    // Dungeon Buff 3: No cooldowns for all skills
    if (window.dungeonBuff3Active) {
        return false;
    }

    const remain = cooldowns[player]?.[skillKey] || 0;
    return remain > 0;
}

function startCooldown(player, skillKey, durationRounds = 2) {
    if (!cooldowns[player]) cooldowns[player] = {};
    cooldowns[player][skillKey] = durationRounds;

    // Immediately update button styling
    updateAllSkillCooldownDescriptions();
}

function endRound() {
    currentRound += 1;
    ['player1', 'player2', 'player3', 'player4'].forEach(p => {
        if (isDead(p)) return;

        const map = cooldowns[p] || {};
        Object.keys(map).forEach(key => {
            map[key] = Math.max(0, (map[key] || 0) - 1);
        });
    });
    // decrement shield durations AFTER cooldowns change
    tickBossInvulnerable();
    tickShieldDurations();
    tickBlessingBuffs();
    tickFocusAimBuffs();
    tickBathalaMandateBuff();
    tickMoonfallDebuffs();
    tickDaybreakFuryBuff();
    tickBindDebuffs();
    tickDevouredDebuffs();
    tickEyeDragonDebuffs();
    tickMandirigmaRageBuff();
    tickBaganiLastStandBuff();
    tickBonecrackedDebuffs();

    console.log(`Round ${currentRound} started. Cooldowns decremented.`);
    updateAllSkillCooldownDescriptions();
    updateAllStatusEffectsUI();
    const rc = document.getElementById('round-counter');
    if (rc) rc.innerText = String(currentRound);
}

function updatePlayerTargetDropdowns() {
    ['player1', 'player2', 'player3', 'player4'].forEach(player => {
        const targetSelect = document.getElementById(`target-${player}`);
        if (!targetSelect) return;

        const currentValue = targetSelect.value;

        if (window.bakunawaPhase2Active) {
            // Phase 2: Add boss2 as targeting option
            targetSelect.innerHTML = `
                <option value="player1" ${currentValue === 'player1' ? 'selected' : ''}>Player 1</option>
                <option value="player2" ${currentValue === 'player2' ? 'selected' : ''}>Player 2</option>
                <option value="player3" ${currentValue === 'player3' ? 'selected' : ''}>Player 3</option>
                <option value="player4" ${currentValue === 'player4' ? 'selected' : ''}>Player 4</option>
                <option value="boss" ${currentValue === 'boss' ? 'selected' : ''}>Bakunawa</option>
                <option value="boss2" ${currentValue === 'boss2' ? 'selected' : ''}>Minokawa</option>
            `;
        } else {
            // Phase 1: Normal targeting
            targetSelect.innerHTML = `
                <option value="player1" ${currentValue === 'player1' ? 'selected' : ''}>Player 1</option>
                <option value="player2" ${currentValue === 'player2' ? 'selected' : ''}>Player 2</option>
                <option value="player3" ${currentValue === 'player3' ? 'selected' : ''}>Player 3</option>
                <option value="player4" ${currentValue === 'player4' ? 'selected' : ''}>Player 4</option>
                <option value="boss" ${currentValue === 'boss' ? 'selected' : ''}>Boss</option>
            `;
        }
    });
}

function getRemainingCooldown(player, skillIndex) {
    // Special-case: player3 skill index 4 is heal 50 bound to key 'heal-50'
    if (player === 'player3' && skillIndex === 4) {
        return cooldowns[player]?.['heal-50'] || 0;
    }
    const key = getSkillKey(player, skillIndex);
    return cooldowns[player]?.[key] || 0;
}

function getHealCooldownDuration(healer, healAmount) {
    // Use editable cooldowns map for all healer heals
    return (healCooldowns[healer] != null) ? healCooldowns[healer] : 2;
}

function setHealCooldown(healer, newCd) {
    const cd = Math.max(0, parseInt(newCd, 10) || 0);
    healCooldowns[healer] = cd;
    console.log(`${healer} heal cooldown set to ${cd} rounds.`);
    updateAllSkillCooldownDescriptions();
}

function updateAllSkillCooldownDescriptions() {
    const playerIds = ['player1', 'player2', 'player3', 'player4'];
    playerIds.forEach((playerId, playerIdx) => {
        const playerContainers = document.querySelectorAll('.players-container .player-container');
        const container = playerContainers[playerIdx];
        if (!container) return;
        const skillDivs = container.querySelectorAll('.skills .skill');
        const skills = playerSkills[playerId];
        if (!skills) return;

        skills.forEach((skill, idx) => {
            const skillDiv = skillDivs[idx];
            if (!skillDiv) return;

            const descEl = skillDiv.querySelector('.skill-description');
            const button = skillDiv.querySelector('button');
            if (!descEl || !button) return;

            const remain = getRemainingCooldown(playerId, idx);
            const cdText = ` (CD: ${remain})`;

            // Reset to base description then append CD
            descEl.innerText = `${skill.description}${cdText}`;

            // Update button styling based on cooldown
            if (remain > 0) {
                button.classList.add('on-cooldown');
            } else {
                button.classList.remove('on-cooldown');
            }
        });

        // Handle extra heal buttons
        if (playerId === 'player2') {
            const healDiv = Array.from(skillDivs).find(div => {
                const btn = div.querySelector('button');
                return btn && btn.getAttribute('onclick') === "healSelectedTarget('player2', 30)";
            });
            if (healDiv) {
                const descEl = healDiv.querySelector('.skill-description');
                const button = healDiv.querySelector('button');
                if (descEl && button) {
                    const remain = cooldowns.player2?.['heal-30'] || 0;
                    descEl.innerText = `Heal: Restores 30 HP to the selected ally. (CD: ${remain})`;

                    if (remain > 0) {
                        button.classList.add('on-cooldown');
                    } else {
                        button.classList.remove('on-cooldown');
                    }
                }
            }
        }
    });
}

function applyPreset(player) {
    // Determine selected preset
    let selectedPreset;
    if (player === 'boss') {
        const bossSelect = document.getElementById('preset-entity');
        selectedPreset = bossSelect ? bossSelect.value : 'preset1';

        // Store the previous boss name for comparison
        const previousBoss = window.currentBossName;
        
        if (!window.currentBossName) {
            window.currentBossName = selectedPreset; // Initialize on first load
        }

        // Check if we're switching between bosses (not on initial load)
        if (window.currentBossName !== selectedPreset) {
            console.log(`Boss changed from ${window.currentBossName} to ${selectedPreset}`);

            // Check if both old and new bosses are minibosses
            const isOldMiniboss = previousBoss ? isMiniboss(previousBoss) : false;
            const isNewMiniboss = isMiniboss(selectedPreset);

            let preservedState = null;

            // Only preserve state if switching between minibosses OR from miniboss to main boss
            if (isOldMiniboss && (isNewMiniboss || !isNewMiniboss)) {
                preservedState = preserveMinibossState();
                console.log(`Preserving state: ${previousBoss} (miniboss) → ${selectedPreset}`);
            }

            // Check if the NEW boss should be dead BEFORE calling reset
            const shouldNewBossStayDead = window.deadBosses.has(selectedPreset);

            // Only do full reset if switching FROM a main boss OR TO a main boss from main boss
            if (!isOldMiniboss || (!isNewMiniboss && !isOldMiniboss)) {
                resetAllBuffsDebuffsAndCooldowns();
                console.log(`Full reset: switching from ${isOldMiniboss ? 'miniboss' : 'main boss'} to ${isNewMiniboss ? 'miniboss' : 'main boss'}`);
            } else {
                // Just clear buffs/debuffs but preserve HP and cooldowns
                console.log('Miniboss transition: clearing buffs/debuffs only');
                
                // Clear all buff/debuff timers (but preserve checkbox-activated ones)
                const preserveDungeon1 = window.dungeonBuff1Active;
                const preserveDungeon2 = window.dungeonBuff2Active;
                const preserveDungeon3 = window.dungeonBuff3Active;
                const preserveCrit = window.critActive;

                // Reset boss buffs/debuffs
                window.bathalaMandateBuff = { turnsLeft: 0, defIncrease: 0 };
                window.daybreakFuryBuff = { turnsLeft: 0, atkIncrease: 0, defIgnore: 0 };
                window.strengthenedBuff = {};
                window.bossInvulnerable = { turnsLeft: 0 };

                // Reset player buffs/debuffs
                window.mandirigmaRageBuff = { turnsLeft: 0, dmgIncrease: 0, defIgnore: 0 };
                window.baganiLastStandBuff = { turnsLeft: 0, defIncrease: 0 };
                window.blessingBuff = {};
                window.focusAimBuff = {};

                // Clear all debuffs
                window.bindDebuffs = {};
                window.devouredDebuffs = {};
                window.eyeDragonDebuffs = {};
                window.moonfallDebuffs = {};
                window.bonecrackedDebuffs = {};

                // Clear all shields
                ['player1', 'player2', 'player3', 'player4', 'boss', 'boss2'].forEach(entity => {
                    if (playersStats[entity]) {
                        playersStats[entity].shield = 0;
                        playersStats[entity].shieldStacks = [];
                    }
                });

                // Restore checkbox-activated buffs
                window.dungeonBuff1Active = preserveDungeon1;
                window.dungeonBuff2Active = preserveDungeon2;
                window.dungeonBuff3Active = preserveDungeon3;
                window.critActive = preserveCrit;

                // Update status effects UI
                updateAllStatusEffectsUI();
            }

            // Restore preserved state if we saved it
            if (preservedState && isOldMiniboss) {
                restoreMinibossState(preservedState);
            }

            // If the new boss should be dead, force it dead after any reset
            if (shouldNewBossStayDead) {
                playersStats.boss.hp = 0;
                window.deadEntities.add('boss');
                console.log(`${selectedPreset} forced to remain dead after reset.`);
            }

            window.currentBossName = selectedPreset; // Update stored boss name
        }

        // Reset phase 2 when changing boss (unless staying on Bakunawa)
        if (selectedPreset !== 'Bakunawa' && window.bakunawaPhase2Active) {
            window.bakunawaPhase2Active = false;
            playersStats.boss2 = { hp: 0, atk: 0, mag: 0, def: 0, maxHp: 0 };
            console.log('Phase 2 reset: Minokawa disappeared due to boss change.');
            // Update targeting back to single boss
            updatePlayerTargetDropdowns();
        }
    } else {
        const playerSelect = document.getElementById(`preset-${player}`);
        if (playerSelect) {
            selectedPreset = playerSelect.value;
        } else {
            const presetKeys = Object.keys(presets[player] || {});
            selectedPreset = presetKeys.length > 0 ? presetKeys[0] : undefined;
        }
    }

    if (!selectedPreset) return;

    // Update the entity's stats with the selected preset
    const newStats = presets[player][selectedPreset];
    playersStats[player] = { ...playersStats[player], ...newStats, maxHp: newStats.hp, shield: 0 };

    // Update the stats display
    const hpEl = document.getElementById(`stats-hp-${player}`);
    const atkEl = document.getElementById(`stats-atk-${player}`);
    const defEl = document.getElementById(`stats-def-${player}`);
    const hpBar = document.getElementById(`hp-${player}`);
    const magEl = player === 'boss' ? document.getElementById('stats-mag-boss') : null;

    if (player === 'boss' && window.deadBosses.has(selectedPreset)) {
        playersStats[player].hp = 0;
        window.deadEntities.add('boss');
        console.log(`${selectedPreset} remains dead from previous defeat.`);

        // Update ALL stats, not just HP
        if (hpEl) hpEl.innerText = '0 (DEAD)';
        if (atkEl) atkEl.innerText = newStats.atk || newStats.mag || 0;
        if (defEl) defEl.innerText = newStats.def;
        if (magEl) magEl.innerText = newStats.mag || 0;

        if (hpBar) {
            hpBar.style.width = '0%';
            hpBar.style.backgroundColor = '#666';
        }
    } else {
        // Normal alive state - only reset HP if not preserving from miniboss
        const shouldPreserveHP = window.currentBossName && 
                                isMiniboss(window.currentBossName) && 
                                player === 'boss' &&
                                !window.deadBosses.has(selectedPreset);
        
        if (!shouldPreserveHP || player !== 'boss') {
            if (hpEl) hpEl.innerText = newStats.hp;
        }
        
        if (atkEl) atkEl.innerText = newStats.atk || newStats.mag || 0;
        if (defEl) defEl.innerText = newStats.def;
        if (magEl) magEl.innerText = newStats.mag || 0;

        if (hpBar && (!shouldPreserveHP || player !== 'boss')) {
            hpBar.style.width = '100%';
            hpBar.style.backgroundColor = '#4caf50';
        }
    }

    // Update UI after boss change
    if (player === 'boss') {
        updateBossUI();
        updateGameStateForViewer();
    }

    if (player !== 'boss' || !window.deadEntities.has('boss')) {
        updateHPAndShieldUI(player);
    }
}

function updateGameStateForViewer() {
    const bossSelect = document.getElementById('preset-entity');
    const currentBoss = bossSelect ? bossSelect.value : null;
    
    const gameState = {
        currentRound: currentRound,
        currentBoss: currentBoss,
        playersStats: playersStats,
        bakunawaPhase2Active: window.bakunawaPhase2Active,
        actionLog: getRecentActionLog(), // You'll need to implement this
        // Add other game state properties as needed
        dungeonBuff1Active: window.dungeonBuff1Active,
        dungeonBuff2Active: window.dungeonBuff2Active,
        dungeonBuff3Active: window.dungeonBuff3Active,
        // Add all your buff/debuff states
        mandirigmaRageBuff: window.mandirigmaRageBuff,
        baganiLastStandBuff: window.baganiLastStandBuff,
        blessingBuff: window.blessingBuff,
        focusAimBuff: window.focusAimBuff,
        bathalaMandateBuff: window.bathalaMandateBuff,
        daybreakFuryBuff: window.daybreakFuryBuff,
        strengthenedBuff: window.strengthenedBuff,
        bossInvulnerable: window.bossInvulnerable,
        bonecrackedDebuffs: window.bonecrackedDebuffs,
        bindDebuffs: window.bindDebuffs,
        moonfallDebuffs: window.moonfallDebuffs,
        eyeDragonDebuffs: window.eyeDragonDebuffs,
        devouredDebuffs: window.devouredDebuffs
    };
    
    // Save to localStorage for viewer to pick up
    localStorage.setItem('botf_game_state', JSON.stringify(gameState));
}

function getRecentActionLog() {
    const damageLog = document.getElementById('damage-log');
    if (!damageLog) return [];
    
    const logEntries = [];
    for (let i = 0; i < Math.min(50, damageLog.children.length); i++) {
        logEntries.push(damageLog.children[i].textContent);
    }
    return logEntries.reverse(); // Return in chronological order
}

function updatePlayerTargetDropdowns() {
    ['player1', 'player2', 'player3', 'player4'].forEach(player => {
        // Update ally targeting (for heals/buffs)
        const allySelect = document.getElementById(`ally-target-${player}`);
        if (allySelect) {
            const currentValue = allySelect.value;
            allySelect.innerHTML = `
                <option value="player1" ${currentValue === 'player1' ? 'selected' : ''}>Mandirigma</option>
                <option value="player2" ${currentValue === 'player2' ? 'selected' : ''}>Bagani</option>
                <option value="player3" ${currentValue === 'player3' ? 'selected' : ''}>Babaylan</option>
                <option value="player4" ${currentValue === 'player4' ? 'selected' : ''}>Mangangayaw</option>
            `;
        }

        // Update enemy targeting (for attacks)
        const enemySelect = document.getElementById(`enemy-target-${player}`);
        if (enemySelect) {
            const currentValue = enemySelect.value;

            if (window.bakunawaPhase2Active) {
                // Phase 2: Both bosses available
                enemySelect.innerHTML = `
                    <option value="boss" ${currentValue === 'boss' ? 'selected' : ''}>Bakunawa</option>
                    <option value="boss2" ${currentValue === 'boss2' ? 'selected' : ''}>Minokawa</option>
                `;
            } else {
                // Phase 1: Only main boss
                enemySelect.innerHTML = `
                    <option value="boss" selected>Boss</option>
                `;
            }
        }
    });
}

// Update HP bar and shield overlay
function updateHPAndShieldUI(player) {
    const maxHp = playersStats[player].maxHp || playersStats[player].hp || 1;
    const hp = Math.max(0, playersStats[player].hp || 0);
    const shield = Math.max(0, playersStats[player].shield || 0);

    const parentContainer = document.getElementById(`hp-${player}`)?.parentElement;
    if (parentContainer && getComputedStyle(parentContainer).position === 'static') parentContainer.style.position = 'relative';

    // percents
    const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100));
    const shieldPercent = Math.max(0, Math.min(100, (shield / maxHp) * 100));

    // hp fill element (always starts at left and keeps its width = hp%)
    const hpFill = document.getElementById(`hp-${player}`);
    if (hpFill) {
        hpFill.style.position = 'absolute';
        hpFill.style.left = '0';
        hpFill.style.top = '0';
        hpFill.style.width = hpPercent + '%';
        // hp under shield visually
        hpFill.style.zIndex = '1';
    }

    // shield element (yellow) starts at very left, sits on top and covers only shieldPercent%
    let shieldEl = document.getElementById(`shield-${player}`);
    if (!shieldEl) {
        shieldEl = document.createElement('div');
        shieldEl.id = `shield-${player}`;
        shieldEl.className = 'hp-shield';
        if (parentContainer) parentContainer.appendChild(shieldEl);
        else document.body.appendChild(shieldEl);
    }

    if (shieldPercent <= 0) {
        // Hide shield element when there's no shield
        shieldEl.style.display = 'none';
    } else {
        shieldEl.style.display = 'block';
        shieldEl.style.position = 'absolute';
        shieldEl.style.top = '0';
        shieldEl.style.left = '0%';
        // draw shield to cover exactly shieldPercent% from the left
        shieldEl.style.width = shieldPercent + '%';
        // shield must be on top of hp
        shieldEl.style.zIndex = '2';
    }

    // update numeric label
    const hpLabel = document.getElementById(`stats-hp-${player}`);
    if (hpLabel) hpLabel.innerText = hp;
}

function recomputeShield(player) {
    if (!playersStats[player]) return;
    playersStats[player].shieldStacks = playersStats[player].shieldStacks || [];
    playersStats[player].shield = playersStats[player].shieldStacks.reduce((sum, s) => sum + (s.amount || 0), 0);
}

function addShield(player, amount, duration = 2, options = { unstackable: false }) {
    if (!playersStats[player]) return;
    playersStats[player].shieldStacks = playersStats[player].shieldStacks || [];

    if (options.unstackable) {
        // unstackable: keep a single stack = max(existing, new). If existing >= new -> refresh its duration
        const existingMax = playersStats[player].shieldStacks.reduce((m, s) => Math.max(m, s.amount || 0), 0);
        if (amount > existingMax) {
            // replace with single new stack
            playersStats[player].shieldStacks = [{ amount, turnsLeft: duration }];
        } else {
            // refresh the largest stack's duration
            let largest = playersStats[player].shieldStacks.reduce((a, b) => (a.amount >= b.amount ? a : b), playersStats[player].shieldStacks[0]);
            if (largest) largest.turnsLeft = duration;
        }
    } else {
        // stacking: push a new stack
        playersStats[player].shieldStacks.push({ amount, turnsLeft: duration });
    }

    recomputeShield(player);
    updateHPAndShieldUI(player);
}

// Called once per round to decrement shield durations and remove expired stacks
function tickShieldDurations() {
    ['player1', 'player2', 'player3', 'player4', 'boss'].forEach(player => {
        if (!playersStats[player]) return;
        if (!playersStats[player].shieldStacks || playersStats[player].shieldStacks.length === 0) return;
        // decrement
        playersStats[player].shieldStacks.forEach(s => {
            s.turnsLeft = (s.turnsLeft || 0) - 1;
        });
        // keep those with turnsLeft > 0
        playersStats[player].shieldStacks = playersStats[player].shieldStacks.filter(s => (s.turnsLeft || 0) > 0);
        recomputeShield(player);
        updateHPAndShieldUI(player);
    });
}

function consumeShieldStacks(player, amount) {
    if (!playersStats[player]) return 0;
    playersStats[player].shieldStacks = playersStats[player].shieldStacks || [];
    let remaining = Math.abs(amount);
    let consumed = 0;

    // consume from oldest stack first (index 0)
    for (let i = 0; i < playersStats[player].shieldStacks.length && remaining > 0;) {
        const stack = playersStats[player].shieldStacks[i];
        const take = Math.min(stack.amount || 0, remaining);
        stack.amount = (stack.amount || 0) - take;
        remaining -= take;
        consumed += take;

        // remove empty stacks
        if ((stack.amount || 0) <= 0) {
            playersStats[player].shieldStacks.splice(i, 1);
        } else {
            i++;
        }
    }

    // update aggregate shield value and UI
    recomputeShield(player);
    updateHPAndShieldUI(player);
    return consumed;
}

function isDead(entity) {
    return window.deadEntities.has(entity) || (playersStats[entity]?.hp || 0) <= 0;
}

function markAsDead(entity) {

    if (!window.deadEntities.has(entity)) {
        window.deadEntities.add(entity);

        if (entity.startsWith('player')) {
            window.deadPlayers.add(entity);
            console.log(`${entity} has been permanently defeated!`);
        }

        if (entity === 'boss') {
            const bossSelect = document.getElementById('preset-entity');
            const selectedPreset = bossSelect ? bossSelect.value : null;

            if (selectedPreset) {
                window.deadBosses.add(selectedPreset);
            }
        }

        console.log(`${entity} has been defeated!`);

        // Visual indicator
        const hpBar = document.getElementById(`hp-${entity}`);
        if (hpBar) hpBar.style.backgroundColor = '#666';

        const label = document.getElementById(`stats-hp-${entity}`);
        if (label) label.innerText = '0 (DEAD)';
    }
}

function adjustHP(player, change) {
    if (!playersStats[player]) return;
    if (typeof playersStats[player].shield !== 'number') playersStats[player].shield = 0;
    const maxHealth = playersStats[player].maxHp || playersStats[player].hp || 1;

    // Don't heal dead entities (but allow damage for completeness)
    if (change > 0 && isDead(player)) {
        console.log(`Cannot heal ${player}: entity is dead.`);
        return;
    }

    const originalHP = playersStats[player].hp || 0;

    if (change < 0) {
        // incoming damage
        let remaining = -change;
        const shieldAvailable = playersStats[player].shield || 0;
        if (shieldAvailable > 0) {
            const wantToUse = Math.min(shieldAvailable, remaining);
            const actuallyUsed = consumeShieldStacks(player, wantToUse);
            remaining -= actuallyUsed;
            console.log(`${player} shield absorbed ${actuallyUsed} damage. Remaining shield: ${playersStats[player].shield}`);
        }
        if (remaining > 0) {
            playersStats[player].hp = Math.max(0, Math.min(maxHealth, (playersStats[player].hp || 0) - remaining));
        }
    } else {
        // heal / increase HP
        playersStats[player].hp = Math.max(0, Math.min(maxHealth, (playersStats[player].hp || 0) + change));
    }

    // Check for death
    if (playersStats[player].hp <= 0 && !window.deadEntities.has(player)) {
        markAsDead(player);
    }

    // Check for phase transition IMMEDIATELY after HP change for boss
    if (player === 'boss') {
        const newHP = playersStats[player].hp || 0;
        const maxHP = playersStats[player].maxHp || 1;

        // Check if HP crossed the 50% threshold
        if (originalHP > maxHP * 0.5 && newHP <= maxHP * 0.5 && newHP > 0) {
            checkBakunawaPhase();
        }
    }

    // Update UI
    updateHPAndShieldUI(player);

    // Update numeric label
    const label = document.getElementById(`stats-hp-${player}`);
    if (label) {
        if (isDead(player)) {
            label.innerText = '0 (DEAD)';
        } else {
            label.innerText = playersStats[player].hp;
        }
    }
}

function reduceHPIgnoringShield(player, amount) {
    if (!playersStats[player]) return;
    const maxHealth = playersStats[player].maxHp || playersStats[player].hp || 1;
    playersStats[player].hp = Math.max(0, Math.min(maxHealth, (playersStats[player].hp || 0) - Math.abs(amount)));
    // Update UI/labels
    updateHPAndShieldUI(player);
    const label = document.getElementById(`stats-hp-${player}`);
    if (label) label.innerText = playersStats[player].hp;
}

// Boss attacks using the selected preset's skills
function entityAttack(skillIndex) {
    if (isDead('boss')) {
        console.log('Boss cannot act: entity is dead.');
        return;
    }

    const target = document.getElementById('entity-target')?.value || 'player1';
    const bossSelect = document.getElementById('preset-entity');
    const selectedPreset = bossSelect ? bossSelect.value : 'Bathala';
    const skills = bossSkills[selectedPreset];
    if (!skills || !skills[skillIndex]) {
        console.log('Boss skill not found for preset:', selectedPreset, 'index:', skillIndex);
        return;
    }
    const skill = skills[skillIndex];

    // 1. Pure heal (Mayari Moonlight Grace)
    if (selectedPreset === 'Mayari' && skill.healPercent_maxHp) {
        let healPercent = skill.healPercent_maxHp;
        const healInput = document.getElementById('mayari-heal-percent');
        if (healInput) {
            const val = parseFloat(healInput.value);
            if (!isNaN(val) && val > 0 && val <= 1) healPercent = val;
        }
        const maxHp = playersStats.boss.maxHp || playersStats.boss.hp;
        const healAmount = Math.round(maxHp * healPercent);
        adjustHP('boss', healAmount);
        logDamage(`Mayari used ${skill.name}: Healed self for ${healAmount} HP (${Math.round(healPercent * 100)}% max HP).`);
        return;
    }

    // 2. Heaven's Mandate (Bathala) – apply DEF buff + optional cleanse
    if (selectedPreset === 'Bathala' && skill.heavens_mandate) {
        window.bathalaMandateBuff = {
            turnsLeft: skill.duration || 3,
            defIncrease: skill.def_increase || 0.3
        };
        if (skill.remove_debuff) {
            cleanseBossDebuffs();
            logDamage("Heaven's Mandate: Debuffs cleansed.");
        }
        logDamage(`Bathala used ${skill.name}: +${(window.bathalaMandateBuff.defIncrease * 100)}% DEF for ${window.bathalaMandateBuff.turnsLeft} turns.`);
        updateAllStatusEffectsUI();
        return;
    }

    // Tide of Night
    if (selectedPreset === 'Mayari' && skill.enemyDamage_currHp) {
        ['player1', 'player2', 'player3', 'player4'].forEach(p => {
            const curr = playersStats[p].hp || 0;
            const dmg = Math.max(1, Math.round(curr * skill.enemyDamage_currHp));
            adjustHP(p, -dmg); // shield can absorb
            logDamage(`Mayari used ${skill.name} on ${p}: ${Math.round(skill.enemyDamage_currHp * 100)}% current HP (Dealt ${dmg})`);
        });
        if (skill.invulnerable_turn) {
            window.bossInvulnerable.turnsLeft = skill.invulnerable_turn;
            logDamage(`Boss is now invulnerable for ${window.bossInvulnerable.turnsLeft} turn(s).`);
        }
        if (skill.remove_debuff) cleanseBossDebuffs();
        setTimeout(() => updateAllStatusEffectsUI(), 50);
        return;
    }

    // Daybreak Fury (Apolaki) – sacrifice HP to gain next-turn ATK buff + DEF ignore
    if (selectedPreset === 'Apolaki' && skill.daybreak_fury) {
        const currHp = playersStats.boss.hp || 0;
        const sacPerc = skill.currHP_sac || 0;
        const sacAmount = Math.round(currHp * sacPerc);
        if (sacAmount > 0) {
            reduceHPIgnoringShield('boss', sacAmount);
        }
        // Set turnsLeft = duration + 1 so it survives the immediate endRound tick and is active next turn
        window.daybreakFuryBuff = {
            turnsLeft: (skill.duration || 1) + 1,
            atkIncrease: skill.atk_increase || 0,
            defIgnore: skill.defIgnore_buff || 0
        };
        logDamage(`Apolaki used ${skill.name}: Sacrificed ${sacAmount} HP. Next turn gain +${(window.daybreakFuryBuff.atkIncrease * 100)}% ATK and ignore ${(window.daybreakFuryBuff.defIgnore * 100)}% DEF.`);
        updateAllStatusEffectsUI();
        return;
    }

    if (selectedPreset === 'Bakunawa') {
        // Eclipse Fang - damage + heal
        if (skill.healFrom_mag || skill.healFrom_magPerc) {
            const dmg = calculateDamage('boss', target, skill.damagePercent || 0, skill.flatdamage || 0, skill.magPercentDamage || 0, skill.defIgnore || 0);
            adjustHP(target, -dmg);

            // Heal self
            const bossMag = playersStats.boss.mag || 0;
            const healAmount = (skill.healFrom_mag || 0) + Math.round(bossMag * (skill.healFrom_magPerc || 0));
            adjustHP('boss', healAmount);

            logDamage(`${selectedPreset} used ${skill.name} on ${target}: Dealt ${dmg} damage and healed self for ${healAmount}.`);
            return;
        }

        // Serpent's Coil - damage + bind debuff
        if (skill.bind_debuff) {
            const dmg = calculateDamage('boss', target, skill.damagePercent || 0, skill.flatdamage || 0, skill.magPercentDamage || 0, skill.defIgnore || 0);
            adjustHP(target, -dmg);

            // Apply bind debuff (DEF reduction)
            if (!window.bindDebuffs) window.bindDebuffs = {};
            window.bindDebuffs[target] = {
                turnsLeft: skill.duration || 2,
                defReduce: skill.reduce_enemyDEF || 0.15
            };

            logDamage(`${selectedPreset} used ${skill.name} on ${target}: Dealt ${dmg} damage and applied Bind (-${(window.bindDebuffs[target].defReduce * 100)}% DEF) for ${window.bindDebuffs[target].turnsLeft} turns.`);
            updateAllStatusEffectsUI();
            return;
        }

        // Lunar Devour - AoE damage + devoured DoT
        if (skill.devoured_debuff) {
            ['player1', 'player2', 'player3', 'player4'].forEach(p => {
                const dmg = calculateDamage('boss', p, skill.damagePercent || 0, skill.flatdamage || 0, skill.magPercentDamage || 0, skill.defIgnore || 0);
                adjustHP(p, -dmg);
                logDamage(`${selectedPreset} used ${skill.name} on ${p}: Dealt ${dmg} damage.`);
            });

            // Apply devoured DoT to all players
            if (!window.devouredDebuffs) window.devouredDebuffs = {};
            ['player1', 'player2', 'player3', 'player4'].forEach(p => {
                window.devouredDebuffs[p] = {
                    turnsLeft: skill.duration || 2,
                    dotMagPerc: skill.devoured_dot_magperc || 0.2
                };
            });

            logDamage(`Applied Devoured to all players: ${(skill.devoured_dot_magperc * 100)}% MAG DoT for ${skill.duration || 2} turns.`);
            updateAllStatusEffectsUI();
            return;
        }

        // Shadow Dive - strengthened buff for next attack
        if (skill.strengthened) {
            if (!window.strengthenedBuff) window.strengthenedBuff = {};
            window.strengthenedBuff.boss = {
                attacksLeft: skill.strengthened_attack_num || 1,
                multiplier: skill.strengthened_attack_mult || 2
            };
            logDamage(`${selectedPreset} used ${skill.name}: Next ${window.strengthenedBuff.boss.attacksLeft} attack(s) deal ${window.strengthenedBuff.boss.multiplier}x damage.`);
            updateAllStatusEffectsUI();
            return;
        }
    }

    // 3. Damage (AoE or Single)
    const applyDamage = (victim) => {
        const dmg = calculateDamage(
            'boss',
            victim,
            skill.damagePercent || 0,
            skill.flatdamage || 0,
            skill.magPercentDamage || 0,
            skill.defIgnore || 0,
            { dmgMultiplier: skill.dmgMultiplier || 1 }
        );
        adjustHP(victim, -dmg);
        logDamage(`${selectedPreset} used ${skill.name} on ${victim}: ${skill.description} (Dealt ${dmg})`);
    };

    if (skill.hitsAll) {
        ['player1', 'player2', 'player3', 'player4'].forEach(applyDamage);
    } else {
        applyDamage(target);
    }

    // 4. Post-damage debuffs (Moonfall Spear)
    if (selectedPreset === 'Mayari' && skill.moonfall_debuff) {
        window.moonfallDebuffs[target] = {
            turnsLeft: skill.duration || 2,
            defReduce: skill.reduce_enemyDEF || 0.2
        };
        logDamage(`Applied Moonfall to ${target}: -${(window.moonfallDebuffs[target].defReduce * 100)}% DEF for ${window.moonfallDebuffs[target].turnsLeft} turns.`);
        updateAllStatusEffectsUI();
    }
}

function attackEnemy(player, skillIndex) {
    if (isDead(player)) {
        logDamage(`${player} cannot act: entity is dead.`);
        return;
    }

    const skillKey = getSkillKey(player, skillIndex);
    if (isOnCooldown(player, skillKey)) {
        logDamage(`${player} skill ${skillIndex + 1} is on cooldown (${cooldowns[player][skillKey]} rounds left).`);
        return;
    }

    const skill = playerSkills[player][skillIndex];
    let target;

    // Determine target based on skill type
    if (skill && (skill.heal_flat || skill.magPercent_heal || skill.blessing || skill.maxHp_perc || skill.currHP_shield)) {
        // Support skills - use ally target dropdown
        const allySelect = document.getElementById(`ally-target-${player}`);
        target = allySelect ? allySelect.value : player;
    } else {
        // Attack skills - use enemy target dropdown  
        const enemySelect = document.getElementById(`enemy-target-${player}`);
        target = enemySelect ? enemySelect.value : 'boss';
    }

    // Focus Aim (self-buff)
    if (skill && skill.focused_aim) {
        window.focusAimBuff[player] = {
            turnsLeft: skill.duration || 2,
            defIgnore: skill.defIgnore_buff || 0.2
        };
        logDamage(`${player} used ${skill.name}: For ${window.focusAimBuff[player].turnsLeft} turns ignore ${(window.focusAimBuff[player].defIgnore * 100)}% DEF.`);
        startCooldown(player, skillKey, skill.cooldown ?? 4);
        updateAllSkillCooldownDescriptions();
        setTimeout(() => updateAllStatusEffectsUI(), 50);
        return;
    }

    if (player === 'player1' && skillIndex === 1) { // Heavy Attack is index 1
        const bonecrackedCheckbox = document.getElementById('bonecracked-checkbox');
        if (bonecrackedCheckbox && bonecrackedCheckbox.checked) {
            // Apply Bone Cracked debuff to the target
            if (!window.bonecrackedDebuffs) window.bonecrackedDebuffs = {};
            window.bonecrackedDebuffs[target] = {
                turnsLeft: 1, // 1 turn duration
                defReduce: 0.1 // 10% DEF reduction
            };
            logDamage(`Bone Cracked applied to ${target}: -10% DEF for 1 turn.`);
            setTimeout(() => updateAllStatusEffectsUI(), 50);
        }
    }

    // NEW: Rest (Mandirigma) - remove debuffs from self
    if (player === 'player1' && skill && skill.remove_debuff && !skill.hitsAll) {
        cleansePlayerDebuffs(player);
        logDamage(`${player} used ${skill.name}: Self debuffs removed.`);
        startCooldown(player, skillKey, skill.cooldown ?? 3);
        updateAllSkillCooldownDescriptions();
        setTimeout(() => updateAllStatusEffectsUI(), 50);
        return;
    }

    // NEW: Berserk (Mandirigma) - HP requirement + rage buff
    if (player === 'player1' && skill && skill.mandirigma_rage) {
        const currentHp = playersStats[player].hp || 0;
        const maxHp = playersStats[player].maxHp || 1;
        const hpPercentage = currentHp / maxHp;

        if (hpPercentage > (skill.HP_requirement_from_maxHP_below || 0.51)) {
            logDamage(`${player} cannot use ${skill.name}: HP must be ≤50% (currently ${Math.round(hpPercentage * 100)}%).`);
            return;
        }

        window.mandirigmaRageBuff = {
            turnsLeft: skill.duration || 3,
            dmgIncrease: skill.dmgMultiplier_increase || 0.5,
            defIgnore: skill.defIgnore || 0.2
        };
        logDamage(`${player} used ${skill.name}: +${(window.mandirigmaRageBuff.dmgIncrease * 100)}% DMG and ignore ${(window.mandirigmaRageBuff.defIgnore * 100)}% DEF for ${window.mandirigmaRageBuff.turnsLeft} turns.`);
        startCooldown(player, skillKey, skill.cooldown ?? 4);
        updateAllSkillCooldownDescriptions();
        setTimeout(() => updateAllStatusEffectsUI(), 50);
        return;
    }

    // NEW: Last Stand (Bagani) - HP requirement + DEF buff
    if (player === 'player2' && skill && skill.last_stand) {
        const currentHp = playersStats[player].hp || 0;
        const maxHp = playersStats[player].maxHp || 1;
        const hpPercentage = currentHp / maxHp;

        if (hpPercentage > (skill.HP_requirement_from_maxHP_below || 0.2)) {
            logDamage(`${player} cannot use ${skill.name}: HP must be ≤20% (currently ${Math.round(hpPercentage * 100)}%).`);
            return;
        }

        window.baganiLastStandBuff = {
            turnsLeft: skill.duration || 3,
            defIncrease: skill.defIncrease || 0.5
        };
        logDamage(`${player} used ${skill.name}: +${(window.baganiLastStandBuff.defIncrease * 100)}% DEF for ${window.baganiLastStandBuff.turnsLeft} turns.`);
        startCooldown(player, skillKey, skill.cooldown ?? 4);
        updateAllSkillCooldownDescriptions();
        setTimeout(() => updateAllStatusEffectsUI(), 50);
        return;
    }

    // NEW: Purify (Babaylan) - remove all player debuffs
    if (player === 'player3' && skill && skill.remove_debuff && skill.hitsAll) {
        cleanseAllPlayersDebuffs();
        logDamage(`${player} used ${skill.name}: All player debuffs removed.`);
        startCooldown(player, skillKey, skill.cooldown ?? 2);
        updateAllSkillCooldownDescriptions();
        setTimeout(() => updateAllStatusEffectsUI(), 50);
        return;
    }

    // Healing/Support skills
    if (skill && (skill.heal_flat || typeof skill.magPercent_heal === 'number' || skill.Hpflat_sac || skill.self_heal)) {
        const casterStat = playersStats[player]?.mag || playersStats[player]?.atk || 0;
        const healAmount = Math.round((skill.heal_flat || 0) + casterStat * (skill.magPercent_heal || 0));

        // Self-heal component
        if (skill.self_heal) {
            const selfHealPerc = Number(skill.self_heal) || 0;
            const selfHealAmount = Math.round(selfHealPerc * healAmount);
            adjustHP(player, selfHealAmount);
            logDamage(`${player} used ${skill.name}: Healed self for ${selfHealAmount}.`);
        }

        // Sacrifice: consume HP then heal all allies except self
        if (skill.Hpflat_sac) {
            const sac = Math.abs(skill.Hpflat_sac || 0);
            reduceHPIgnoringShield(player, sac);
            ['player1', 'player2', 'player4'].forEach(p => adjustHP(p, healAmount)); // Fixed - includes all players
            logDamage(`${player} used ${skill.name}: Sacrificed ${sac} HP and healed all allies for ${healAmount}.`);
        } else {
            // Single-target heal - USE THE DETERMINED TARGET, not a new dropdown read
            adjustHP(target, healAmount); // ✅ Use the target determined at the beginning
            logDamage(`${player} used ${skill.name}: Healed ${target} for ${healAmount}.`);
        }

        startCooldown(player, skillKey, skill.cooldown ?? 2);
        updateAllSkillCooldownDescriptions();
        return;
    }

    // Blessing buff
    if (skill && skill.blessing) {
        window.blessingBuff[target] = skill.duration || 2; // ✅ Use the determined target
        logDamage(`${player} used Blessing on ${target}: +20% pre-mitigation damage for ${skill.duration || 2} turns.`);
        startCooldown(player, skillKey, skill.cooldown ?? 3);
        updateAllSkillCooldownDescriptions();
        setTimeout(() => updateAllStatusEffectsUI(), 50);
        return;
    }

    // Player2 support skills (Fortify/Guardian's Oath)
    if (player === 'player2' && skill) {
        if (typeof skill.maxHp_perc === 'number') {
            const maxHp = playersStats.player2.maxHp || playersStats.player2.hp || 1;
            const shieldAmount = Math.round(maxHp * skill.maxHp_perc);
            addShield('player2', shieldAmount, 2, { unstackable: false });
            updateHPAndShieldUI('player2');
            logDamage(`player2 used ${skill.name}: Gained ${shieldAmount} shield (total ${playersStats.player2.shield}).`);
            startCooldown(player, skillKey, skill.cooldown ?? 2);
            updateAllSkillCooldownDescriptions();
            return;
        }

        if (typeof skill.currHP_sac === 'number' && typeof skill.currHP_shield === 'number') {
            const sacAmount = Math.round((playersStats.player2.hp || 0) * skill.currHP_sac);
            const shieldValuePerAlly = Math.round((playersStats.player2.hp || 0) * skill.currHP_shield);
            if (sacAmount <= 0) {
                logDamage('Not enough HP to sacrifice for Guardian\'s Oath.');
                return;
            }
            reduceHPIgnoringShield('player2', sacAmount);
            // Use ally target for Guardian's Oath if it should be single-target, or keep as AoE
            ['player1', 'player3', 'player4'].forEach(p => {
                if (isDead(p)) return;
                addShield(p, shieldValuePerAlly, 2, { unstackable: true });
            });
            logDamage(`player2 used ${skill.name}: Sacrificed ${sacAmount} HP and granted ${shieldValuePerAlly} shield to all allies.`);
            startCooldown(player, skillKey, skill.cooldown ?? 2);
            updateAllSkillCooldownDescriptions();
            return;
        }
    }

    // Damage calculation
    let damage = 0;
    if (skill.damagePercent) {
        damage = calculateDamage(player, target, skill.damagePercent, skill.flatdamage, skill.magPercentDamage || 0, skill.defIgnore || 0);
    } else if (skill.damage) {
        damage = skill.damage;
    }

    // Check invulnerability
    if ((target === 'boss' || target === 'boss2') && window.bossInvulnerable?.turnsLeft > 0) {
        logDamage(`Attack negated: Boss invulnerable (${window.bossInvulnerable.turnsLeft} turns left).`);
        damage = 0;
    }

    // Apply damage
    if (damage > 0) {
        const originalBossHP = playersStats.boss.hp || 0;

        // AoE skills hit multiple targets
        if (skill.name && (skill.name.includes('Volley') || skill.name.includes('Explosive'))) {
            // Hit main boss
            adjustHP('boss', -damage);
            logDamage(`${player} used ${skill.name} on Bakunawa: (Dealt ${damage})`);

            // Hit second boss if active
            if (window.bakunawaPhase2Active && playersStats.boss2.hp > 0) {
                const damage2 = calculateDamage(player, 'boss2', skill.damagePercent, skill.flatdamage, skill.magPercentDamage || 0, skill.defIgnore || 0);
                adjustHP('boss2', -damage2);
                logDamage(`${player} used ${skill.name} on Minokawa: (Dealt ${damage2})`);
            }

            // Check phase transition
            const newBossHP = playersStats.boss.hp || 0;
            const maxHP = playersStats.boss.maxHp || 1;
            if (originalBossHP > maxHP * 0.5 && newBossHP <= maxHP * 0.5 && newBossHP > 0) {
                checkBakunawaPhase();
            }
        } else {
            // Single target attack
            adjustHP(target, -damage);
            logDamage(`${player} used ${skill.name} on ${target}: (Dealt ${damage})`);

            // Check phase transition for boss
            if (target === 'boss') {
                const newBossHP = playersStats[target].hp || 0;
                const maxHP = playersStats[target].maxHp || 1;
                if (originalBossHP > maxHP * 0.5 && newBossHP <= maxHP * 0.5 && newBossHP > 0) {
                    checkBakunawaPhase();
                }
            }
        }
    }

    // Update UI labels
    const label = document.getElementById('stats-hp-boss');
    if (label) label.innerText = playersStats.boss.hp;
    const label2 = document.getElementById('stats-hp-boss2');
    if (label2) label2.innerText = playersStats.boss2.hp;

    if (!window.dungeonBuff3Active) {
        startCooldown(player, skillKey, skill.cooldown ?? 2);
    } else {
        logDamage(`${player} used ${skill.name}: No cooldown applied (Dungeon Buff 3 active).`);
    }
    updateAllSkillCooldownDescriptions();
}


// Heals the entity selected in the healer's target dropdown
function healSelectedTarget(healer, healAmount) {
    if (isDead(healer)) {
        logDamage(`${healer} cannot heal: entity is dead.`);
        return;
    }

    const skillKey = `heal-${healAmount}`;
    // Check cooldown (dungeon buff 3 bypasses this via isOnCooldown)
    if (isOnCooldown(healer, skillKey)) {
        logDamage(`${healer} heal is on cooldown (${cooldowns[healer][skillKey]} rounds left).`);
        return;
    }

    const targetSelect = document.getElementById(`target-${healer}`);
    const target = targetSelect ? targetSelect.value : healer;
    if (!playersStats[target]) return;

    adjustHP(target, Math.abs(healAmount));
    logDamage(`${healer} healed ${target} for ${Math.abs(healAmount)} HP`);

    // Only start cooldown if dungeon buff 3 is not active
    if (!window.dungeonBuff3Active) {
        startCooldown(healer, skillKey, getHealCooldownDuration(healer, healAmount));
    }
    updateAllSkillCooldownDescriptions();
}

//OPTIONAL
function resurrect(entity, hpPercent = 0.5) {
    if (isDead(entity)) {
        window.deadEntities.delete(entity);
        const maxHp = playersStats[entity].maxHp || 100;
        const newHp = Math.round(maxHp * hpPercent);
        playersStats[entity].hp = newHp;

        logDamage(`${entity} has been resurrected with ${newHp} HP!`);

        // Restore visual indicators
        const hpBar = document.getElementById(`hp-${entity}`);
        if (hpBar) hpBar.style.backgroundColor = ''; // Remove gray

        updateHPAndShieldUI(entity);
    }
}

function logDamage(message) {
    const damageLog = document.getElementById('damage-log');
    if (!damageLog) return;

    const logEntry = document.createElement('div');
    logEntry.textContent = message;
    logEntry.style.marginBottom = '2px';

    // Add to top of log (newest first)
    damageLog.insertBefore(logEntry, damageLog.firstChild);

    // Keep only last 20 messages
    while (damageLog.children.length > 20) {
        damageLog.removeChild(damageLog.lastChild);
    }
}

function checkGameState() {
    const playersAlive = ['player1', 'player2', 'player3', 'player4'].some(p => !isDead(p));
    const bossesAlive = !isDead('boss') || (window.bakunawaPhase2Active && !isDead('boss2'));

    if (!playersAlive) {
        console.log('GAME OVER: All players defeated!');
        // Add game over logic here
        return 'defeat';
    } else if (!bossesAlive) {
        console.log('VICTORY: All bosses defeated!');
        // Add victory logic here
        return 'victory';
    }
    return 'ongoing';
}