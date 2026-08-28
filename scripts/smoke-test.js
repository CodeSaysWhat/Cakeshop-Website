const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const requiredFiles = ["index.html", "cakes.json", "css/style.css", "JS/script.js", "partials/header.html", "partials/footer.html"];
const pages = ["pages/Cakes.html", "pages/ProductDetails.html", "pages/AddToCart.html", "pages/order.html", "pages/aboutUs.html"];

for (const file of [...requiredFiles, ...pages]) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing required file: ${file}`);
}
const cakes = JSON.parse(fs.readFileSync(path.join(root, "cakes.json"), "utf8"));
if (!Array.isArray(cakes) || cakes.length === 0) throw new Error("Cake catalogue is empty.");
if (cakes.some((cake) => !cake.name || !cake.price || !cake.img || !cake.category)) throw new Error("Cake catalogue contains an incomplete item.");
const html = fs.readFileSync(path.join(root, "pages/Cakes.html"), "utf8");
for (const category of ["characters", "gelato", "ice cream", "normal flavors", "themes"]) {
  if (!html.includes(`data-category=\"${category}\"`)) throw new Error(`Missing cake category: ${category}`);
}
console.log(`Smoke test passed: ${cakes.length} cakes and ${pages.length} pages checked.`);
