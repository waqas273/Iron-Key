
// Iron Key - Password Manager
// Main JavaScript file

// Constants
const STORAGE_KEYS = {
  MASTER_PASSWORD: 'ironkey_master_password',
  PIN: 'ironkey_pin',
  PASSWORDS: 'ironkey_passwords',
  SETUP_COMPLETE: 'ironkey_setup_complete'
};

const SECURITY_QUOTES = [
  "Your digital fortress in a connected world",
  "Security is not a product, but a process",
  "A strong password is your first line of defense",
  "Trust, but verify",
  "The password to security is awareness",
  "Simple passwords lead to complicated problems",
  "Your vault is secure, your secrets are safe",
  "Better safe than sorry",
  "Keep calm and encrypt everything",
  "Think before you click"
];

// DOM Elements
const elements = {
  screens: {
    splash: document.getElementById('splash-screen'),
    setup: document.getElementById('setup-screen'),
    verifyPin: document.getElementById('verify-pin-screen'),
    dashboard: document.getElementById('dashboard-screen'),
    passwordsList: document.getElementById('passwords-list-screen'),
    addPassword: document.getElementById('add-password-screen'),
    passwordDetails: document.getElementById('password-details-screen'),
    keyMenu: document.getElementById('key-menu-screen'),
    changeMasterPassword: document.getElementById('change-master-password-screen'),
    changePin: document.getElementById('change-pin-screen')
  },
  setupSteps: {
    masterPassword: document.getElementById('setup-master-password'),
    pin: document.getElementById('setup-pin'),
    complete: document.getElementById('setup-complete')
  },
  forms: {
    addPassword: document.getElementById('add-password-form'),
    changeMasterPassword: document.getElementById('change-master-password-form'),
    changePin: document.getElementById('change-pin-form')
  },
  pinInput: {
    setup: document.querySelectorAll('.pin-digit'),
    verify: document.querySelectorAll('.verify-pin-digit'),
    changePin: document.querySelectorAll('.new-pin-digit')
  },
  modals: {
    resetConfirmation: document.getElementById('reset-confirmation-modal')
  },
  toast: document.getElementById('toast'),
  passwordsList: document.getElementById('passwords-list'),
  noPasswordsMessage: document.getElementById('no-passwords-message')
};

// App State
const appState = {
  setupStep: 0,
  currentScreen: null,
  previousScreen: null,
  currentPasswordId: null,
  currentAction: null,
  pinVerificationCallback: null,
  isSetupComplete: false,
  passwords: []
};

// Utility functions
function generateRandomId() {
  return Math.random().toString(36).substr(2, 9);
}

function showToast(type, message, duration = 3000) {
  const toast = elements.toast;
  const toastIcon = document.getElementById('toast-icon');
  const toastMessage = document.querySelector('.toast-message');

  // Set message and icon
  toastMessage.textContent = message;
  toast.className = 'toast';

  // Add type class and icon
  switch (type) {
    case 'success':
      toast.classList.add('success');
      toastIcon.className = 'fas fa-check-circle';
      break;
    case 'error':
      toast.classList.add('error');
      toastIcon.className = 'fas fa-exclamation-circle';
      break;
    case 'warning':
      toast.classList.add('warning');
      toastIcon.className = 'fas fa-exclamation-triangle';
      break;
    default: // info
      toast.classList.add('info');
      toastIcon.className = 'fas fa-info-circle';
  }

  // Show toast
  toast.classList.add('show');

  // Hide toast after duration
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

function showScreen(screenName) {
  // Hide all screens
  for (const key in elements.screens) {
    if (elements.screens[key] !== null) {
      elements.screens[key].classList.remove('active');
    }
  }

  // Show requested screen
  if (elements.screens[screenName]) {
    appState.previousScreen = appState.currentScreen;
    appState.currentScreen = screenName;
    elements.screens[screenName].classList.add('active');
  }
}

function goBack() {
  if (appState.previousScreen) {
    showScreen(appState.previousScreen);
  } else {
    showScreen('dashboard');
  }
}

// Password strength checker
function checkPasswordStrength(password) {
  const strengthBar = document.querySelector('.password-strength-meter .strength-bar');
  const strengthText = document.getElementById('password-strength-text');
  let strength = 0;
  
  if (password.length === 0) {
    strengthBar.style.width = '0%';
    strengthBar.style.backgroundColor = 'transparent';
    strengthText.textContent = 'Password strength: Not set';
    return 0;
  }

  // Criteria
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;

  // Calculate percentage
  const percent = (strength / 6) * 100;
  strengthBar.style.width = percent + '%';

  // Set color and text
  if (strength < 2) {
    strengthBar.style.backgroundColor = '#f44336'; // Very weak
    strengthText.textContent = 'Password strength: Very weak';
  } else if (strength < 3) {
    strengthBar.style.backgroundColor = '#ff9800'; // Weak
    strengthText.textContent = 'Password strength: Weak';
  } else if (strength < 4) {
    strengthBar.style.backgroundColor = '#ffeb3b'; // Medium
    strengthText.textContent = 'Password strength: Medium';
  } else if (strength < 6) {
    strengthBar.style.backgroundColor = '#4caf50'; // Strong
    strengthText.textContent = 'Password strength: Strong';
  } else {
    strengthBar.style.backgroundColor = '#2e7d32'; // Very strong
    strengthText.textContent = 'Password strength: Very strong';
  }

  return strength;
}

// Check if passwords match
function checkPasswordsMatch(password, confirmPassword) {
  const matchText = document.getElementById('password-match-text');
  
  if (confirmPassword.length === 0) {
    matchText.textContent = '';
    return false;
  }
  
  if (password === confirmPassword) {
    matchText.textContent = 'Passwords match';
    matchText.style.color = 'var(--primary-green)';
    return true;
  } else {
    matchText.textContent = 'Passwords do not match';
    matchText.style.color = 'var(--danger-color)';
    return false;
  }
}

// Generate a strong random password
function generatePassword(length = 16) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}|:<>?";
  let password = "";
  
  // Ensure at least one of each character type
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
  password += "0123456789"[Math.floor(Math.random() * 10)];
  password += "!@#$%^&*()_+{}|:<>?"[Math.floor(Math.random() * 20)];
  
  // Fill the rest of the password
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password characters
  password = password.split('').sort(() => 0.5 - Math.random()).join('');
  
  return password;
}

// Setup PIN Input functionality
function setupPINInputs(pinInputElements) {
  pinInputElements.forEach((input, index) => {
    input.addEventListener('input', function(e) {
      this.value = this.value.replace(/[^0-9]/g, '');
      
      // Move to next input when a digit is entered
      if (this.value && index < pinInputElements.length - 1) {
        pinInputElements[index + 1].focus();
      }
    });
    
    input.addEventListener('keydown', function(e) {
      // Move to previous input on backspace if current input is empty
      if (e.key === 'Backspace' && !this.value && index > 0) {
        pinInputElements[index - 1].focus();
      }
    });
  });
}

// Save passwords to localStorage
function savePasswords() {
  localStorage.setItem(STORAGE_KEYS.PASSWORDS, JSON.stringify(appState.passwords));
}

// Load passwords from localStorage
function loadPasswords() {
  const savedPasswords = localStorage.getItem(STORAGE_KEYS.PASSWORDS);
  if (savedPasswords) {
    try {
      appState.passwords = JSON.parse(savedPasswords);
    } catch (e) {
      console.error("Error loading passwords:", e);
      appState.passwords = [];
    }
  }
}

// Update passwords list in the passwords list screen
function updatePasswordsList() {
  const passwordsList = elements.passwordsList;
  const noPasswordsMessage = elements.noPasswordsMessage;
  
  // Clear current list
  passwordsList.innerHTML = '';
  
  if (!appState.passwords || appState.passwords.length === 0) {
    // Show no passwords message if there are no passwords
    noPasswordsMessage.style.display = 'block';
    passwordsList.style.display = 'none';
    return;
  }
  
  // Hide no passwords message and show the list
  noPasswordsMessage.style.display = 'none';
  passwordsList.style.display = 'block';
  
  // Add each password to the list
  appState.passwords.forEach(password => {
    const listItem = document.createElement('li');
    listItem.className = 'password-item';
    listItem.dataset.id = password.id;
    
    listItem.innerHTML = `
      <div class="password-item-header">
        <span class="site-name">${password.website}</span>
      </div>
      <div class="password-details">${password.email}</div>
    `;
    
    listItem.addEventListener('click', () => {
      appState.currentPasswordId = password.id;
      showPasswordDetails(password);
    });
    
    passwordsList.appendChild(listItem);
  });
}

// Show password details
function showPasswordDetails(password) {
  document.getElementById('details-title').textContent = password.website;
  document.getElementById('details-website').textContent = password.website;
  document.getElementById('details-email').textContent = password.email || '';

  // Always start with hidden password
  const passwordElement = document.getElementById('details-password');
  const toggleBtn = document.getElementById('toggle-password-view-btn');
  passwordElement.textContent = '••••••••';
  passwordElement.dataset.hidden = 'true';
  toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
  
  // Store the actual password in a data attribute
  passwordElement.dataset.password = password.password;
  
  showScreen('passwordDetails');
}

// Toggle password visibility
function togglePasswordVisibility(passwordElement, toggleBtn) {
  if (passwordElement.dataset.hidden === 'true') {
    passwordElement.textContent = passwordElement.dataset.password;
    passwordElement.dataset.hidden = 'false';
    toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
  } else {
    passwordElement.textContent = '••••••••';
    passwordElement.dataset.hidden = 'true';
    toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
  }
}

// Copy text to clipboard
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .then(() => {
        showToast('success', 'Copied to clipboard');
      })
      .catch(err => {
        showToast('error', 'Failed to copy: ' + err);
      });
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      showToast(successful ? 'success' : 'error', 
                successful ? 'Copied to clipboard' : 'Failed to copy');
    } catch (err) {
      showToast('error', 'Failed to copy: ' + err);
    }
    
    document.body.removeChild(textArea);
  }
}

// Export data as JSON file
function exportData() {
  // Get master password and PIN
  const masterPassword = localStorage.getItem(STORAGE_KEYS.MASTER_PASSWORD);
  const pin = localStorage.getItem(STORAGE_KEYS.PIN);
  
  // Create export data structure
  const exportData = {
    master_password: masterPassword ? "****" : "",
    pin: pin ? "****" : "",
    passwords: appState.passwords
  };
  
  // Convert to JSON string
  const jsonString = JSON.stringify(exportData, null, 2);
  
  // Create blob from JSON string
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ironkey_export_${new Date().toISOString().split('T')[0]}.json`;
  
  // Trigger download
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
  
  showToast('success', 'Data exported successfully');
}

// Reset application
function resetApp() {
  localStorage.removeItem(STORAGE_KEYS.MASTER_PASSWORD);
  localStorage.removeItem(STORAGE_KEYS.PIN);
  localStorage.removeItem(STORAGE_KEYS.PASSWORDS);
  localStorage.removeItem(STORAGE_KEYS.SETUP_COMPLETE);
  
  appState.passwords = [];
  appState.isSetupComplete = false;
  
  // Reset all forms
  document.getElementById('master-password-input').value = '';
  document.getElementById('confirm-master-password-input').value = '';
  elements.pinInput.setup.forEach(input => input.value = '');
  
  // Also reset other input fields that might cause bugs
  if (document.getElementById('confirm-pin-input')) {
    document.getElementById('confirm-pin-input').value = '';
  }
  
  elements.pinInput.verify.forEach(input => input.value = '');
  
  // Show setup screen
  initializeApp();
  
  // Show toast
  showToast('success', 'App reset successful');
}

// Verify PIN
function verifyPIN(enteredPIN, callback) {
  const savedPIN = localStorage.getItem(STORAGE_KEYS.PIN);
  
  if (enteredPIN === savedPIN) {
    if (callback) callback(true);
    return true;
  } else {
    showToast('error', 'Incorrect PIN');
    if (callback) callback(false);
    return false;
  }
}

// Get PIN from verify screen
function getVerifyPIN() {
  let pin = '';
  elements.pinInput.verify.forEach(input => {
    pin += input.value;
  });
  return pin;
}

// Reset verify PIN inputs
function resetVerifyPIN() {
  elements.pinInput.verify.forEach(input => {
    input.value = '';
  });
  elements.pinInput.verify[0].focus();
  document.getElementById('pin-error').textContent = '';
}

// Show PIN verification screen
function showVerifyPIN(actionToPerform, callback) {
  appState.currentAction = actionToPerform;
  appState.pinVerificationCallback = callback;
  
  resetVerifyPIN();
  showScreen('verifyPin');
  
  // Focus the first PIN digit
  setTimeout(() => {
    elements.pinInput.verify[0].focus();
  }, 300);
}

// Verify Master Password
function verifyMasterPassword(enteredPassword) {
  const savedPassword = localStorage.getItem(STORAGE_KEYS.MASTER_PASSWORD);
  return enteredPassword === savedPassword;
}

// Show random security quote
function showRandomQuote() {
  const quoteElement = document.getElementById('security-quote');
  const randomIndex = Math.floor(Math.random() * SECURITY_QUOTES.length);
  quoteElement.textContent = SECURITY_QUOTES[randomIndex];
  
  // Change quote every 10 seconds
  setTimeout(showRandomQuote, 10000);
}

// Initialize app
function initializeApp() {
  // Check if setup is complete
  appState.isSetupComplete = localStorage.getItem(STORAGE_KEYS.SETUP_COMPLETE) === 'true';
  
  // Show splash screen first
  showScreen('splash');
  
  // Load passwords
  loadPasswords();
  
  // After splash screen animation
  setTimeout(() => {
    if (appState.isSetupComplete) {
      showScreen('dashboard');
      showRandomQuote();
    } else {
      showScreen('setup');
      elements.setupSteps.masterPassword.classList.add('active');
    }
  }, 2500);
}

// Setup Event Listeners
function setupEventListeners() {
  // Setup pin inputs
  setupPINInputs(elements.pinInput.setup);
  setupPINInputs(elements.pinInput.verify);
  setupPINInputs(elements.pinInput.changePin);
  
  // Password strength checker
  document.getElementById('master-password-input').addEventListener('input', function() {
    const strength = checkPasswordStrength(this.value);
    
    // Check if passwords match when both fields have values
    const confirmPassword = document.getElementById('confirm-master-password-input').value;
    if (confirmPassword) {
      checkPasswordsMatch(this.value, confirmPassword);
    }
  });
  
  document.getElementById('confirm-master-password-input').addEventListener('input', function() {
    const masterPassword = document.getElementById('master-password-input').value;
    checkPasswordsMatch(masterPassword, this.value);
  });
  
  // Master Password setup
  document.getElementById('set-master-password-btn').addEventListener('click', function() {
    const password = document.getElementById('master-password-input').value;
    const confirmPassword = document.getElementById('confirm-master-password-input').value;
    
    if (!password) {
      showToast('error', 'Please enter a master password');
      return;
    }
    
    if (password !== confirmPassword) {
      showToast('error', 'Passwords do not match');
      return;
    }
    
    const strength = checkPasswordStrength(password);
    if (strength < 3) {
      showToast('warning', 'Your password is weak. Consider using a stronger password.');
    }
    
    // Save master password
    localStorage.setItem(STORAGE_KEYS.MASTER_PASSWORD, password);
    
    // Move to PIN setup
    elements.setupSteps.masterPassword.classList.remove('active');
    elements.setupSteps.pin.classList.add('active');
  });
  
  // PIN setup
  document.getElementById('set-pin-btn').addEventListener('click', function() {
    let pin = '';
    elements.pinInput.setup.forEach(input => {
      pin += input.value;
    });
    
    const confirmPin = document.getElementById('confirm-pin-input').value;
    
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      showToast('error', 'Please enter a valid 4-digit PIN');
      return;
    }
    
    if (pin !== confirmPin) {
      showToast('error', 'PINs do not match');
      return;
    }
    
    // Save PIN
    localStorage.setItem(STORAGE_KEYS.PIN, pin);
    localStorage.setItem(STORAGE_KEYS.SETUP_COMPLETE, 'true');
    appState.isSetupComplete = true;
    
    // Move to setup complete
    elements.setupSteps.pin.classList.remove('active');
    elements.setupSteps.complete.classList.add('active');
  });
  
  // Complete setup
  document.getElementById('goto-dashboard-btn').addEventListener('click', function() {
    showScreen('dashboard');
    showRandomQuote();
  });
  
  // PIN verification
  document.getElementById('verify-pin-btn').addEventListener('click', function() {
    const pin = getVerifyPIN();
    
    if (pin.length !== 4) {
      document.getElementById('pin-error').textContent = 'Please enter a 4-digit PIN';
      return;
    }
    
    if (verifyPIN(pin)) {
      document.getElementById('pin-error').textContent = '';
      
      // Execute callback if exists
      if (appState.pinVerificationCallback) {
        appState.pinVerificationCallback(true);
      }
      
      // Handle specific actions
      switch (appState.currentAction) {
        case 'viewPasswords':
          showScreen('passwordsList');
          updatePasswordsList();
          break;
        case 'addPassword':
          // Clear add password form
          document.getElementById('website-input').value = '';
          document.getElementById('email-input').value = '';
          document.getElementById('password-input').value = '';
          showScreen('addPassword');
          break;
        case 'exportData':
          showScreen('dashboard');
          exportData();
          break;
        case 'deletePassword':
          // Find and remove the password
          const index = appState.passwords.findIndex(p => p.id === appState.currentPasswordId);
          if (index !== -1) {
            appState.passwords.splice(index, 1);
            savePasswords();
            showToast('success', 'Password deleted');
            showScreen('passwordsList');
            updatePasswordsList();
          }
          break;
        default:
          showScreen('dashboard');
      }
    } else {
      document.getElementById('pin-error').textContent = 'Incorrect PIN';
      
      // Clear PIN fields
      elements.pinInput.verify.forEach(input => {
        input.value = '';
      });
      elements.pinInput.verify[0].focus();
    }
  });
  
  // Cancel PIN verification
  document.getElementById('cancel-verify-pin-btn').addEventListener('click', function() {
    resetVerifyPIN();
    goBack();
  });
  
  // Dashboard Actions
  document.getElementById('add-password-btn').addEventListener('click', function() {
    showVerifyPIN('addPassword');
  });
  
  document.getElementById('view-passwords-btn').addEventListener('click', function() {
    showVerifyPIN('viewPasswords');
  });
  
  // Key Menu Button
  document.querySelector('.key-menu-button').addEventListener('click', function() {
    showScreen('keyMenu');
  });
  
  // Add Password Form
  elements.forms.addPassword.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const website = document.getElementById('website-input').value.trim();
    const email = document.getElementById('email-input').value.trim();
    const password = document.getElementById('password-input').value;
    
    if (!website || !email || !password) {
      showToast('error', 'Please fill all fields');
      return;
    }
    
    // Create new password object
    const newPassword = {
      id: generateRandomId(),
      website: website,
      email: email,
      password: password
    };
    
    // Add to passwords array
    appState.passwords.push(newPassword);
    
    // Save to localStorage
    savePasswords();
    
    // Show success message
    showToast('success', 'Password saved');
    
    // Return to dashboard
    showScreen('dashboard');
  });
  
  // Generate Password Button
  document.getElementById('generate-password-btn').addEventListener('click', function() {
    const passwordInput = document.getElementById('password-input');
    const generatedPassword = generatePassword();
    passwordInput.value = generatedPassword;
    
    // Show strength of generated password
    checkPasswordStrength(generatedPassword);
    
    // Brief animation for the button
    this.classList.add('pulse');
    setTimeout(() => {
      this.classList.remove('pulse');
    }, 500);
  });
  
  // Password Visibility Toggle
  document.querySelector('.toggle-password-btn').addEventListener('click', function() {
    const passwordField = document.getElementById('password-input');
    if (passwordField.type === 'password') {
      passwordField.type = 'text';
      this.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
      passwordField.type = 'password';
      this.innerHTML = '<i class="fas fa-eye"></i>';
    }
  });
  
  // Cancel Add Password
  document.getElementById('cancel-add-password').addEventListener('click', function() {
    showScreen('dashboard');
  });
  
  // Password Details Actions
  document.getElementById('toggle-password-view-btn').addEventListener('click', function() {
    const passwordElement = document.getElementById('details-password');
    togglePasswordVisibility(passwordElement, this);
  });
  
  document.getElementById('copy-password-btn').addEventListener('click', function() {
    const password = document.getElementById('details-password').dataset.password;
    copyToClipboard(password);
  });
  
  document.getElementById('copy-email-btn').addEventListener('click', function() {
    const email = document.getElementById('details-email').textContent;
    copyToClipboard(email);
  });
  
  document.getElementById('delete-password-btn').addEventListener('click', function() {
    // Verify PIN before deleting
    showVerifyPIN('deletePassword');
  });
  
  document.getElementById('back-to-passwords-btn').addEventListener('click', function() {
    showScreen('passwordsList');
    updatePasswordsList();
  });
  
  // Back to Dashboard from Passwords List
  document.getElementById('back-to-dashboard-btn').addEventListener('click', function() {
    showScreen('dashboard');
  });
  
  // Key Menu Actions
  document.getElementById('change-master-password').addEventListener('click', function() {
    showScreen('changeMasterPassword');
  });
  
  document.getElementById('change-pin').addEventListener('click', function() {
    showScreen('changePin');
  });
  
  document.getElementById('export-data').addEventListener('click', function() {
    showVerifyPIN('exportData');
  });
  
  document.getElementById('reset-app').addEventListener('click', function() {
    elements.modals.resetConfirmation.classList.add('active');
  });
  
  // Change Master Password Form
  elements.forms.changeMasterPassword.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-master-password').value;
    const newPassword = document.getElementById('new-master-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-master-password').value;
    
    if (!verifyMasterPassword(currentPassword)) {
      showToast('error', 'Current master password is incorrect');
      return;
    }
    
    if (!newPassword) {
      showToast('error', 'Please enter a new master password');
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      showToast('error', 'New passwords do not match');
      return;
    }
    
    // Update master password
    localStorage.setItem(STORAGE_KEYS.MASTER_PASSWORD, newPassword);
    
    // Show success message
    showToast('success', 'Master password updated');
    
    // Return to dashboard
    showScreen('dashboard');
  });
  
  // Change PIN Form
  elements.forms.changePin.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const currentPin = document.getElementById('current-pin').value;
    
    let newPin = '';
    elements.pinInput.changePin.forEach(input => {
      newPin += input.value;
    });
    
    const confirmNewPin = document.getElementById('confirm-new-pin').value;
    
    if (!verifyPIN(currentPin)) {
      showToast('error', 'Current PIN is incorrect');
      return;
    }
    
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      showToast('error', 'Please enter a valid 4-digit PIN');
      return;
    }
    
    if (newPin !== confirmNewPin) {
      showToast('error', 'New PINs do not match');
      return;
    }
    
    // Update PIN
    localStorage.setItem(STORAGE_KEYS.PIN, newPin);
    
    // Show success message
    showToast('success', 'PIN updated');
    
    // Return to dashboard
    showScreen('dashboard');
  });
  
  // Reset Confirmation Modal
  document.getElementById('confirm-reset-btn').addEventListener('click', function() {
    const masterPassword = document.getElementById('reset-master-password').value;
    
    if (verifyMasterPassword(masterPassword)) {
      resetApp();
      elements.modals.resetConfirmation.classList.remove('active');
    } else {
      showToast('error', 'Incorrect master password');
    }
  });
  
  document.getElementById('cancel-reset-btn').addEventListener('click', function() {
    elements.modals.resetConfirmation.classList.remove('active');
    document.getElementById('reset-master-password').value = '';
  });
  
  // Close Buttons
  document.querySelectorAll('.close-btn').forEach(button => {
    button.addEventListener('click', function() {
      goBack();
    });
  });
  
  // Cancel Change buttons
  document.querySelectorAll('.cancel-change').forEach(button => {
    button.addEventListener('click', function() {
      showScreen('keyMenu');
    });
  });
  
  // Footer Actions
  document.querySelectorAll('.footer-icon').forEach(icon => {
    icon.addEventListener('click', function() {
      const action = this.dataset.action;
      
      switch (action) {
        case 'support':
          showToast('info', 'Contact support: +92327-6420741');
          break;
        case 'social':
          showToast('info', 'Follow us on Instagram: @waqas_m273');
          break;
        case 'location':
          showToast('info', 'Developed in GIFT Universty, Gujrawala');
          break;
        case 'help':
          showToast('info', 'Need help? Visit wa8090666@gmail.com');
          break;
        case 'export':
          showVerifyPIN('exportData');
          break;
        case 'reset':
          elements.modals.resetConfirmation.classList.add('active');
          break;
      }
    });
  });
}

// Initialize the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  initializeApp();
});
