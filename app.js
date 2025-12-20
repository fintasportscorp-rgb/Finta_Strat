// StratModel - Multi-Formation Battle Analyzer
// Complete rewrite for comparing multiple formations against a fixed opponent

let formationData = null;
let scatterChart = null;
let selectedFormations = new Set();
let comparisonData = [];
let currentSlide = 0;
const totalSlides = 7;

// i18n - Internationalization
let currentLang = 'en';
let translations = {};

// Load translations for a language
async function loadTranslations(lang) {
    try {
        const response = await fetch(`lang/${lang}.json`);
        if (!response.ok) throw new Error('Translation file not found');
        translations = await response.json();
        currentLang = lang;
        localStorage.setItem('stratmodel-lang', lang);
        applyTranslations();
    } catch (error) {
        console.error('Error loading translations:', error);
        // Fallback to English if translation fails
        if (lang !== 'en') {
            loadTranslations('en');
        }
    }
}

// Get translation by key path (e.g., "nav.setup")
function t(keyPath, replacements = {}) {
    const keys = keyPath.split('.');
    let value = translations;

    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return keyPath; // Return key if not found
        }
    }

    // Handle replacements like {formation}, {winRate}
    if (typeof value === 'string') {
        Object.keys(replacements).forEach(key => {
            value = value.replace(new RegExp(`\\{${key}\\}`, 'g'), replacements[key]);
        });
    }

    return value || keyPath;
}

// Apply translations to all elements with data-i18n attribute
function applyTranslations() {
    // Translate text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translated = t(key);
        if (translated !== key) {
            el.innerHTML = translated;
        }
    });

    // Translate title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        const translated = t(key);
        if (translated !== key) {
            el.setAttribute('title', translated);
        }
    });

    // Translate placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const translated = t(key);
        if (translated !== key) {
            el.setAttribute('placeholder', translated);
        }
    });

    // Update page title
    document.title = t('app.title');
}

// Change language
function changeLanguage(lang) {
    loadTranslations(lang);
}

// Initialize language from localStorage or browser
function initLanguage() {
    const savedLang = localStorage.getItem('stratmodel-lang');
    const browserLang = navigator.language.split('-')[0];
    const lang = savedLang || (browserLang === 'en' ? 'en' : 'en'); // Only English for now
    loadTranslations(lang);
}

// Carousel functions
function changeSlide(direction) {
    currentSlide += direction;
    if (currentSlide < 0) currentSlide = totalSlides - 1;
    if (currentSlide >= totalSlides) currentSlide = 0;
    updateCarousel();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

function updateCarousel() {
    // Update slides
    const slides = document.querySelectorAll('.carousel-slide');
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
    });

    // Update dots
    const dots = document.querySelectorAll('.carousel-dots .dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

// Mobile navigation toggle
function toggleMobileNav() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('mobileNavOverlay');

    menuToggle.classList.toggle('active');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

// Close mobile nav when clicking a nav item
function closeMobileNav() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('mobileNavOverlay');

    menuToggle.classList.remove('active');
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
}

// Theme toggle
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('stratmodel-theme', newTheme);
}

// Initialize theme from localStorage
function initTheme() {
    const savedTheme = localStorage.getItem('stratmodel-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
}

// Dashboard navigation functions
function showSection(section) {
    // Close mobile nav if open
    closeMobileNav();
    // Update nav items
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.classList.toggle('active', item.dataset.section === section);
    });

    // Show/hide sections
    document.getElementById('contextSection').classList.toggle('active', section === 'context');
    document.getElementById('analysisSection').classList.toggle('active', section === 'analysis');
    document.getElementById('analysisSection').style.display = section === 'analysis' ? 'block' : 'none';
    document.getElementById('contextSection').style.display = section === 'context' ? 'block' : 'none';

    // Show/hide category nav in sidebar
    const categoriesNav = document.getElementById('analysisCategoriesNav');
    if (categoriesNav) {
        categoriesNav.style.display = section === 'analysis' ? 'block' : 'none';
    }
}

function switchParentTab(parent) {
    // Close mobile nav if open
    closeMobileNav();

    // Update sidebar nav items
    document.querySelectorAll('.nav-item.sub-nav').forEach(item => {
        item.classList.toggle('active', item.dataset.parent === parent);
    });

    // Update sub-tabs visibility
    document.querySelectorAll('.analysis-tabs .sub-tabs').forEach(subtab => {
        subtab.classList.remove('active');
    });
    const activeSubtabs = document.getElementById(`${parent}-subtabs`);
    if (activeSubtabs) {
        activeSubtabs.classList.add('active');
    }

    // Get the first sub-tab of this parent and activate it
    const firstSubTab = activeSubtabs?.querySelector('.sub-tab-btn');
    if (firstSubTab) {
        const tabId = firstSubTab.dataset.tab;
        switchSubTab(tabId);
    }
}

function switchSubTab(tabId) {
    // Update sub-tab buttons
    document.querySelectorAll('.sub-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    const activeContent = document.getElementById(`${tabId}-tab`);
    if (activeContent) {
        activeContent.classList.add('active');
    }

    // Apply focus mode highlighting if needed
    applyFocusHighlighting();
}

// Tier display names
const tierDisplayNames = {
    'Elite_Tier': 'Elite (Top 3)',
    'Strong_Tier': 'Strong (4-8)',
    'Mid_Tier': 'Mid-Table (9-13)',
    'Struggling_Tier': 'Struggling (14-20)'
};

// Metric definitions by category
const metricDefinitions = {
    summary: {
        metrics: ['win_rate', 'draw_rate', 'loss_rate', 'total_matches'],
        labels: {
            'win_rate': 'Win Rate %',
            'draw_rate': 'Draw Rate %',
            'loss_rate': 'Loss Rate %',
            'total_matches': 'Total Matches'
        },
        source: 'battle_summary'
    },
    shooting: {
        metrics: [
            'avg_goals', 'avg_shots', 'avg_shots_on_target', 'avg_shots_on_target_pct',
            'avg_goals_per_shot', 'avg_goals_per_shot_on_target', 'avg_average_shot_distance',
            'avg_shots_free_kicks', 'avg_pens_made', 'avg_pens_att',
            'avg_xg', 'avg_npxg', 'avg_npxg_per_shot', 'avg_xg_net', 'avg_npxg_net'
        ],
        labels: {
            'avg_goals': 'Goals',
            'avg_shots': 'Shots',
            'avg_shots_on_target': 'Shots on Target',
            'avg_shots_on_target_pct': 'SOT %',
            'avg_goals_per_shot': 'Goals/Shot',
            'avg_goals_per_shot_on_target': 'Goals/SOT',
            'avg_average_shot_distance': 'Avg Shot Dist',
            'avg_shots_free_kicks': 'FK Shots',
            'avg_pens_made': 'Pens Made',
            'avg_pens_att': 'Pens Attempted',
            'avg_xg': 'xG',
            'avg_npxg': 'npxG',
            'avg_npxg_per_shot': 'npxG/Shot',
            'avg_xg_net': 'xG Net',
            'avg_npxg_net': 'npxG Net'
        },
        source: 'shooting'
    },
    passing: {
        metrics: [
            'avg_passes_completed', 'avg_passes', 'avg_passes_pct',
            'avg_passes_total_distance', 'avg_passes_progressive_distance',
            'avg_passes_completed_short', 'avg_passes_short', 'avg_passes_pct_short',
            'avg_passes_completed_medium', 'avg_passes_medium', 'avg_passes_pct_medium',
            'avg_passes_completed_long', 'avg_passes_long', 'avg_passes_pct_long',
            'avg_assists', 'avg_xg_assist', 'avg_pass_xa', 'avg_assisted_shots',
            'avg_passes_into_final_third', 'avg_passes_into_penalty_area',
            'avg_crosses_into_penalty_area', 'avg_progressive_passes'
        ],
        labels: {
            'avg_passes_completed': 'Passes Completed',
            'avg_passes': 'Total Passes',
            'avg_passes_pct': 'Pass %',
            'avg_passes_total_distance': 'Total Distance',
            'avg_passes_progressive_distance': 'Prog Distance',
            'avg_passes_completed_short': 'Short Completed',
            'avg_passes_short': 'Short Passes',
            'avg_passes_pct_short': 'Short %',
            'avg_passes_completed_medium': 'Medium Completed',
            'avg_passes_medium': 'Medium Passes',
            'avg_passes_pct_medium': 'Medium %',
            'avg_passes_completed_long': 'Long Completed',
            'avg_passes_long': 'Long Passes',
            'avg_passes_pct_long': 'Long %',
            'avg_assists': 'Assists',
            'avg_xg_assist': 'xG Assist',
            'avg_pass_xa': 'xA',
            'avg_assisted_shots': 'Key Passes',
            'avg_passes_into_final_third': 'Into Final 3rd',
            'avg_passes_into_penalty_area': 'Into Pen Area',
            'avg_crosses_into_penalty_area': 'Crosses to Pen',
            'avg_progressive_passes': 'Prog Passes'
        },
        source: 'passing'
    },
    possession: {
        metrics: [
            'avg_possession', 'avg_touches', 'avg_touches_def_pen_area',
            'avg_touches_def_3rd', 'avg_touches_mid_3rd', 'avg_touches_att_3rd',
            'avg_touches_att_pen_area', 'avg_touches_live_ball',
            'avg_take_ons', 'avg_take_ons_won', 'avg_take_ons_won_pct',
            'avg_take_ons_tackled', 'avg_take_ons_tackled_pct',
            'avg_carries', 'avg_carries_distance', 'avg_carries_progressive_distance',
            'avg_progressive_carries', 'avg_carries_into_final_third',
            'avg_carries_into_penalty_area', 'avg_miscontrols', 'avg_dispossessed',
            'avg_passes_received', 'avg_progressive_passes_received'
        ],
        labels: {
            'avg_possession': 'Possession %',
            'avg_touches': 'Touches',
            'avg_touches_def_pen_area': 'Touches Def Pen',
            'avg_touches_def_3rd': 'Touches Def 3rd',
            'avg_touches_mid_3rd': 'Touches Mid 3rd',
            'avg_touches_att_3rd': 'Touches Att 3rd',
            'avg_touches_att_pen_area': 'Touches Att Pen',
            'avg_touches_live_ball': 'Live Ball Touches',
            'avg_take_ons': 'Take-ons',
            'avg_take_ons_won': 'Take-ons Won',
            'avg_take_ons_won_pct': 'Take-on %',
            'avg_take_ons_tackled': 'Take-ons Tackled',
            'avg_take_ons_tackled_pct': 'Tackled %',
            'avg_carries': 'Carries',
            'avg_carries_distance': 'Carry Distance',
            'avg_carries_progressive_distance': 'Prog Carry Dist',
            'avg_progressive_carries': 'Prog Carries',
            'avg_carries_into_final_third': 'Carries to Final 3rd',
            'avg_carries_into_penalty_area': 'Carries to Pen',
            'avg_miscontrols': 'Miscontrols',
            'avg_dispossessed': 'Dispossessed',
            'avg_passes_received': 'Passes Received',
            'avg_progressive_passes_received': 'Prog Passes Recv'
        },
        source: 'possession'
    },
    defensive: {
        metrics: [
            'avg_tackles', 'avg_tackles_won', 'avg_tackles_def_3rd',
            'avg_tackles_mid_3rd', 'avg_tackles_att_3rd',
            'avg_challenge_tackles', 'avg_challenges', 'avg_challenge_tackles_pct',
            'avg_challenges_lost', 'avg_blocks', 'avg_blocked_shots',
            'avg_blocked_passes', 'avg_interceptions', 'avg_tackles_interceptions',
            'avg_clearances', 'avg_errors'
        ],
        labels: {
            'avg_tackles': 'Tackles',
            'avg_tackles_won': 'Tackles Won',
            'avg_tackles_def_3rd': 'Tackles Def 3rd',
            'avg_tackles_mid_3rd': 'Tackles Mid 3rd',
            'avg_tackles_att_3rd': 'Tackles Att 3rd',
            'avg_challenge_tackles': 'Challenge Tackles',
            'avg_challenges': 'Challenges',
            'avg_challenge_tackles_pct': 'Challenge %',
            'avg_challenges_lost': 'Challenges Lost',
            'avg_blocks': 'Blocks',
            'avg_blocked_shots': 'Shot Blocks',
            'avg_blocked_passes': 'Pass Blocks',
            'avg_interceptions': 'Interceptions',
            'avg_tackles_interceptions': 'Tackles + Int',
            'avg_clearances': 'Clearances',
            'avg_errors': 'Errors'
        },
        source: 'defensive'
    },
    goalkeeping: {
        metrics: [
            'avg_gk_shots_on_target_against', 'avg_gk_goals_against', 'avg_gk_saves',
            'avg_gk_save_pct', 'avg_gk_clean_sheets', 'avg_gk_psxg', 'avg_gk_psxg_net',
            'avg_gk_pens_att', 'avg_gk_pens_allowed', 'avg_gk_pens_saved', 'avg_gk_pens_missed',
            'avg_gk_passes_completed_launched', 'avg_gk_passes_launched', 'avg_gk_passes_pct_launched',
            'avg_gk_passes', 'avg_gk_passes_throws', 'avg_gk_pct_passes_launched',
            'avg_gk_passes_length_avg', 'avg_gk_goal_kicks', 'avg_gk_pct_goal_kicks_launched',
            'avg_gk_goal_kick_length_avg', 'avg_gk_crosses', 'avg_gk_crosses_stopped',
            'avg_gk_crosses_stopped_pct', 'avg_gk_def_actions_outside_pen_area',
            'avg_gk_avg_distance_def_actions'
        ],
        labels: {
            'avg_gk_shots_on_target_against': 'SOT Against',
            'avg_gk_goals_against': 'Goals Against',
            'avg_gk_saves': 'Saves',
            'avg_gk_save_pct': 'Save %',
            'avg_gk_clean_sheets': 'Clean Sheets',
            'avg_gk_psxg': 'PSxG',
            'avg_gk_psxg_net': 'PSxG Net',
            'avg_gk_pens_att': 'Pens Faced',
            'avg_gk_pens_allowed': 'Pens Allowed',
            'avg_gk_pens_saved': 'Pens Saved',
            'avg_gk_pens_missed': 'Pens Missed',
            'avg_gk_passes_completed_launched': 'Launched Comp',
            'avg_gk_passes_launched': 'Launched',
            'avg_gk_passes_pct_launched': 'Launched %',
            'avg_gk_passes': 'GK Passes',
            'avg_gk_passes_throws': 'Throws',
            'avg_gk_pct_passes_launched': '% Launched',
            'avg_gk_passes_length_avg': 'Avg Pass Length',
            'avg_gk_goal_kicks': 'Goal Kicks',
            'avg_gk_pct_goal_kicks_launched': 'GK Launched %',
            'avg_gk_goal_kick_length_avg': 'GK Length',
            'avg_gk_crosses': 'Crosses Faced',
            'avg_gk_crosses_stopped': 'Crosses Stopped',
            'avg_gk_crosses_stopped_pct': 'Crosses Stop %',
            'avg_gk_def_actions_outside_pen_area': 'Actions Outside',
            'avg_gk_avg_distance_def_actions': 'Avg Action Dist'
        },
        source: 'goalkeeping'
    },
    creation: {
        metrics: [
            'avg_sca', 'avg_sca_passes_live', 'avg_sca_passes_dead',
            'avg_sca_take_ons', 'avg_sca_shots', 'avg_sca_fouled', 'avg_sca_defense',
            'avg_gca', 'avg_gca_passes_live', 'avg_gca_passes_dead',
            'avg_gca_take_ons', 'avg_gca_shots', 'avg_gca_fouled', 'avg_gca_defense'
        ],
        labels: {
            'avg_sca': 'SCA',
            'avg_sca_passes_live': 'SCA Live Pass',
            'avg_sca_passes_dead': 'SCA Dead Ball',
            'avg_sca_take_ons': 'SCA Take-ons',
            'avg_sca_shots': 'SCA Shots',
            'avg_sca_fouled': 'SCA Fouled',
            'avg_sca_defense': 'SCA Defense',
            'avg_gca': 'GCA',
            'avg_gca_passes_live': 'GCA Live Pass',
            'avg_gca_passes_dead': 'GCA Dead Ball',
            'avg_gca_take_ons': 'GCA Take-ons',
            'avg_gca_shots': 'GCA Shots',
            'avg_gca_fouled': 'GCA Fouled',
            'avg_gca_defense': 'GCA Defense'
        },
        source: 'creation'
    },
    pass_types: {
        metrics: [
            'avg_passes_pt', 'avg_passes_live', 'avg_passes_dead',
            'avg_passes_free_kicks', 'avg_through_balls', 'avg_passes_switches',
            'avg_crosses_pt', 'avg_throw_ins', 'avg_corner_kicks',
            'avg_corner_kicks_in', 'avg_corner_kicks_out', 'avg_corner_kicks_straight',
            'avg_passes_completed_pt', 'avg_passes_offsides', 'avg_passes_blocked'
        ],
        labels: {
            'avg_passes_pt': 'Total Passes',
            'avg_passes_live': 'Live Passes',
            'avg_passes_dead': 'Dead Ball',
            'avg_passes_free_kicks': 'Free Kicks',
            'avg_through_balls': 'Through Balls',
            'avg_passes_switches': 'Switches',
            'avg_crosses_pt': 'Crosses',
            'avg_throw_ins': 'Throw-ins',
            'avg_corner_kicks': 'Corners',
            'avg_corner_kicks_in': 'Inswing Corners',
            'avg_corner_kicks_out': 'Outswing Corners',
            'avg_corner_kicks_straight': 'Straight Corners',
            'avg_passes_completed_pt': 'Completed',
            'avg_passes_offsides': 'Offsides',
            'avg_passes_blocked': 'Blocked'
        },
        source: 'pass_types'
    },
    miscellaneous: {
        metrics: [
            'avg_cards_yellow', 'avg_cards_red', 'avg_cards_yellow_red',
            'avg_fouls', 'avg_fouled', 'avg_offsides', 'avg_crosses',
            'avg_interceptions_misc', 'avg_tackles_won_misc',
            'avg_pens_won', 'avg_pens_conceded', 'avg_own_goals',
            'avg_ball_recoveries', 'avg_aerials_won', 'avg_aerials_lost', 'avg_aerials_won_pct'
        ],
        labels: {
            'avg_cards_yellow': 'Yellow Cards',
            'avg_cards_red': 'Red Cards',
            'avg_cards_yellow_red': '2nd Yellows',
            'avg_fouls': 'Fouls',
            'avg_fouled': 'Fouled',
            'avg_offsides': 'Offsides',
            'avg_crosses': 'Crosses',
            'avg_interceptions_misc': 'Interceptions',
            'avg_tackles_won_misc': 'Tackles Won',
            'avg_pens_won': 'Pens Won',
            'avg_pens_conceded': 'Pens Conceded',
            'avg_own_goals': 'Own Goals',
            'avg_ball_recoveries': 'Recoveries',
            'avg_aerials_won': 'Aerials Won',
            'avg_aerials_lost': 'Aerials Lost',
            'avg_aerials_won_pct': 'Aerial %'
        },
        source: 'miscellaneous'
    }
};

// Metric explanations from FBRef
const metricExplanations = {
    // SHOOTING
    'avg_goals': 'Goals scored by the team',
    'avg_shots': 'Total shots attempted (includes blocked shots)',
    'avg_shots_on_target': 'Shots that would have gone into the goal if not for a save by the goalkeeper or block by a defender',
    'avg_shots_on_target_pct': 'Percentage of shots that are on target. Minimum 0.395 shots per squad game to qualify as a leader',
    'avg_goals_per_shot': 'Goals scored divided by total shots',
    'avg_goals_per_shot_on_target': 'Goals scored divided by shots on target (excluding penalty kicks)',
    'avg_average_shot_distance': 'Average distance in yards from goal of all shots taken. Does not include penalty kicks',
    'avg_shots_free_kicks': 'Shots from free kicks',
    'avg_pens_made': 'Penalty kicks converted',
    'avg_pens_att': 'Penalty kicks attempted',
    'avg_xg': 'Expected Goals (xG): Measures the quality of chances based on shot position, type of assist, whether it was a headed shot, and timing. xG is the post-shot model that calculates the probability that the ball will end up in the net',
    'avg_npxg': 'Non-Penalty Expected Goals: Expected goals excluding penalty kicks',
    'avg_npxg_per_shot': 'Non-Penalty xG per shot: Measures average quality of chances created (excluding penalties)',
    'avg_xg_net': 'Net Expected Goals: xG for minus xG against (shows overall xG balance)',
    'avg_npxg_net': 'Net Non-Penalty xG: npxG for minus npxG against',

    // PASSING
    'avg_passes_completed': 'Passes completed successfully',
    'avg_passes': 'Total passes attempted',
    'avg_passes_pct': 'Pass completion percentage',
    'avg_passes_total_distance': 'Total distance in yards of completed passes',
    'avg_passes_progressive_distance': 'Total distance in yards that completed passes have traveled towards the opponent\'s goal. Excludes passes from defensive 40% of the pitch',
    'avg_passes_completed_short': 'Short passes completed (5-15 yards)',
    'avg_passes_short': 'Short passes attempted (5-15 yards)',
    'avg_passes_pct_short': 'Short pass completion percentage',
    'avg_passes_completed_medium': 'Medium passes completed (15-30 yards)',
    'avg_passes_medium': 'Medium passes attempted (15-30 yards)',
    'avg_passes_pct_medium': 'Medium pass completion percentage',
    'avg_passes_completed_long': 'Long passes completed (over 30 yards)',
    'avg_passes_long': 'Long passes attempted (over 30 yards)',
    'avg_passes_pct_long': 'Long pass completion percentage',
    'avg_assists': 'Passes that directly lead to a goal',
    'avg_xg_assist': 'Expected Assisted Goals: The xG value of shots assisted, measuring the quality of chances created for teammates',
    'avg_pass_xa': 'Expected Assists (xA): The likelihood that a given pass will become a goal assist. Based on the type of pass, location, phase of play, and distance covered',
    'avg_assisted_shots': 'Key Passes: Passes that directly lead to a shot (assisted shots)',
    'avg_passes_into_final_third': 'Completed passes that enter the final third of the pitch (not including set pieces)',
    'avg_passes_into_penalty_area': 'Completed passes into the 18-yard box (not including set pieces)',
    'avg_crosses_into_penalty_area': 'Completed crosses into the 18-yard box',
    'avg_progressive_passes': 'Progressive Passes: Completed passes that move the ball towards the opponent\'s goal by at least 10 yards from its furthest point in the last 6 passes, or any completed pass into the penalty area. Excludes passes from the defensive 40% of the pitch',

    // POSSESSION
    'avg_possession': 'Calculated as the percentage of passes attempted by each team',
    'avg_touches': 'Total touches of the ball. Receiving a pass then passing it counts as 2 touches',
    'avg_touches_def_pen_area': 'Touches in the defensive penalty area',
    'avg_touches_def_3rd': 'Touches in the defensive third of the pitch',
    'avg_touches_mid_3rd': 'Touches in the middle third of the pitch',
    'avg_touches_att_3rd': 'Touches in the attacking third of the pitch',
    'avg_touches_att_pen_area': 'Touches in the attacking penalty area',
    'avg_touches_live_ball': 'Live-ball touches. Does not include set pieces, free kicks, throw-ins, kick-offs, or penalties',
    'avg_take_ons': 'Take-Ons Attempted: Number of attempts to dribble past an opponent',
    'avg_take_ons_won': 'Successful Take-Ons: Number of successful dribbles past an opponent',
    'avg_take_ons_won_pct': 'Percentage of successful take-ons (dribbles)',
    'avg_take_ons_tackled': 'Number of times tackled while attempting a take-on (dribble)',
    'avg_take_ons_tackled_pct': 'Percentage of take-ons where player was tackled',
    'avg_carries': 'Carries: Number of times the player controlled the ball with their feet',
    'avg_carries_distance': 'Total distance in yards the ball was carried',
    'avg_carries_progressive_distance': 'Total distance in yards the ball was carried towards the opponent\'s goal',
    'avg_progressive_carries': 'Progressive Carries: Carries that move the ball towards the opponent\'s goal by at least 10 yards from its furthest point in the last 6 passes, or any carry into the penalty area. Excludes carries from defensive 40%',
    'avg_carries_into_final_third': 'Carries that enter the final third of the pitch',
    'avg_carries_into_penalty_area': 'Carries that enter the 18-yard box',
    'avg_miscontrols': 'Number of times a player failed to control the ball when receiving it',
    'avg_dispossessed': 'Number of times a player was dispossessed by a tackle from an opponent',
    'avg_passes_received': 'Number of times a player received a pass from a teammate',
    'avg_progressive_passes_received': 'Progressive Passes Received: Passes received that move the ball towards the opponent\'s goal by at least 10 yards',

    // DEFENSIVE
    'avg_tackles': 'Number of players tackled',
    'avg_tackles_won': 'Tackles that won possession of the ball for the team',
    'avg_tackles_def_3rd': 'Tackles in the defensive third of the pitch',
    'avg_tackles_mid_3rd': 'Tackles in the middle third of the pitch',
    'avg_tackles_att_3rd': 'Tackles in the attacking third of the pitch',
    'avg_challenge_tackles': 'Dribblers Tackled: Number of times an opposing dribbler was tackled',
    'avg_challenges': 'Dribblers Challenged: Total challenges against dribblers',
    'avg_challenge_tackles_pct': 'Percentage of dribblers tackled. Tackling dribbler means winning the duel',
    'avg_challenges_lost': 'Number of times an opposing dribbler got past the defender',
    'avg_blocks': 'Total blocks (shots + passes blocked)',
    'avg_blocked_shots': 'Shot Blocks: Number of shots blocked by standing in its path',
    'avg_blocked_passes': 'Pass Blocks: Number of passes blocked by standing in its path',
    'avg_interceptions': 'Interceptions: Passes read and intercepted by the player',
    'avg_tackles_interceptions': 'Tackles + Interceptions: Sum of tackles and interceptions (Tkl+Int)',
    'avg_clearances': 'Clearances: Ball cleared away from danger zone',
    'avg_errors': 'Errors leading to an opponent\'s shot',

    // GOALKEEPING
    'avg_gk_shots_on_target_against': 'Shots on target faced by the goalkeeper',
    'avg_gk_goals_against': 'Goals conceded by the goalkeeper',
    'avg_gk_saves': 'Shots on target saved by the goalkeeper',
    'avg_gk_save_pct': 'Save Percentage: Percentage of shots on target that were saved',
    'avg_gk_clean_sheets': 'Clean Sheets: Full matches completed without conceding a goal',
    'avg_gk_psxg': 'Post-Shot Expected Goals (PSxG): Expected goals based on how likely the goalkeeper is to save the shot. Takes into account shot placement and trajectory after the ball is struck',
    'avg_gk_psxg_net': 'PSxG +/-: Goals against minus post-shot xG. Positive numbers = better than expected saves. Represents goals "saved" above expectation',
    'avg_gk_pens_att': 'Penalty kicks faced by goalkeeper',
    'avg_gk_pens_allowed': 'Penalty kicks allowed (goals from penalties)',
    'avg_gk_pens_saved': 'Penalty kicks saved',
    'avg_gk_pens_missed': 'Penalty kicks missed by opponent (off target)',
    'avg_gk_passes_completed_launched': 'Launched passes completed (over 40 yards)',
    'avg_gk_passes_launched': 'Launched passes attempted (over 40 yards)',
    'avg_gk_passes_pct_launched': 'Launched pass completion percentage',
    'avg_gk_passes': 'Total passes attempted by goalkeeper (excluding goal kicks)',
    'avg_gk_passes_throws': 'Throws by the goalkeeper',
    'avg_gk_pct_passes_launched': 'Percentage of GK passes that are launched (40+ yards)',
    'avg_gk_passes_length_avg': 'Average pass length in yards',
    'avg_gk_goal_kicks': 'Total goal kicks taken',
    'avg_gk_pct_goal_kicks_launched': 'Percentage of goal kicks that are long (40+ yards)',
    'avg_gk_goal_kick_length_avg': 'Average goal kick length in yards',
    'avg_gk_crosses': 'Crosses into box faced by goalkeeper',
    'avg_gk_crosses_stopped': 'Crosses successfully claimed or punched by goalkeeper',
    'avg_gk_crosses_stopped_pct': 'Percentage of crosses stopped',
    'avg_gk_def_actions_outside_pen_area': 'Defensive actions outside penalty area (sweeper keeper actions)',
    'avg_gk_avg_distance_def_actions': 'Average distance from goal of defensive actions',

    // CREATION (SCA & GCA)
    'avg_sca': 'Shot-Creating Actions (SCA): The two offensive actions directly leading to a shot, such as passes, take-ons and drawing fouls',
    'avg_sca_passes_live': 'Completed live-ball passes that directly lead to a shot',
    'avg_sca_passes_dead': 'Dead-ball passes (free kicks, corners, throw-ins, kick-offs) that lead to a shot',
    'avg_sca_take_ons': 'Successful take-ons (dribbles) that lead to a shot',
    'avg_sca_shots': 'Shots that lead to another shot attempt',
    'avg_sca_fouled': 'Fouls drawn that lead to a shot',
    'avg_sca_defense': 'Defensive actions (clearances, blocks, interceptions) that lead to a shot',
    'avg_gca': 'Goal-Creating Actions (GCA): The two offensive actions directly leading to a goal, such as passes, take-ons and drawing fouls',
    'avg_gca_passes_live': 'Completed live-ball passes that directly lead to a goal',
    'avg_gca_passes_dead': 'Dead-ball passes that lead to a goal',
    'avg_gca_take_ons': 'Successful take-ons that lead to a goal',
    'avg_gca_shots': 'Shots that lead to another goal-scoring shot',
    'avg_gca_fouled': 'Fouls drawn that lead to a goal',
    'avg_gca_defense': 'Defensive actions that lead to a goal',

    // PASS TYPES
    'avg_passes_pt': 'Total passes attempted',
    'avg_passes_live': 'Live-ball passes (in open play)',
    'avg_passes_dead': 'Dead-ball passes (free kicks, corners, etc.)',
    'avg_passes_free_kicks': 'Passes from free kicks',
    'avg_through_balls': 'Through Balls: Passes played into space behind the defense for a teammate to run onto',
    'avg_passes_switches': 'Switches: Passes that travel more than 40 yards of the width of the pitch',
    'avg_crosses_pt': 'Crosses: Passes into the penalty area from wide positions',
    'avg_throw_ins': 'Throw-ins taken',
    'avg_corner_kicks': 'Corner kicks taken',
    'avg_corner_kicks_in': 'Inswinging corner kicks (curving towards goal)',
    'avg_corner_kicks_out': 'Outswinging corner kicks (curving away from goal)',
    'avg_corner_kicks_straight': 'Straight corner kicks (no curve)',
    'avg_passes_completed_pt': 'Passes completed successfully',
    'avg_passes_offsides': 'Passes that were offside',
    'avg_passes_blocked': 'Passes blocked by an opponent',

    // MISCELLANEOUS
    'avg_cards_yellow': 'Yellow cards received',
    'avg_cards_red': 'Red cards received',
    'avg_cards_yellow_red': 'Second yellow cards resulting in red',
    'avg_fouls': 'Fouls committed',
    'avg_fouled': 'Fouls suffered (times fouled by opponent)',
    'avg_offsides': 'Offsides committed',
    'avg_crosses': 'Crosses attempted',
    'avg_interceptions_misc': 'Interceptions made',
    'avg_tackles_won_misc': 'Tackles won (possession gained)',
    'avg_pens_won': 'Penalty kicks won',
    'avg_pens_conceded': 'Penalty kicks conceded',
    'avg_own_goals': 'Own goals scored',
    'avg_ball_recoveries': 'Ball Recoveries: Gaining possession of a loose ball that was not under any player\'s control',
    'avg_aerials_won': 'Aerial Duels Won: Headers won against an opponent',
    'avg_aerials_lost': 'Aerial Duels Lost: Headers lost to an opponent',
    'avg_aerials_won_pct': 'Aerial duel success percentage',

    // BATTLE SUMMARY
    'win_rate': 'Percentage of matches won against this opponent formation/tier combination',
    'draw_rate': 'Percentage of matches drawn',
    'loss_rate': 'Percentage of matches lost',
    'total_matches': 'Total number of matches in this formation matchup (sample size)'
};

// Formation colors for charts
const formationColors = [
    '#4ade80', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
    '#6366f1', '#d946ef', '#0ea5e9', '#eab308', '#22c55e'
];

// Inverted metrics: higher values are WORSE (high percentile = weakness, low percentile = strength)
const invertedMetrics = new Set([
    // Possession - losing the ball
    'avg_miscontrols',
    'avg_dispossessed',
    'avg_take_ons_tackled',
    'avg_take_ons_tackled_pct',
    // Defensive - losing duels/errors
    'avg_challenges_lost',
    'avg_errors',
    // Goalkeeping - conceding
    'avg_gk_shots_on_target_against',
    'avg_gk_goals_against',
    'avg_gk_pens_allowed',
    // Pass types - failed passes
    'avg_passes_offsides',
    'avg_passes_blocked',
    // Miscellaneous - cards, fouls, losses
    'avg_cards_yellow',
    'avg_cards_red',
    'avg_cards_yellow_red',
    'avg_fouls',
    'avg_offsides',
    'avg_pens_conceded',
    'avg_own_goals',
    'avg_aerials_lost'
]);

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    initLanguage();
    await loadData();
    setupEventListeners();
    setupScrollToTop();
    setupPercentileModal();
});

// Setup scroll to top button
function setupScrollToTop() {
    const scrollBtn = document.getElementById('scrollTopBtn');
    const resultsSection = document.getElementById('resultsSection');

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });

    // Scroll to results header on click
    scrollBtn.addEventListener('click', () => {
        const resultsHeader = document.querySelector('.results-header');
        if (resultsHeader && resultsSection.style.display !== 'none') {
            resultsHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

// Setup percentile help modal - Escape key handler
function setupPercentileModal() {
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('percentileModal');
        if (e.key === 'Escape' && modal && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
}

// Load JSON data
async function loadData() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    try {
        const response = await fetch('formation_battles_with_individual_stat_percentiles.json');
        formationData = await response.json();
        populateOpponentFormations();
        populateTierSelects();
        loadingOverlay.classList.add('hidden');
    } catch (error) {
        console.error('Error loading data:', error);
        loadingOverlay.innerHTML = `
            <div style="text-align: center; color: #ef4444;">
                <p>Error loading formation data</p>
                <p style="font-size: 0.9rem; color: #9ca3af; margin-top: 10px;">
                    Make sure the JSON file is in the same directory
                </p>
            </div>
        `;
    }
}

// Get all unique opponent formations from data
function getAllOpponentFormations() {
    const opponents = new Set();
    for (const yourForm of Object.keys(formationData)) {
        for (const yourTier of Object.keys(formationData[yourForm])) {
            for (const oppForm of Object.keys(formationData[yourForm][yourTier])) {
                opponents.add(oppForm);
            }
        }
    }
    return Array.from(opponents).sort();
}

// Populate opponent formation dropdown
function populateOpponentFormations() {
    const select = document.getElementById('opponentFormation');
    const formations = getAllOpponentFormations();
    formations.forEach(f => {
        const option = document.createElement('option');
        option.value = f;
        option.textContent = f;
        select.appendChild(option);
    });
}

// Populate tier selects
function populateTierSelects() {
    const tiers = ['Elite_Tier', 'Strong_Tier', 'Mid_Tier', 'Struggling_Tier'];
    ['opponentTier', 'yourTier'].forEach(id => {
        const select = document.getElementById(id);
        tiers.forEach(tier => {
            const option = document.createElement('option');
            option.value = tier;
            option.textContent = tierDisplayNames[tier];
            select.appendChild(option);
        });
    });
}

// Parent tab to sub-tab mapping
const parentTabMapping = {
    'overview': ['summary', 'miscellaneous'],
    'attack': ['shooting', 'creation'],
    'buildup': ['passing', 'pass_types', 'possession'],
    'defense': ['defensive', 'goalkeeping']
};

// Current active state
let currentParentTab = 'overview';
let currentSubTab = 'summary';
let focusedFormation = null;

// Setup event listeners
function setupEventListeners() {
    // Opponent/tier changes
    ['opponentFormation', 'opponentTier', 'yourTier'].forEach(id => {
        document.getElementById(id).addEventListener('change', updateAvailableFormations);
    });

    // Min matches slider
    document.getElementById('minMatches').addEventListener('input', (e) => {
        document.getElementById('minMatchesValue').textContent = e.target.value;
        updateFormationDisplay();
    });

    // Sort by
    document.getElementById('sortBy').addEventListener('change', updateFormationDisplay);

    // Select all / Deselect all
    document.getElementById('selectAll').addEventListener('click', () => {
        document.querySelectorAll('#formationsGrid input[type="checkbox"]').forEach(cb => {
            if (!cb.closest('.formation-item').classList.contains('low-confidence')) {
                cb.checked = true;
                selectedFormations.add(cb.dataset.formation);
                cb.closest('.formation-item').classList.add('selected');
            }
        });
    });

    document.getElementById('deselectAll').addEventListener('click', () => {
        document.querySelectorAll('#formationsGrid input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
            cb.closest('.formation-item').classList.remove('selected');
        });
        selectedFormations.clear();
    });

    // Analyze button
    document.getElementById('analyzeBtn').addEventListener('click', runAnalysis);

    // Parent tab buttons
    document.querySelectorAll('.parent-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const parentTab = e.currentTarget.dataset.parent;
            switchParentTab(parentTab);
        });
    });

    // Sub-tab buttons
    document.querySelectorAll('.sub-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const subTab = e.currentTarget.dataset.tab;
            switchSubTab(subTab);
        });
    });

    // Legacy tab buttons (for backwards compatibility)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
    });

    // Focus mode dropdown
    document.getElementById('focusFormation').addEventListener('change', (e) => {
        focusedFormation = e.target.value || null;
        applyFocusMode();
    });

    // Metric select dropdowns
    Object.keys(metricDefinitions).forEach(category => {
        if (category === 'summary') return;
        const select = document.getElementById(`${category}MetricSelect`);
        if (select) {
            select.addEventListener('change', () => updateGauge(category));
        }
    });
}

// Switch parent tab
function switchParentTab(parentTab) {
    currentParentTab = parentTab;

    // Update parent tab buttons
    document.querySelectorAll('.parent-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.parent === parentTab);
    });

    // Show correct sub-tabs
    document.querySelectorAll('.sub-tabs').forEach(container => {
        container.classList.toggle('active', container.id === `${parentTab}-subtabs`);
    });

    // Switch to first sub-tab of this parent
    const firstSubTab = parentTabMapping[parentTab][0];
    switchSubTab(firstSubTab);
}

// Switch sub-tab
function switchSubTab(subTab) {
    currentSubTab = subTab;

    // Update sub-tab buttons within current parent
    const currentSubTabs = document.getElementById(`${currentParentTab}-subtabs`);
    if (currentSubTabs) {
        currentSubTabs.querySelectorAll('.sub-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === subTab);
        });
    }

    // Switch tab content
    switchTab(subTab);
}

// Apply focus mode to all tables
function applyFocusMode() {
    const focusCard = document.getElementById('focusCard');
    const focusModeHint = document.getElementById('focusModeHint');

    if (focusedFormation) {
        // Show focus card
        focusCard.style.display = 'block';
        focusModeHint.textContent = `Showing detailed analysis for ${focusedFormation}`;
        document.getElementById('focusFormationName').textContent = focusedFormation;
        generateFocusCard(focusedFormation);

        // Highlight rows in all tables
        document.querySelectorAll('.heatmap-table tbody tr').forEach(row => {
            const formationCell = row.querySelector('.formation-col');
            if (formationCell) {
                const rowFormation = formationCell.textContent.split('(')[0].trim();
                if (rowFormation === focusedFormation) {
                    row.classList.add('focused');
                    row.classList.remove('dimmed');
                } else {
                    row.classList.add('dimmed');
                    row.classList.remove('focused');
                }
            }
        });
    } else {
        // Hide focus card
        focusCard.style.display = 'none';
        focusModeHint.textContent = 'Select a formation to see its detailed performance report';

        // Remove all highlighting
        document.querySelectorAll('.heatmap-table tbody tr').forEach(row => {
            row.classList.remove('focused', 'dimmed');
        });
    }
}

// Generate focus card content
function generateFocusCard(formation) {
    const formationData = comparisonData.find(f => f.formation === formation);
    if (!formationData) return;

    const container = document.getElementById('focusCardContent');
    const data = formationData.data;

    // Collect key stats
    const battleStats = data.battle_summary;
    const shooting = data.shooting || {};
    const passing = data.passing || {};
    const possession = data.possession || {};
    const defensive = data.defensive || {};

    // Find strengths and weaknesses for this formation
    const strengths = [];
    const weaknesses = [];

    Object.keys(metricDefinitions).forEach(category => {
        if (category === 'summary') return;
        const def = metricDefinitions[category];
        const source = data[def.source];
        if (!source) return;

        def.metrics.forEach(metric => {
            const perc = source[`${metric}_formation_percentile`];
            if (perc !== undefined) {
                const isInverted = invertedMetrics.has(metric);

                if (isInverted) {
                    // Inverted: high percentile = weakness, low percentile = strength
                    if (perc >= 50) {
                        weaknesses.push({ metric: def.labels[metric], percentile: perc, category });
                    }
                    if (perc <= 40 && perc >= 20) {
                        strengths.push({ metric: def.labels[metric], percentile: perc, category });
                    }
                } else {
                    // Normal: high percentile = strength, low percentile = weakness
                    if (perc >= 50) {
                        strengths.push({ metric: def.labels[metric], percentile: perc, category });
                    }
                    if (perc <= 40 && perc >= 20) {
                        weaknesses.push({ metric: def.labels[metric], percentile: perc, category });
                    }
                }
            }
        });
    });

    // Sort strengths by percentile (for inverted, lower is better so we show those first)
    strengths.sort((a, b) => b.percentile - a.percentile);
    // Sort weaknesses by percentile (for inverted, higher is worse so we show those first)
    weaknesses.sort((a, b) => b.percentile - a.percentile);

    let html = `
        <div class="focus-stat-group">
            <h4>Battle Results</h4>
            <div class="focus-stat-row">
                <span class="focus-stat-label">Win Rate</span>
                <span class="focus-stat-value ${battleStats.win_rate >= 50 ? 'high' : battleStats.win_rate >= 30 ? 'mid' : 'low'}">${battleStats.win_rate.toFixed(1)}%</span>
            </div>
            <div class="focus-stat-row">
                <span class="focus-stat-label">Draw Rate</span>
                <span class="focus-stat-value mid">${battleStats.draw_rate.toFixed(1)}%</span>
            </div>
            <div class="focus-stat-row">
                <span class="focus-stat-label">Loss Rate</span>
                <span class="focus-stat-value ${battleStats.loss_rate <= 30 ? 'high' : battleStats.loss_rate <= 50 ? 'mid' : 'low'}">${battleStats.loss_rate.toFixed(1)}%</span>
            </div>
            <div class="focus-stat-row">
                <span class="focus-stat-label">Sample Size</span>
                <span class="focus-stat-value">${battleStats.total_matches} matches</span>
            </div>
        </div>

        <div class="focus-stat-group">
            <h4>Key Metrics</h4>
            <div class="focus-stat-row">
                <span class="focus-stat-label">xG (Expected Goals)</span>
                <span class="focus-stat-value">${shooting.avg_xg?.toFixed(2) || '-'}</span>
            </div>
            <div class="focus-stat-row">
                <span class="focus-stat-label">Possession</span>
                <span class="focus-stat-value">${possession.avg_possession?.toFixed(1) || '-'}%</span>
            </div>
            <div class="focus-stat-row">
                <span class="focus-stat-label">Pass Accuracy</span>
                <span class="focus-stat-value">${passing.avg_passes_pct?.toFixed(1) || '-'}%</span>
            </div>
            <div class="focus-stat-row">
                <span class="focus-stat-label">Tackles Won</span>
                <span class="focus-stat-value">${defensive.avg_tackles_won?.toFixed(1) || '-'}</span>
            </div>
        </div>

        <div class="focus-stat-group">
            <h4>Top Strengths (>50th percentile)</h4>
            ${strengths.length > 0 ? strengths.slice(0, 5).map(s => `
                <div class="focus-stat-row">
                    <span class="focus-stat-label">${s.metric}</span>
                    <span class="focus-stat-value high">${s.percentile.toFixed(0)}th</span>
                </div>
            `).join('') : '<div class="focus-stat-row"><span class="focus-stat-label">No notable strengths</span></div>'}
        </div>

        <div class="focus-stat-group">
            <h4>Weaknesses (20-40th percentile)</h4>
            ${weaknesses.length > 0 ? weaknesses.slice(0, 5).map(w => `
                <div class="focus-stat-row">
                    <span class="focus-stat-label">${w.metric}</span>
                    <span class="focus-stat-value low">${w.percentile.toFixed(0)}th</span>
                </div>
            `).join('') : '<div class="focus-stat-row"><span class="focus-stat-label">No significant weaknesses</span></div>'}
        </div>
    `;

    container.innerHTML = html;
}

// Update available formations based on opponent selection
function updateAvailableFormations() {
    const oppFormation = document.getElementById('opponentFormation').value;
    const oppTier = document.getElementById('opponentTier').value;
    const yourTier = document.getElementById('yourTier').value;

    if (!oppFormation || !oppTier || !yourTier) {
        document.getElementById('formationSelector').style.display = 'none';
        return;
    }

    // Find all YOUR formations that have data against this opponent
    const availableFormations = [];
    for (const yourForm of Object.keys(formationData)) {
        try {
            const data = formationData[yourForm][yourTier][oppFormation][oppTier];
            if (data && data.battle_summary) {
                availableFormations.push({
                    formation: yourForm,
                    data: data
                });
            }
        } catch (e) {
            // No data for this combination
        }
    }

    if (availableFormations.length === 0) {
        document.getElementById('formationSelector').style.display = 'none';
        alert('No formations found with data against this opponent configuration');
        return;
    }

    // Store for later use
    window.availableFormations = availableFormations;
    selectedFormations.clear();

    // Update label
    document.getElementById('opponentLabel').textContent = `${oppFormation} (${tierDisplayNames[oppTier]})`;

    // Show formation selector
    document.getElementById('formationSelector').style.display = 'block';

    // Reset analysis section if it exists
    const analysisSection = document.getElementById('analysisSection');
    if (analysisSection) {
        analysisSection.style.display = 'none';
    }

    updateFormationDisplay();
}

// Update formation grid display
function updateFormationDisplay() {
    const grid = document.getElementById('formationsGrid');
    const minMatches = parseInt(document.getElementById('minMatches').value);
    const sortBy = document.getElementById('sortBy').value;

    if (!window.availableFormations) return;

    // Sort formations
    let sorted = [...window.availableFormations];
    if (sortBy === 'winRate') {
        sorted.sort((a, b) => b.data.battle_summary.win_rate - a.data.battle_summary.win_rate);
    } else if (sortBy === 'matches') {
        sorted.sort((a, b) => b.data.battle_summary.total_matches - a.data.battle_summary.total_matches);
    } else {
        sorted.sort((a, b) => a.formation.localeCompare(b.formation));
    }

    grid.innerHTML = '';

    sorted.forEach((item, index) => {
        const matches = item.data.battle_summary.total_matches;
        const winRate = item.data.battle_summary.win_rate;
        const lowConfidence = matches < minMatches;

        const div = document.createElement('div');
        div.className = `formation-item ${lowConfidence ? 'low-confidence' : ''} ${selectedFormations.has(item.formation) ? 'selected' : ''}`;
        div.innerHTML = `
            <input type="checkbox"
                   data-formation="${item.formation}"
                   ${selectedFormations.has(item.formation) ? 'checked' : ''}
                   ${lowConfidence ? 'disabled' : ''}>
            <div class="formation-info">
                <div class="formation-name">${item.formation}</div>
                <div class="formation-meta">
                    n=${matches} | <span class="win-rate">${winRate.toFixed(1)}%</span> wins
                </div>
            </div>
            <span class="confidence-badge ${matches >= 30 ? 'high' : 'low'}">
                ${matches >= 30 ? '✓' : '⚠'}
            </span>
        `;

        // Checkbox change
        const checkbox = div.querySelector('input');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedFormations.add(item.formation);
                div.classList.add('selected');
            } else {
                selectedFormations.delete(item.formation);
                div.classList.remove('selected');
            }
        });

        // Click on item
        div.addEventListener('click', (e) => {
            if (e.target.type !== 'checkbox' && !lowConfidence) {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        });

        grid.appendChild(div);
    });
}

// Run the analysis
function runAnalysis() {
    if (selectedFormations.size === 0) {
        alert('Please select at least one formation to analyze');
        return;
    }

    const oppFormation = document.getElementById('opponentFormation').value;
    const oppTier = document.getElementById('opponentTier').value;
    const yourTier = document.getElementById('yourTier').value;

    // Build comparison data
    comparisonData = [];
    window.availableFormations.forEach(item => {
        if (selectedFormations.has(item.formation)) {
            comparisonData.push({
                formation: item.formation,
                data: item.data
            });
        }
    });

    // Sort by win rate for consistent display
    comparisonData.sort((a, b) => b.data.battle_summary.win_rate - a.data.battle_summary.win_rate);

    // Update labels
    document.getElementById('resultOpponentLabel').textContent = `${oppFormation} (${tierDisplayNames[oppTier]})`;
    document.getElementById('resultsSubtitle').textContent =
        `Comparing ${comparisonData.length} formations from ${tierDisplayNames[yourTier]} tier`;

    // Populate focus mode dropdown
    populateFocusDropdown();

    // Reset focus mode
    focusedFormation = null;
    document.getElementById('focusFormation').value = '';
    document.getElementById('focusCard').style.display = 'none';

    // Reset to default tabs
    currentParentTab = 'overview';
    currentSubTab = 'summary';
    switchParentTab('overview');

    // Build all visualizations
    buildAllHeatmaps();
    populateMetricSelects();
    updateAllGauges();

    // Generate analysis insights
    generateAllInsights();

    // Enable analysis nav button and switch to analysis section
    const navAnalysis = document.getElementById('navAnalysis');
    if (navAnalysis) {
        navAnalysis.disabled = false;
    }
    showSection('analysis');
}

// Populate focus mode dropdown
function populateFocusDropdown() {
    const select = document.getElementById('focusFormation');
    select.innerHTML = '<option value="">Compare All Formations</option>';

    comparisonData.forEach(item => {
        const option = document.createElement('option');
        option.value = item.formation;
        option.textContent = `${item.formation} (${item.data.battle_summary.win_rate.toFixed(1)}% wins)`;
        select.appendChild(option);
    });
}

// Build scatter chart
function buildScatterChart() {
    const ctx = document.getElementById('scatterChart').getContext('2d');

    if (scatterChart) {
        scatterChart.destroy();
    }

    const data = comparisonData.map((item, i) => ({
        x: item.data.battle_summary.total_matches,
        y: item.data.battle_summary.win_rate,
        formation: item.formation
    }));

    // Calculate dynamic Y-axis range based on data
    const winRates = data.map(d => d.y);
    const maxWinRate = Math.max(...winRates);
    const minWinRate = Math.min(...winRates);

    // Add ~30% padding above max, round up to nearest 5
    const yMax = Math.min(100, Math.ceil((maxWinRate * 1.3) / 5) * 5);
    // Start from 0 or slightly below min if min is high, round down to nearest 5
    const yMin = Math.max(0, Math.floor((minWinRate * 0.7) / 5) * 5);

    scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Formations',
                data: data,
                backgroundColor: comparisonData.map((_, i) => formationColors[i % formationColors.length]),
                pointRadius: 12,
                pointHoverRadius: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: { display: true, text: 'Sample Size (matches)', color: '#9ca3af' },
                    grid: { color: '#1f2f27' },
                    ticks: { color: '#9ca3af' }
                },
                y: {
                    title: { display: true, text: 'Win Rate %', color: '#9ca3af' },
                    grid: { color: '#1f2f27' },
                    ticks: { color: '#9ca3af' },
                    min: yMin,
                    max: yMax
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const d = ctx.raw;
                            return `${d.formation}: ${d.y.toFixed(1)}% wins (n=${d.x})`;
                        }
                    }
                }
            }
        },
        plugins: [{
            afterDraw: (chart) => {
                const ctx = chart.ctx;
                chart.data.datasets[0].data.forEach((point, i) => {
                    const meta = chart.getDatasetMeta(0);
                    const pt = meta.data[i];
                    ctx.save();
                    ctx.fillStyle = '#f0fdf4';
                    ctx.font = '10px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(point.formation, pt.x, pt.y - 18);
                    ctx.restore();
                });
            }
        }]
    });
}

// Build all heatmaps
function buildAllHeatmaps() {
    Object.keys(metricDefinitions).forEach(category => {
        buildHeatmap(category);
    });
}

// Store donut chart instances
let donutCharts = [];

// Build heatmap for a category
function buildHeatmap(category) {
    const container = document.getElementById(`${category}Heatmap`);
    const def = metricDefinitions[category];

    if (!container || !def) return;

    // For summary, build donut charts instead of table
    if (category === 'summary') {
        buildSummaryDonuts(container);
        return;
    }

    // Get metrics that exist in the data
    const availableMetrics = def.metrics.filter(m => {
        return comparisonData.some(item => {
            const source = item.data[def.source];
            return source && source[m] !== undefined;
        });
    });

    if (availableMetrics.length === 0) {
        container.innerHTML = '<p style="color: #6b7280;">No data available for this category</p>';
        return;
    }

    let html = '<table class="heatmap-table"><thead><tr>';
    html += '<th class="formation-col">Formation</th>';

    availableMetrics.forEach(m => {
        const explanation = metricExplanations[m] || m;
        const label = def.labels[m] || m;
        html += `<th class="metric-col has-tooltip" data-metric="${m}">
            <span class="metric-label">${label}</span>
            <span class="tooltip-icon">?</span>
            <div class="metric-tooltip">${explanation}</div>
        </th>`;
    });
    html += '</tr></thead><tbody>';

    comparisonData.forEach(item => {
        const source = item.data[def.source];
        html += `<tr>`;
        html += `<td class="formation-col">${item.formation} <span class="sample-size">(n=${item.data.battle_summary.total_matches})</span></td>`;

        availableMetrics.forEach(m => {
            const value = source ? source[m] : null;
            const percentileKey = `${m}_formation_percentile`;
            const percentile = source ? source[percentileKey] : null;
            const isInverted = invertedMetrics.has(m);

            if (value === null || value === undefined) {
                html += '<td class="heatmap-cell" data-level="mid">-</td>';
            } else {
                const level = getPercentileLevel(percentile, isInverted);
                const displayValue = formatValue(value);
                const percDisplay = percentile !== null && percentile !== undefined ?
                    `<span class="cell-percentile">${percentile.toFixed(0)}th</span>` : '';
                html += `<td class="heatmap-cell" data-level="${level}" title="${m}: ${value}">
                    <span class="cell-value">${displayValue}</span>${percDisplay}
                </td>`;
            }
        });

        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// Build summary donut charts
function buildSummaryDonuts(container) {
    // Destroy existing donut charts
    donutCharts.forEach(chart => chart.destroy());
    donutCharts = [];

    // Category display names
    const categoryNames = {
        shooting: 'Shooting',
        passing: 'Passing',
        possession: 'Possession',
        defensive: 'Defensive',
        goalkeeping: 'Goalkeeping',
        creation: 'Creation',
        pass_types: 'Pass Types',
        miscellaneous: 'Misc'
    };

    // Categories to analyze (exclude summary)
    const categories = ['shooting', 'passing', 'possession', 'defensive', 'goalkeeping', 'creation', 'pass_types', 'miscellaneous'];

    // Create grid container
    let html = '<div class="donut-grid-extended">';

    comparisonData.forEach((item, index) => {
        const stats = item.data.battle_summary;

        // Collect strengths and weaknesses by category
        const strengthsByCategory = {};
        const weaknessesByCategory = {};

        categories.forEach(category => {
            const def = metricDefinitions[category];
            if (!def) return;

            const source = item.data[def.source];
            if (!source) return;

            strengthsByCategory[category] = [];
            weaknessesByCategory[category] = [];

            def.metrics.forEach(metric => {
                const perc = source[`${metric}_formation_percentile`];
                if (perc !== undefined && perc !== null) {
                    const isInverted = invertedMetrics.has(metric);

                    if (isInverted) {
                        // Inverted: high percentile = weakness, low percentile = strength
                        if (perc >= 50) {
                            weaknessesByCategory[category].push({
                                metric: def.labels[metric] || metric,
                                percentile: perc
                            });
                        }
                        if (perc <= 40 && perc >= 20) {
                            strengthsByCategory[category].push({
                                metric: def.labels[metric] || metric,
                                percentile: perc
                            });
                        }
                    } else {
                        // Normal: high percentile = strength, low percentile = weakness
                        if (perc >= 50) {
                            strengthsByCategory[category].push({
                                metric: def.labels[metric] || metric,
                                percentile: perc
                            });
                        }
                        if (perc <= 40 && perc >= 20) {
                            weaknessesByCategory[category].push({
                                metric: def.labels[metric] || metric,
                                percentile: perc
                            });
                        }
                    }
                }
            });

            // Sort by percentile
            strengthsByCategory[category].sort((a, b) => b.percentile - a.percentile);
            weaknessesByCategory[category].sort((a, b) => a.percentile - b.percentile);
        });

        // Build strengths HTML by category
        let strengthsHtml = '';
        categories.forEach(category => {
            const items = strengthsByCategory[category];
            if (items && items.length > 0) {
                strengthsHtml += `
                    <div class="sw-category">
                        <div class="sw-category-title">${categoryNames[category]}</div>
                        <div class="sw-items">
                            ${items.map(s => `
                                <span class="sw-item strength">
                                    ${s.metric} <span class="sw-perc">${s.percentile.toFixed(0)}th</span>
                                </span>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        });

        // Build weaknesses HTML by category
        let weaknessesHtml = '';
        categories.forEach(category => {
            const items = weaknessesByCategory[category];
            if (items && items.length > 0) {
                weaknessesHtml += `
                    <div class="sw-category">
                        <div class="sw-category-title">${categoryNames[category]}</div>
                        <div class="sw-items">
                            ${items.map(w => `
                                <span class="sw-item weakness">
                                    ${w.metric} <span class="sw-perc">${w.percentile.toFixed(0)}th</span>
                                </span>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        });

        html += `
            <div class="donut-card-extended">
                <div class="donut-header">
                    <div class="donut-title">${item.formation}</div>
                    <div class="donut-matches-badge">${stats.total_matches} matches</div>
                </div>
                <div class="donut-content">
                    <div class="donut-chart-section">
                        <div class="donut-wrapper">
                            <canvas id="donut-${index}"></canvas>
                            <div class="donut-center">
                                <span class="donut-win-rate">${stats.win_rate.toFixed(0)}%</span>
                                <span class="donut-label">win</span>
                            </div>
                        </div>
                        <div class="donut-legend">
                            <div class="legend-item win">
                                <span class="legend-color"></span>
                                <span class="legend-text">${stats.win_rate.toFixed(1)}%</span>
                            </div>
                            <div class="legend-item draw">
                                <span class="legend-color"></span>
                                <span class="legend-text">${stats.draw_rate.toFixed(1)}%</span>
                            </div>
                            <div class="legend-item loss">
                                <span class="legend-color"></span>
                                <span class="legend-text">${stats.loss_rate.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                    <div class="donut-sw-section">
                        <div class="sw-column strengths">
                            <div class="sw-header">💪 Strengths (>50th)</div>
                            ${strengthsHtml || '<div class="sw-empty">No notable strengths</div>'}
                        </div>
                        <div class="sw-column weaknesses">
                            <div class="sw-header">⚠️ Weaknesses (20-40th)</div>
                            ${weaknessesHtml || '<div class="sw-empty">No notable weaknesses</div>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;

    // Create donut charts
    comparisonData.forEach((item, index) => {
        const stats = item.data.battle_summary;
        const ctx = document.getElementById(`donut-${index}`).getContext('2d');

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Win', 'Draw', 'Loss'],
                datasets: [{
                    data: [stats.win_rate, stats.draw_rate, stats.loss_rate],
                    backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
                    borderColor: ['#16a34a', '#d97706', '#dc2626'],
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '65%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.label}: ${ctx.raw.toFixed(1)}%`
                        }
                    }
                }
            }
        });

        donutCharts.push(chart);
    });
}

// Get percentile level for coloring
function getPercentileLevel(percentile, isInverted = false) {
    if (percentile === null || percentile === undefined) return 'mid';

    // For inverted metrics, flip the color scale (high = bad, low = good)
    const p = isInverted ? (100 - percentile) : percentile;

    if (p < 15) return 'very-low';
    if (p < 35) return 'low';
    if (p < 45) return 'mid-low';
    if (p < 55) return 'mid';
    if (p < 65) return 'mid-high';
    if (p < 85) return 'high';
    return 'very-high';
}

// Format value for display
function formatValue(value) {
    if (value === null || value === undefined) return '-';
    if (Number.isInteger(value)) return value.toString();
    if (Math.abs(value) >= 100) return value.toFixed(0);
    if (Math.abs(value) >= 10) return value.toFixed(1);
    return value.toFixed(2);
}

// Populate metric select dropdowns
function populateMetricSelects() {
    Object.keys(metricDefinitions).forEach(category => {
        if (category === 'summary') return;
        const select = document.getElementById(`${category}MetricSelect`);
        if (!select) return;

        const def = metricDefinitions[category];
        select.innerHTML = '';

        def.metrics.forEach(m => {
            // Check if any formation has this metric with percentile
            const hasData = comparisonData.some(item => {
                const source = item.data[def.source];
                return source && source[`${m}_formation_percentile`] !== undefined;
            });

            if (hasData) {
                const option = document.createElement('option');
                option.value = m;
                option.textContent = def.labels[m] || m;
                option.title = metricExplanations[m] || ''; // Add tooltip to option
                select.appendChild(option);
            }
        });

        // Add metric explanation display below the select
        const container = select.closest('.gauge-header');
        if (container) {
            // Remove existing explanation if any
            const existingExplanation = container.querySelector('.metric-explanation');
            if (existingExplanation) existingExplanation.remove();

            // Add explanation element
            const explanationDiv = document.createElement('div');
            explanationDiv.className = 'metric-explanation';
            explanationDiv.id = `${category}MetricExplanation`;
            container.appendChild(explanationDiv);

            // Update explanation on change
            select.addEventListener('change', () => updateMetricExplanation(category));
            // Initial update
            updateMetricExplanation(category);
        }
    });
}

// Update metric explanation display
function updateMetricExplanation(category) {
    const select = document.getElementById(`${category}MetricSelect`);
    const explanationDiv = document.getElementById(`${category}MetricExplanation`);
    if (!select || !explanationDiv) return;

    const metric = select.value;
    const explanation = metricExplanations[metric];

    if (explanation) {
        explanationDiv.innerHTML = `<span class="explanation-icon">ℹ</span> ${explanation}`;
        explanationDiv.style.display = 'block';
    } else {
        explanationDiv.style.display = 'none';
    }
}

// Update all gauges
function updateAllGauges() {
    Object.keys(metricDefinitions).forEach(category => {
        if (category === 'summary') return;
        updateGauge(category);
    });
}

// Update gauge for a category
function updateGauge(category) {
    const container = document.getElementById(`${category}Gauge`);
    const select = document.getElementById(`${category}MetricSelect`);
    const def = metricDefinitions[category];

    if (!container || !select || !def) return;

    const metric = select.value;
    if (!metric) {
        container.innerHTML = '<p style="color: #6b7280;">Select a metric above</p>';
        return;
    }

    const isInverted = invertedMetrics.has(metric);

    // Build gauge HTML
    let html = `
        <div class="gauge-wrapper">
            <div class="gauge-track${isInverted ? ' inverted' : ''}"></div>
    `;

    // Add markers for each formation
    comparisonData.forEach((item, i) => {
        const source = item.data[def.source];
        const percentile = source ? source[`${metric}_formation_percentile`] : null;
        const value = source ? source[metric] : null;

        if (percentile !== null && percentile !== undefined) {
            // For inverted metrics, flip position (high percentile = bad = left side)
            const displayPercentile = isInverted ? (100 - percentile) : percentile;
            const left = Math.min(Math.max(displayPercentile, 2), 98); // Keep within bounds
            html += `
                <div class="gauge-marker" style="left: ${left}%">
                    <div class="gauge-marker-dot" style="background: ${formationColors[i % formationColors.length]}"></div>
                    <div class="gauge-marker-label">${item.formation}</div>
                    <div class="gauge-marker-value">${formatValue(value)} (${percentile.toFixed(0)}th)</div>
                </div>
            `;
        }
    });

    html += `
        </div>
        <div class="gauge-labels">
            <span>0 (Worst)</span>
            <span>35</span>
            <span>50</span>
            <span>65</span>
            <span>100 (Best)</span>
        </div>
        ${isInverted ? '<div class="gauge-inverted-note">↑ Lower values are better for this metric</div>' : ''}
    `;

    container.innerHTML = html;
}

// Switch tabs
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
}

// ==========================================
// ANALYSIS AND INSIGHTS GENERATION
// ==========================================

// Generate global analysis report
function generateGlobalAnalysis() {
    const container = document.getElementById('globalReportContent');
    if (!container || comparisonData.length === 0) return;

    let html = '';

    // 1. BEST FORMATION RECOMMENDATION
    const bestByWinRate = [...comparisonData].sort((a, b) =>
        b.data.battle_summary.win_rate - a.data.battle_summary.win_rate)[0];

    const reliableFormations = comparisonData.filter(f =>
        f.data.battle_summary.total_matches >= 30);

    const bestReliable = reliableFormations.length > 0
        ? reliableFormations.sort((a, b) => b.data.battle_summary.win_rate - a.data.battle_summary.win_rate)[0]
        : bestByWinRate;

    html += `
        <div class="recommendation-card">
            <h4>🏆 Recommended Formation</h4>
            <p>
                <span class="highlight">${bestReliable.formation}</span> is the best choice against this opponent
                with a <span class="highlight">${bestReliable.data.battle_summary.win_rate.toFixed(1)}%</span> win rate
                across ${bestReliable.data.battle_summary.total_matches} matches.
                ${bestReliable !== bestByWinRate ? `
                    <br><span class="warning-text">Note:</span> ${bestByWinRate.formation} has a higher win rate
                    (${bestByWinRate.data.battle_summary.win_rate.toFixed(1)}%) but with only
                    ${bestByWinRate.data.battle_summary.total_matches} matches - less statistically reliable.
                ` : ''}
            </p>
        </div>
    `;

    // 2. SAMPLE SIZE WARNING
    const lowSampleFormations = comparisonData.filter(f =>
        f.data.battle_summary.total_matches < 20);

    if (lowSampleFormations.length > 0) {
        html += `
            <div class="recommendation-card warning">
                <h4>📉 Statistical Reliability Warning</h4>
                <p>
                    The following formations have limited data (n<20):
                    <span class="warning-text">${lowSampleFormations.map(f =>
                        `${f.formation} (n=${f.data.battle_summary.total_matches})`
                    ).join(', ')}</span>.
                    Results may not be statistically significant.
                </p>
            </div>
        `;
    }

    // 6. TACTICAL SUMMARY
    const avgPossession = comparisonData.reduce((sum, f) =>
        sum + (f.data.possession?.avg_possession || 50), 0) / comparisonData.length;

    const avgXG = comparisonData.reduce((sum, f) =>
        sum + (f.data.shooting?.avg_xg || 0), 0) / comparisonData.length;

    html += `
        <div class="recommendation-card">
            <h4>📋 Tactical Overview</h4>
            <p>
                Against this opponent configuration, your formations average
                <span class="highlight">${avgPossession.toFixed(1)}%</span> possession
                and <span class="highlight">${avgXG.toFixed(2)}</span> xG per match.
                ${avgPossession > 55 ? 'Your formations tend to dominate possession.' :
                  avgPossession < 45 ? 'Expect to play more on the counter-attack.' :
                  'Possession is typically balanced in these matchups.'}
            </p>
        </div>
    `;

    container.innerHTML = html;
}

// Generate category-specific insights
function generateCategoryInsights(category) {
    const container = document.getElementById(`${category}Insights`);
    const def = metricDefinitions[category];

    if (!container || !def || comparisonData.length === 0) return;

    const strengths = [];
    const weaknesses = [];
    const bestPerMetric = {};
    const worstPerMetric = {};

    // Analyze each formation
    comparisonData.forEach(item => {
        const source = item.data[def.source];
        if (!source) return;

        def.metrics.forEach(metric => {
            const percKey = `${metric}_formation_percentile`;
            const perc = source[percKey];
            const value = source[metric];

            if (perc === undefined || perc === null) return;

            // Track best/worst per metric
            if (!bestPerMetric[metric] || perc > bestPerMetric[metric].percentile) {
                bestPerMetric[metric] = { formation: item.formation, percentile: perc, value };
            }
            if (!worstPerMetric[metric] || perc < worstPerMetric[metric].percentile) {
                worstPerMetric[metric] = { formation: item.formation, percentile: perc, value };
            }

            // Check if metric is inverted
            const isInverted = invertedMetrics.has(metric);

            if (isInverted) {
                // Inverted: high percentile = weakness, low percentile = strength
                if (perc >= 50) {
                    weaknesses.push({
                        formation: item.formation,
                        metric,
                        label: def.labels[metric],
                        percentile: perc,
                        value
                    });
                }
                if (perc <= 40 && perc >= 20) {
                    strengths.push({
                        formation: item.formation,
                        metric,
                        label: def.labels[metric],
                        percentile: perc,
                        value
                    });
                }
            } else {
                // Normal: high percentile = strength, low percentile = weakness
                if (perc >= 50) {
                    strengths.push({
                        formation: item.formation,
                        metric,
                        label: def.labels[metric],
                        percentile: perc,
                        value
                    });
                }
                if (perc <= 40 && perc >= 20) {
                    weaknesses.push({
                        formation: item.formation,
                        metric,
                        label: def.labels[metric],
                        percentile: perc,
                        value
                    });
                }
            }
        });
    });

    // Sort
    strengths.sort((a, b) => b.percentile - a.percentile);
    weaknesses.sort((a, b) => b.percentile - a.percentile);

    // Find overall best performer in this category
    const formationScores = {};
    comparisonData.forEach(item => {
        const source = item.data[def.source];
        if (!source) return;

        let totalPerc = 0;
        let count = 0;

        def.metrics.forEach(metric => {
            const perc = source[`${metric}_formation_percentile`];
            if (perc !== undefined) {
                // For inverted metrics, flip the percentile (lower is better)
                const isInverted = invertedMetrics.has(metric);
                totalPerc += isInverted ? (100 - perc) : perc;
                count++;
            }
        });

        formationScores[item.formation] = count > 0 ? totalPerc / count : 50;
    });

    const sortedFormations = Object.entries(formationScores)
        .sort((a, b) => b[1] - a[1]);

    const bestFormation = sortedFormations[0];
    const worstFormation = sortedFormations[sortedFormations.length - 1];

    // Build HTML
    let html = '<div class="insights-grid">';

    // Best in category
    if (bestFormation) {
        html += `
            <div class="insight-card strength">
                <div class="insight-title">Best in ${getCategoryDisplayName(category)}</div>
                <div class="insight-formation">${bestFormation[0]}</div>
                <div class="insight-detail">
                    Avg percentile: <span class="insight-value">${bestFormation[1].toFixed(0)}th</span>
                </div>
            </div>
        `;
    }

    // Worst in category
    if (worstFormation && comparisonData.length > 1) {
        html += `
            <div class="insight-card weakness">
                <div class="insight-title">Weakest in ${getCategoryDisplayName(category)}</div>
                <div class="insight-formation">${worstFormation[0]}</div>
                <div class="insight-detail">
                    Avg percentile: <span class="insight-value">${worstFormation[1].toFixed(0)}th</span>
                </div>
            </div>
        `;
    }

    html += '</div>';

    // Top strengths
    if (strengths.length > 0) {
        html += `
            <div class="sw-section">
                <h4>Notable Strengths (>50th percentile)</h4>
                <div class="sw-list">
                    ${strengths.slice(0, 8).map(s => `
                        <span class="sw-tag strength">
                            <span class="formation">${s.formation}</span>
                            <span class="metric">${s.label}</span>
                            <span class="perc">${s.percentile.toFixed(0)}th</span>
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Weaknesses
    if (weaknesses.length > 0) {
        html += `
            <div class="sw-section">
                <h4>Notable Weaknesses (20-40th percentile)</h4>
                <div class="sw-list">
                    ${weaknesses.slice(0, 8).map(w => `
                        <span class="sw-tag weakness">
                            <span class="formation">${w.formation}</span>
                            <span class="metric">${w.label}</span>
                            <span class="perc">${w.percentile.toFixed(0)}th</span>
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    if (strengths.length === 0 && weaknesses.length === 0) {
        html += '<p style="color: var(--text-muted);">No extreme values in this category - all formations perform within normal range.</p>';
    }

    container.innerHTML = html;
}

// Get display name for category
function getCategoryDisplayName(category) {
    const names = {
        shooting: 'Shooting',
        passing: 'Passing',
        possession: 'Possession',
        defensive: 'Defense',
        goalkeeping: 'Goalkeeping',
        creation: 'Chance Creation',
        pass_types: 'Pass Types',
        miscellaneous: 'Miscellaneous'
    };
    return names[category] || category;
}

// Generate all insights
function generateAllInsights() {
    generateGlobalAnalysis();

    Object.keys(metricDefinitions).forEach(category => {
        if (category === 'summary') return;
        generateCategoryInsights(category);
    });
}
