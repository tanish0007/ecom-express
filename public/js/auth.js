const spanText = document.querySelector(".span-text");
const toggleBtn = document.querySelector(".toggle-btn");
const heroPage = document.querySelector(".hero-page");
let showSignUpForm = false;
let users = [];

function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email));
}

async function makeAPIRequest (url, data){
    try{
        const response = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
        return await response.json();
    }catch( error ){
        console.log(`API request failed: ${error}`);
        return {
            success: false,
            error: 'Network error'
        }
    }
}

function disableFormButtons() {
    const buttons = document.querySelectorAll('.toggle-btn, .btn-as-text, .api-req-btn');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.8';
        btn.style.cursor = 'not-allowed';
    });
}

function enableFormButtons() {
    const buttons = document.querySelectorAll('.toggle-btn, .btn-as-text, .api-req-btn');
    buttons.forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';    
        btn.style.cursor = 'pointer';
    });
}

function createLoginForm() {
    heroPage.innerHTML = '';

    const form = document.createElement("form");
    form.className = "user-form";
    const loginHeading = document.createElement("h2");
    loginHeading.textContent = "Welcome Back";
    form.appendChild(loginHeading);
    const emailLabel = document.createElement("label");
    emailLabel.textContent = "Email*";
    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.id = "email";
    emailInput.name = "email";
    emailInput.autocomplete = "email";
    emailInput.required = true;
    emailInput.placeholder = "user123@example.com";
    emailLabel.appendChild(emailInput);
    form.appendChild(emailLabel);
    const passwordLabel = document.createElement("label");
    passwordLabel.textContent = "Password*";
    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.id = "password";
    passwordInput.name = "password";
    passwordInput.autocomplete = "current-password";
    passwordInput.required = true;
    passwordInput.placeholder = "********";
    passwordLabel.appendChild(passwordInput);
    form.appendChild(passwordLabel);
    const errorText = document.createElement("span");
    errorText.className = "error-text";
    form.appendChild(errorText);
    const loginBtn = document.createElement("button");
    loginBtn.type = "submit";
    loginBtn.className = "button";
    loginBtn.classList.add("api-req-btn");
    loginBtn.textContent = "Login";
    form.appendChild(loginBtn);
    const toggleText = document.createElement("div");
    toggleText.className = "toggle-text";
    toggleText.innerHTML = 'Don\'t have an account? <span class="btn-as-text">Signup</span>';
    heroPage.appendChild(toggleText);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorText.textContent = "";
        
        if (!emailInput.value || !passwordInput.value) {
            errorText.textContent = "Please fill all fields";
            return;
        }

        if (!validateEmail(emailInput.value)) {
            errorText.textContent = "Please enter a valid email";
            return;
        }

        disableFormButtons();
        loginBtn.textContent = "Logging in...";

        const response = await makeAPIRequest('http://localhost:6565/api/auth/login', {
            email: emailInput.value,
            password: passwordInput.value
        })
        console.log(response);
        
        if(response && response.success){
            errorText.textContent = response.message;
            errorText.style.color = 'green';
            
            localStorage.setItem("loggedInUser", JSON.stringify(response.user));

            if(response.user.isAdmin){
                window.location.href = 'admin.html';
            }else {
                window.location.href = 'user.html';
            }
        }else {
            errorText.textContent = response.error;
            errorText.style.color = "red";
            enableFormButtons();
            loginBtn.textContent = "Login";
        }
    });

    heroPage.insertBefore(form, toggleText);
    document.querySelector(".btn-as-text").addEventListener("click", toggleForms);
}

function createSignupForm() {
    heroPage.innerHTML = '';

    const form = document.createElement("form");
    form.className = "user-form";
    const signupHeading = document.createElement("h2");
    signupHeading.textContent = "Create Your Account";
    form.appendChild(signupHeading);
    const nameLabel = document.createElement("label");
    nameLabel.textContent = "Username*";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = "username";
    nameInput.name = "username";
    nameInput.autocomplete = "name";
    nameInput.required = true;
    nameInput.placeholder = "John Doe";
    nameLabel.appendChild(nameInput);
    form.appendChild(nameLabel);
    const emailLabel = document.createElement("label");
    emailLabel.textContent = "Email*";
    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.id = "email";
    emailInput.name = "email";
    emailInput.autocomplete = "email";
    emailInput.required = true;
    emailInput.placeholder = "user123@gmail.com";
    emailLabel.appendChild(emailInput);
    form.appendChild(emailLabel);
    const passwordLabel = document.createElement("label");
    passwordLabel.textContent = "Password*";
    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.id = "password";
    passwordInput.name = "password";
    passwordInput.autocomplete = "new-password";
    passwordInput.required = true;
    passwordInput.placeholder = "********";
    passwordLabel.appendChild(passwordInput);
    form.appendChild(passwordLabel);
    const adminLabel = document.createElement("label");
    adminLabel.className = "checkbox-label";
    const adminCheckbox = document.createElement("input");
    adminCheckbox.type = "checkbox";
    adminCheckbox.id = "isAdmin";
    adminCheckbox.name = "isAdmin";
    adminLabel.appendChild(adminCheckbox);
    adminLabel.appendChild(document.createTextNode(" Register as admin"));
    form.appendChild(adminLabel);
    const errorText = document.createElement("span");
    errorText.className = "error-text";
    form.appendChild(errorText);
    const signupBtn = document.createElement("button");
    signupBtn.type = "submit";
    signupBtn.className = "button";
    signupBtn.classList.add("api-req-btn");
    signupBtn.textContent = "Register";
    form.appendChild(signupBtn);
    const toggleText = document.createElement("div");
    toggleText.className = "toggle-text";
    toggleText.innerHTML = 'Already have an account? <span class="btn-as-text">Login</span>';
    heroPage.appendChild(toggleText);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorText.textContent = "";

        if (!nameInput.value || !emailInput.value || !passwordInput.value) {
            errorText.textContent = "Please fill all fields";
            return;
        }

        if (!validateEmail(emailInput.value)) {
            errorText.textContent = "Please enter a valid email";
            return;
        }

        disableFormButtons();
        signupBtn.textContent = "Registering...";

        const response = await makeAPIRequest("http://localhost:6565/api/auth/signup", {
            username: nameInput.value,
            email: emailInput.value,
            password: passwordInput.value,
            isAdmin: adminCheckbox.checked
        });

        if (response && response.success) {
            signupBtn.textContent = "Registration Successful";
            form.reset();
            errorText.textContent = response.message;
            errorText.style.color = "green";

            const loginResponse = await makeAPIRequest('http://localhost:6565/api/auth/login', {
                email: emailInput.value,
                password: passwordInput.value
            });

            signupBtn.textContent = "Logging in...";
            if(loginResponse && loginResponse.success) {
                localStorage.setItem("loggedInUser", JSON.stringify(loginResponse.user));
                
                if(loginResponse.user.isAdmin) {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'user.html';
                }
            } else {
                showSignUpForm = false;
                toggleForms();
                enableFormButtons();
                signupBtn.textContent = "Register";
            }
        } else {
            errorText.textContent = response.error;
            errorText.style.color = "red";
            enableFormButtons();
            signupBtn.textContent = "Register";
        }
        signupBtn.textContent = "Register";
    });

    heroPage.insertBefore(form, toggleText);
    document.querySelector(".btn-as-text").addEventListener("click", toggleForms);
}

function toggleForms() {    
    showSignUpForm = !showSignUpForm;
    if (showSignUpForm) {
        spanText.textContent = "Already have an account?";
        toggleBtn.textContent = "Login";
        createSignupForm();
    } else {
        spanText.textContent = "Don't have an account?";
        toggleBtn.textContent = "Signup";
        createLoginForm();
    }
}

function checkLoggedInUser() {
    const user = localStorage.getItem("loggedInUser");
    if (user) {
        const userData = JSON.parse(user);
        if (userData.isAdmin) {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'user.html';
        }
        return true;
    }
    return false;
}

window.addEventListener('focus', () => {
    if (localStorage.getItem("loggedInUser")) {
        window.location.reload();
    }
});

window.addEventListener("DOMContentLoaded", () => {
    if (!checkLoggedInUser()) {
        spanText.textContent = "Don't have an account?";
        toggleBtn.textContent = "Signup";
        createLoginForm();
        toggleBtn.addEventListener("click", toggleForms);
    }
});