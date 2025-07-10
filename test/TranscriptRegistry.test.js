const TranscriptRegistry = artifacts.require("TranscriptRegistry");
const { expectRevert } = require('@openzeppelin/test-helpers');

contract("TranscriptRegistry", accounts => {
  const owner = accounts[0];
  const other = accounts[1];

  let instance;
  const matric = "U1234567";
  const hash = "QmFakeIpfsHash";

  beforeEach(async () => {
    instance = await TranscriptRegistry.new({ from: owner });
  });

  it("should set deployer as owner", async () => {
    const contractOwner = await instance.owner();
    assert.equal(contractOwner, owner);
  });

  it("owner can upload a transcript", async () => {
    const tx = await instance.uploadTranscript(matric, hash, { from: owner });
    assert.equal(tx.logs[0].event, "TranscriptUploaded");
    assert.equal(tx.logs[0].args.matricNumber, matric);
    assert.equal(tx.logs[0].args.documentHash, hash);
  });

  it("non-owner cannot upload", async () => {
    await expectRevert(
      instance.uploadTranscript(matric, hash, { from: other }),
      "Not authorized"
    );
  });

  it("prevents duplicate matric numbers", async () => {
    await instance.uploadTranscript(matric, hash, { from: owner });
    await expectRevert(
      instance.uploadTranscript(matric, "AnotherHash", { from: owner }),
      "Matric number already registered"
    );
  });

  it("prevents duplicate document hashes", async () => {
    await instance.uploadTranscript(matric, hash, { from: owner });
    await expectRevert(
      instance.uploadTranscript("U7654321", hash, { from: owner }),
      "Document hash already registered"
    );
  });

  it("retrieves by matric number correctly", async () => {
    await instance.uploadTranscript(matric, hash, { from: owner });
    const t = await instance.getByMatric(matric);
    assert.equal(t.matricNumber, matric);
    assert.equal(t.documentHash, hash);
    assert.equal(t.uploader, owner);
  });

  it("retrieves by document hash correctly", async () => {
    await instance.uploadTranscript(matric, hash, { from: owner });
    const t = await instance.getByHash(hash);
    assert.equal(t.matricNumber, matric);
    assert.equal(t.documentHash, hash);
    assert.equal(t.uploader, owner);
  });

  it("reverts retrieval of non-existent records", async () => {
    await expectRevert(
      instance.getByMatric("NoSuchMatric"),
      "No such matric number"
    );
    await expectRevert(
      instance.getByHash("NoSuchHash"),
      "No such document hash"
    );
  });
});
