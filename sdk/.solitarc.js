const path = require("path");
const programDir = path.join(__dirname, "..", "programs/reclaim");
const idlDir = path.join(__dirname, "idl");
const sdkDir = path.join(__dirname, "src", "generated");
const binaryInstallDir = path.join(__dirname, ".crates");

module.exports = {
  idlGenerator: "anchor",
  programName: "reclaim",
  programId: "2NRByeqyVqXf4LByQP8aTAnWToK9zCwV8JSBZTW2gQAq",
  idlDir,
  sdkDir,
  binaryInstallDir,
  programDir,
};
