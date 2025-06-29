<script lang="ts">
  import "../app.css";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { isAuthenticated, user, auth } from "$lib/authService";

  // Check if we're on the callback page
  $: isCallbackPage = $page.url.pathname === "/callback";

  onMount(() => {
    async function checkAuth() {
      // Skip auth check on callback page to avoid interference
      if (isCallbackPage) {
        return;
      }

      try {
        await auth.checkSession();
      } catch (error) {
        console.error("Layout: Auth check failed:", error);
      }
    }

    checkAuth();
  });
</script>

{#if $isAuthenticated}
  <header class="bg-gray-800 bg-opacity-90 p-4 border-b border-purple-500">
    <div class="max-w-6xl mx-auto flex justify-between items-center">
      <h1 class="text-2xl font-bold text-purple-400 drop-shadow-neon">
        Lumikko
      </h1>
      <div class="flex items-center gap-4">
        {#if $user}
          <span class="text-gray-300"
            >Welcome, {$user.name || $user.email}!</span
          >
        {/if}
        <button
          on:click={auth.logout}
          class="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          Log out
        </button>
      </div>
    </div>
  </header>
  <main class="flex-1">
    <slot />
  </main>
{:else if isCallbackPage}
  <!-- Show callback page even when not authenticated -->
  <slot />
{:else}
  <div class="min-h-screen flex flex-col bg-black text-white">
    <div class="flex-1 flex items-center justify-center">
      <div
        class="w-full max-w-md p-8 rounded-xl shadow-2xl bg-gray-800 bg-opacity-90 flex flex-col gap-6"
      >
        <div class="text-center">
          <h1
            class="text-5xl font-extrabold text-purple-400 drop-shadow-neon mb-4"
          >
            Lumikko
          </h1>
          <p class="text-xl font-semibold text-gray-300 mb-2">
            Secure Code Sanitization
          </p>
          <p class="text-gray-400 mb-6">
            Please log in to continue and start improving your code security.
          </p>
        </div>

        <div class="space-y-4">
          <button
            on:click={auth.loginWithRedirect}
            class="w-full py-3 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold text-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            Log in with Auth0
          </button>
        </div>

        <div class="text-center text-sm text-gray-500">
          <p>Secure authentication powered by Auth0</p>
        </div>
      </div>
    </div>

    <footer class="w-full text-center mb-4 text-sm text-gray-500">
      <span
        >Made by
        <a
          href="https://github.com/NeonTowel/lumikko"
          target="_blank"
          rel="noopener noreferrer"
          class="underline hover:text-purple-400 transition-colors"
        >
          NeonTowel</a
        >
        🦄 &nbsp;|&nbsp; Dedicated to the public domain (<a
          href="https://unlicense.org/"
          target="_blank"
          class="underline hover:text-purple-400">Unlicense</a
        >) &nbsp;|&nbsp; Powered by Private Azure OpenAI ⚡
      </span>
    </footer>
  </div>
{/if}

<style>
  /* Neon drop shadow for header */
  .drop-shadow-neon {
    text-shadow:
      0 0 8px #a78bfa,
      0 0 16px #a78bfa;
  }
</style>
