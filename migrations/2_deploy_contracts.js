const TranscriptRegistry = artifacts.require("TranscriptRegistry");

module.exports = function (deployer) {
  deployer.deploy(TranscriptRegistry);
};
