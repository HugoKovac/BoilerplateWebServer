<script>
    export let form;

    import { getToastStore } from '@skeletonlabs/skeleton';

    const toastStore = getToastStore();

    $: if (form?.errors?.invalid) {
        console.log(form?.errors?.invalid);
        toastStore.trigger({
            message: form?.errors?.invalid,
            background: 'variant-filled-error',
        });
    }
</script>

<div class="flex flex-row min-h-screen justify-center items-center">
	<div class="card bg-inital card-hover overflow-hidden py-10 px-12 w-[375px] md:w-[600px] lg:w-[600px]">
		<header class="mb-4">
			<h2 class="h2">Login</h2>
		</header>
        <form method="POST" id="loginForm">
            <div class="p-4 space-y-4">
                <label class="label">
                    <span>Email</span>
                    <input form="loginForm" name="email" class={(form?.errors?.email ? "input input-error" : "input")} type="text" placeholder="email" value={form?.data?.email ?? ''} />
                    {#if form?.errors?.email}
                    <span class="badge variant-filled-error">{form?.errors?.email[0]}</span>
                    {/if}
                </label>
                <label class="label">
                    <span>Password</span>
                    <input form="loginForm" name="password" class={((form?.errors?.password || form?.errors?.invalid) ? "input input-error" : "input")} type="password" placeholder="password" />
                    {#if form?.errors?.password}
                    <span class="badge variant-filled-error">{form?.errors?.password[0]}</span>
                    {/if}
                </label>
                <div class="text-center">
                    <a href="/forgot" class="text-gray-500 text-sm underline">Forgot password?</a>
                </div>
            </div>
            <hr class="opacity-50" />
            <footer class="p-4 flex justify-around ">
                <a href="/register" type="button" class="btn variant-filled-secondary">Register</a>
                <button form="loginForm" class="btn variant-filled-primary">
                    <span>Login</span>
                </button>
            </footer>
        </form>
	</div>
</div>
