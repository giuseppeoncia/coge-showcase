/**
 * MongoDB anonymization script for the CoGe showcase.
 *
 * Replaces real employee / customer / user names + CAC resource-description
 * references with deterministic fake data. Runs inside `mongosh` (targeted at
 * the local dev DB only — see README for restore instructions).
 *
 * Usage: load this file from a mongosh session authenticated against the local
 * dev DB. See docs/screenshots-capture.md.
 *
 * Set DRY_RUN=true to print the first 5 mapped examples per collection and skip writes.
 * Set KEEP_LOGIN_EMAIL to preserve one login identity (defaults to the
 * env-provided value or none).
 */

const DRY = (typeof DRY_RUN !== 'undefined') ? !!DRY_RUN : false;

const FAKE_FIRST_NAMES = [
  'Aldo','Alba','Alessandro','Alice','Andrea','Anna','Antonio','Arianna',
  'Bianca','Bruno','Camilla','Carlo','Caterina','Cesare','Chiara','Claudio',
  'Daniele','Daria','Davide','Diana','Diego','Edoardo','Elena','Elia',
  'Elisa','Emanuele','Emma','Enrico','Erica','Fabio','Federica','Federico',
  'Filippo','Francesca','Gabriele','Gaia','Giacomo','Giada','Gianna','Gilda',
  'Giorgio','Giovanna','Giulia','Giulio','Giuseppe','Ilaria','Irene','Jacopo',
  'Laura','Leonardo','Letizia','Lorenzo','Luca','Lucia','Luigi','Manuela',
  'Marco','Maria','Mario','Martina','Matilde','Matteo','Mattia','Michele',
  'Monica','Nicola','Nicoletta','Olga','Paola','Paolo','Pietro','Priscilla',
  'Raffaele','Remo','Renata','Renzo','Riccardo','Roberta','Roberto','Rosa',
  'Sabrina','Salvatore','Sara','Serena','Silvia','Simone','Sofia','Stefania',
  'Stefano','Susanna','Teresa','Tommaso','Ubaldo','Valentina','Valerio','Vanessa',
  'Vincenzo','Viola','Virginia','Vito','Walter','Ylenia','Zelinda','Zeno',
  'Achille','Beatrice','Clemente','Doriana','Egidio','Fiorenza','Gregorio','Helena',
];

const FAKE_LAST_NAMES = [
  'Alberti','Albini','Amato','Amoruso','Angeli','Aquila','Arditi','Arrigoni',
  'Bassi','Bellini','Beltrami','Benedetti','Bernardi','Bianchi','Bonetti','Borghi',
  'Bosco','Brambilla','Bruni','Burgio','Calabrese','Caldera','Campagna','Cantoni',
  'Capponi','Caraccioli','Carbone','Cardillo','Cassano','Castaldi','Catalano','Cavalli',
  'Cerasa','Chiaretti','Ciampi','Cinque','Colombo','Conti','Cortese','Costa',
  'Croce','Damiani','D\'Angelo','Daverio','De Luca','Del Bianco','Donati','Elia',
  'Falcone','Fantini','Ferrari','Ferraro','Ferri','Fiore','Foglia','Fontana',
  'Franchi','Gallo','Gandolfi','Garofalo','Gatti','Gennaro','Ghidini','Giannini',
  'Greco','Guidi','Lazzari','Leone','Lombardi','Longhi','Lupi','Magnani',
  'Manetti','Mantovani','Marchetti','Marino','Martini','Marzi','Masini','Massa',
  'Mauri','Mele','Mercati','Milani','Monaco','Morelli','Moretti','Nardi',
  'Natale','Negri','Nocera','Oliveri','Orsini','Pagano','Palmieri','Paoletti',
  'Parisi','Pastore','Pellegrino','Perego','Perri','Pesce','Piazza','Pisani',
  'Poggi','Pozzi','Quaranta','Ranieri','Ravera','Re','Ricci','Riva',
  'Romano','Rossi','Rovelli','Ruocco','Sabatini','Sacchi','Sala','Salerno',
  'Santoro','Sartori','Savi','Scala','Serra','Sforza','Siciliano','Silvestri',
];

const FAKE_CUSTOMERS = [
  'Axion Digital','Novara Tech','Polaris Partners','Orbit Systems','Alpine Cloud',
  'Meridian Labs','Corvus Analytics','Helios Retail','Lumen Automotive','Fabbrica Domani',
  'Clearline Banking','Pixel Forge','Vento Energy','Aurora Motors','Cosmo Insure',
  'Verdelago Utilities','Borealis Shipping','Porto Digital','Mareblu Logistics','Cortex Health',
  'Quanta Manufacturing','Atlante Media','Paloma Foods','Ferro Engineering','Zen Consulting',
  'Aquila Advisory','Fenice Partners','Idra Software','Stella Industries','Magna Networks',
  'Salerno Energia','Volcano Games','Arcobaleno Pharma','Ponte Banking','Città Futura',
  'Serenissima Services','Fiorentina Fashion','Novecento Legal','Aviano Aerospace','Calibro Semiconductors',
  'Tramontana Transport','Levante Legal','Ostro Publishing','Mistral Retail','Scirocco Consulting',
  'Grecale Systems','Brezza Digital','Uragano Tech','Tempesta Analytics','Mareggiata Insure',
  'Primavera Foods','Estate Consulting','Autunno Media','Inverno Networks','Diurno Software',
  'Notturno Partners','Alba Holding','Tramonto Ventures','Chiaro Digital','Nebbia Labs',
];

function pick(arr, seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return arr[h % arr.length];
}

function fakeEmail(first, last, domain = 'coge-demo.local') {
  const f = first.normalize('NFD').replace(/[^a-z]/gi, '').toLowerCase();
  const l = last.normalize('NFD').replace(/[^a-z]/gi, '').toLowerCase();
  return `${f}.${l}@${domain}`;
}

// Keep this login intact so we can still auth + capture screenshots.
// Supply via `--eval "var KEEP_LOGIN_EMAIL='user@example.com'"` on the mongosh
// command line. If omitted, every user record (including the admin used to
// take screenshots) gets renamed.
const KEEP_USER_EMAIL = (typeof KEEP_LOGIN_EMAIL !== 'undefined') ? KEEP_LOGIN_EMAIL : null;

// ============================================================
// 1. Employees (firstName, lastName, email)
// ============================================================
let empCount = 0;
const empSamples = [];
db.employees.find({}).forEach((doc) => {
  const seed = doc._id.toString();
  const newFirst = pick(FAKE_FIRST_NAMES, seed + 'F');
  const newLast = pick(FAKE_LAST_NAMES, seed + 'L');
  const newEmail = fakeEmail(newFirst, newLast);
  if (empSamples.length < 5) {
    empSamples.push({
      from: `${doc.firstName} ${doc.lastName} <${doc.email}>`,
      to: `${newFirst} ${newLast} <${newEmail}>`,
    });
  }
  if (!DRY) {
    db.employees.updateOne(
      { _id: doc._id },
      { $set: { firstName: newFirst, lastName: newLast, email: newEmail } }
    );
  }
  empCount++;
});
print(`employees: ${empCount} (${DRY ? 'dry-run, not written' : 'updated'})`);
empSamples.forEach((s) => print(`  ${s.from}  ->  ${s.to}`));

// ============================================================
// 2. Customers (companyName)
// ============================================================
let custCount = 0;
const custSamples = [];
db.customers.find({}).forEach((doc) => {
  const seed = doc._id.toString();
  const newName = pick(FAKE_CUSTOMERS, seed);
  if (custSamples.length < 5) {
    custSamples.push({ from: doc.companyName, to: newName });
  }
  if (!DRY) {
    db.customers.updateOne({ _id: doc._id }, { $set: { companyName: newName } });
  }
  custCount++;
});
print(`customers: ${custCount} (${DRY ? 'dry-run' : 'updated'})`);
custSamples.forEach((s) => print(`  ${s.from}  ->  ${s.to}`));

// ============================================================
// 3. Users (name, email) — skip KEEP_USER_EMAIL for login continuity
// ============================================================
let userCount = 0;
const userSamples = [];
const userQuery = KEEP_USER_EMAIL ? { email: { $ne: KEEP_USER_EMAIL } } : {};
db.users.find(userQuery).forEach((doc) => {
  const seed = doc._id.toString();
  const newFirst = pick(FAKE_FIRST_NAMES, seed + 'UF');
  const newLast = pick(FAKE_LAST_NAMES, seed + 'UL');
  const newName = `${newFirst} ${newLast}`;
  const newEmail = fakeEmail(newFirst, newLast);
  if (userSamples.length < 5) {
    userSamples.push({
      from: `${doc.name} <${doc.email}>`,
      to: `${newName} <${newEmail}>`,
    });
  }
  if (!DRY) {
    db.users.updateOne({ _id: doc._id }, { $set: { name: newName, email: newEmail } });
  }
  userCount++;
});
const excl = KEEP_USER_EMAIL ? `excluding ${KEEP_USER_EMAIL}` : 'no exclusion';
print(`users: ${userCount} (${excl}; ${DRY ? 'dry-run' : 'updated'})`);
userSamples.forEach((s) => print(`  ${s.from}  ->  ${s.to}`));

// Rename the kept admin user's display name (login email stays real) so it
// doesn't surface in screenshots. Skipped if no user was kept.
if (KEEP_USER_EMAIL) {
  if (!DRY) {
    db.users.updateOne({ email: KEEP_USER_EMAIL }, { $set: { name: 'Admin Demo' } });
  }
  print(`kept login user ${KEEP_USER_EMAIL} display name -> "Admin Demo"`);
}

// ============================================================
// 4. CAC descriptions with "Resources: LASTNAME (...)" patterns
// ============================================================
let cacCount = 0;
const cacSamples = [];
db.cost_allocation_codes.find({ description: /Resources:/ }).forEach((doc) => {
  const seed = doc._id.toString();
  const newLast = pick(FAKE_LAST_NAMES, seed + 'CAC');
  const newDesc = doc.description.replace(
    /Resources:\s*[^\(\n]+?(?=\s*\(|\s*$)/,
    `Resources: ${newLast}`
  );
  if (cacSamples.length < 6) {
    cacSamples.push({ from: doc.description, to: newDesc });
  }
  if (!DRY) {
    db.cost_allocation_codes.updateOne(
      { _id: doc._id },
      { $set: { description: newDesc } }
    );
  }
  cacCount++;
});
print(`cost_allocation_codes (Resources: desc): ${cacCount} (${DRY ? 'dry-run' : 'updated'})`);
cacSamples.forEach((s) => print(`  "${s.from}"  ->  "${s.to}"`));

print(DRY ? '\nDRY RUN — no data changed.' : '\nAnonymization complete.');
