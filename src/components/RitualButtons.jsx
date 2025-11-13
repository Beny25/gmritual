async function sendRitual(type, message) {
  if (!contract) {
    alert("Wallet not ready yet");
    return;
  }

  try {
    // Check fee & balance
    const feeValue = await contract.fee();
    
    const balance = await contract.runner.provider.getBalance(contract.runner.address);
    if (balance < feeValue) {
      alert("Not enough ETH. Ritual needs " + ethers.formatEther(feeValue) + " ETH");
      return;
    }

    // Try send TX
    const tx = await contract.performRitual(message, { value: feeValue });
    alert("Transaction sent… Waiting for confirmation.");
    await tx.wait();

    alert(`${type} ritual completed! ✨`);

  } catch (err) {
    console.error("TX ERROR:", err);

    // ===== Specific Errors =====
    if (err.code === "ACTION_REJECTED") {
      alert("You rejected the transaction.");
      return;
    }

    if (String(err).includes("insufficient funds")) {
      alert("Not enough ETH to pay fee + gas.");
      return;
    }

    if (String(err).includes("gas required exceeds allowance")) {
      alert("Gas error: contract likely reverted.");
      return;
    }

    if (String(err).includes("USER_REJECTED")) {
      alert("You cancelled the transaction.");
      return;
    }

    // Default fallback
    alert("TX failed! Check wallet network & balance.");
  }
}
