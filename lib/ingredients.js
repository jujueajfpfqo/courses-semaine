// Dictionnaire d'ingrédients : nom → {cat, qty, unit, price, pack, pantry}
// qty + unit = contenu du conditionnement ; price = prix de ce conditionnement chez Magasins U (marque U)
// pantry = article de placard (souvent déjà à la maison)
// Ces prix sont indicatifs (France, novembre 2026) — l'utilisateur peut les corriger dans l'onglet Budget.

'use strict';

const CATS = ["Fruits et légumes","Boucherie et poisson","Crèmerie et œufs","Boulangerie","Épicerie","Surgelés","Boissons","Hygiène et maison","Autres"];

// Chaque entrée : nom (clé) → {cat, qty, unit ("g"|"ml"|""), price, pack, pantry}
// Pour les pièces, unit="" et qty=1
const DICT = {
  // ── Fruits & légumes ──────────────────────────────────────────────────────
  "oignon":                  {cat:"Fruits et légumes",    qty:1,    unit:"",   price:0.30,  pack:"Oignon, pièce",                           pantry:false},
  "oignon rouge":            {cat:"Fruits et légumes",    qty:1,    unit:"",   price:0.45,  pack:"Oignon rouge, pièce",                     pantry:false},
  "échalote":                {cat:"Fruits et légumes",    qty:1,    unit:"",   price:0.35,  pack:"Échalote, pièce",                         pantry:false},
  "gousse d'ail":            {cat:"Fruits et légumes",    qty:10,   unit:"",   price:0.90,  pack:"Ail, tête",                               pantry:true},
  "ail":                     {cat:"Fruits et légumes",    qty:10,   unit:"",   price:0.90,  pack:"Ail, tête",                               pantry:true},
  "carotte":                 {cat:"Fruits et légumes",    qty:1,    unit:"",   price:0.25,  pack:"Carotte, pièce",                          pantry:false},
  "pomme de terre":          {cat:"Fruits et légumes",    qty:1000, unit:"g",  price:1.90,  pack:"Pommes de terre U, 1 kg",                 pantry:false},
  "tomate":                  {cat:"Fruits et légumes",    qty:1,    unit:"",   price:0.60,  pack:"Tomate, pièce",                           pantry:false},
  "tomate cerise":           {cat:"Fruits et légumes",    qty:250,  unit:"g",  price:1.80,  pack:"Tomates cerises U, 250 g",                pantry:false},
  "courgette":               {cat:"Fruits et légumes",    qty:1,    unit:"",   price:0.90,  pack:"Courgette, pièce",                        pantry:false},
  "aubergine":               {cat:"Fruits et légumes",    qty:1,    unit:"",   price:1.20,  pack:"Aubergine, pièce",                        pantry:false},
  "poivron":                 {cat:"Fruits et légumes",    qty:1,    unit:"",   price:1.10,  pack:"Poivron, pièce",                          pantry:false},
  "poivron rouge":           {cat:"Fruits et légumes",    qty:1,    unit:"",   price:1.10,  pack:"Poivron rouge, pièce",                    pantry:false},
  "poivron vert":            {cat:"Fruits et légumes",    qty:1,    unit:"",   price:0.90,  pack:"Poivron vert, pièce",                     pantry:false},
  "champignon":              {cat:"Fruits et légumes",    qty:500,  unit:"g",  price:2.90,  pack:"Champignons de Paris U, 500 g",           pantry:false},
  "champignon de paris":     {cat:"Fruits et légumes",    qty:500,  unit:"g",  price:2.90,  pack:"Champignons de Paris U, 500 g",           pantry:false},
  "épinards":                {cat:"Fruits et légumes",    qty:400,  unit:"g",  price:2.50,  pack:"Épinards frais U, 400 g",                 pantry:false},
  "brocoli":                 {cat:"Fruits et légumes",    qty:1,    unit:"",   price:1.80,  pack:"Brocoli, pièce",                          pantry:false},
  "chou-fleur":              {cat:"Fruits et légumes",    qty:1,    unit:"",   price:2.20,  pack:"Chou-fleur, pièce",                       pantry:false},
  "chou":                    {cat:"Fruits et légumes",    qty:1,    unit:"",   price:1.50,  pack:"Chou blanc, pièce",                       pantry:false},
  "poireau":                 {cat:"Fruits et légumes",    qty:1,    unit:"",   price:0.90,  pack:"Poireau, pièce",                          pantry:false},
  "céleri":                  {cat:"Fruits et légumes",    qty:1,    unit:"",   price:1.60,  pack:"Céleri branche, pièce",                   pantry:false},
  "fenouil":                 {cat:"Fruits et légumes",    qty:1,    unit:"",   price:1.50,  pack:"Fenouil, pièce",                          pantry:false},
  "radis":                   {cat:"Fruits et légumes",    qty:1,    unit:"",   price:0.90,  pack:"Botte de radis",                          pantry:false},
  "avocat":                  {cat:"Fruits et légumes",    qty:1,    unit:"",   price:1.00,  pack:"Avocat, pièce",                           pantry:false},
  "concombre":               {cat:"Fruits et légumes",    qty:1,    unit:"",   price:1.00,  pack:"Concombre, pièce",                        pantry:false},
  "laitue":                  {cat:"Fruits et légumes",    qty:1,    unit:"",   price:1.20,  pack:"Laitue, pièce",                           pantry:false},
  "salade":                  {cat:"Fruits et légumes",    qty:1,    unit:"",   price:1.20,  pack:"Salade verte, pièce",                     pantry:false},
  "mâche":                   {cat:"Fruits et légumes",    qty:100,  unit:"g",  price:1.60,  pack:"Mâche U, 100 g",                          pantry:false},
  "roquette":                {cat:"Fruits et légumes",    qty:100,  unit:"g",  price:1.90,  pack:"Roquette U, 100 g",                       pantry:false},
  "cresson":                 {cat:"Fruits et légumes",    qty:1,    unit:"",   price:1.00,  pack:"Cresson, botte",                          pantry:false},
  "maïs":                    {cat:"Fruits et légumes",    qty:1,    unit:"",   price:0.50,  pack:"Épi de maïs, pièce",                      pantry:false},
  "pomme":                   {cat:"Fruits et légumes",    qty:1,    unit:"",   price:0.45,  pack:"Pomme, pièce",                            pantry:false},
  "poire":                   {cat:"Fruits et légumes",    qty:1,    unit:"",   price:0.60,  pack:"Poire, pièce",                            pantry:false},
  "banane":                  {cat:"Fruits et légumes",    qty:1,    unit:"",   price:0.30,  pack:"Banane, pièce",                           pantry:false},
  "orange":                  {cat:"Fruits et légumes",    qty:1,    unit:"",   price:0.70,  pack:"Orange, pièce",                           pantry:false},
  "citron":                  {cat:"Fruits et légumes",    qty:1,    unit:"",   price:0.60,  pack:"Citron, pièce",                           pantry:false},
  "citron vert":             {cat:"Fruits et légumes",    qty:1,    unit:"",   price:0.70,  pack:"Citron vert, pièce",                      pantry:false},
  "kiwi":                    {cat:"Fruits et légumes",    qty:1,    unit:"",   price:0.45,  pack:"Kiwi, pièce",                             pantry:false},
  "fraise":                  {cat:"Fruits et légumes",    qty:500,  unit:"g",  price:3.50,  pack:"Fraises U, 500 g",                        pantry:false},
  "framboise":               {cat:"Fruits et légumes",    qty:125,  unit:"g",  price:2.80,  pack:"Framboises U, 125 g",                     pantry:false},
  "raisin":                  {cat:"Fruits et légumes",    qty:500,  unit:"g",  price:2.00,  pack:"Raisin, 500 g",                           pantry:false},
  "mangue":                  {cat:"Fruits et légumes",    qty:1,    unit:"",   price:1.80,  pack:"Mangue, pièce",                           pantry:false},
  "ananas":                  {cat:"Fruits et légumes",    qty:1,    unit:"",   price:2.50,  pack:"Ananas, pièce",                           pantry:false},
  "coriandre":               {cat:"Fruits et légumes",    qty:1,    unit:"",   price:1.00,  pack:"Coriandre fraîche, botte",                pantry:false},
  "persil":                  {cat:"Fruits et légumes",    qty:1,    unit:"",   price:0.90,  pack:"Persil, botte",                           pantry:false},
  "basilic":                 {cat:"Fruits et légumes",    qty:1,    unit:"",   price:1.80,  pack:"Basilic, pot",                            pantry:false},
  "thym":                    {cat:"Fruits et légumes",    qty:1,    unit:"",   price:0.90,  pack:"Thym frais, botte",                       pantry:true},
  "romarin":                 {cat:"Fruits et légumes",    qty:1,    unit:"",   price:0.90,  pack:"Romarin frais, botte",                    pantry:true},
  "ciboulette":              {cat:"Fruits et légumes",    qty:1,    unit:"",   price:0.90,  pack:"Ciboulette, botte",                       pantry:false},
  "menthe":                  {cat:"Fruits et légumes",    qty:1,    unit:"",   price:0.90,  pack:"Menthe fraîche, botte",                   pantry:false},
  "gingembre":               {cat:"Fruits et légumes",    qty:1,    unit:"",   price:1.20,  pack:"Gingembre frais, pièce",                  pantry:false},
  "patate douce":            {cat:"Fruits et légumes",    qty:1,    unit:"",   price:1.20,  pack:"Patate douce, pièce",                     pantry:false},
  "navet":                   {cat:"Fruits et légumes",    qty:1,    unit:"",   price:0.60,  pack:"Navet, pièce",                            pantry:false},
  "betterave":               {cat:"Fruits et légumes",    qty:1,    unit:"",   price:0.80,  pack:"Betterave cuite, pièce",                  pantry:false},
  "asperge":                 {cat:"Fruits et légumes",    qty:500,  unit:"g",  price:4.00,  pack:"Asperges, botte 500 g",                   pantry:false},
  "haricot vert":            {cat:"Fruits et légumes",    qty:500,  unit:"g",  price:2.50,  pack:"Haricots verts U, 500 g",                 pantry:false},
  "petits pois":             {cat:"Fruits et légumes",    qty:400,  unit:"g",  price:1.80,  pack:"Petits pois en boîte U, 400 g",           pantry:false},
  "artichaut":               {cat:"Fruits et légumes",    qty:1,    unit:"",   price:1.20,  pack:"Artichaut, pièce",                        pantry:false},

  // ── Boucherie et poisson ─────────────────────────────────────────────────
  "blanc de poulet":         {cat:"Boucherie et poisson", qty:600,  unit:"g",  price:7.90,  pack:"Blancs de poulet U, 2 × 300 g",          pantry:false},
  "escalope de poulet":      {cat:"Boucherie et poisson", qty:600,  unit:"g",  price:7.50,  pack:"Escalopes de poulet U, 600 g",            pantry:false},
  "poulet":                  {cat:"Boucherie et poisson", qty:1500, unit:"g",  price:8.50,  pack:"Poulet entier U, 1,5 kg",                 pantry:false},
  "cuisse de poulet":        {cat:"Boucherie et poisson", qty:800,  unit:"g",  price:5.50,  pack:"Cuisses de poulet U, 4 pièces",           pantry:false},
  "escalope de dinde":       {cat:"Boucherie et poisson", qty:400,  unit:"g",  price:5.50,  pack:"Escalopes de dinde U, 400 g",             pantry:false},
  "boeuf haché":             {cat:"Boucherie et poisson", qty:500,  unit:"g",  price:4.50,  pack:"Viande hachée bœuf U, 500 g",             pantry:false},
  "steak haché":             {cat:"Boucherie et poisson", qty:500,  unit:"g",  price:4.50,  pack:"Steaks hachés U, 4 × 125 g",             pantry:false},
  "filet de bœuf":           {cat:"Boucherie et poisson", qty:200,  unit:"g",  price:8.00,  pack:"Filet de bœuf, pièce",                   pantry:false},
  "entrecôte":               {cat:"Boucherie et poisson", qty:200,  unit:"g",  price:5.50,  pack:"Entrecôte, pièce",                        pantry:false},
  "côtelette d'agneau":      {cat:"Boucherie et poisson", qty:300,  unit:"g",  price:6.50,  pack:"Côtelettes d'agneau, 2 pièces",           pantry:false},
  "gigot d'agneau":          {cat:"Boucherie et poisson", qty:1500, unit:"g",  price:16.00, pack:"Gigot d'agneau U, 1,5 kg",               pantry:false},
  "côte de porc":            {cat:"Boucherie et poisson", qty:600,  unit:"g",  price:5.00,  pack:"Côtes de porc U, 2 pièces",              pantry:false},
  "filet de porc":           {cat:"Boucherie et poisson", qty:400,  unit:"g",  price:5.00,  pack:"Filet de porc U, 400 g",                 pantry:false},
  "lardons":                 {cat:"Boucherie et poisson", qty:200,  unit:"g",  price:2.10,  pack:"Lardons fumés U, 200 g",                  pantry:false},
  "bacon":                   {cat:"Boucherie et poisson", qty:150,  unit:"g",  price:2.80,  pack:"Bacon U, 150 g",                          pantry:false},
  "jambon":                  {cat:"Boucherie et poisson", qty:1,    unit:"",   price:0.90,  pack:"Tranche de jambon U",                     pantry:false},
  "saucisse":                {cat:"Boucherie et poisson", qty:1,    unit:"",   price:1.00,  pack:"Saucisse de Toulouse, pièce",             pantry:false},
  "merguez":                 {cat:"Boucherie et poisson", qty:1,    unit:"",   price:0.80,  pack:"Merguez, pièce",                          pantry:false},
  "chorizo":                 {cat:"Boucherie et poisson", qty:200,  unit:"g",  price:2.90,  pack:"Chorizo U, 200 g",                        pantry:false},
  "filet de saumon":         {cat:"Boucherie et poisson", qty:200,  unit:"g",  price:4.50,  pack:"Filet de saumon U, 200 g",               pantry:false},
  "saumon":                  {cat:"Boucherie et poisson", qty:200,  unit:"g",  price:4.50,  pack:"Saumon U, 200 g",                         pantry:false},
  "cabillaud":               {cat:"Boucherie et poisson", qty:200,  unit:"g",  price:4.80,  pack:"Cabillaud U, 200 g",                      pantry:false},
  "thon":                    {cat:"Boucherie et poisson", qty:200,  unit:"g",  price:2.20,  pack:"Thon en boîte U, 200 g",                  pantry:false},
  "sardine":                 {cat:"Boucherie et poisson", qty:135,  unit:"g",  price:1.80,  pack:"Sardines à l'huile U, 135 g",             pantry:false},
  "crevette":                {cat:"Boucherie et poisson", qty:400,  unit:"g",  price:6.90,  pack:"Crevettes cuites U, 400 g",              pantry:false},
  "moule":                   {cat:"Boucherie et poisson", qty:1000, unit:"g",  price:4.50,  pack:"Moules de bouchot U, 1 kg",              pantry:false},
  "noix de saint-jacques":   {cat:"Boucherie et poisson", qty:1,    unit:"",   price:2.80,  pack:"Noix de Saint-Jacques, pièce",           pantry:false},

  // ── Crèmerie et œufs ─────────────────────────────────────────────────────
  "oeuf":                    {cat:"Crèmerie et œufs",     qty:6,    unit:"",   price:2.10,  pack:"Œufs U, boîte de 6",                     pantry:false},
  "jaune d'oeuf":            {cat:"Crèmerie et œufs",     qty:6,    unit:"",   price:2.10,  pack:"Œufs U, boîte de 6",                     pantry:false},
  "blanc d'oeuf":            {cat:"Crèmerie et œufs",     qty:6,    unit:"",   price:2.10,  pack:"Œufs U, boîte de 6",                     pantry:false},
  "lait":                    {cat:"Crèmerie et œufs",     qty:1000, unit:"ml", price:1.05,  pack:"Lait demi-écrémé U, 1 L",               pantry:false},
  "lait entier":             {cat:"Crèmerie et œufs",     qty:1000, unit:"ml", price:1.10,  pack:"Lait entier U, 1 L",                    pantry:false},
  "beurre":                  {cat:"Crèmerie et œufs",     qty:250,  unit:"g",  price:2.90,  pack:"Beurre doux U, 250 g",                   pantry:true},
  "crème fraîche":           {cat:"Crèmerie et œufs",     qty:200,  unit:"ml", price:1.20,  pack:"Crème fraîche épaisse U, 20 cl",        pantry:false},
  "crème liquide":           {cat:"Crèmerie et œufs",     qty:200,  unit:"ml", price:1.20,  pack:"Crème liquide entière U, 20 cl",        pantry:false},
  "fromage blanc":           {cat:"Crèmerie et œufs",     qty:500,  unit:"g",  price:1.80,  pack:"Fromage blanc U, 500 g",                pantry:false},
  "yaourt":                  {cat:"Crèmerie et œufs",     qty:8,    unit:"",   price:2.20,  pack:"Yaourts nature U, 8 × 125 g",           pantry:false},
  "yaourt nature":           {cat:"Crèmerie et œufs",     qty:8,    unit:"",   price:2.20,  pack:"Yaourts nature U, 8 × 125 g",           pantry:false},
  "emmental râpé":           {cat:"Crèmerie et œufs",     qty:200,  unit:"g",  price:2.10,  pack:"Emmental râpé U, 200 g",                pantry:false},
  "gruyère râpé":            {cat:"Crèmerie et œufs",     qty:200,  unit:"g",  price:2.20,  pack:"Gruyère râpé U, 200 g",                 pantry:false},
  "parmesan":                {cat:"Crèmerie et œufs",     qty:100,  unit:"g",  price:2.80,  pack:"Parmesan râpé U, 100 g",                pantry:false},
  "mozzarella":              {cat:"Crèmerie et œufs",     qty:125,  unit:"g",  price:1.60,  pack:"Mozzarella U, 125 g",                   pantry:false},
  "ricotta":                 {cat:"Crèmerie et œufs",     qty:250,  unit:"g",  price:2.20,  pack:"Ricotta U, 250 g",                      pantry:false},
  "comté":                   {cat:"Crèmerie et œufs",     qty:200,  unit:"g",  price:4.50,  pack:"Comté U, 200 g",                        pantry:false},
  "brie":                    {cat:"Crèmerie et œufs",     qty:200,  unit:"g",  price:3.50,  pack:"Brie, 200 g",                           pantry:false},
  "camembert":               {cat:"Crèmerie et œufs",     qty:250,  unit:"g",  price:2.90,  pack:"Camembert U, 250 g",                    pantry:false},
  "chèvre":                  {cat:"Crèmerie et œufs",     qty:1,    unit:"",   price:1.80,  pack:"Bûche de chèvre U, pièce",              pantry:false},
  "mascarpone":              {cat:"Crèmerie et œufs",     qty:250,  unit:"g",  price:2.60,  pack:"Mascarpone U, 250 g",                   pantry:false},
  "philadelphia":            {cat:"Crèmerie et œufs",     qty:200,  unit:"g",  price:3.00,  pack:"Fromage à tartiner, 200 g",             pantry:false},
  "lait de coco":            {cat:"Épicerie",              qty:400,  unit:"ml", price:1.90,  pack:"Lait de coco U, 400 ml",               pantry:false},

  // ── Boulangerie ──────────────────────────────────────────────────────────
  "pain":                    {cat:"Boulangerie",           qty:1,    unit:"",   price:1.10,  pack:"Baguette",                               pantry:false},
  "baguette":                {cat:"Boulangerie",           qty:1,    unit:"",   price:1.10,  pack:"Baguette",                               pantry:false},
  "pain de mie":             {cat:"Boulangerie",           qty:500,  unit:"g",  price:1.80,  pack:"Pain de mie U, 500 g",                   pantry:false},
  "pain grillé":             {cat:"Boulangerie",           qty:1,    unit:"",   price:0.20,  pack:"Tranche de pain grillé U",               pantry:false},
  "chapelure":               {cat:"Boulangerie",           qty:200,  unit:"g",  price:1.20,  pack:"Chapelure U, 200 g",                     pantry:true},

  // ── Épicerie ─────────────────────────────────────────────────────────────
  "riz basmati":             {cat:"Épicerie",              qty:1000, unit:"g",  price:2.40,  pack:"Riz basmati U, 1 kg",                   pantry:false},
  "riz":                     {cat:"Épicerie",              qty:1000, unit:"g",  price:1.80,  pack:"Riz long U, 1 kg",                      pantry:false},
  "pâtes":                   {cat:"Épicerie",              qty:500,  unit:"g",  price:1.20,  pack:"Pâtes U, 500 g",                        pantry:false},
  "spaghetti":               {cat:"Épicerie",              qty:500,  unit:"g",  price:1.20,  pack:"Spaghetti U, 500 g",                    pantry:false},
  "tagliatelle":             {cat:"Épicerie",              qty:500,  unit:"g",  price:1.50,  pack:"Tagliatelles U, 500 g",                 pantry:false},
  "penne":                   {cat:"Épicerie",              qty:500,  unit:"g",  price:1.20,  pack:"Penne U, 500 g",                        pantry:false},
  "fusilli":                 {cat:"Épicerie",              qty:500,  unit:"g",  price:1.20,  pack:"Fusilli U, 500 g",                      pantry:false},
  "lentilles vertes":        {cat:"Épicerie",              qty:500,  unit:"g",  price:1.60,  pack:"Lentilles vertes U, 500 g",             pantry:false},
  "lentilles corail":        {cat:"Épicerie",              qty:500,  unit:"g",  price:1.80,  pack:"Lentilles corail U, 500 g",             pantry:false},
  "lentilles":               {cat:"Épicerie",              qty:500,  unit:"g",  price:1.60,  pack:"Lentilles vertes U, 500 g",             pantry:false},
  "pois chiches":            {cat:"Épicerie",              qty:400,  unit:"g",  price:1.00,  pack:"Pois chiches en boîte U, 400 g",        pantry:false},
  "haricots rouges":         {cat:"Épicerie",              qty:400,  unit:"g",  price:1.00,  pack:"Haricots rouges U, 400 g",              pantry:false},
  "haricots blancs":         {cat:"Épicerie",              qty:400,  unit:"g",  price:1.00,  pack:"Haricots blancs U, 400 g",              pantry:false},
  "tomates pelées":          {cat:"Épicerie",              qty:400,  unit:"g",  price:0.90,  pack:"Tomates pelées U, 400 g",               pantry:false},
  "tomates concassées":      {cat:"Épicerie",              qty:400,  unit:"g",  price:0.90,  pack:"Tomates concassées U, 400 g",           pantry:false},
  "coulis de tomates":       {cat:"Épicerie",              qty:500,  unit:"g",  price:1.00,  pack:"Coulis de tomates U, 500 g",            pantry:false},
  "concentré de tomates":    {cat:"Épicerie",              qty:200,  unit:"g",  price:0.90,  pack:"Concentré de tomates U, 200 g",         pantry:true},
  "sauce tomate":            {cat:"Épicerie",              qty:400,  unit:"ml", price:1.20,  pack:"Sauce tomate U, 400 ml",                pantry:false},
  "bouillon de poulet":      {cat:"Épicerie",              qty:1,    unit:"",   price:0.60,  pack:"Cube de bouillon de poulet U",           pantry:true},
  "bouillon de légumes":     {cat:"Épicerie",              qty:1,    unit:"",   price:0.60,  pack:"Cube de bouillon de légumes U",          pantry:true},
  "bouillon de bœuf":        {cat:"Épicerie",              qty:1,    unit:"",   price:0.60,  pack:"Cube de bouillon de bœuf U",             pantry:true},
  "huile d'olive":           {cat:"Épicerie",              qty:1000, unit:"ml", price:5.50,  pack:"Huile d'olive U, 1 L",                  pantry:true},
  "huile":                   {cat:"Épicerie",              qty:1000, unit:"ml", price:2.50,  pack:"Huile de tournesol U, 1 L",             pantry:true},
  "huile de tournesol":      {cat:"Épicerie",              qty:1000, unit:"ml", price:2.50,  pack:"Huile de tournesol U, 1 L",             pantry:true},
  "huile de sésame":         {cat:"Épicerie",              qty:250,  unit:"ml", price:3.90,  pack:"Huile de sésame, 250 ml",               pantry:true},
  "vinaigre":                {cat:"Épicerie",              qty:500,  unit:"ml", price:0.90,  pack:"Vinaigre de vin U, 50 cl",              pantry:true},
  "vinaigre balsamique":     {cat:"Épicerie",              qty:250,  unit:"ml", price:2.50,  pack:"Vinaigre balsamique U, 250 ml",         pantry:true},
  "moutarde":                {cat:"Épicerie",              qty:350,  unit:"g",  price:1.50,  pack:"Moutarde de Dijon U, 350 g",            pantry:true},
  "farine":                  {cat:"Épicerie",              qty:1000, unit:"g",  price:1.10,  pack:"Farine de blé U, 1 kg",                 pantry:true},
  "fécule de maïs":          {cat:"Épicerie",              qty:400,  unit:"g",  price:1.80,  pack:"Maïzena, 400 g",                        pantry:true},
  "maïzena":                 {cat:"Épicerie",              qty:400,  unit:"g",  price:1.80,  pack:"Maïzena, 400 g",                        pantry:true},
  "sucre":                   {cat:"Épicerie",              qty:1000, unit:"g",  price:1.20,  pack:"Sucre U, 1 kg",                         pantry:true},
  "sucre en poudre":         {cat:"Épicerie",              qty:1000, unit:"g",  price:1.20,  pack:"Sucre U, 1 kg",                         pantry:true},
  "sucre glace":             {cat:"Épicerie",              qty:500,  unit:"g",  price:1.30,  pack:"Sucre glace U, 500 g",                  pantry:true},
  "cassonade":               {cat:"Épicerie",              qty:500,  unit:"g",  price:1.80,  pack:"Cassonade U, 500 g",                    pantry:true},
  "miel":                    {cat:"Épicerie",              qty:500,  unit:"g",  price:4.50,  pack:"Miel U, 500 g",                         pantry:true},
  "sel":                     {cat:"Épicerie",              qty:500,  unit:"g",  price:0.70,  pack:"Sel fin U, 500 g",                      pantry:true},
  "poivre":                  {cat:"Épicerie",              qty:50,   unit:"g",  price:1.80,  pack:"Poivre moulu U, 50 g",                  pantry:true},
  "curry en poudre":         {cat:"Épicerie",              qty:50,   unit:"g",  price:1.80,  pack:"Curry en poudre U, 50 g",               pantry:true},
  "cumin":                   {cat:"Épicerie",              qty:50,   unit:"g",  price:1.60,  pack:"Cumin moulu U, 50 g",                   pantry:true},
  "cumin en poudre":         {cat:"Épicerie",              qty:50,   unit:"g",  price:1.60,  pack:"Cumin moulu U, 50 g",                   pantry:true},
  "paprika":                 {cat:"Épicerie",              qty:50,   unit:"g",  price:1.60,  pack:"Paprika U, 50 g",                       pantry:true},
  "curcuma":                 {cat:"Épicerie",              qty:50,   unit:"g",  price:1.60,  pack:"Curcuma U, 50 g",                       pantry:true},
  "noix de muscade":         {cat:"Épicerie",              qty:15,   unit:"g",  price:1.80,  pack:"Noix de muscade U, 15 g",               pantry:true},
  "cannelle":                {cat:"Épicerie",              qty:50,   unit:"g",  price:1.80,  pack:"Cannelle moulue U, 50 g",               pantry:true},
  "herbes de provence":      {cat:"Épicerie",              qty:20,   unit:"g",  price:1.20,  pack:"Herbes de Provence U, 20 g",            pantry:true},
  "origan":                  {cat:"Épicerie",              qty:20,   unit:"g",  price:1.20,  pack:"Origan U, 20 g",                        pantry:true},
  "piment":                  {cat:"Épicerie",              qty:50,   unit:"g",  price:1.60,  pack:"Piment de Cayenne U, 50 g",             pantry:true},
  "piment d'espelette":      {cat:"Épicerie",              qty:40,   unit:"g",  price:4.50,  pack:"Piment d'Espelette AOP, 40 g",          pantry:true},
  "levure chimique":         {cat:"Épicerie",              qty:11,   unit:"g",  price:0.50,  pack:"Levure chimique U, sachet 11 g",        pantry:true},
  "levure boulangère":       {cat:"Épicerie",              qty:7,    unit:"g",  price:0.60,  pack:"Levure boulangère U, sachet 7 g",       pantry:true},
  "huile de coco":           {cat:"Épicerie",              qty:400,  unit:"ml", price:4.90,  pack:"Huile de coco U, 400 ml",               pantry:true},
  "pesto":                   {cat:"Épicerie",              qty:190,  unit:"g",  price:2.50,  pack:"Pesto verde U, 190 g",                  pantry:false},
  "sauce soja":              {cat:"Épicerie",              qty:150,  unit:"ml", price:2.20,  pack:"Sauce soja U, 150 ml",                  pantry:true},
  "sauce worcestershire":    {cat:"Épicerie",              qty:150,  unit:"ml", price:2.80,  pack:"Sauce Worcestershire, 150 ml",          pantry:true},
  "tabasco":                 {cat:"Épicerie",              qty:60,   unit:"ml", price:3.00,  pack:"Tabasco, 60 ml",                        pantry:true},
  "ketchup":                 {cat:"Épicerie",              qty:570,  unit:"ml", price:1.80,  pack:"Ketchup U, 570 ml",                     pantry:true},
  "mayonnaise":              {cat:"Épicerie",              qty:235,  unit:"g",  price:1.60,  pack:"Mayonnaise U, 235 g",                   pantry:true},
  "chocolat noir":           {cat:"Épicerie",              qty:200,  unit:"g",  price:1.80,  pack:"Chocolat noir U, 200 g",                pantry:false},
  "chocolat au lait":        {cat:"Épicerie",              qty:200,  unit:"g",  price:1.80,  pack:"Chocolat au lait U, 200 g",             pantry:false},
  "cacao en poudre":         {cat:"Épicerie",              qty:250,  unit:"g",  price:2.50,  pack:"Cacao non sucré U, 250 g",              pantry:true},
  "vanille":                 {cat:"Épicerie",              qty:1,    unit:"",   price:1.80,  pack:"Gousse de vanille U, 2 pièces",          pantry:true},
  "extrait de vanille":      {cat:"Épicerie",              qty:50,   unit:"ml", price:2.90,  pack:"Extrait de vanille, 50 ml",             pantry:true},
  "tahini":                  {cat:"Épicerie",              qty:250,  unit:"g",  price:3.50,  pack:"Tahini, 250 g",                         pantry:false},
  "amandes":                 {cat:"Épicerie",              qty:200,  unit:"g",  price:3.00,  pack:"Amandes U, 200 g",                      pantry:false},
  "noisettes":               {cat:"Épicerie",              qty:200,  unit:"g",  price:3.50,  pack:"Noisettes U, 200 g",                    pantry:false},
  "noix":                    {cat:"Épicerie",              qty:200,  unit:"g",  price:3.80,  pack:"Noix U, 200 g",                         pantry:false},
  "noix de cajou":           {cat:"Épicerie",              qty:200,  unit:"g",  price:4.50,  pack:"Noix de cajou U, 200 g",                pantry:false},
  "raisins secs":            {cat:"Épicerie",              qty:200,  unit:"g",  price:2.20,  pack:"Raisins secs U, 200 g",                 pantry:false},
  "chapelure":               {cat:"Épicerie",              qty:200,  unit:"g",  price:1.20,  pack:"Chapelure U, 200 g",                    pantry:true},
  "pain rassis":             {cat:"Épicerie",              qty:200,  unit:"g",  price:1.00,  pack:"Croûtons U, 200 g",                     pantry:false},
  "tortillas":               {cat:"Épicerie",              qty:1,    unit:"",   price:0.30,  pack:"Tortilla de blé, pièce",                pantry:false},
  "galette de riz":          {cat:"Épicerie",              qty:1,    unit:"",   price:0.20,  pack:"Galette de riz, pièce",                 pantry:false},
  "gélatine":                {cat:"Épicerie",              qty:1,    unit:"",   price:0.60,  pack:"Feuille de gélatine U, sachet",          pantry:true},

  // ── Surgelés ─────────────────────────────────────────────────────────────
  "petits pois surgelés":    {cat:"Surgelés",              qty:1000, unit:"g",  price:2.90,  pack:"Petits pois surgelés U, 1 kg",          pantry:false},
  "maïs surgelé":            {cat:"Surgelés",              qty:450,  unit:"g",  price:1.60,  pack:"Maïs surgelé U, 450 g",                pantry:false},
  "épinards surgelés":       {cat:"Surgelés",              qty:1000, unit:"g",  price:2.50,  pack:"Épinards en branches surgelés U, 1 kg", pantry:false},
  "poêlée de légumes":       {cat:"Surgelés",              qty:600,  unit:"g",  price:3.20,  pack:"Poêlée de légumes U, 600 g",            pantry:false},
  "frites surgelées":        {cat:"Surgelés",              qty:1000, unit:"g",  price:2.80,  pack:"Frites U, 1 kg",                       pantry:false},
  "haricots verts surgelés": {cat:"Surgelés",              qty:600,  unit:"g",  price:2.50,  pack:"Haricots verts surgelés U, 600 g",     pantry:false},

  // ── Boissons ─────────────────────────────────────────────────────────────
  "vin blanc":               {cat:"Boissons",              qty:750,  unit:"ml", price:4.50,  pack:"Vin blanc U, 75 cl",                   pantry:false},
  "vin rouge":               {cat:"Boissons",              qty:750,  unit:"ml", price:4.50,  pack:"Vin rouge U, 75 cl",                   pantry:false},
  "cidre":                   {cat:"Boissons",              qty:750,  unit:"ml", price:3.20,  pack:"Cidre brut U, 75 cl",                   pantry:false},
  "bière":                   {cat:"Boissons",              qty:330,  unit:"ml", price:1.00,  pack:"Bière, canette 33 cl",                  pantry:false},
  "jus de citron":           {cat:"Boissons",              qty:200,  unit:"ml", price:1.20,  pack:"Jus de citron U, 20 cl",               pantry:true},
  "jus d'orange":            {cat:"Boissons",              qty:1000, unit:"ml", price:2.20,  pack:"Jus d'orange U, 1 L",                  pantry:false},
};

// Mots à ignorer dans les noms d'ingrédients (préparations, tailles, etc.)
const NOISE_WORDS = [
  "émincé","émincée","émincés","émincées",
  "haché","hachée","hachés","hachées",
  "coupé","coupée","coupés","coupées",
  "pelé","pelée","pelés","pelées",
  "lavé","lavée","lavés","lavées",
  "égoutté","égouttée","égouttés","égouttées",
  "cuit","cuite","cuits","cuites",
  "rôti","rôtie","rôtis","rôties",
  "grillé","grillée","grillés","grillées",
  "écrasé","écrasée","écrasés","écrasées",
  "finement","grossièrement","en dés","en lamelles","en julienne",
  "en rondelles","en quartiers","en morceaux","en tranches",
  "frais","fraîche","fraiches","fraîches","frais",
  "séché","séchée","séchés","séchées",
  "froids","froide","froid",
  "grand","grande","gros","grosse","petit","petite","moyen","moyenne",
  "entier","entière","entiers","entières",
  "bien mûr","mûr","mûre","bien mûrs",
  "à température ambiante",
  "environ","approximativement","au goût","selon le goût",
];

// ── Enseignes et multiplicateurs de prix par rayon ───────────────────────────
// Les multiplicateurs sont appliqués sur les prix de base Magasins U.
// Ils reflètent les écarts constatés en France (novembre 2026, marques propres).
const STORES = {
  u:            { label: "Magasins U",   mult: { "Fruits et légumes":1.00,"Boucherie et poisson":1.00,"Crèmerie et œufs":1.00,"Boulangerie":1.00,"Épicerie":1.00,"Surgelés":1.00,"Boissons":1.00,"Hygiène et maison":1.00,"Autres":1.00 } },
  leclerc:      { label: "E.Leclerc",    mult: { "Fruits et légumes":0.88,"Boucherie et poisson":0.90,"Crèmerie et œufs":0.86,"Boulangerie":0.90,"Épicerie":0.85,"Surgelés":0.88,"Boissons":0.82,"Hygiène et maison":0.84,"Autres":0.88 } },
  auchan:       { label: "Auchan",        mult: { "Fruits et légumes":0.93,"Boucherie et poisson":0.95,"Crèmerie et œufs":0.92,"Boulangerie":0.94,"Épicerie":0.92,"Surgelés":0.93,"Boissons":0.90,"Hygiène et maison":0.91,"Autres":0.92 } },
  intermarche:  { label: "Intermarché",  mult: { "Fruits et légumes":0.92,"Boucherie et poisson":0.93,"Crèmerie et œufs":0.91,"Boulangerie":0.93,"Épicerie":0.91,"Surgelés":0.92,"Boissons":0.89,"Hygiène et maison":0.90,"Autres":0.91 } },
  lidl:         { label: "Lidl",          mult: { "Fruits et légumes":0.80,"Boucherie et poisson":0.83,"Crèmerie et œufs":0.78,"Boulangerie":0.75,"Épicerie":0.78,"Surgelés":0.80,"Boissons":0.78,"Hygiène et maison":0.80,"Autres":0.80 } },
  picnic:       { label: "Picnic",        mult: { "Fruits et légumes":0.90,"Boucherie et poisson":0.92,"Crèmerie et œufs":0.88,"Boulangerie":0.92,"Épicerie":0.87,"Surgelés":0.89,"Boissons":0.85,"Hygiène et maison":0.86,"Autres":0.89 } },
};

// Cherche la meilleure correspondance dans le dictionnaire
// store : clé dans STORES (défaut "u")
function findIngredient(name, store) {
  const n = name.trim().toLowerCase();
  const mult = (STORES[store] || STORES.u).mult;
  const adjust = entry => {
    const m = mult[entry.cat] || 1;
    return { ...entry, price: Math.round(entry.price * m * 100) / 100 };
  };
  if (DICT[n]) return { key: n, ...adjust(DICT[n]) };
  let best = null, bestLen = 0;
  for (const [k, v] of Object.entries(DICT)) {
    if (n.includes(k) || k.includes(n)) {
      if (k.length > bestLen) { bestLen = k.length; best = { key: k, ...adjust(v) }; }
    }
  }
  return best;
}

module.exports = { DICT, CATS, NOISE_WORDS, STORES, findIngredient };
