<script lang="ts">
  import { onMount } from "svelte";
  import { auth } from "$lib/authService";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";

  let loading = true;
  let error = "";
  let status = "Processing authentication...";

  // Global flag to prevent multiple callback processing across all instances
  let globalCallbackProcessed = false;
  if (browser && typeof window !== "undefined") {
    // Check if we've already processed a callback in this session
    // @ts-ignore - Custom property on window
    if (window.__lumikko_callback_processed) {
      globalCallbackProcessed = true;
    }
  }

  onMount(() => {
    // Prevent multiple processing using global flag
    if (globalCallbackProcessed) {
      goto("/");
      return;
    }

    // Simple immediate check
    const urlParams = new URLSearchParams(window.location.search);
    const hasCode = urlParams.has("code");
    const hasError = urlParams.has("error");

    if (!hasCode && !hasError) {
      goto("/");
      return;
    }

    if (hasError) {
      const errorParam = urlParams.get("error");
      const errorDescription = urlParams.get("error_description");
      error = `Auth0 Error: ${errorParam} - ${errorDescription}`;
      loading = false;
      setTimeout(() => goto("/"), 3000);
      return;
    }

    // Mark as processing globally to prevent duplicate calls
    globalCallbackProcessed = true;
    if (browser && typeof window !== "undefined") {
      // @ts-ignore - Custom property on window
      window.__lumikko_callback_processed = true;
    }

    // Handle the callback
    auth
      .handleRedirectCallback()
      .then((result) => {
        status = "Success! Redirecting...";
        loading = false;

        // Clear the URL parameters to prevent reprocessing
        window.history.replaceState({}, document.title, "/");

        setTimeout(() => goto("/"), 1000);
      })
      .catch((err) => {
        console.error("Callback: ERROR during handleRedirectCallback:", err);
        error = err instanceof Error ? err.message : "Authentication failed";
        loading = false;

        // Clear the URL parameters even on error
        window.history.replaceState({}, document.title, "/");

        setTimeout(() => goto("/"), 3000);
      });
  });
</script>

<div class="min-h-screen flex items-center justify-center bg-black text-white">
  <div class="text-center">
    {#if loading && !error}
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"
      ></div>
      <p class="text-lg text-gray-300">Processing authentication...</p>
      <p class="text-sm text-gray-400 mt-2">{status}</p>
    {:else if error}
      <div class="text-red-400 mb-4">
        <svg
          class="w-12 h-12 mx-auto mb-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <p class="text-lg text-red-300 mb-2">Authentication Error</p>
      <p class="text-sm text-gray-400 mb-4">{error}</p>
      <p class="text-xs text-gray-500">Redirecting to home page...</p>
    {:else}
      <div class="text-green-400 mb-4">
        <svg
          class="w-12 h-12 mx-auto mb-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <p class="text-lg text-green-300">Authentication Successful!</p>
      <p class="text-sm text-gray-400">Redirecting...</p>
    {/if}
  </div>
</div>
