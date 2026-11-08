const POSTS_PER_PAGE = 5;

const postsContainer = document.getElementById("posts-container");
const mobilePostsContainer = document.getElementById("mobile-posts-container");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const previousButton = document.getElementById("previous-button");
const nextButton = document.getElementById("next-button");
const resultsInfo = document.getElementById("results-info");
const pageIndicator = document.getElementById("page-indicator");

let currentPosts = [];
let isLoading = false;

function readStateFromURL() {
  const params = new URLSearchParams(window.location.search);
  const pageValue = Number.parseInt(params.get("_page"), 10);
  const limitValue = Number.parseInt(params.get("_limit"), 10);
  const sortField = params.get("_sort") || "";
  const sortOrder = params.get("_order") || "";

  const validSort = ["title", "id"].includes(sortField) &&
    ["asc", "desc"].includes(sortOrder);

  return {
    page: Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1,
    limit: Number.isInteger(limitValue) && limitValue > 0 ? limitValue : POSTS_PER_PAGE,
    search: params.get("title_like") || "",
    sortField: validSort ? sortField : "",
    sortOrder: validSort ? sortOrder : ""
  };
}

let state = readStateFromURL();

function updateURL() {
  const params = new URLSearchParams();
  params.set("_page", String(state.page));
  params.set("_limit", String(state.limit));

  if (state.search) params.set("title_like", state.search);
  if (state.sortField && state.sortOrder) {
    params.set("_sort", state.sortField);
    params.set("_order", state.sortOrder);
  }

  const newURL = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
  window.history.pushState({}, "", newURL);
}

function syncControls() {
  searchInput.value = state.search;
  sortSelect.value = state.sortField && state.sortOrder
    ? `${state.sortField}-${state.sortOrder}`
    : "";
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function renderLoading() {
  postsContainer.innerHTML = '<tr><td colspan="3" class="table-message">Loading posts...</td></tr>';
  mobilePostsContainer.innerHTML = '<div class="mobile-empty">Loading posts...</div>';
  resultsInfo.textContent = "Loading posts...";
  previousButton.disabled = true;
  nextButton.disabled = true;
}

function renderError(message) {
  postsContainer.innerHTML = `<tr><td colspan="3" class="table-message">${escapeHTML(message)}</td></tr>`;
  mobilePostsContainer.innerHTML = `<div class="mobile-empty">${escapeHTML(message)}</div>`;
  resultsInfo.textContent = "Could not load posts.";
  previousButton.disabled = state.page <= 1;
  nextButton.disabled = true;
  pageIndicator.textContent = `Page ${state.page}`;
}

function renderPosts(posts, total) {
  currentPosts = posts;

  if (posts.length === 0) {
    postsContainer.innerHTML = '<tr><td colspan="3" class="table-message">No posts found. Try another search.</td></tr>';
    mobilePostsContainer.innerHTML = '<div class="mobile-empty">No posts found. Try another search.</div>';
  } else {
    postsContainer.innerHTML = posts.map((post) => `
      <tr>
        <td><span class="post-id">${escapeHTML(post.id)}</span></td>
        <td><strong class="post-title">${escapeHTML(post.title)}</strong></td>
        <td><span class="post-body">${escapeHTML(post.body)}</span></td>
      </tr>
    `).join("");

    mobilePostsContainer.innerHTML = posts.map((post) => `
      <article class="mobile-post-card">
        <div class="mobile-post-top">
          <span class="post-id">${escapeHTML(post.id)}</span>
          <strong class="post-title">${escapeHTML(post.title)}</strong>
        </div>
        <p class="post-body">${escapeHTML(post.body)}</p>
      </article>
    `).join("");
  }

  const startItem = posts.length ? ((state.page - 1) * state.limit) + 1 : 0;
  const endItem = ((state.page - 1) * state.limit) + posts.length;

  if (total !== null && Number.isFinite(total)) {
    resultsInfo.textContent = total === 0
      ? "No results"
      : `Showing ${startItem}–${endItem} of ${total} posts`;
    const totalPages = Math.max(1, Math.ceil(total / state.limit));
    nextButton.disabled = state.page >= totalPages || posts.length === 0;
  } else {
    resultsInfo.textContent = posts.length
      ? `Showing ${startItem}–${endItem} posts`
      : "No results";
    nextButton.disabled = posts.length < state.limit;
  }

  previousButton.disabled = state.page <= 1;
  pageIndicator.textContent = `Page ${state.page}`;
}

async function loadPosts() {
  if (isLoading) return;
  isLoading = true;
  renderLoading();

  try {
    const result = await fetchPosts(state);
    renderPosts(result.posts, result.total);
  } catch (error) {
    console.error(error);
    renderError(error.message || "Something went wrong while loading posts.");
  } finally {
    isLoading = false;
  }
}

function applyStateChange(changes) {
  state = { ...state, ...changes };
  updateURL();
  syncControls();
  loadPosts();
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  applyStateChange({
    search: searchInput.value.trim(),
    page: 1
  });
});

sortSelect.addEventListener("change", () => {
  const [sortField, sortOrder] = sortSelect.value
    ? sortSelect.value.split("-")
    : ["", ""];

  applyStateChange({
    sortField,
    sortOrder,
    page: 1
  });
});

previousButton.addEventListener("click", () => {
  if (state.page > 1) {
    applyStateChange({ page: state.page - 1 });
  }
});

nextButton.addEventListener("click", () => {
  if (!nextButton.disabled) {
    applyStateChange({ page: state.page + 1 });
  }
});

window.addEventListener("popstate", () => {
  state = readStateFromURL();
  syncControls();
  loadPosts();
});

syncControls();
loadPosts();
