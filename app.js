const cards = document.getElementById("cards");
    const search = document.getElementById("search");
    const domain = document.getElementById("domain");
    const message = document.getElementById("message");

    let internships = [];

    async function loadInternships() {
      message.textContent = "Loading internships...";
      cards.replaceChildren();

      try {
        const response = await fetch("/api/internships");

        if (!response.ok) {
          throw new Error("Failed to load internships.");
        }

        const result = await response.json();
        internships = result.data || [];
        render();
      } catch (err) {
        message.textContent =
          "Could not load internships. Please try again.";
        cards.replaceChildren();
      }
    }

    function render() {
      const term = search.value.trim().toLowerCase();
      const selected = domain.value;

      const results = internships.filter(item =>
        (selected === "all" ||
          item.domain.toLowerCase() === selected.toLowerCase()) &&
        (item.title + " " + item.company + " " +
          item.domain + " " + item.location)
          .toLowerCase().includes(term)
      );

      cards.replaceChildren();

      message.textContent = results.length
        ? `${results.length} internship opportunities found`
        : "No internships found. Try another search.";

      results.forEach(item => {
        const card = document.createElement("article");
        card.className = "card";

        const title = document.createElement("h2");
        title.textContent = item.title;

        const company = document.createElement("p");
        company.textContent = item.company;

        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = item.domain;

        const location = document.createElement("p");
        location.textContent = "Location: " + item.location;

        const description = document.createElement("p");
        description.textContent = item.description;

        card.append(title, company, tag, location, description);
        cards.appendChild(card);
      });
    }

    search.addEventListener("input", render);
    domain.addEventListener("change", render);

    loadInternships();
