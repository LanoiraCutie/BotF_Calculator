const playersStats = {
    player1: { hp: 100, atk: 20, def: 10 },
    player2: { hp: 100, atk: 25, def: 15 },
    player3: { hp: 100, atk: 30, def: 20 },
    player4: { hp: 100, atk: 35, def: 25 },
    boss: { hp: 200, atk: 50, mag: 50, def: 30 } // Added mag
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
        Minokawa: { hp: 1700 /*plc*/, atk: 300, mag: 40, def: 190 }, // Total HP: Inherit from Bakunawa (See Bakunawa: Eat the Sun and Moon)
        Manananggal: { hp: 900, atk: 230, mag: 35, def: 100 },      // Assassin Type
        Tiyanak: { hp: 1150, atk: 50, mag: 195, def: 125 },         // Trickster
        Siren: { hp: 1000, atk: 20, mag: 240, def: 80 },            // Mage
        Kapre: { hp: 1300, atk: 200, mag: 0, def: 150 },            // Tank
    }
};

// Damage calculation function implementing the formula:
// For boss skills: (boss ATK * damagePercent + boss MAG * magPercentDamage) / (1 + target DEF * 0.01)
// For player skills: (attacker ATK * damagePercent) / (1 + target DEF * 0.01)
function calculateDamage(attacker, target, damagePercent, flatdamage, magPercentDamage = 0, defIgnore = 0) {
    let targetStats = playersStats[target];
    let def = (targetStats.def || 0);

    // Apply DEF buffs
    if (target === 'boss' && window.bathalaMandateActive) {
        def = Math.round(def * 1.3);
    }
    if (target === 'player2' && window.baganiLastStandActive) {
        def = Math.round(def * 1.5);
    }

    if (attacker !== 'boss' && window.focusAimBuff && window.focusAimBuff[attacker]?.turnsLeft > 0) {
        const extra = window.focusAimBuff[attacker].defIgnore || 0;
        def = def * (1 - extra);
    }

    // Mandirigma Rage: ignore 20% DEF and +50% DMG
    let rageActive = false;
    if (attacker === 'player1' && window.mandirigmaRageActive) {
        def = def * (1 - window.mandirigmaRageDefIgnore);
        rageActive = true;
    }

    // Apply skill-based DEF ignore
    def = def * (1 - defIgnore);

    let atkDamage = 0;
    let magDamage = 0;
    let dmg = 0;

    if (attacker === 'boss') {
        const atk = playersStats[attacker].atk || 0;
        const mag = playersStats[attacker].mag || 0;
        atkDamage = ((flatdamage || 0) + (atk * (damagePercent || 0))) / (1.5 * (1 + (def * 0.01)));
        magDamage = ((flatdamage || 0) + (mag * (magPercentDamage || 0))) / (1.5 * (1 + (def * 0.01)));
        dmg = Math.max(1, Math.round(atkDamage + magDamage));
    } else {
        const attackerATK = playersStats[attacker].mag || playersStats[attacker].atk;
        let numerator = (flatdamage || 0) + attackerATK * (damagePercent || 0);

        // Apply Blessing pre-mitigation (only if attacker has active buff)
        if (window.blessingBuff && window.blessingBuff[attacker] > 0) {
            numerator *= 1.2;
        }

        // Apply Mandirigma Rage +50% DMG
        if (rageActive) {
            numerator *= 1.5;
        }

        atkDamage = numerator / (1 + def * 0.01);
        dmg = Math.max(1, Math.round(atkDamage));
    }

    // Apply crit
    if (window.critActive) {
        dmg = Math.round(dmg * 1.5);
    }

    // Log only once per calculation
    if (typeof window._lastDamageLogRound === "undefined") window._lastDamageLogRound = 0;
    if (typeof currentRound !== "undefined" && window._lastDamageLogRound !== currentRound) {
        window._lastDamageLogRound = currentRound;
    }
    let logMsg = `Damage calculation: attacker=${attacker}, target=${target}, baseDMG=${dmg}`;
    if (rageActive) logMsg += " [Mandirigma Rage]";
    if (window.critActive) logMsg += " [CRIT]";
    if (typeof console !== "undefined" && typeof console.log === "function") {
        console.log(logMsg);
    }

    return dmg;
}

const playerSkills = {
    player1: [
        { name: "Attack", flatdamage: 50, damagePercent: 1.5, cooldown: 1, description: "Attack: Deals 50 (+150% ATK) to the boss." },
        { name: "Heavy Attack", damagePercent: 3.34, cooldown: 2, description: "Heavy Attack: Deals 334% ATK to the boss." },
        { name: "All-in Attack", damagePercent: 8.34, cooldown: 3, description: "All-in Attack: Deals 834% ATK to the boss." },
    ],
    player2: [
        { name: "Shield Bash", flatdamage: 50, damagePercent: 1, cooldown: 1, description: "Deals 50 (+100% ATK) to the boss." },
        { name: "Fortify", maxHp_perc: 0.3, cooldown: 4, description: "Gain shield equal to +30% max HP for 2 turns." },
        { name: "Guardian’s Oath ", currHP_sac: 0.25, currHP_shield: 0.25, cooldown: 4, description: "Sacrifice 25% current HP, shield all ally for amount of 25% current HP, unstackable." }
    ],
    player3: [
        { name: "Heal", heal_flat: 100, magPercent_heal: 0.5, self_heal: 0.5, cooldown: 2, description: "Restore HP equivalent to 100 (+50% MAG) to ally, and heals self for 50% of the amount." },
        { name: "Blessing", blessing: true, duration: 2, cooldown: 3, description: "+20% dmg buff to ally (2 turns)." },
        { name: "Mana Surge", damagePercent: 1, cooldown: 2, description: "Deals 100% MAG to the enemy." },
        { name: "Sacrifice ", Hpflat_sac: 200, heal_flat: 50, magPercent_heal: 1, cooldown: 3, description: "Lose 200 HP, heal all allies HP equivalent to 150% -> 50 (+100% MAG)" },
    ],
    player4: [
        { name: "Quick Shot", flatdamage: 150, damagePercent: 1.5, cooldown: 1, description: "Deals 150 (+ 150% ATK) damage to the enemy." },
        { name: "Piercing Arrow", damagePercent: 2.25, defIgnore: 1, cooldown: 3, description: "Deals 225% ATK damage and ignores defense." },
        { name: "Volley", flatdamage: 50, damagePercent: 1, cooldown: 1, description: "Deals 50 + 100% ATK each to all enemies." },
        { name: "Focus Aim", focused_aim: true, duration: 2, defIgnore_buff: 0.2, cooldown: 4, description: "Next 2 attacks ignore 20% of enemy DEF." },
        { name: "Explosive Arrow ", flatdamage: 300, damagePercent: 5, cooldown: 3, description: "Deals 300 (+ 500% ATK) to all enemies." }
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
        { name: "Serpent Bite", damagePercent: 0.85, magPercentDamage: 0.15, description: "Deals 85% ATK + 15% MAG to a player." },
        { name: "Tidal Wave", damagePercent: 0.65, magPercentDamage: 0.35, description: "Deals 65% ATK + 35% MAG to all players." },
        { name: "Devour", damagePercent: 1.15, magPercentDamage: 0.25, description: "Deals 115% ATK + 25% MAG to a player." },
        { name: "Abyssal Roar", damagePercent: 1.05, magPercentDamage: 0.45, description: "Deals 105% ATK + 45% MAG to all players." }
    ],
    Minokawa: [ 
        { name: "Serpent Bite", damagePercent: 0.85, magPercentDamage: 0.15, description: "Deals 85% ATK + 15% MAG to a player." },
        { name: "Tidal Wave", damagePercent: 0.65, magPercentDamage: 0.35, description: "Deals 65% ATK + 35% MAG to all players." },
        { name: "Devour", damagePercent: 1.15, magPercentDamage: 0.25, description: "Deals 115% ATK + 25% MAG to a player." },
        { name: "Abyssal Roar", damagePercent: 1.05, magPercentDamage: 0.45, description: "Deals 105% ATK + 45% MAG to all players." }
    ],
    Manananggal: [
        { name: "Batwing Slash", damagePercent: 1.2, magPercentDamage: 0, description: "Deals 1.2x ATK to one enemy." },
        { name: "Blood Splash", damagePercent: 1.5, magPercentDamage: 0, description: "Deals 1.5x ATK to single enemies." },
        { name: "Split Body", damagePercent: 1.6, magPercentDamage: 0, description: "Deals 1.6x ATK to all enemies." }
    ],
    Tiyanak: [
        { name: "Claw Latch", damagePercent: 0, magPercentDamage: 1.2, description: "Deals 1.2x MAG to one enemy." },
        { name: "Blood Hex", damagePercent: 0, magPercentDamage: 1.5, description: "Deals 1.5x MAG to single enemies." },
        { name: "Demonic Wail", damagePercent: 0, magPercentDamage: 1.6, description: "Deals 1.6x MAG to all enemies." }
    ],
    Siren: [
        { name: "Drowning Current", damagePercent: 0, magPercentDamage: 1.2, description: "Deals 1.2x MAG to one enemy." },
        { name: "Tidal Surge", damagePercent: 0, magPercentDamage: 1.5, description: "Deals 1.5x MAG to single enemies." },
        { name: "Moonlight Hymn", damagePercent: 0, magPercentDamage: 1.6, description: "Deals 1.6x MAG to all enemies." }
    ],
    Kapre: [
        { name: "Tree Smash", damagePercent: 1.2, magPercentDamage: 0, description: "Deals 1.2x ATK to one enemy." },
        { name: "Uproot Smash", damagePercent: 1.5, magPercentDamage: 0, description: "Deals 1.5x ATK to single enemies." },
        { name: "Forest Wrath", damagePercent: 1.6, magPercentDamage: 0, description: "Deals 1.6x ATK to all enemies." }
    ]

};
// Expose bossSkills and playersStats to global scope for HTML dynamic updates
window.bossSkills = bossSkills;
window.playersStats = playersStats;

// Global crit flag
window.critActive = false;

// Global buff flags
window.critActive = false;
window.bathalaMandateBuff = { turnsLeft: 0, defIncrease: 0 };
window.baganiLastStandActive = false;
window.mandirigmaRageActive = false;
window.mandirigmaRageDefIgnore = 0;
window.blessingBuff = {}; // blessingBuff[playerId] = remainingTurns
window.focusAimBuff = {};  // focusAimBuff[playerId] = { attacksLeft, defIgnore }
window.moonfallDebuffs = {}; // moonfallDebuffs[playerId] = remainingTurns
window.bossInvulnerable = { turnsLeft: 0 };
window.daybreakFuryBuff = { turnsLeft: 0, atkIncrease: 0, defIgnore: 0 };

function cleanseBossDebuffs() {
    // Remove any DEF-reducing or negative flags applied to boss
    if (window.moonfallDebuffs && window.moonfallDebuffs['boss']) {
        delete window.moonfallDebuffs['boss'];
    }
    // Placeholder: clear other future boss debuffs here
    console.log("Boss debuffs cleansed.");
}

// Functions to handle buff/debuff durations
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

// --- Patch calculateDamage for crit, DEF buffs, Mandirigma Rage ---
const originalCalculateDamage = typeof window.originalCalculateDamage === "function"
    ? window.originalCalculateDamage
    : calculateDamage;
window.originalCalculateDamage = originalCalculateDamage;

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
        console.log(`Damage prevented: boss invulnerable (${window.bossInvulnerable.turnsLeft} turns left).`);
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

    if (target === 'player2' && window.baganiLastStandActive) {
        def = Math.round(def * 1.5);
    }

    // DEF reductions

    // Moonfall debuff
    if (target !== 'boss' && window.moonfallDebuffs && window.moonfallDebuffs[target]) {
        const red = window.moonfallDebuffs[target].defReduce || 0;
        def = def * (1 - red);
    }

    // Focus Aim (turn based extra DEF ignore)
    if (attacker !== 'boss' && window.focusAimBuff && window.focusAimBuff[attacker]?.turnsLeft > 0) {
        const extra = window.focusAimBuff[attacker].defIgnore || 0;
        def = def * (1 - extra);
    }

    // Mandirigma Rage
    let rageActive = false;
    if (attacker === 'player1' && window.mandirigmaRageActive) {
        def = def * (1 - window.mandirigmaRageDefIgnore);
        rageActive = true;
    }

    // Skill-based DEF ignore (e.g. Piercing Arrow)
    if (attacker === 'boss' && daybreakActive && window.daybreakFuryBuff.defIgnore > 0) {
        def = def * (1 - window.daybreakFuryBuff.defIgnore);
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
            numerator *= 1.5;
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
    console.log(logMsg);

    return dmg;
};

// Remove duplicate patch for attackEnemy
if (typeof window._attackEnemyPatched === "undefined") {
    const originalAttackEnemy = window.attackEnemy;
    window.attackEnemy = function (player, skillIndex) {
        originalAttackEnemy(player, skillIndex);
    };
    window._attackEnemyPatched = true;
}

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
    const remain = cooldowns[player]?.[skillKey] || 0;
    return remain > 0;
}

function startCooldown(player, skillKey, durationRounds = 2) {
    if (!cooldowns[player]) cooldowns[player] = {};
    cooldowns[player][skillKey] = durationRounds;
}

function endRound() {
    currentRound += 1;
    ['player1', 'player2', 'player3', 'player4'].forEach(p => {
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
    console.log(`Round ${currentRound} started. Cooldowns decremented.`);
    updateAllSkillCooldownDescriptions();
    const rc = document.getElementById('round-counter');
    if (rc) rc.innerText = String(currentRound);
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
            if (!descEl) return;
            const remain = getRemainingCooldown(playerId, idx);
            const cdText = ` (CD: ${remain})`;
            // Reset to base description then append CD
            descEl.innerText = `${skill.description}${cdText}`;
        });

        // Also handle extra heal buttons not tied to playerSkills indices
        // player2 heal 30
        if (playerId === 'player2') {
            const healDiv = Array.from(skillDivs).find(div => {
                const btn = div.querySelector('button');
                return btn && btn.getAttribute('onclick') === "healSelectedTarget('player2', 30)";
            });
            if (healDiv) {
                const descEl = healDiv.querySelector('.skill-description');
                if (descEl) {
                    const remain = cooldowns.player2?.['heal-30'] || 0;
                    descEl.innerText = `Heal: Restores 30 HP to the selected ally. (CD: ${remain})`;
                }
            }
        }

        // player3 heal 50 (Resurrection)
        if (playerId === 'player3') {
            const healDiv = Array.from(skillDivs).find(div => {
                const btn = div.querySelector('button');
                return btn && btn.getAttribute('onclick') === "healSelectedTarget('player3', 50)";
            });
            if (healDiv) {
                const descEl = healDiv.querySelector('.skill-description');
                if (descEl) {
                    const remain = cooldowns.player3?.['heal-50'] || 0;
                    descEl.innerText = `Resurrection: Restores 50 HP to the selected ally. (CD: ${remain})`;
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
    // Add mag display for boss
    const magEl = player === 'boss' ? document.getElementById('stats-mag-boss') : null;
    if (hpEl) hpEl.innerText = newStats.hp;
    if (atkEl) atkEl.innerText = newStats.atk || newStats.mag || 0; // Handle ATK or MAG
    if (defEl) defEl.innerText = newStats.def;
    if (magEl) magEl.innerText = newStats.mag || 0;

    // Update the HP bar (full)
    const hpBar = document.getElementById(`hp-${player}`);
    if (hpBar) {
        hpBar.style.width = '100%';
    }

    // ensure UI elements for shield/hp exist/updated
    updateHPAndShieldUI(player);
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

function adjustHP(player, change) {
    if (!playersStats[player]) return;
    if (typeof playersStats[player].shield !== 'number') playersStats[player].shield = 0;
    const maxHealth = playersStats[player].maxHp || playersStats[player].hp || 1;

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

    // Update UI
    updateHPAndShieldUI(player);
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

// Reduce boss defense by input amount, not going below 0, and update UI
function reduceBossDefense() {
    const input = document.getElementById('boss-def-reduce');
    if (!input) return;
    const amount = Math.max(0, parseInt(input.value || '0', 10));
    const boss = playersStats['boss'];
    const newDef = Math.max(0, (boss.def || 0) - amount);
    boss.def = newDef;
    const defEl = document.getElementById('stats-def-boss');
    if (defEl) defEl.innerText = newDef;
    console.log(`Boss DEF reduced by ${amount}. New DEF: ${newDef}`);
}

// Reset boss defense back to the preset's DEF value and update UI
function resetBossDefense() {
    // Determine the currently selected preset for boss
    const bossSelect = document.getElementById('preset-entity');
    const selectedPreset = bossSelect ? bossSelect.value : 'preset1';
    const baseDef = presets.boss[selectedPreset]?.def ?? playersStats.boss.def;
    playersStats.boss.def = baseDef;
    const defEl = document.getElementById('stats-def-boss');
    if (defEl) defEl.innerText = baseDef;
    const input = document.getElementById('boss-def-reduce');
    if (input) input.value = '0';
    console.log(`Boss DEF reset to ${baseDef} based on ${selectedPreset}.`);
}

function bossAttack(change) {
    const target = document.getElementById('boss-target').value;
    adjustHP(target, change);
}

let currentEntity = 'boss';

function updateEntity() {
    const entityType = document.getElementById('entity-type').value;
    currentEntity = entityType;

    // Update the HP bar and preset dropdown based on the selected entity
    const entityStats = playersStats[currentEntity];
    document.getElementById('hp-entity').style.width = (entityStats.hp / entityStats.hp) * 100 + '%'; // Assuming max HP is dynamic
    document.getElementById('preset-entity').value = 'preset1';

    // Update the stats display
    document.getElementById('stats-hp-boss').innerText = entityStats.hp;
    document.getElementById('stats-atk-boss').innerText = entityStats.atk;
    document.getElementById('stats-def-boss').innerText = entityStats.def;
    // Add mag display for boss
    if (entityStats.mag !== undefined && document.getElementById('stats-mag-boss')) {
        document.getElementById('stats-mag-boss').innerText = entityStats.mag;
    }
}

// Boss attacks using the selected preset's skills
function entityAttack(skillIndex) {
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
        console.log(`Mayari used ${skill.name}: Healed self for ${healAmount} HP (${Math.round(healPercent * 100)}% max HP).`);
        return;
    }

    // 2. Heaven's Mandate (Bathala) – apply DEF buff + optional cleanse
    if (selectedPreset === 'Bathala' && skill.heavens_mandate) {
        window.bathalaMandateBuff = {
            turnsLeft: skill.duration || 3,
            defIncrease: skill.def_increase || 0.3
        };
        if (skill.remove_debuff) {
            // Example: remove Moonfall debuffs from boss or all? (currently only boss-aimed debuffs matter)
            // If you track other debuffs on boss, clear them here.
            console.log("Heaven's Mandate: Debuffs cleansed (placeholder).");
        }
        console.log(`Bathala used ${skill.name}: +${(window.bathalaMandateBuff.defIncrease * 100)}% DEF for ${window.bathalaMandateBuff.turnsLeft} turns.`);
        return;
    }

    // Tide of Night
    if (selectedPreset === 'Mayari' && skill.enemyDamage_currHp) {
        ['player1','player2','player3','player4'].forEach(p => {
            const curr = playersStats[p].hp || 0;
            const dmg = Math.max(1, Math.round(curr * skill.enemyDamage_currHp));
            adjustHP(p, -dmg); // shield can absorb
            console.log(`Mayari used ${skill.name} on ${p}: ${Math.round(skill.enemyDamage_currHp * 100)}% current HP (Dealt ${dmg})`);
        });
        if (skill.invulnerable_turn) {
            window.bossInvulnerable.turnsLeft = skill.invulnerable_turn;
            console.log(`Boss is now invulnerable for ${window.bossInvulnerable.turnsLeft} turn(s).`);
        }
        if (skill.remove_debuff) cleanseBossDebuffs();
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
        console.log(`Apolaki used ${skill.name}: Sacrificed ${sacAmount} HP. Next turn gain +${(window.daybreakFuryBuff.atkIncrease * 100)}% ATK and ignore ${(window.daybreakFuryBuff.defIgnore * 100)}% DEF.`);
        return;
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
        console.log(`${selectedPreset} used ${skill.name} on ${victim}: ${skill.description} (Dealt ${dmg})`);
    };

    if (skill.hitsAll) {
        ['player1','player2','player3','player4'].forEach(applyDamage);
    } else {
        applyDamage(target);
    }

    // 4. Post-damage debuffs (Moonfall Spear)
    if (selectedPreset === 'Mayari' && skill.moonfall_debuff) {
        window.moonfallDebuffs[target] = {
            turnsLeft: skill.duration || 2,
            defReduce: skill.reduce_enemyDEF || 0.2
        };
        console.log(`Applied Moonfall to ${target}: -${(window.moonfallDebuffs[target].defReduce * 100)}% DEF for ${window.moonfallDebuffs[target].turnsLeft} turns.`);
    }
}

function useSkill(player, skillIndex, target) {
    const skill = playerSkills[player][skillIndex];

    // Healing skills: compute heal = heal_flat + MAG * magPercent_heal
    if (skill && (skill.heal_flat || typeof skill.magPercent_heal === 'number')) {
        const casterStat = playersStats[player]?.mag || playersStats[player]?.atk || 0;
        const healAmount = Math.round((skill.heal_flat || 0) + casterStat * (skill.magPercent_heal || 0));

        // Sacrifice-type skill: consume Hpflat_sac (bypass shield) then heal allies
        if (skill.Hpflat_sac) {
            const sac = Math.abs(skill.Hpflat_sac || 0);
            reduceHPIgnoringShield(player, sac);
            ['player1', 'player2', 'player3', 'player4'].forEach(p => adjustHP(p, healAmount));
        } else {
            // single-target heal -> target param or caster
            const tgt = target || player;
            adjustHP(tgt, healAmount);
        }

        console.log(`${player} used ${skill.name}: Healed ${healAmount}`);
        return;
    }

    if (skill.damage) {
        adjustHP(target, -skill.damage);
    } else if (skill.heal) {
        adjustHP(player, skill.heal);
    }
    console.log(`${player} used ${skill.name}: ${skill.description}`);
}

function attackBoss(player, skillIndex) {
    const skillKey = getSkillKey(player, skillIndex);
    if (isOnCooldown(player, skillKey)) {
        console.log(`${player} skill ${skillIndex + 1} is on cooldown (${cooldowns[player][skillKey]} rounds left).`);
        return;
    }
    const skill = playerSkills[player][skillIndex];
    const target = 'boss'; // The boss is the target

    if (skill.damage) {
        const maxHealth = presets[target].maxHp || playersStats[target].hp; // Get max HP from presets or current stats
        playersStats[target].hp = Math.max(0, playersStats[target].hp - skill.damage); // Reduce boss's HP

        // Update the HP bar
        const hpBar = document.getElementById(`hp-${target}`);
        if (hpBar) {
            const healthPercentage = (playersStats[target].hp / maxHealth) * 100;
            hpBar.style.width = healthPercentage + '%';
        }

        // Update the stats display
        document.getElementById(`stats-hp-${target}`).innerText = playersStats[target].hp;

        console.log(`${player} used ${skill.name} on Boss: ${skill.description}`);
        startCooldown(player, skillKey, skill.cooldown ?? 2);
        updateAllSkillCooldownDescriptions();
    }
}

function attackEnemy(player, skillIndex) {
    const skillKey = getSkillKey(player, skillIndex);
    if (isOnCooldown(player, skillKey)) {
        console.log(`${player} skill ${skillIndex + 1} is on cooldown (${cooldowns[player][skillKey]} rounds left).`);
        return;
    }
    const target = 'boss';
    const skill = playerSkills[player][skillIndex];

    if (skill && skill.focused_aim) {
        window.focusAimBuff[player] = {
            turnsLeft: skill.duration || 2,
            defIgnore: skill.defIgnore_buff || 0.2
        };
        console.log(`${player} used ${skill.name}: For ${window.focusAimBuff[player].turnsLeft} turns ignore ${(window.focusAimBuff[player].defIgnore * 100)}% DEF.`);
        startCooldown(player, skillKey, skill.cooldown ?? 4);
        updateAllSkillCooldownDescriptions();
        return;
    }

    // Healer-style skills (heal_flat + MAG% of MAG) and Sacrifice (Hpflat_sac)
    if (skill && (skill.heal_flat || typeof skill.magPercent_heal === 'number' || skill.Hpflat_sac || skill.self_heal)) {
        const casterStat = playersStats[player]?.mag || playersStats[player]?.atk || 0;
        const healAmount = Math.round((skill.heal_flat || 0) + casterStat * (skill.magPercent_heal || 0));
        if (skill.self_heal) {
            const self_healPerc = Number(skill.self_heal) || 0;
            const self_healAmount = Math.round(self_healPerc * healAmount);
            adjustHP(player, self_healAmount);
            console.log(`${player} on ${skill.name}: Healed self for ${self_healAmount}.`);
        }
        // Sacrifice: consume Hpflat_sac from caster ignoring shield, then heal all allies
        if (skill.Hpflat_sac) {
            const sac = Math.abs(skill.Hpflat_sac || 0);
            reduceHPIgnoringShield(player, sac);
            ['player1', 'player2', 'player4'].forEach(p => adjustHP(p, healAmount));
            console.log(`${player} used ${skill.name}: Sacrificed ${sac} HP and healed all allies for ${healAmount}.`);
        } else {
            // single-target heal uses target selector if available
            const targetSelect = document.getElementById(`target-${player}`);
            const tgt = targetSelect ? targetSelect.value : player;
            adjustHP(tgt, healAmount);
            console.log(`${player} used ${skill.name}: Healed ${tgt} for ${healAmount}.`);
        }

        startCooldown(player, skillKey, skill.cooldown ?? 2);
        updateAllSkillCooldownDescriptions();
        return;
    }

    if (skill && skill.blessing) {
        // Determine target ally (fallback: self)
        const targetSelect = document.getElementById(`target-${player}`);
        const tgt = targetSelect ? targetSelect.value : player;
        window.blessingBuff[tgt] = skill.duration; // e.g. 2 turns
        console.log(`${player} used Blessing on ${tgt}: +20% pre-mitigation damage for ${skill.duration} turns.`);
        startCooldown(player, skillKey, skill.cooldown ?? 3);
        updateAllSkillCooldownDescriptions();
        return;
    }

    // handle player2 support skills (Fortify / Guardian's Oath)
    if (player === 'player2' && skill) {
        if (typeof skill.maxHp_perc === 'number') {
            const maxHp = playersStats.player2.maxHp || playersStats.player2.hp || 1;
            const shieldAmount = Math.round(maxHp * skill.maxHp_perc);
            addShield('player2', shieldAmount, 2, { unstackable: false });
            updateHPAndShieldUI('player2');
            console.log(`player2 used ${skill.name}: Gained ${shieldAmount} shield (total ${playersStats.player2.shield}).`);
            startCooldown(player, skillKey, skill.cooldown ?? 2);
            updateAllSkillCooldownDescriptions();
            return;
        }
        if (typeof skill.currHP_sac === 'number' && typeof skill.currHP_shield === 'number') {
            const sacAmount = Math.round((playersStats.player2.hp || 0) * skill.currHP_sac);
            const shieldValuePerAlly = Math.round((playersStats.player2.hp || 0) * (skill.currHP_shield || 1));
            if (sacAmount <= 0) {
                console.log('Not enough HP to sacrifice for Guardian\'s Oath.');
                return;
            }
            reduceHPIgnoringShield('player2', sacAmount);
            ['player1', 'player3', 'player4'].forEach(p => {
                addShield(p, shieldValuePerAlly, 2, { unstackable: true });
            });
            console.log(`player2 used ${skill.name}: Sacrificed ${sacAmount} HP and granted ${shieldValuePerAlly} shield to all allies.`);
            startCooldown(player, skillKey, skill.cooldown ?? 2);
            updateAllSkillCooldownDescriptions();
            return;
        }
    }

    let damage = 0;
    if (skill.damagePercent) {
        // Use the new damage formula
        damage = calculateDamage(player, target, skill.damagePercent, skill.flatdamage, skill.magPercentDamage || 0, skill.defIgnore || 0);
    } else if (skill.damage) {
        // For fixed damage skills, use the old system
        damage = skill.damage;
    }

    // Check for boss invulnerability
    if (window.bossInvulnerable?.turnsLeft > 0) {
        console.log(`Attack negated: Boss invulnerable (${window.bossInvulnerable.turnsLeft} turns left).`);
        damage = 0;
    }

    if (damage > 0) {
        playersStats[target].hp = Math.max(0, playersStats[target].hp - damage);
        updateHPAndShieldUI(target);
        const label = document.getElementById('stats-hp-boss');
        if (label) label.innerText = playersStats[target].hp;

        console.log(`${player} used ${skill.name} on ${target}: ${skill.description} (Dealt ${damage})`);
        startCooldown(player, skillKey, skill.cooldown ?? 2);
        updateAllSkillCooldownDescriptions();
    }
}


// Heals the entity selected in the healer's target dropdown
function healSelectedTarget(healer, healAmount) {
    const skillKey = `heal-${healAmount}`;
    if (isOnCooldown(healer, skillKey)) {
        console.log(`${healer} heal is on cooldown (${cooldowns[healer][skillKey]} rounds left).`);
        return;
    }
    const targetSelect = document.getElementById(`target-${healer}`);
    const target = targetSelect ? targetSelect.value : healer;
    if (!playersStats[target]) return;

    // keep backward-compatible numeric healAmount path
    adjustHP(target, Math.abs(healAmount));
    console.log(`${healer} healed ${target} for ${Math.abs(healAmount)} HP`);
    startCooldown(healer, skillKey, getHealCooldownDuration(healer, healAmount));
    updateAllSkillCooldownDescriptions();
}


