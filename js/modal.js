const modal = document.getElementById("post-modal");
const openModalButton = document.getElementById("open-modal-button");
const closeModalButton = document.getElementById("close-modal-button");
const cancelModalButton = document.getElementById("cancel-modal-button");
const successCloseButton = document.getElementById("success-close-button");
const postForm = document.getElementById("post-form");
const titleInput = document.getElementById("post-title");
const bodyInput = document.getElementById("post-body");
const titleError = document.getElementById("title-error");
const bodyError = document.getElementById("body-error");
const submitError = document.getElementById("submit-error");
const titleCount = document.getElementById("title-count");
const submitPostButton = document.getElementById("submit-post-button");
const successPanel = document.getElementById("success-panel");

function openModal() {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  window.setTimeout(() => titleInput.focus(), 50);
}

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  resetModal();
}

function resetModal() {
  postForm.reset();
  postForm.hidden = false;
  successPanel.hidden = true;
  titleError.textContent = "";
  bodyError.textContent = "";
  submitError.textContent = "";
  titleInput.removeAttribute("aria-invalid");
  bodyInput.removeAttribute("aria-invalid");
  titleCount.textContent = "0/30";
  submitPostButton.disabled = false;
  submitPostButton.innerHTML = "<span>＋</span> Create Post";
}

function validateForm() {
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  let isValid = true;

  titleError.textContent = "";
  bodyError.textContent = "";
  submitError.textContent = "";
  titleInput.removeAttribute("aria-invalid");
  bodyInput.removeAttribute("aria-invalid");

  if (!title) {
    titleError.textContent = "Title is required.";
    titleInput.setAttribute("aria-invalid", "true");
    isValid = false;
  } else if (/\d/.test(title)) {
    titleError.textContent = "Title must not contain digits.";
    titleInput.setAttribute("aria-invalid", "true");
    isValid = false;
  } else if (title.length > 30) {
    titleError.textContent = "Title must be 30 characters or fewer.";
    titleInput.setAttribute("aria-invalid", "true");
    isValid = false;
  }

  if (!body) {
    bodyError.textContent = "Body is required.";
    bodyInput.setAttribute("aria-invalid", "true");
    isValid = false;
  } else if (/\d/.test(body)) {
    bodyError.textContent = "Body must not contain digits.";
    bodyInput.setAttribute("aria-invalid", "true");
    isValid = false;
  }

  return isValid;
}

function showCreatedPost(post) {
  document.getElementById("created-id").textContent = post.id;
  document.getElementById("created-title").textContent = post.title;
  document.getElementById("created-body").textContent = post.body;
  postForm.hidden = true;
  successPanel.hidden = false;
  successCloseButton.focus();
}

openModalButton.addEventListener("click", openModal);
closeModalButton.addEventListener("click", closeModal);
cancelModalButton.addEventListener("click", closeModal);
successCloseButton.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) {
    closeModal();
  }
});

titleInput.addEventListener("input", () => {
  titleCount.textContent = `${titleInput.value.length}/30`;
  if (titleInput.value.length > 30) {
    titleCount.classList.add("field-error");
  } else {
    titleCount.classList.remove("field-error");
  }
});

postForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateForm()) return;

  const postData = {
    title: titleInput.value.trim(),
    body: bodyInput.value.trim()
  };

  submitPostButton.disabled = true;
  submitPostButton.textContent = "Creating...";
  submitError.textContent = "";

  try {
    const createdPost = await createPost(postData);
    showCreatedPost(createdPost);
  } catch (error) {
    console.error(error);
    submitError.textContent = error.message || "Failed to create post. Please try again.";
    submitPostButton.disabled = false;
    submitPostButton.innerHTML = "<span>＋</span> Create Post";
  }
});
