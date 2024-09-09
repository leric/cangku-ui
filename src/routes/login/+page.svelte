<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { auth } from '$lib/auth';

  let username = '';
  let password = '';

  async function handleSubmit() {
    const success = await auth.login(username, password);
    if (success) {
      const redirectTo = $page.url.searchParams.get('redirect') || '/dashboard';
      goto(redirectTo);
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center">
  <div class="w-full max-w-md p-6">
    <form on:submit|preventDefault={handleSubmit} class="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8">
      <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
      <div class="mb-4">
        <input bind:value={username} type="text" placeholder="Email" required
               class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500">
      </div>
      <div class="mb-6">
        <input bind:value={password} type="password" placeholder="Password" required
               class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500">
      </div>
      <div class="flex items-center justify-between">
        <button type="submit"
                class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300">
          Login
        </button>
      </div>
    </form>
  </div>
</div>