%%writefile github_project/public/script.js
async function registerUser() {
    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            email,
            password
        })
    });

    const data = await response.json();

    document.getElementById("registerMessage").textContent =
        data.message;
}

async function loginUser() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            email,
            password
        })
    });

    const data = await response.json();

    document.getElementById("loginMessage").textContent =
        data.message;
}

async function getProfile() {
    const response = await fetch("/api/profile", {
        method: "GET",
        credentials: "include"
    });

    const data = await response.json();

    const profile = document.getElementById("profile");

    if (response.ok) {
        profile.innerHTML = `
            <p><strong>ID:</strong> ${data.user.id}</p>
            <p><strong>Name:</strong> ${data.user.name}</p>
            <p><strong>Email:</strong> ${data.user.email}</p>
        `;
    } else {
        profile.textContent = data.message;
    }
}

async function logoutUser() {
    const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
    });

    const data = await response.json();

    document.getElementById("loginMessage").textContent =
        data.message;

    document.getElementById("profile").textContent = "";
}
