import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// Paths to configuration files
const ANCHOR_TOML_PATH = path.resolve(__dirname, "../../../Anchor.toml");
const SOLITARC_JS_PATH = path.resolve(__dirname, "../../../sdk/.solitarc.js");
const PROGRAM_KEYPAIR_PATH = path.resolve(
  __dirname,
  "../../../program-keypairs/reclaim-program-keypair.json"
);
const PROGRAM_LIB_PATH = path.resolve(
  __dirname,
  "../../../programs/reclaim/src/lib.rs"
);
const UTILS_TS_PATH = path.resolve(__dirname, "../utils.ts");

// Generate a new program keypair
console.log("Generating new program keypair...");
const keygenOutput = execSync(
  `solana-keygen new --outfile ${PROGRAM_KEYPAIR_PATH} --force`,
  { encoding: "utf-8" }
);
console.log("New program keypair generated successfully.");

// Extract the public key from the output
const pubkeyMatch = keygenOutput.match(/pubkey: (\w+)/);
if (!pubkeyMatch) {
  console.error("Failed to extract the public key from the keygen output.");
  process.exit(1);
}
const newProgramId = pubkeyMatch[1];
console.log(`New Program ID: ${newProgramId}`);

// Update Anchor.toml
console.log("Updating Anchor.toml...");
let anchorToml = fs.readFileSync(ANCHOR_TOML_PATH, "utf-8");
anchorToml = anchorToml.replace(
  /reclaim = ['"].*['"]/,
  `reclaim = "${newProgramId}"`
);
fs.writeFileSync(ANCHOR_TOML_PATH, anchorToml);
console.log("Anchor.toml updated successfully.");

// Update .solitarc.js
console.log("Updating .solitarc.js...");
let solitarcJs = fs.readFileSync(SOLITARC_JS_PATH, "utf-8");
solitarcJs = solitarcJs.replace(
  /programId: ['"].*['"]/,
  `programId: "${newProgramId}"`
);
fs.writeFileSync(SOLITARC_JS_PATH, solitarcJs);
console.log(".solitarc.js updated successfully.");

// Update lib.rs
console.log("Updating lib.rs...");
let programLib = fs.readFileSync(PROGRAM_LIB_PATH, "utf-8");
programLib = programLib.replace(
  /declare_id!\(["'].*["']\);/,
  `declare_id!("${newProgramId}");`
);
fs.writeFileSync(PROGRAM_LIB_PATH, programLib);
console.log("lib.rs updated successfully.");

// Update utils.ts
console.log("Updating utils.ts...");
let utilsTs = fs.readFileSync(UTILS_TS_PATH, "utf-8");
utilsTs = utilsTs.replace(
  /return new PublicKey\(["'].*["']\)/,
  `return new PublicKey("${newProgramId}")`
);
fs.writeFileSync(UTILS_TS_PATH, utilsTs);
console.log("utils.ts updated successfully.");

console.log(
  "All configuration files updated successfully. You are now ready to deploy your program."
);
