const express = require('express');
const puppeteer = require('puppeteer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 3000;

// Endpoint para fichar
app.get('/sesame/fichar', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: '/usr/bin/chromium',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--no-zygote',
        '--single-process'
      ]
    });
    const page = await browser.newPage();

    // Establecer geolocalización en la Ciutat de la Justícia, Barcelona
    await page.setGeolocation({ latitude: 41.36455655237514, longitude: 2.132000007857688 });

    // Accede a la página de login
    await page.goto('https://app.sesametime.com/login', { waitUntil: 'networkidle2' });
    console.log('Accediendo a la página de login');

    // Paso 1: Email
    await page.type('input[name="email"]', process.env.email);
    console.log('Email escrito');

    // Paso 2: Clic en "Siguiente"
    await page.click('#btn-next-login');
    console.log('Click en "Siguiente"');

    // Paso 3: Espera el campo de contraseña
    await page.waitForSelector('#txt-pw-login', { timeout: 10000 });

    // Paso 4: Contraseña
    await page.type('#txt-pw-login', process.env.password);
    console.log('Contraseña escrita');

    // Paso 5: Clic en login
    await page.click('#btn-login-login');
    console.log('Click en "Login"');

    await page.waitForFunction(() => location.href.includes('/employee/portal'), { timeout: 15000 });
    console.log('Redirigido al portal');

  

    // Paso 6: Esperar que cargue alguna de las dos opciones (fichar o salir)
    await page.waitForFunction(() => {
      return (
        document.querySelector('button.bg-feedback-success') ||
        document.querySelector('#button-click-sign-out')
      );
    }, { timeout: 15000 });

    // Paso 7: Determinar si debe fichar o desfichar
    const yaFichado = await page.$('#button-click-sign-out');
    const botonEntrar = await page.$('button.bg-feedback-success');

    // Si no está fichado, hacer clic en "Fichar"
    if (botonEntrar) {
      await botonEntrar.click();
      console.log('Fichaje realizado con éxito');
      await browser.close();
      return res.send('Fichado correctamente');
    }

    // Si ya está fichado, no hace nada
    if (yaFichado) {
      console.log('Ya estás fichado, no se hace nada.');
      await browser.close();
      return res.send('Ya estabas fichado. No se ha hecho nada.');
    }

    throw new Error('No se encontró el botón de fichaje ni el botón de salir');

  } catch (err) {
    console.error('Error al fichar:', err);
    res.status(500).send('Error al fichar');
  }
});

// Endpoint para desfichar
app.get('/sesame/desfichar', async (req, res) => {
  try {

    const browser = await puppeteer.launch({
        headless: 'new', 
        executablePath: '/usr/bin/chromium',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--no-zygote',
          '--single-process'
        ]
      });
    
      const context = browser.defaultBrowserContext();
      await context.overridePermissions('https://app.sesametime.com', ['geolocation']);
    
      const page = await browser.newPage();
    
      // Establece una ubicación falsa (opcional)
      await page.setGeolocation({ latitude: 41.36455655237514, longitude: 2.132000007857688  }); // Madrid, por ejemplo
    
      // Navega a la web
      await page.goto('https://app.sesametime.com/employee/portal', {
        waitUntil: 'networkidle2',
      });

  
    console.log('Accediendo a la página de login');

    // Paso 1: Email
    await page.type('input[name="email"]', process.env.email);
    console.log('Email escrito');

    // Paso 2: Clic en "Siguiente"
    await page.click('#btn-next-login');
    console.log('Click en "Siguiente"');

    // Paso 3: Espera el campo de contraseña
    await page.waitForSelector('#txt-pw-login', { timeout: 10000 });

    // Paso 4: Contraseña
    await page.type('#txt-pw-login', process.env.password);
    console.log('Contraseña escrita');

    // Paso 5: Clic en login
    await page.click('#btn-login-login');
    console.log('Click en "Login"');

    await page.waitForFunction(() => location.href.includes('/employee/portal'), { timeout: 15000 });
    console.log('Redirigido al portal');

    // Paso 6: Esperar que aparezca el botón de "Salir"
    await page.waitForSelector('#button-click-sign-out', { timeout: 10000 });

    // Paso 7: Hacer clic en "Salir" para desfichar
    const botonSalir = await page.$('#button-click-sign-out');
    if (botonSalir) {
      await botonSalir.click();
      console.log('Desfichaje realizado con éxito');
      await browser.close();
      return res.send('Desfichado correctamente');
    } else {
      console.log('No estás fichado. No se puede desfichar.');
      await browser.close();
      return res.send('No estás fichado. No se puede desfichar.');
    }

  } catch (err) {
    console.error('Error al desfichar:', err);
    res.status(500).send('Error al desfichar');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
