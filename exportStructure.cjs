// exportStructure.js
const fs = require("fs");
const path = require("path");

function generateTree(dir, depth = 0, ignore = ['node_modules', '.git', 'dist', 'build']) {
  if (depth > 5) return "";

  let output = "";
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (ignore.includes(file)) continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    output += "  ".repeat(depth) + "|-- " + file + "\n";
    if (stat.isDirectory()) {
      output += generateTree(fullPath, depth + 1, ignore);
    }
  }
  return output;
}

const tree = generateTree(".");
fs.writeFileSync("structure.txt", tree);
console.log("Project structure exported to structure.txt");
