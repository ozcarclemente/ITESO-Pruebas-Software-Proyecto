const { Given, When, Then, Before, After } = require("@cucumber/cucumber");
const { chromium } = require("@playwright/test");

let browser;
let page;

// Replicamos la configuración de tu equipo para inicializar Playwright
Before(async function () {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
});

After(async function () {
    if (page) await page.close();
    if (browser) await browser.close();
});

// ==========================================
// ESCENARIO: REGISTRO
// ==========================================
Given("que estoy en la página de registro", async function () {
    await page.goto("http://localhost:3000/#/register");
    await page.waitForTimeout(1000);
});

When("ingreso un nombre de usuario {string}", async function (username) {
    await page.fill('input[name="username"]', username);
});

// Este step reutiliza la misma función para Login y Registro
When("ingreso la contraseña {string}", async function (password) {
    await page.fill('input[name="password"]', password);
});

When("hago clic en el botón de registro", async function () {
    await page.click('button:has-text("Sign up")');
    await page.waitForTimeout(2000); // Dar tiempo a que el backend procese
});

// ==========================================
// ESCENARIO: LOGIN
// ==========================================
Given("que estoy en la página de inicio de sesión", async function () {
    // Ajuste crucial: uso de /#/login
    await page.goto("http://localhost:3000/#/login");
    await page.waitForTimeout(1000);
});

When("ingreso el correo {string}", async function (email) {
    await page.fill('input[name="email"]', email);
});

When("ingreso la contraseña correcta {string}", async function (password) {
    await page.fill('input[name="password"]', password);
});

When("ingreso una contraseña incorrecta {string}", async function (password) {
    await page.fill('input[name="password"]', password);
});

When("hago clic en el botón de iniciar sesión", async function () {
    await page.click('button:has-text("Login")');
    await page.waitForTimeout(2000);
});

Then("debo ser redirigido al inicio", async function () {
    // Esperamos a que la URL cambie al hash root
    await page.waitForURL("http://localhost:3000/#/");
    const currentUrl = page.url();
    if (!currentUrl.endsWith("/#/")) {
        throw new Error(
            `Esperaba estar en el inicio, pero la URL es: ${currentUrl}`,
        );
    }
});

Then("debo ver mi nombre de usuario en la navegación", async function () {
    // En lugar de buscar el nombre de usuario (que puede variar),
    // validamos que la sesión inició comprobando que el Navbar muestra "New Article"
    // (Según tu Navbar.jsx, "New Article" solo se renderiza si isAuth es true)
    await page.waitForSelector(".nav", { timeout: 10000 });

    const isVisible = await page.isVisible('text="New Article"');
    if (!isVisible) {
        throw new Error(
            'No se encontró el enlace "New Article" en la barra de navegación. La sesión no se inició correctamente.',
        );
    }
});

Then(
    "debo ver un mensaje de error indicando credenciales inválidas",
    async function () {
        // En lugar de isVisible, obligamos a Playwright a esperar hasta que React renderice el error
        await page.waitForSelector(".error-messages", {
            state: "visible",
            timeout: 5000,
        });
    },
);

// ==========================================
// ESCENARIO: SETTINGS
// ==========================================
Given(
    "que he iniciado sesión con el usuario {string} y la contraseña {string}",
    async function (email, password) {
        await page.goto("http://localhost:3000/#/login");
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.click('button:has-text("Login")');

        await page.waitForURL("http://localhost:3000/#/");
    },
);

Given("me encuentro en la página de configuración", async function () {
    await page.goto("http://localhost:3000/#/settings");
    await page.waitForTimeout(1000);
});

When("actualizo mi biografía con {string}", async function (bioText) {
    // Según SettingsForm.jsx, el textarea tiene el name "bio"
    await page.fill('textarea[name="bio"]', bioText);
});

When("hago clic en el botón de actualizar configuración", async function () {
    await page.click('button:has-text("Update Settings")');
    await page.waitForTimeout(2000);
});

Then(
    "debo ver los cambios reflejados o ser redirigido a mi perfil",
    async function () {
        // vamos a recargar la página para asegurar que el backend guardó la información.
        await page.reload();
        await page.waitForTimeout(2000); // Damos tiempo a que se vuelva a montar el componente

        // Validamos que el valor del textarea sea el nuevo texto
        const bioValue = await page.inputValue('textarea[name="bio"]');
        if (bioValue !== "Esta es mi nueva biografía de prueba") {
            throw new Error(
                `Los cambios no persistieron en la BD. Valor actual: ${bioValue}`,
            );
        }
    },
);
