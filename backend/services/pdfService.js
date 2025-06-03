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

// Fonction pour générer un PDF à partir de HTML
async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "20px",
      right: "20px",
      bottom: "20px",
      left: "20px",
    },
  });

  await browser.close();
  return pdfBuffer;
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

    const templateContent = await fs.readFile(templatePath, "utf8");
    console.log("Template chargé avec succès");

    // Préparer le logo
    const logoPath = path.join(__dirname, "../public/images/logo.png");
    console.log("Chemin du logo:", logoPath);

    let logoBase64 = null;
    try {
      logoBase64 = await imageToBase64(logoPath);
      console.log("Logo converti en base64");
    } catch (logoError) {
      console.error("Erreur lors du chargement du logo:", logoError);
      // Continuer sans logo
    }

    // Compiler le template avec Handlebars
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

    console.log("Données préparées:", JSON.stringify(data, null, 2));

    // Générer le HTML avec les données
    const htmlContent = template(data);
    console.log("HTML généré avec succès");

    // Générer le PDF
    console.log("Génération du PDF...");
    const pdfBuffer = await generatePdfFromHtml(htmlContent);
    console.log("PDF généré avec succès");

    return pdfBuffer;
  } catch (error) {
    console.error("Erreur détaillée lors de la génération du template:", error);

    // Fallback en cas d'erreur avec le template
    console.log("Utilisation du template de secours");
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Demande ${demand.type}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          .info { margin-bottom: 20px; }
          .label { font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Demande de ${demand.type === "CONGE" ? "Congé" : "Attestation"}</h1>
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
        <p>Document généré le ${formatDate(new Date())}</p>
      </body>
      </html>
    `;

    return await generatePdfFromHtml(htmlContent);
  }
}

module.exports = {
  generateDemandPdf,
};
