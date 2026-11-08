const API_BASE_URL = "https://jsonplaceholder.typicode.com";

/**
 * Fetch posts from JSONPlaceholder.
 * @param {Object} params - Current pagination, search, and sort state.
 * @returns {Promise<{posts: Array, total: number|null}>}
 */
async function fetchPosts(params) {
  const query = new URLSearchParams();
  query.set("_page", String(params.page));
  query.set("_limit", String(params.limit));

  if (params.search) {
    query.set("title_like", params.search);
  }

  if (params.sortField && params.sortOrder) {
    query.set("_sort", params.sortField);
    query.set("_order", params.sortOrder);
  }

  const response = await fetch(`${API_BASE_URL}/posts?${query.toString()}`);

  if (!response.ok) {
    throw new Error(`Unable to fetch posts (HTTP ${response.status}).`);
  }

  const posts = await response.json();
  const totalHeader = response.headers.get("X-Total-Count");

  return {
    posts,
    total: totalHeader !== null ? Number(totalHeader) : null
  };
}

async function createPost(postData) {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify({
      title: postData.title,
      body: postData.body,
      userId: 1
    })
  });

  if (!response.ok) {
    throw new Error(`Unable to create post (HTTP ${response.status}).`);
  }

  return response.json();
}
