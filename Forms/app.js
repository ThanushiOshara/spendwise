// SpendWise - Core Application Logic

// 1. Categories configuration (වියදම් සහ ආදායම් වර්ගීකරණයන්)
const CATEGORIES = {
    income: ['Salary', 'Freelance', 'Business', 'Investments', 'Gifts', 'Other'],
    expense: ['Housing/Rent', 'Groceries', 'Utilities', 'Dining Out', 'Transport', 'Entertainment', 'Shopping', 'Healthcare', 'Other']
};

// 2. Category Icons mapping (එක් එක් වර්ගයට අදාළ Icons)
const CATEGORY_ICONS = {
    // Income
    'Salary': 'banknote',
    'Freelance': 'laptop',
    'Business': 'briefcase',
    'Investments': 'trending-up',
    'Gifts': 'gift',
    
    // Expense
    'Housing/Rent': 'home',
    'Groceries': 'shopping-cart',
    'Utilities': 'zap',
    'Dining Out': 'utensils',
    'Transport': 'car',
    'Entertainment': 'popcorn',
    'Shopping': 'shopping-bag',
    'Healthcare': 'heart-pulse',
    
    // Fallback
    'Other': 'help-circle'
};
// Initial state / LocalStorage loading
let state = {
    transactions: JSON.parse(localStorage.getItem('spendwise_lkr_transactions')) || [],
    budgetLimit: parseFloat(localStorage.getItem('spendwise_lkr_budget_limit')) || 100000,
    savingsGoals: JSON.parse(localStorage.getItem('spendwise_lkr_savings_goals')) || [],
    profileName: localStorage.getItem('spendwise_lkr_profile_name') || 'Guest',
    profileStatus: localStorage.getItem('spendwise_lkr_profile_status') || 'Financial Tracker'
};

// Seed initial demo data
if (state.transactions.length === 0) {
    const today = new Date();
    const formatOffsetDate = (daysAgo) => {
        const d = new Date(today);
        d.setDate(today.getDate() - daysAgo);
        return d.toISOString().split('T')[0];
    };
    
    state.transactions = [
        { id: '1', type: 'income', amount: 150000, category: 'Salary', date: formatOffsetDate(14), description: 'Monthly Salary' },
        { id: '2', type: 'income', amount: 35000, category: 'Freelance', date: formatOffsetDate(5), description: 'UI/UX Design project' },
        { id: '3', type: 'expense', amount: 45000, category: 'Housing/Rent', date: formatOffsetDate(14), description: 'Apartment Rent' },
        { id: '4', type: 'expense', amount: 18500, category: 'Groceries', date: formatOffsetDate(8), description: 'Weekly Groceries' },
        { id: '5', type: 'expense', amount: 12500, category: 'Utilities', date: formatOffsetDate(6), description: 'Electricity Bill' },
        { id: '6', type: 'expense', amount: 6800, category: 'Dining Out', date: formatOffsetDate(3), description: 'Dinner with friends' },
        { id: '7', type: 'expense', amount: 15000, category: 'Shopping', date: formatOffsetDate(1), description: 'Running shoes' }
    ];
    saveToLocalStorage('transactions', state.transactions);
}

if (state.savingsGoals.length === 0) {
    state.savingsGoals = [
        { id: 'g1', name: 'Emergency Fund', target: 500000, saved: 150000 },
        { id: 'g2', name: 'New MacBook Pro', target: 350000, saved: 120000 }
    ];
    saveToLocalStorage('savingsGoals', state.savingsGoals);
}
if (state.savingsGoals.length === 0) {
    state.savingsGoals = [
        { id: 'g1', name: 'Emergency Fund', target: 5000, saved: 2500 },
        { id: 'g2', name: 'New MacBook Pro', target: 2000, saved: 800 }
    ];
    saveToLocalStorage('savingsGoals', state.savingsGoals);
}

// Chart.js ප්‍රස්තාරය සඳහා Variable එකක්
let financeChartInstance = null;

// 4. HTML Elements තෝරාගැනීම (DOM Selectors)
const elements = {
    // Summary
    totalBalance: document.getElementById('total-balance'),
    totalIncome: document.getElementById('total-income'),
    totalExpenses: document.getElementById('total-expenses'),
    
    // Budget
    budgetLimitVal: document.getElementById('budget-limit-val'),
    budgetSpentVal: document.getElementById('budget-spent-val'),
    budgetRemainingVal: document.getElementById('budget-remaining-val'),
    budgetPercentage: document.getElementById('budget-pct'),
    budgetRing: document.getElementById('budget-progress-ring'),
    
    // Lists
    transactionList: document.getElementById('transaction-list'),
    savingsGoalsList: document.getElementById('savings-goals-list'),
    
    // Modals
    transactionModal: document.getElementById('transaction-modal'),
    budgetModal: document.getElementById('budget-modal'),
    goalModal: document.getElementById('goal-modal'),
    
    // Forms & Inputs
    transactionForm: document.getElementById('transaction-form'),
    budgetForm: document.getElementById('budget-form'),
    goalForm: document.getElementById('goal-form'),
    
    txId: document.getElementById('transaction-id'),
    txTypeIncome: document.getElementById('type-income'),
    txTypeExpense: document.getElementById('type-expense'),
    txAmount: document.getElementById('amount'),
    txDate: document.getElementById('date'),
    txCategory: document.getElementById('category'),
    txDescription: document.getElementById('description'),
    txModalTitle: document.getElementById('modal-title'),
    
    budgetLimitInput: document.getElementById('budget-limit'),
    
    goalNameInput: document.getElementById('goal-name'),
    goalTargetInput: document.getElementById('goal-target'),
    goalSavedInput: document.getElementById('goal-saved'),
    
    // Buttons
    btnOpenTxModal: document.getElementById('btn-open-transaction-modal'),
    btnCloseTxModal: document.getElementById('btn-close-transaction-modal'),
    btnCancelTx: document.getElementById('btn-cancel-transaction'),
    
    btnEditBudget: document.getElementById('btn-edit-budget'),
    btnCloseBudgetModal: document.getElementById('btn-close-budget-modal'),
    btnCancelBudget: document.getElementById('btn-cancel-budget'),
    
    btnOpenGoalModal: document.getElementById('btn-open-goal-modal'),
    btnCloseGoalModalX: document.getElementById('btn-close-goal-modal-x'),
    btnCancelGoal: document.getElementById('btn-cancel-goal'),
    
    btnOpenFilter: document.getElementById('btn-open-filter'),
    btnClearFilters: document.getElementById('btn-clear-filters'),
    filterPanel: document.getElementById('filter-panel'),
    searchFilter: document.getElementById('search-filter'),
    typeFilter: document.getElementById('type-filter'),
    categoryFilter: document.getElementById('category-filter'),

        // Profile Elements
    profileNameDisplay: document.querySelector('.profile-name'),
    profileStatusDisplay: document.querySelector('.profile-status'),
    profileTrigger: document.getElementById('user-profile-trigger'),
    profileModal: document.getElementById('profile-modal'),
    profileForm: document.getElementById('profile-form'),
    profileNameInput: document.getElementById('profile-name-input'),
    profileStatusInput: document.getElementById('profile-status-input'),
    btnCancelProfile: document.getElementById('btn-cancel-profile'),
    btnCloseProfileModal: document.getElementById('btn-close-profile-modal')
};
// 5. Format & LocalStorage Helpers (මුදල් හැඩගැන්වීම් සහ දත්ත සුරැකීම්)
function formatCurrency(amount) {
    return 'Rs. ' + new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function saveToLocalStorage(key, data) {
    localStorage.setItem(`spendwise_lkr_${key}`, JSON.stringify(data));
}

// 6. App Initialization (වෙබ් පිටුව මුලින්ම ලෝඩ් වන විට ක්‍රියාත්මක වන කොටස)
document.addEventListener('DOMContentLoaded', () => {
    // ගනුදෙනු ඇතුළත් කරන පෝරමයේ දිනයට අද දිනය ස්වයංක්‍රීයව ලබාදීම
    elements.txDate.value = new Date().toISOString().split('T')[0];
    
    setupEventListeners();
    populateCategoryDropdown(elements.txCategory, 'expense'); // Default එක ලෙස expense Categories පෙන්වීම
    populateCategoryFilterDropdown(); // සෙවුම් තීරුවේ (Filter) ඇති Categories පිරවීම
    
    // UI එක update කිරීම
    updateUI();
    
    // Lucide Icons සක්‍රීය කිරීම
    lucide.createIcons();
});

// 7. Event Listeners (බොත්තම් ක්ලික් කිරීම් සහ වෙනස්වීම් හඳුනාගැනීම)
function setupEventListeners() {
    // Transaction Modal එක විවෘත කිරීම සහ වැසීම
    elements.btnOpenTxModal.addEventListener('click', () => {
        elements.txId.value = '';
        elements.transactionForm.reset();
        elements.txDate.value = new Date().toISOString().split('T')[0];
        elements.txModalTitle.innerText = 'Add Transaction';
        populateCategoryDropdown(elements.txCategory, 'expense');
        openModal(elements.transactionModal);
    });
    
    elements.btnCloseTxModal.addEventListener('click', () => closeModal(elements.transactionModal));
    elements.btnCancelTx.addEventListener('click', () => closeModal(elements.transactionModal));
    
    // Budget Modal එක විවෘත කිරීම සහ වැසීම
    elements.btnEditBudget.addEventListener('click', () => {
        elements.budgetLimitInput.value = state.budgetLimit;
        openModal(elements.budgetModal);
    });
    elements.btnCloseBudgetModal.addEventListener('click', () => closeModal(elements.budgetModal));
    elements.btnCancelBudget.addEventListener('click', () => closeModal(elements.budgetModal));
    
    // Savings Goal Modal එක විවෘත කිරීම සහ වැසීම
    elements.btnOpenGoalModal.addEventListener('click', () => {
        elements.goalForm.reset();
        openModal(elements.goalModal);
    });
    elements.btnCloseGoalModalX.addEventListener('click', () => closeModal(elements.goalModal));
    elements.btnCancelGoal.addEventListener('click', () => closeModal(elements.goalModal));
    
    // Income හෝ Expense තේරූ විට ඊට අදාළ Categories පමණක් පෙන්වීමට මාරු කිරීම
    elements.txTypeIncome.addEventListener('change', () => populateCategoryDropdown(elements.txCategory, 'income'));
    elements.txTypeExpense.addEventListener('change', () => populateCategoryDropdown(elements.txCategory, 'expense'));
    
    // Forms Submit වන විට දත්ත සැකසීම
    elements.transactionForm.addEventListener('submit', handleTransactionSubmit);
    elements.budgetForm.addEventListener('submit', handleBudgetSubmit);
    elements.goalForm.addEventListener('submit', handleGoalSubmit);
    elements.profileForm.addEventListener('submit', handleProfileSubmit);
    
    // සෙවුම් තීරුව (Filter panel) විවෘත කිරීම සහ Filters ක්‍රියාත්මක කිරීම
    elements.btnOpenFilter.addEventListener('click', () => {
        elements.filterPanel.classList.toggle('active');
    });
    elements.searchFilter.addEventListener('input', () => renderTransactions());
    elements.typeFilter.addEventListener('change', () => renderTransactions());
    elements.categoryFilter.addEventListener('change', () => renderTransactions());
    
    // Filters සියල්ල ඉවත් කිරීම (Reset)
    elements.btnClearFilters.addEventListener('click', () => {
        elements.searchFilter.value = '';
        elements.typeFilter.value = 'all';
        elements.categoryFilter.value = 'all';
        renderTransactions();
    });

        // Profile Modal එක විවෘත කිරීම
    elements.profileTrigger.addEventListener('click', () => {
        elements.profileNameInput.value = state.profileName;
        elements.profileStatusInput.value = state.profileStatus;
        openModal(elements.profileModal);
    });
    
    // Profile Modal එක වැසීම (Cancel / Close)
    elements.btnCloseProfileModal.addEventListener('click', () => closeModal(elements.profileModal));
    elements.btnCancelProfile.addEventListener('click', () => closeModal(elements.profileModal));
}

// 8. Modal පාලන Helpers
function openModal(modal) {
    modal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

// CategoriesDropdown ලැයිස්තුව dynamic ලෙස සැකසීම
function populateCategoryDropdown(selectElement, type) {
    selectElement.innerHTML = '';
    CATEGORIES[type].forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        selectElement.appendChild(option);
    });
}

function populateCategoryFilterDropdown() {
    const select = elements.categoryFilter;
    select.innerHTML = '<option value="all">All Categories</option>';
    
    const allCats = [...CATEGORIES.income, ...CATEGORIES.expense];
    allCats.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}
// 9. Financial Summary ගණනය කිරීම්
function getSummaryData() {
    let income = 0;
    let expenses = 0;
    
    state.transactions.forEach(t => {
        const amt = parseFloat(t.amount);
        if (t.type === 'income') {
            income += amt;
        } else {
            expenses += amt;
        }
    });
    
    return {
        totalIncome: income,
        totalExpenses: expenses,
        balance: income - expenses
    };
}

// 10. UI එක යාවත්කාලීන කිරීමේ Engine එක
function updateUI() {
    const summary = getSummaryData();
    
    // ප්‍රධාන අගයන් වෙනස් කිරීම
    elements.totalBalance.textContent = formatCurrency(summary.balance);
    elements.totalIncome.textContent = formatCurrency(summary.totalIncome);
    elements.totalExpenses.textContent = formatCurrency(summary.totalExpenses);
    
    // Balance එක ධන නම් සුදු පැහැයෙන්ද, ඍණ නම් රතු පැහැයෙන්ද පෙන්වීම
    if (summary.balance >= 0) {
        elements.totalBalance.style.color = 'var(--text-primary)';
    } else {
        elements.totalBalance.style.color = 'var(--expense-color)';
    }
    
    // අනෙක් කොටස් Render කිරීම
    renderBudgetProgress(summary.totalExpenses);
    renderSavingsGoals();
    renderTransactions();
    renderChart(state.transactions);

        // Profile එක තිරය මත යාවත්කාලීන කිරීම
    elements.profileNameDisplay.textContent = `Hello, ${state.profileName}`;
    elements.profileStatusDisplay.textContent = state.profileStatus;
}

// 11. අයවැය (Budget) ප්‍රගතිය ගණනය කර පෙන්වීම
function renderBudgetProgress(totalExpenses) {
    const limit = state.budgetLimit;
    const spent = totalExpenses;
    const remaining = limit - spent;
    const percentage = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 999) : 0;
    
    elements.budgetLimitVal.textContent = formatCurrency(limit);
    elements.budgetSpentVal.textContent = formatCurrency(spent);
    elements.budgetRemainingVal.textContent = formatCurrency(Math.max(0, remaining));
    elements.budgetPercentage.textContent = `${percentage}%`;
    
    // SVG රවුම පිරවීමේ ගණිතමය ක්‍රමය (r=50 -> Circumference = 2 * PI * 50 ≈ 314.16)
    const circumference = 2 * Math.PI * 50;
    const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;
    elements.budgetRing.style.strokeDashoffset = offset;
    
    // අයවැය සීමාව ඉක්මවා යන විට වර්ණ වෙනස් කිරීම
    if (percentage >= 100) {
        elements.budgetRing.style.stroke = 'var(--expense-color)';
        elements.budgetRemainingVal.style.color = 'var(--expense-color)';
        elements.budgetPercentage.style.color = 'var(--expense-color)';
    } else if (percentage >= 85) {
        elements.budgetRing.style.stroke = 'var(--warning-color)';
        elements.budgetRemainingVal.style.color = 'var(--warning-color)';
        elements.budgetPercentage.style.color = 'var(--warning-color)';
    } else {
        elements.budgetRing.style.stroke = 'var(--primary-color)';
        elements.budgetRemainingVal.style.color = 'var(--text-primary)';
        elements.budgetPercentage.style.color = 'var(--text-primary)';
    }
}

// 12. ඉතුරුම් ඉලක්ක (Savings Goals) Render කිරීම
function renderSavingsGoals() {
    const list = elements.savingsGoalsList;
    list.innerHTML = '';
    
    if (state.savingsGoals.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i data-lucide="piggy-bank"></i>
                <p>No savings goals set. Save for something special!</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    
    state.savingsGoals.forEach(goal => {
        const percentage = goal.target > 0 ? Math.min(Math.round((goal.saved / goal.target) * 100), 100) : 0;
        
        const goalCard = document.createElement('div');
        goalCard.className = 'goal-card';
        goalCard.innerHTML = `
            <div class="goal-card-header">
                <span class="goal-card-title">${goal.name}</span>
                <span class="goal-card-amounts">${formatCurrency(goal.saved)} / ${formatCurrency(goal.target)}</span>
            </div>
            <div class="goal-progress-bar-bg">
                <div class="goal-progress-bar-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="goal-actions">
                <button class="btn btn-xs btn-secondary" onclick="adjustGoalAmount('${goal.id}')">+ Add</button>
                <button class="btn btn-xs btn-icon" onclick="deleteGoal('${goal.id}')" title="Delete Goal">&times;</button>
            </div>
        `;
        list.appendChild(goalCard);
    });
}

// ඉතුරුම් ඉලක්ක සඳහා මුදල් එකතු කිරීම
window.adjustGoalAmount = function(id) {
    const goal = state.savingsGoals.find(g => g.id === id);
    if (!goal) return;
    
    const input = prompt(`Enter amount to add to "${goal.name}" (Current: ${formatCurrency(goal.saved)} / Target: ${formatCurrency(goal.target)}):`);
    if (input === null) return;
    
    const amountToAdd = parseFloat(input);
    if (isNaN(amountToAdd) || amountToAdd <= 0) {
        alert('Please enter a valid positive number.');
        return;
    }
    
    goal.saved = Math.min(goal.saved + amountToAdd, goal.target);
    saveToLocalStorage('savingsGoals', state.savingsGoals);
    updateUI();
};

// ඉතුරුම් ඉලක්ක මකා දැමීම
window.deleteGoal = function(id) {
    if (!confirm('Are you sure you want to delete this savings goal?')) return;
    
    state.savingsGoals = state.savingsGoals.filter(g => g.id !== id);
    saveToLocalStorage('savingsGoals', state.savingsGoals);
    updateUI();
};
// 13. ගනුදෙනු ලැයිස්තුව පෙරහන් (Filters) අනුව සකසා පෙන්වීම
function renderTransactions() {
    const list = elements.transactionList;
    list.innerHTML = '';
    
    const searchQuery = elements.searchFilter.value.toLowerCase().trim();
    const typeQuery = elements.typeFilter.value;
    const categoryQuery = elements.categoryFilter.value;
    
    // Filtering logic (සෙවීම් සහ තේරීම් අනුව දත්ත වෙන් කිරීම)
    const filtered = state.transactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchQuery) || t.category.toLowerCase().includes(searchQuery);
        const matchesType = typeQuery === 'all' || t.type === typeQuery;
        const matchesCategory = categoryQuery === 'all' || t.category === categoryQuery;
        
        return matchesSearch && matchesType && matchesCategory;
    });
    
    // දිනය අනුව අලුත්ම ගනුදෙනු ඉහළින්ම පෙන්වීමට Sort කිරීම
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i data-lucide="receipt"></i>
                <p>No matching transactions found.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    
    filtered.forEach(t => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        
        const sign = t.type === 'income' ? '+' : '-';
        const formattedAmount = `${sign}${formatCurrency(t.amount)}`;
        const iconName = CATEGORY_ICONS[t.category] || CATEGORY_ICONS['Other'];
        
        item.innerHTML = `
            <div class="tx-left-block">
                <div class="tx-cat-icon ${t.type}">
                    <i data-lucide="${iconName}"></i>
                </div>
                <div class="tx-details">
                    <span class="tx-desc">${t.description}</span>
                    <div class="tx-meta">
                        <span class="tx-tag">${t.category}</span>
                        <span>•</span>
                        <span>${formatDateString(t.date)}</span>
                    </div>
                </div>
            </div>
            <div class="tx-right-block">
                <span class="tx-amount ${t.type}">${formattedAmount}</span>
                <button class="tx-delete-btn" onclick="deleteTransaction('${t.id}')" title="Delete">
                    <i data-lucide="trash-2" class="icon-sm"></i>
                </button>
            </div>
        `;
        
        // Double click කළ විට ගනුදෙනුව edit කිරීමට හැකි වීම
        item.addEventListener('dblclick', () => openEditTransactionModal(t.id));
        
        list.appendChild(item);
    });
    
    // අලුතින් එකතු වූ අයිකන සක්‍රීය කිරීම
    lucide.createIcons();
}

// දින ලස්සනට පෙන්වීමට සකසන Helper එකක් (e.g., Aug 15, 2026)
function formatDateString(dateStr) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
}

// ගනුදෙනු මකා දැමීම (Delete)
window.deleteTransaction = function(id) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    state.transactions = state.transactions.filter(t => t.id !== id);
    saveToLocalStorage('transactions', state.transactions);
    updateUI();
};

// ගනුදෙනුවක් Edit කිරීමට Modal එකට දත්ත පිරවීම
function openEditTransactionModal(id) {
    const t = state.transactions.find(item => item.id === id);
    if (!t) return;
    
    elements.txId.value = t.id;
    elements.txAmount.value = t.amount;
    elements.txDate.value = t.date;
    elements.txDescription.value = t.description;
    
    if (t.type === 'income') {
        elements.txTypeIncome.checked = true;
        populateCategoryDropdown(elements.txCategory, 'income');
    } else {
        elements.txTypeExpense.checked = true;
        populateCategoryDropdown(elements.txCategory, 'expense');
    }
    
    elements.txCategory.value = t.category;
    elements.txModalTitle.innerText = 'Edit Transaction';
    
    openModal(elements.transactionModal);
}

// 14. Forms Submit කිරීමේදී දත්ත සකසා සුරැකීම

// ගනුදෙනු පෝරමය (Transaction Form)
function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const id = elements.txId.value || 'tx_' + Date.now();
    const type = elements.txTypeIncome.checked ? 'income' : 'expense';
    const amount = parseFloat(elements.txAmount.value);
    const date = elements.txDate.value;
    const category = elements.txCategory.value;
    const description = elements.txDescription.value.trim();
    
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount.');
        return;
    }
    
    const updatedTransaction = { id, type, amount, date, category, description };
    
    const editIndex = state.transactions.findIndex(t => t.id === id);
    if (editIndex > -1) {
        state.transactions[editIndex] = updatedTransaction; // Edit කිරීමක් නම් පැරණි එක වෙනස් කිරීම
    } else {
        state.transactions.push(updatedTransaction); // අලුත් එකක් නම් ලැයිස්තුවට එකතු කිරීම
    }
    
    saveToLocalStorage('transactions', state.transactions);
    closeModal(elements.transactionModal);
    updateUI();
}

// අයවැය පෝරමය (Budget Form)
function handleBudgetSubmit(e) {
    e.preventDefault();
    const limit = parseFloat(elements.budgetLimitInput.value);
    if (isNaN(limit) || limit < 0) {
        alert('Please enter a valid budget amount.');
        return;
    }
    
    state.budgetLimit = limit;
    saveToLocalStorage('budgetLimit', limit);
    closeModal(elements.budgetModal);
    updateUI();
}

// ඉතුරුම් පෝරමය (Savings Goal Form)
function handleGoalSubmit(e) {
    e.preventDefault();
    
    const name = elements.goalNameInput.value.trim();
    const target = parseFloat(elements.goalTargetInput.value);
    const saved = parseFloat(elements.goalSavedInput.value);
    
    if (isNaN(target) || target <= 0) {
        alert('Please enter a valid target amount.');
        return;
    }
    if (isNaN(saved) || saved < 0) {
        alert('Please enter a valid saved amount.');
        return;
    }
    
    const newGoal = {
        id: 'g_' + Date.now(),
        name,
        target,
        saved: Math.min(saved, target)
    };
    
    state.savingsGoals.push(newGoal);
    saveToLocalStorage('savingsGoals', state.savingsGoals);
    closeModal(elements.goalModal);
    updateUI();
}

// 15. Chart.js මඟින් වියදම් වර්ගීකරණ ප්‍රස්ථාරය ඇඳීම (Doughnut Chart)
function renderChart(transactions) {
    const ctx = document.getElementById('finance-chart').getContext('2d');
    
    // වියදම් පමණක් කාණ්ඩ (Category) අනුව එකතු කිරීම
    const categoryTotals = {};
    transactions.forEach(t => {
        if (t.type === 'expense') {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + parseFloat(t.amount);
        }
    });
    
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    
    // ප්‍රස්ථාරය සඳහා වර්ණ මාලාවක්
    const chartColors = ['#a855f7', '#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#84cc16', '#94a3b8'];
    
    if (financeChartInstance) {
        financeChartInstance.destroy(); // පැරණි ප්‍රස්ථාරය ඉවත් කිරීම
    }
    
    // වියදම් කිසිවක් නැති විට හිස් රවුමක් ඇඳීම
    if (labels.length === 0) {
        financeChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['No Data'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['rgba(255, 255, 255, 0.05)'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                cutout: '75%'
            }
        });
        return;
    }
    
    // Doughnut Chart එක ඇඳීම
    financeChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: chartColors.slice(0, labels.length),
                borderColor: '#151324',
                borderWidth: 2,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#94a3b8',
                        font: { family: 'Outfit', size: 11 },
                        boxWidth: 12,
                        padding: 12
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return ` ${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
}
// Profile පෝරමය (Profile Form) Submit කිරීම පාලනය කිරීම
function handleProfileSubmit(e) {
    e.preventDefault();
    
    const newName = elements.profileNameInput.value.trim();
    const newStatus = elements.profileStatusInput.value.trim();
    
    state.profileName = newName;
    state.profileStatus = newStatus;
    
    // LocalStorage හි සුරැකීම
    localStorage.setItem('spendwise_lkr_profile_name', newName);
    localStorage.setItem('spendwise_lkr_profile_status', newStatus);
    
    closeModal(elements.profileModal);
    updateUI(); // වෙනස්කම් සජීවීව පිටුවේ පෙන්වීමට
}