document.addEventListener("DOMContentLoaded", () => {
  const modals = document.querySelectorAll(".modal");
  const openButtons = document.querySelectorAll("[data-modal-open]");
  const closeButtons = document.querySelectorAll(".btn-modal-close");

  function openModal(modalId) {
    const modal = document.querySelector(modalId);
    if (modal) {
      modal.classList.add("is-visible");
      document.body.classList.add("scroll-stop");
    }
  }

  function closeModal() {
    modals.forEach((modal) => modal.classList.remove("is-visible"));
    document.body.classList.remove("scroll-stop");
  }

  openButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const modalId = event.target.getAttribute("data-modal-open");
      openModal(modalId);
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });

  modals.forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (!event.target.closest(".modal-content")) {
        closeModal();
      }
    });
  });
});
