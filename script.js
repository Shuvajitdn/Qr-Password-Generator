// DOM Elements - General
const themeToggle = document.getElementById('theme-toggle-checkbox');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const currentYearEl = document.getElementById('current-year');

// DOM Elements - QR Code Generator
const textInput = document.getElementById('text');
const sizeInput = document.getElementById('size');
const sizeValueEl = document.getElementById('size-value');
const colorInput = document.getElementById('color');
const colorPreview = document.getElementById('color-preview');
const bgColorInput = document.getElementById('bg-color');
const bgColorPreview = document.getElementById('bg-color-preview');
const logoUpload = document.getElementById('logo-upload');
const generateQrBtn = document.getElementById('generate-qr');
const downloadQrBtn = document.getElementById('download-qr');
const qrPreview = document.getElementById('qr-preview');
const qrHistoryContainer = document.getElementById('qr-history');
const clearQrHistoryBtn = document.getElementById('clear-qr-history');
const exportQrHistoryBtn = document.getElementById('export-qr-history');
const importQrFileInput = document.getElementById('import-qr-file');

// DOM Elements - Password Generator
const passwordLengthInput = document.getElementById('password-length');
const lengthValueEl = document.getElementById('length-value');
const uppercaseCheckbox = document.getElementById('uppercase');
const lowercaseCheckbox = document.getElementById('lowercase');
const numbersCheckbox = document.getElementById('numbers');
const symbolsCheckbox = document.getElementById('symbols');
const minRequirementsCheckbox = document.getElementById('min-requirements');
const requirementsDetails = document.getElementById('requirements-details');
const generatePasswordBtn = document.getElementById('generate-password');
const copyPasswordBtn = document.getElementById('copy-password');
const autoSuggestBtn = document.getElementById('auto-suggest');
const passwordDisplay = document.getElementById('password-display');
const toggleVisibilityBtn = document.getElementById('toggle-visibility');
const strengthMeterContainer = document.getElementById('strength-meter-container');
const strengthIcon = document.getElementById('strength-icon');
const strengthText = document.getElementById('strength-text');
const strengthPercentage = document.getElementById('strength-percentage');
const strengthProgress = document.getElementById('strength-progress');
const passwordHistoryContainer = document.getElementById('password-history');
const clearPasswordHistoryBtn = document.getElementById('clear-password-history');
const exportPasswordHistoryBtn = document.getElementById('export-password-history');
const importPasswordFileInput = document.getElementById('import-password-file');
const categoryItems = document.querySelectorAll('.category-item');

// State
let qrCodeHistory = [];
let passwordHistory = [];
let currentLogo = null;
let currentCategory = null;
let qrCodeInstance = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    currentYearEl.textContent = new Date().getFullYear();

    // Initialize theme
    initTheme();

    // Initialize QR Code Generator
    initQRCodeGenerator();

    // Initialize Password Generator
    initPasswordGenerator();

    // Initialize tabs
    initTabs();
});

// Theme Functions
function initTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        themeToggle.checked = true;
    }

    // Theme toggle event listener
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            document.body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    });
}

// Tab Functions
function initTabs() {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show active tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// QR Code Generator Functions
function initQRCodeGenerator() {
    // Load history from localStorage
    loadQRCodeHistory();

    // Initialize color previews
    updateColorPreview(colorInput, colorPreview);
    updateColorPreview(bgColorInput, bgColorPreview);

    // Event listeners
    sizeInput.addEventListener('input', () => {
        sizeValueEl.textContent = sizeInput.value;
    });

    colorInput.addEventListener('input', () => {
        updateColorPreview(colorInput, colorPreview);
    });

    bgColorInput.addEventListener('input', () => {
        updateColorPreview(bgColorInput, bgColorPreview);
    });

    logoUpload.addEventListener('change', handleLogoUpload);

    generateQrBtn.addEventListener('click', generateQRCode);
    downloadQrBtn.addEventListener('click', downloadQRCode);
    clearQrHistoryBtn.addEventListener('click', clearQRCodeHistory);
    exportQrHistoryBtn.addEventListener('click', exportQRCodeHistory);
    importQrFileInput.addEventListener('change', importQRCodeHistory);
}

function updateColorPreview(input, preview) {
    preview.style.backgroundColor = input.value;
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentLogo = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function generateQRCode() {
    const text = textInput.value.trim();
    if (!text) {
        showToast('Please enter some text or URL', 'error');
        return;
    }

    // Clear previous QR code
    qrPreview.innerHTML = '';

    // Create QR code options
    const size = parseInt(sizeInput.value);
    const color = colorInput.value;
    const backgroundColor = bgColorInput.value;

    // Create QR code
    qrCodeInstance = new QRCode(qrPreview, {
        text: text,
        width: size,
        height: size,
        colorDark: color,
        colorLight: backgroundColor,
        correctLevel: QRCode.CorrectLevel.H // High error correction for logo
    });

    // Add logo if uploaded
    if (currentLogo) {
        setTimeout(() => {
            addLogoToQRCode(currentLogo, size);
        }, 100);
    }

    // Enable download button
    downloadQrBtn.disabled = false;

    // Add to history
    const newQRCode = {
        id: Date.now().toString(),
        text: text,
        color: color,
        backgroundColor: backgroundColor,
        size: size,
        logo: currentLogo,
        timestamp: Date.now()
    };

    qrCodeHistory.unshift(newQRCode);
    if (qrCodeHistory.length > 10) {
        qrCodeHistory.pop();
    }
    
    saveQRCodeHistory();
    renderQRCodeHistory();
    
    showToast('QR Code generated successfully!', 'success');
}

function addLogoToQRCode(logoDataUrl, size) {
    const qrImage = qrPreview.querySelector('img');
    if (!qrImage) return;

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const qrSize = size;
    canvas.width = qrSize;
    canvas.height = qrSize;

    // Draw QR code on canvas
    const qrImg = new Image();
    qrImg.onload = function() {
        ctx.drawImage(qrImg, 0, 0, qrSize, qrSize);
        
        // Draw logo in center
        const logo = new Image();
        logo.onload = function() {
            // Calculate logo size (25% of QR code)
            const logoSize = qrSize * 0.25;
            const logoX = (qrSize - logoSize) / 2;
            const logoY = (qrSize - logoSize) / 2;
            
            // Draw white background for logo
            ctx.fillStyle = 'white';
            ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
            
            // Draw logo
            ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
            
            // Replace QR image with canvas image
            qrImage.src = canvas.toDataURL();
        };
        logo.src = logoDataUrl;
    };
    qrImg.src = qrImage.src;
}

function downloadQRCode() {
    const qrImage = qrPreview.querySelector('img');
    if (!qrImage) return;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = qrImage.src;
    link.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('QR Code downloaded successfully!', 'success');
}

function loadQRCodeHistory() {
    const savedHistory = localStorage.getItem('qrCodeHistory');
    if (savedHistory) {
        qrCodeHistory = JSON.parse(savedHistory);
        renderQRCodeHistory();
    }
}

function saveQRCodeHistory() {
    localStorage.setItem('qrCodeHistory', JSON.stringify(qrCodeHistory));
    
    // Show/hide clear history button
    clearQrHistoryBtn.style.display = qrCodeHistory.length > 0 ? 'flex' : 'none';
}

function renderQRCodeHistory() {
    qrHistoryContainer.innerHTML = '';
    
    if (qrCodeHistory.length === 0) {
        qrHistoryContainer.innerHTML = '<p class="empty-history">No history yet. Generate some QR codes!</p>';
        return;
    }
    
    qrCodeHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.addEventListener('click', () => loadFromQRCodeHistory(item));
        
        const colorPreview = document.createElement('div');
        colorPreview.className = 'history-color-preview';
        colorPreview.style.backgroundColor = item.backgroundColor;
        
        // Create inner color square
        const innerColor = document.createElement('div');
        innerColor.style.position = 'absolute';
        innerColor.style.top = '50%';
        innerColor.style.left = '50%';
        innerColor.style.transform = 'translate(-50%, -50%)';
        innerColor.style.width = '60%';
        innerColor.style.height = '60%';
        innerColor.style.backgroundColor = item.color;
        colorPreview.appendChild(innerColor);
        
        const content = document.createElement('div');
        content.className = 'history-content';
        
        const text = document.createElement('p');
        text.className = 'history-text';
        text.textContent = item.text;
        
        const meta = document.createElement('div');
        meta.className = 'history-meta';
        
        const timestamp = document.createElement('span');
        timestamp.className = 'history-timestamp';
        timestamp.innerHTML = `<i class="fas fa-clock"></i> ${formatDate(item.timestamp)}`;
        
        const size = document.createElement('span');
        size.className = 'history-badge';
        size.textContent = `${item.size}px`;
        
        meta.appendChild(timestamp);
        meta.appendChild(size);
        
        content.appendChild(text);
        content.appendChild(meta);
        
        const actions = document.createElement('div');
        actions.className = 'history-actions';
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'history-btn';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.title = 'Copy text';
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(item.text);
            showToast('Text copied to clipboard!', 'success');
        });
        
        const loadBtn = document.createElement('button');
        loadBtn.className = 'history-btn';
        loadBtn.innerHTML = '<i class="fas fa-check-circle"></i>';
        loadBtn.title = 'Load QR code';
        loadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            loadFromQRCodeHistory(item);
        });
        
        actions.appendChild(copyBtn);
        actions.appendChild(loadBtn);
        
        historyItem.appendChild(colorPreview);
        historyItem.appendChild(content);
        historyItem.appendChild(actions);
        
        qrHistoryContainer.appendChild(historyItem);
    });
    
    // Show/hide clear history button
    clearQrHistoryBtn.style.display = 'flex';
}

function loadFromQRCodeHistory(item) {
    textInput.value = item.text;
    sizeInput.value = item.size;
    sizeValueEl.textContent = item.size;
    colorInput.value = item.color;
    bgColorInput.value = item.backgroundColor;
    updateColorPreview(colorInput, colorPreview);
    updateColorPreview(bgColorInput, bgColorPreview);
    
    currentLogo = item.logo;
    
    // Generate QR code
    generateQRCode();
    
    showToast('Loaded from history', 'info');
}

function clearQRCodeHistory() {
    qrCodeHistory = [];
    localStorage.removeItem('qrCodeHistory');
    renderQRCodeHistory();
    clearQrHistoryBtn.style.display = 'none';
    showToast('History cleared', 'success');
}

function exportQRCodeHistory() {
    if (qrCodeHistory.length === 0) {
        showToast('No history to export', 'error');
        return;
    }
    
    const dataStr = JSON.stringify(qrCodeHistory);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileName = `qrcode-history-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    showToast('History exported successfully!', 'success');
}

function importQRCodeHistory(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedHistory = JSON.parse(e.target.result);
            
            if (Array.isArray(importedHistory)) {
                qrCodeHistory = [...importedHistory, ...qrCodeHistory];
                // Remove duplicates based on id
                qrCodeHistory = qrCodeHistory.filter((item, index, self) =>
                    index === self.findIndex((t) => t.id === item.id)
                );
                // Keep only the last 10 items
                if (qrCodeHistory.length > 10) {
                    qrCodeHistory = qrCodeHistory.slice(0, 10);
                }
                
                saveQRCodeHistory();
                renderQRCodeHistory();
                showToast('History imported successfully!', 'success');
            } else {
                showToast('Invalid history file format', 'error');
            }
        } catch (error) {
            showToast('Error importing history', 'error');
            console.error(error);
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// Password Generator Functions
function initPasswordGenerator() {
    // Load history from localStorage
    loadPasswordHistory();

    // Event listeners
    passwordLengthInput.addEventListener('input', () => {
        lengthValueEl.textContent = passwordLengthInput.value;
    });

    minRequirementsCheckbox.addEventListener('change', () => {
        requirementsDetails.style.display = minRequirementsCheckbox.checked ? 'block' : 'none';
    });

    generatePasswordBtn.addEventListener('click', generatePassword);
    copyPasswordBtn.addEventListener('click', copyPasswordToClipboard);
    autoSuggestBtn.addEventListener('click', autoSuggestPassword);
    toggleVisibilityBtn.addEventListener('click', togglePasswordVisibility);
    clearPasswordHistoryBtn.addEventListener('click', clearPasswordHistory);
    exportPasswordHistoryBtn.addEventListener('click', exportPasswordHistory);
    importPasswordFileInput.addEventListener('change', importPasswordHistory);

    // Category selection
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            // Toggle active state
            if (item.classList.contains('active')) {
                item.classList.remove('active');
                currentCategory = null;
            } else {
                categoryItems.forEach(cat => cat.classList.remove('active'));
                item.classList.add('active');
                currentCategory = item.getAttribute('data-category');
            }
        });
    });
}

function generatePassword() {
    // Check if at least one character type is selected
    if (!uppercaseCheckbox.checked && !lowercaseCheckbox.checked && 
        !numbersCheckbox.checked && !symbolsCheckbox.checked) {
        showToast('Please select at least one character type', 'error');
        return;
    }

    const length = parseInt(passwordLengthInput.value);
    const useUppercase = uppercaseCheckbox.checked;
    const useLowercase = lowercaseCheckbox.checked;
    const useNumbers = numbersCheckbox.checked;
    const useSymbols = symbolsCheckbox.checked;
    const enforceRequirements = minRequirementsCheckbox.checked;

    let charset = '';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (useUppercase) charset += uppercaseChars;
    if (useLowercase) charset += lowercaseChars;
    if (useNumbers) charset += numberChars;
    if (useSymbols) charset += symbolChars;

    let password = '';

    if (enforceRequirements) {
        // Ensure minimum requirements are met
        if (useUppercase) password += getRandomChar(uppercaseChars);
        if (useLowercase) password += getRandomChar(lowercaseChars);
        if (useNumbers) password += getRandomChar(numberChars);
        if (useSymbols) password += getRandomChar(symbolChars);

        // Fill the rest randomly
        while (password.length < length) {
            password += getRandomChar(charset);
        }

        // Shuffle the password
        password = shuffleString(password);
    } else {
        // Generate completely random password
        for (let i = 0; i < length; i++) {
            password += getRandomChar(charset);
        }
    }

    // Update password display
    passwordDisplay.value = password;
    passwordDisplay.type = 'password';
    toggleVisibilityBtn.innerHTML = '<i class="fas fa-eye"></i>';
    toggleVisibilityBtn.disabled = false;
    copyPasswordBtn.disabled = false;

    // Calculate and update strength
    const strength = calculatePasswordStrength(password);
    updateStrengthMeter(strength);

    // Update requirements indicators if enabled
    if (enforceRequirements) {
        updateRequirementsIndicators(password);
    }

    // Add to history
    const newPassword = {
        id: Date.now().toString(),
        password: password,
        length: length,
        strength: strength,
        category: currentCategory,
        timestamp: Date.now()
    };

    passwordHistory.unshift(newPassword);
    if (passwordHistory.length > 10) {
        passwordHistory.pop();
    }
    
    savePasswordHistory();
    renderPasswordHistory();
    
    showToast('Password generated successfully!', 'success');
}

function getRandomChar(charset) {
    return charset.charAt(Math.floor(Math.random() * charset.length));
}

function shuffleString(str) {
    const array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
}

function autoSuggestPassword() {
    // Enable all character types
    uppercaseCheckbox.checked = true;
    lowercaseCheckbox.checked = true;
    numbersCheckbox.checked = true;
    symbolsCheckbox.checked = true;
    
    // Set length to a secure value (16-20)
    const secureLength = Math.floor(Math.random() * 5) + 16;
    passwordLengthInput.value = secureLength;
    lengthValueEl.textContent = secureLength;
    
    // Enable minimum requirements
    minRequirementsCheckbox.checked = true;
    requirementsDetails.style.display = 'block';
    
    // Generate password
    generatePassword();
}

function calculatePasswordStrength(password) {
    let strength = 0;

    // Length contribution (up to 25%)
    strength += Math.min(25, (password.length / 20) * 25);

    // Character variety contribution (up to 75%)
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^A-Za-z0-9]/.test(password);
    
    if (hasUppercase) strength += 15;
    if (hasLowercase) strength += 15;
    if (hasNumbers) strength += 15;
    if (hasSymbols) strength += 30;

    // Penalize for patterns and repetitions
    const repeatingChars = password.match(/(.)\1{2,}/g);
    if (repeatingChars) {
        strength -= repeatingChars.length * 5;
    }

    const sequences = ['abcdefghijklmnopqrstuvwxyz', '0123456789', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
    sequences.forEach(seq => {
        for (let i = 3; i < seq.length; i++) {
            const pattern = seq.substring(i - 3, i);
            if (password.toLowerCase().includes(pattern)) {
                strength -= 5;
                break;
            }
        }
    });

    return Math.max(0, Math.min(100, Math.round(strength)));
}

function updateStrengthMeter(strength) {
    strengthMeterContainer.style.display = 'block';
    strengthProgress.style.width = `${strength}%`;
    strengthPercentage.textContent = `${strength}%`;

    // Update color and text based on strength
    if (strength < 30) {
        strengthProgress.style.backgroundColor = 'var(--progress-weak)';
        strengthText.textContent = 'Very Weak';
        strengthIcon.innerHTML = '<i class="fas fa-shield-alt text-red-500"></i>';
    } else if (strength < 50) {
        strengthProgress.style.backgroundColor = 'var(--progress-weak)';
        strengthText.textContent = 'Weak';
        strengthIcon.innerHTML = '<i class="fas fa-shield-alt text-red-500"></i>';
    } else if (strength < 70) {
        strengthProgress.style.backgroundColor = 'var(--progress-moderate)';
        strengthText.textContent = 'Moderate';
        strengthIcon.innerHTML = '<i class="fas fa-shield-alt text-yellow-500"></i>';
    } else if (strength < 90) {
        strengthProgress.style.backgroundColor = 'var(--progress-strong)';
        strengthText.textContent = 'Strong';
        strengthIcon.innerHTML = '<i class="fas fa-shield-alt text-green-500"></i>';
    } else {
        strengthProgress.style.backgroundColor = 'var(--progress-very-strong)';
        strengthText.textContent = 'Very Strong';
        strengthIcon.innerHTML = '<i class="fas fa-shield-alt text-green-500"></i>';
    }
}

function updateRequirementsIndicators(password) {
    const reqLength = document.getElementById('req-length');
    const reqUppercase = document.getElementById('req-uppercase');
    const reqLowercase = document.getElementById('req-lowercase');
    const reqNumber = document.getElementById('req-number');
    const reqSymbol = document.getElementById('req-symbol');

    // Check each requirement
    reqLength.classList.toggle('active', password.length >= 8);
    reqUppercase.classList.toggle('active', /[A-Z]/.test(password));
    reqLowercase.classList.toggle('active', /[a-z]/.test(password));
    reqNumber.classList.toggle('active', /[0-9]/.test(password));
    reqSymbol.classList.toggle('active', /[^A-Za-z0-9]/.test(password));
}

function togglePasswordVisibility() {
    if (passwordDisplay.type === 'password') {
        passwordDisplay.type = 'text';
        toggleVisibilityBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        passwordDisplay.type = 'password';
        toggleVisibilityBtn.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

function copyPasswordToClipboard() {
    const password = passwordDisplay.value;
    if (!password) return;

    navigator.clipboard.writeText(password)
        .then(() => {
            showToast('Password copied to clipboard!', 'success');
        })
        .catch(() => {
            showToast('Failed to copy password', 'error');
        });
}

function loadPasswordHistory() {
    const savedHistory = localStorage.getItem('passwordHistory');
    if (savedHistory) {
        passwordHistory = JSON.parse(savedHistory);
        renderPasswordHistory();
    }
}

function savePasswordHistory() {
    localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
    
    // Show/hide clear history button
    clearPasswordHistoryBtn.style.display = passwordHistory.length > 0 ? 'flex' : 'none';
}

function renderPasswordHistory() {
    passwordHistoryContainer.innerHTML = '';
    
    if (passwordHistory.length === 0) {
        passwordHistoryContainer.innerHTML = '<p class="empty-history">No history yet. Generate some passwords!</p>';
        return;
    }
    
    passwordHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.addEventListener('click', () => loadFromPasswordHistory(item));
        
        const strengthIcon = document.createElement('div');
        strengthIcon.className = 'strength-icon';
        
        if (item.strength < 50) {
            strengthIcon.innerHTML = '<i class="fas fa-shield-alt" style="color: var(--progress-weak)"></i>';
        } else if (item.strength < 80) {
            strengthIcon.innerHTML = '<i class="fas fa-shield-alt" style="color: var(--progress-moderate)"></i>';
        } else {
            strengthIcon.innerHTML = '<i class="fas fa-shield-alt" style="color: var(--progress-strong)"></i>';
        }
        
        const content = document.createElement('div');
        content.className = 'history-content';
        
        const passwordText = document.createElement('p');
        passwordText.className = 'history-text font-mono';
        
        // Mask password for security
        const maskedPassword = item.password.substring(0, 3) + 
                              '•'.repeat(Math.min(10, item.password.length - 6)) + 
                              item.password.substring(item.password.length - 3);
        passwordText.textContent = maskedPassword;
        
        const meta = document.createElement('div');
        meta.className = 'history-meta';
        
        const timestamp = document.createElement('span');
        timestamp.className = 'history-timestamp';
        timestamp.innerHTML = `<i class="fas fa-clock"></i> ${formatDate(item.timestamp)}`;
        
        const lengthBadge = document.createElement('span');
        lengthBadge.className = 'history-badge';
        lengthBadge.textContent = `${item.length} chars`;
        
        meta.appendChild(timestamp);
        meta.appendChild(lengthBadge);
        
        if (item.category) {
            const categoryBadge = document.createElement('span');
            categoryBadge.className = 'history-badge';
            categoryBadge.innerHTML = `<i class="fas fa-tag"></i> ${item.category}`;
            meta.appendChild(categoryBadge);
        }
        
        content.appendChild(passwordText);
        content.appendChild(meta);
        
        const actions = document.createElement('div');
        actions.className = 'history-actions';
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'history-btn';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.title = 'Copy password';
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(item.password);
            showToast('Password copied to clipboard!', 'success');
        });
        
        const loadBtn = document.createElement('button');
        loadBtn.className = 'history-btn';
        loadBtn.innerHTML = '<i class="fas fa-check-circle"></i>';
        loadBtn.title = 'Load password';
        loadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            loadFromPasswordHistory(item);
        });
        
        actions.appendChild(copyBtn);
        actions.appendChild(loadBtn);
        
        historyItem.appendChild(strengthIcon);
        historyItem.appendChild(content);
        historyItem.appendChild(actions);
        
        passwordHistoryContainer.appendChild(historyItem);
    });
    
    // Show/hide clear history button
    clearPasswordHistoryBtn.style.display = 'flex';
}

function loadFromPasswordHistory(item) {
    passwordDisplay.value = item.password;
    passwordDisplay.type = 'password';
    toggleVisibilityBtn.innerHTML = '<i class="fas fa-eye"></i>';
    toggleVisibilityBtn.disabled = false;
    copyPasswordBtn.disabled = false;
    
    passwordLengthInput.value = item.length;
    lengthValueEl.textContent = item.length;
    
    // Update strength meter
    updateStrengthMeter(item.strength);
    
    // Set category if available
    if (item.category) {
        categoryItems.forEach(cat => {
            if (cat.getAttribute('data-category') === item.category) {
                categoryItems.forEach(c => c.classList.remove('active'));
                cat.classList.add('active');
                currentCategory = item.category;
            }
        });
    }
    
    showToast('Loaded from history', 'info');
}

function clearPasswordHistory() {
    passwordHistory = [];
    localStorage.removeItem('passwordHistory');
    renderPasswordHistory();
    clearPasswordHistoryBtn.style.display = 'none';
    showToast('History cleared', 'success');
}

function exportPasswordHistory() {
    if (passwordHistory.length === 0) {
        showToast('No history to export', 'error');
        return;
    }
    
    const dataStr = JSON.stringify(passwordHistory);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileName = `password-history-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    showToast('History exported successfully!', 'success');
}

function importPasswordHistory(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedHistory = JSON.parse(e.target.result);
            
            if (Array.isArray(importedHistory)) {
                passwordHistory = [...importedHistory, ...passwordHistory];
                // Remove duplicates based on id
                passwordHistory = passwordHistory.filter((item, index, self) =>
                    index === self.findIndex((t) => t.id === item.id)
                );
                // Keep only the last 10 items
                if (passwordHistory.length > 10) {
                    passwordHistory = passwordHistory.slice(0, 10);
                }
                
                savePasswordHistory();
                renderPasswordHistory();
                showToast('History imported successfully!', 'success');
            } else {
                showToast('Invalid history file format', 'error');
            }
        } catch (error) {
            showToast('Error importing history', 'error');
            console.error(error);
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// Utility Functions
function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString();
}

function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
        
        // Add toast container styles
        const style = document.createElement('style');
        style.textContent = `
            .toast-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
            }
            .toast {
                padding: 12px 16px;
                border-radius: 8px;
                margin-top: 10px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                animation: toast-in 0.3s ease, toast-out 0.3s ease 2.7s forwards;
                max-width: 300px;
            }
            .toast-info {
                background-color: #3b82f6;
                color: white;
            }
            .toast-success {
                background-color: #10b981;
                color: white;
            }
            .toast-error {
                background-color: #ef4444;
                color: white;
            }
            .toast-icon {
                margin-right: 8px;
            }
            @keyframes toast-in {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            @keyframes toast-out {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Add icon based on type
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle toast-icon"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle toast-icon"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle toast-icon"></i>';
    }
    
    toast.innerHTML = `${icon}${message}`;
    toastContainer.appendChild(toast);
    
    // Remove toast after animation
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Declare QRCode
var QRCode = require('qrcodejs');