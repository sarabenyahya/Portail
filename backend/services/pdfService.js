const path = require("path");
const fs = require("fs").promises;
const Handlebars = require("handlebars");
const puppeteer = require("puppeteer");

// Fonction pour convertir une image en base64
async function imageToBase64(imagePath) {
  try {
    const imageBuffer = await fs.readFile(imagePath);
    return `data:image/png;base64,${imageBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Erreur lors de la conversion de l'image en base64:", error);
    return null;
  }
}

// Fonction pour formater une date
function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR");
}

// Fonction pour calculer la durée entre deux dates
function calculateDuration(startDate, endDate) {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calculer la différence en jours
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 pour inclure le jour de début

  return diffDays;
}

// Fonction pour obtenir la classe CSS du statut
function getStatusClass(status) {
  const statusClasses = {
    EN_ATTENTE: "status-pending",
    ACCEPTE: "status-approved",
    REFUSE: "status-rejected",
  };
  return statusClasses[status] || "status-default";
}

// Fonction pour générer un PDF à partir de HTML avec gestion d'erreur améliorée
async function generatePdfFromHtml(htmlContent) {
  let browser = null;

  try {
    console.log("Lancement de Puppeteer...");
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Éviter les problèmes de mémoire
        "--disable-gpu", // Désactiver le GPU
        "--font-render-hinting=none", // Améliorer le rendu des polices
        "--disable-web-security", // Désactiver les restrictions de sécurité web
        "--allow-file-access-from-files", // Permettre l'accès aux fichiers locaux
      ],
      timeout: 60000, // 60 secondes
    });

    console.log("Création d'une nouvelle page...");
    const page = await browser.newPage();

    // Ajouter des gestionnaires d'événements pour capturer les erreurs
    page.on("error", (err) => {
      console.error("Erreur dans la page Puppeteer:", err);
    });

    page.on("pageerror", (err) => {
      console.error("Erreur JavaScript dans la page:", err);
    });

    page.on("console", (msg) => {
      console.log("Console de la page:", msg.text());
    });

    // Définir un viewport raisonnable
    await page.setViewport({ width: 1200, height: 800 });

    // Ajouter des polices par défaut
    await page.addStyleTag({
      content: `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
        body { font-family: 'Roboto', Arial, sans-serif; }
      `,
    });

    console.log("Définition du contenu HTML...");
    await page.setContent(htmlContent, {
      waitUntil: ["load", "networkidle0"],
      timeout: 30000, // 30 secondes
    });

    // Attendre que les polices soient chargées
    await page.evaluate(() => document.fonts.ready);

    console.log("Génération du PDF...");
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
      displayHeaderFooter: false,
      timeout: 30000, // 30 secondes
    });

    console.log("PDF généré avec succès, taille:", pdfBuffer.length, "octets");

    // Fermer le navigateur proprement
    if (browser) {
      console.log("Fermeture du navigateur...");
      await browser.close();
      browser = null;
    }

    return pdfBuffer;
  } catch (error) {
    console.error("Erreur détaillée lors de la génération du PDF:", error);
    console.error(error.stack);

    // Fermer le navigateur en cas d'erreur
    if (browser) {
      try {
        console.log("Fermeture du navigateur après erreur...");
        await browser.close();
      } catch (closeError) {
        console.error("Erreur lors de la fermeture du navigateur:", closeError);
      }
      browser = null;
    }

    throw new Error(`Erreur lors de la génération du PDF: ${error.message}`);
  }
}

/**
 * Génère un PDF pour une demande
 * @param {Object} demand - L'objet demande
 * @param {Object} employee - L'objet employé
 * @returns {Promise<Buffer>} - Le buffer du PDF généré
 */
async function generateDemandPdf(demand, employee) {
  console.log("Génération du PDF pour la demande:", demand._id);

  try {
    // Lire le template depuis le fichier avec le chemin corrigé
    const templatePath = path.join(__dirname, "../templates/pdf/demand.html");
    console.log("Chemin du template:", templatePath);

    // Vérifier si le fichier template existe
    try {
      await fs.access(templatePath);
      console.log("Le fichier template existe");
    } catch (accessError) {
      console.error("Le fichier template n'existe pas:", accessError);
      throw new Error(`Le template PDF n'existe pas: ${templatePath}`);
    }

    const templateContent = await fs.readFile(templatePath, "utf8");
    console.log("Template chargé avec succès, taille:", templateContent.length);

    // Préparer le logo
    const logoPath = path.join(__dirname, "../public/images/logo.png");
    console.log("Chemin du logo:", logoPath);

    let logoBase64 = null;
    try {
      // Vérifier si le fichier logo existe
      await fs.access(logoPath);
      console.log("Le fichier logo existe");

      logoBase64 = await imageToBase64(logoPath);
      console.log(
        "Logo converti en base64, taille:",
        logoBase64 ? logoBase64.length : 0
      );
    } catch (logoError) {
      console.error("Erreur lors du chargement du logo:", logoError);
      // Continuer sans logo
    }

    // Enregistrer les helpers Handlebars
    Handlebars.registerHelper("formatDate", formatDate);
    Handlebars.registerHelper("calculateDuration", calculateDuration);
    Handlebars.registerHelper("getStatusClass", getStatusClass);

    // Compiler le template avec Handlebars
    try {
      const template = Handlebars.compile(templateContent);
      console.log("Template compilé avec succès");

      // Préparer les données pour le template
      const data = {
        logoPath: logoBase64 || "",
        demandId: demand._id.toString().slice(-6).toUpperCase(),
        demandType: demand.type === "CONGE" ? "Congé" : "Attestation",
        emissionDate: formatDate(new Date()),
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        email: employee.email || "",
        department: employee.department || "Non spécifié",
        requestedAt: formatDate(demand.requestedAt || demand.createdAt),
        status: demand.status || "En attente",
        statusClass: getStatusClass(demand.status),
        startDate:
          demand.startDate || demand.dateDebut
            ? formatDate(demand.startDate || demand.dateDebut)
            : null,
        endDate:
          demand.endDate || demand.dateFin
            ? formatDate(demand.endDate || demand.dateFin)
            : null,
        duration: calculateDuration(
          demand.startDate || demand.dateDebut,
          demand.endDate || demand.dateFin
        ),
        reason: demand.reason || null,
        managerName: null, // À compléter si disponible
        currentYear: new Date().getFullYear(),
      };

      console.log("Données préparées pour le template");

      // Générer le HTML avec les données
      const htmlContent = template(data);
      console.log("HTML généré avec succès, taille:", htmlContent.length);

      // Générer le PDF
      console.log("Génération du PDF avec Puppeteer...");

      // Vérifier que Puppeteer est correctement installé
      if (!puppeteer) {
        throw new Error("Puppeteer n'est pas disponible");
      }

      const pdfBuffer = await generatePdfFromHtml(htmlContent);

      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error("Puppeteer a généré un buffer PDF vide");
      }

      console.log(
        "PDF généré avec succès, taille:",
        pdfBuffer.length,
        "octets"
      );

      return pdfBuffer;
    } catch (templateError) {
      console.error(
        "Erreur lors de la compilation ou du rendu du template:",
        templateError
      );
      throw templateError;
    }
  } catch (error) {
    console.error("Erreur détaillée lors de la génération du template:", error);
    console.error(error.stack);

    // Fallback en cas d'erreur avec le template
    console.log("Utilisation du template de secours");
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Demande ${demand.type}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
            body { 
              font-family: 'Roboto', Arial, sans-serif; 
              margin: 20px; 
              color: #333;
              line-height: 1.5;
            }
            h1 { 
              color: #2c3e50; 
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            .info { 
              margin-bottom: 20px; 
              background: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
            }
            .label { 
              font-weight: bold; 
              color: #2c3e50;
            }
            .footer {
              margin-top: 30px;
              font-size: 12px;
              color: #777;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <h1>Demande de ${
            demand.type === "CONGE" ? "Congé" : "Attestation"
          }</h1>
          <div class="info">
            <p><span class="label">Employé:</span> ${employee.firstName} ${
        employee.lastName
      }</p>
            <p><span class="label">Email:</span> ${employee.email}</p>
            <p><span class="label">Date de demande:</span> ${formatDate(
              demand.createdAt
            )}</p>
            <p><span class="label">Statut:</span> ${demand.status}</p>
            ${
              demand.dateDebut
                ? `<p><span class="label">Date de début:</span> ${formatDate(
                    demand.dateDebut
                  )}</p>`
                : ""
            }
            ${
              demand.dateFin
                ? `<p><span class="label">Date de fin:</span> ${formatDate(
                    demand.dateFin
                  )}</p>`
                : ""
            }
            ${
              demand.reason
                ? `<p><span class="label">Motif:</span> ${demand.reason}</p>`
                : ""
            }
          </div>
          <div class="footer">
            <p>Document généré le ${formatDate(new Date())}</p>
            <p>&copy; ${new Date().getFullYear()} - Tous droits réservés</p>
          </div>
        </body>
        </html>
      `;

      console.log("HTML de secours généré, taille:", htmlContent.length);

      const pdfBuffer = await generatePdfFromHtml(htmlContent);
      console.log(
        "PDF de secours généré avec succès, taille:",
        pdfBuffer.length,
        "octets"
      );

      return pdfBuffer;
    } catch (fallbackError) {
      console.error("Erreur avec le template de secours:", fallbackError);
      throw fallbackError;
    }
  }
}

module.exports = {
  generateDemandPdf,
};
