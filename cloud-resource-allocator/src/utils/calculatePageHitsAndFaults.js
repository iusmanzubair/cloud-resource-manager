export const calculatePagesHitsAndFaults = async (pages, ramSlots, algo) => {
  console.log(pages)
  try {
    const response = await fetch(`http://localhost:4000/api/${algo}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ramSlots,
        diskPages: pages
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      pageFaults: data.pageFaults,
      pageHits: data.pageHits
    };
  } catch (error) {
    console.error("API Error:", error);
  }
};       