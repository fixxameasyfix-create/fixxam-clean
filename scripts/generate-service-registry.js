const fs = require("fs");
const path = require("path");

const servicesDir = path.join(
  __dirname,
  "..",
  "assets",
  "services"
);

const outputFile = path.join(
  __dirname,
  "..",
  "constants",
  "serviceRegistry.ts"
);

const files = fs
  .readdirSync(servicesDir)
  .filter((file) => file.endsWith(".json"));

const toVariableName = (fileName) => {
  return fileName
    .replace(".json", "")
    .replace(/-([a-z])/g, (_, c) =>
      c.toUpperCase()
    )
    .replace(/[^a-zA-Z0-9]/g, "");
};

let imports = "";
let registryEntries = "";

files.forEach((file) => {
  const variableName =
    toVariableName(file);

  imports += `import ${variableName} from "@/assets/services/${file}";\n`;

  registryEntries += `  "${file.replace(
    ".json",
    ""
  )}": ${variableName},\n`;
});

const content = `${imports}

export const serviceRegistry = {
${registryEntries}};
`;

fs.writeFileSync(
  outputFile,
  content,
  "utf8"
);

console.log(
  "✅ serviceRegistry.ts generated successfully"
);