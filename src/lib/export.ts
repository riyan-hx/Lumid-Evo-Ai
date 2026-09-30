/** Downloads everything Evo stores on this device as a JSON file. */
export function exportMyData(data: unknown) {
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), app: "Lumid Evo", data }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `evo-my-data-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
