<script>
  import { env } from '$env/dynamic/public';

  let code = '';
  let sanitizedCode = '';
  let recommendations = '';
  let error = '';
  let loading = false;

  async function sanitize() {
    sanitizedCode = '';
    recommendations = '';
    loading = true;
    try {
      const res = await fetch(`${env.PUBLIC_API_URL}/api/generate_with_recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: code })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        error = err.error || 'An unknown error occurred.';
        return;
      }

      const data = await res.json();
      sanitizedCode = data.sanitizedCode || '';
      recommendations = data.recommendations || '';
      error = '';
    } catch (e) {
      error = 'Failed to connect to the API. Please try again later.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex flex-col bg-black text-white">
  <div class="flex-1 flex items-center justify-center">
    {#if !sanitizedCode}
      <div class="w-full max-w-2xl p-8 rounded-xl shadow-2xl bg-gray-800 bg-opacity-90 flex flex-col gap-6">
        <h1 class="text-6xl font-extrabold text-purple-400 text-center drop-shadow-neon">Lumikko</h1>
        <p class="text-xl font-semibold text-gray-300 text-center mb-2">Make your code more secure and avoid sensitive information.</p>
        <textarea
          bind:value={code}
          class="flex-1 w-full min-h-[16rem] max-h-[40vh] p-4 rounded-lg bg-gray-900 border-2 border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg font-mono resize-none placeholder-gray-500"
          placeholder="Paste your code or script here..."
        ></textarea>
        <button
          class="mt-4 w-full py-3 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-bold text-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          on:click={sanitize}
          disabled={loading || !code.trim()}
        >
          {loading ? 'Improving...' : 'Improve It!'}
        </button>
      </div>
    {/if}
  </div>

  {#if error}
    <div class="w-full max-w-2xl mx-auto mt-8 p-4 rounded-lg bg-red-800 bg-opacity-80 text-red-200 text-center font-semibold">
      {error}
    </div>
  {/if}

  {#if sanitizedCode}
    <div class="w-full min-h-screen bg-gray-800 bg-opacity-90 flex flex-col gap-4">
      <div class="pt-12 pb-2">
        <h1 class="text-6xl font-extrabold text-purple-400 text-center drop-shadow-neon mb-2">Lumikko</h1>
        <p class="text-xl font-semibold text-gray-300 text-center mb-4">Here is your improved code.</p>
      </div>
      <div class="flex flex-row gap-4 px-4 pb-6 flex-1">
        <div class="flex-1 flex flex-col min-w-0">
          <div class="text-lg font-semibold text-gray-400 mb-2">Original</div>
          <pre class="whitespace-pre-wrap bg-gray-900 p-4 rounded-lg overflow-x-auto text-lg font-mono text-gray-400 border border-gray-700 min-h-[200px]">{code}</pre>
        </div>
        <div class="flex-1 flex flex-col min-w-0">
          <div class="text-lg font-semibold text-purple-300 mb-2">Improved</div>
          <pre class="whitespace-pre-wrap bg-gray-900 p-4 rounded-lg overflow-x-auto text-lg font-mono text-gray-100 border border-purple-700 min-h-[200px]">{sanitizedCode}</pre>
        </div>
      </div>
    </div>
    <div class="w-full flex flex-col items-center justify-center pt-8 sm:pt-12 lg:pt-16">
        {#if recommendations}
          <div class="w-full sm:w-[100%] lg:w-[96%] xl:w-[84%] 2xl:w-[72%] max-w-5xl mx-auto mb-4 p-4 px-8 rounded-lg bg-[#1a0826] bg-opacity-90 border border-purple-950 shadow-lg">
            <div class="mb-2 text-purple-200 font-semibold">Recommendations for further code improvements:</div>
            <div class="prose prose-invert prose-purple max-w-none font-normal text-gray-200
                        prose-p:text-gray-200 prose-li:text-gray-200 prose-strong:text-purple-200 prose-code:text-purple-300">
              {@html recommendations}
            </div>
          </div>
        {/if}
        <button
          class="mb-8 w-48 mx-auto py-3 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed block"
          on:click={() => { sanitizedCode = ''; recommendations = ''; error = ''; }}
        >
          Return
        </button>
      </div>
    {/if}

  <footer class="w-full text-center mb-4 text-sm text-gray-500">
    <span>Made by 
      <a 
        href="https://github.com/NeonTowel" 
        target="_blank" 
        rel="noopener noreferrer"
        class="underline hover:text-purple-400 transition-colors"
      > NeonTowel</a> 🦄
      &nbsp;|&nbsp; Dedicated to the public domain (<a href="https://unlicense.org/" target="_blank" class="underline hover:text-purple-400">Unlicense</a>)
      &nbsp;|&nbsp; Powered by Private Azure OpenAI ⚡
    </span>
  </footer>
</div>

<style>
  /* Optional: Neon drop shadow for header */
  .drop-shadow-neon {
    text-shadow: 0 0 8px #a78bfa, 0 0 16px #a78bfa;
  }

  .prose ul, .prose ol {
    list-style-type: revert !important;
    list-style-position: inside !important;
    margin-left: 1.5em !important;
    padding-left: 1em !important;
  }
  .prose ul {
    list-style-type: disc !important;
  }
  .prose ol {
    list-style-type: decimal !important;
  }
  .prose li {
    margin-bottom: 0.5em !important;
  }
</style>
