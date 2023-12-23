<script>
    export let form;
    import { getToastStore } from '@skeletonlabs/skeleton';

    const toastStore = getToastStore();

    $: if (form?.errors?.not_match) {
        console.log(form?.errors?.not_match);
        toastStore.trigger({
            message: form?.errors?.not_match,
            background: 'variant-filled-error',
        });
    }

    $: if (form?.errors?.db) {
        console.log(form?.errors?.db);
        toastStore.trigger({
            message: form?.errors?.db,
            background: 'variant-filled-error',
        });
    }

    let passwordPolicyError = '';
    $: {
        passwordPolicyError = 'Your password must contain at least:<br />'
        if (form?.errors?.policy && form?.errors?.policy[0]) {
            Object.keys(form?.errors?.policy[0]).forEach((key) => {
                if (!form?.errors?.policy[0][key].pass){
                    passwordPolicyError += `<span class="badge variant-filled-error">${form?.errors?.policy[0][key].message}</span><br />`
                }
            })
        }
    }
</script>

<div class="flex flex-row min-h-screen justify-center items-center">
	<div class="card bg-inital card-hover overflow-hidden py-10 px-12 w-[375px] md:w-[600px] lg:w-[600px]">
		<header class="mb-4">
			<h2 class="h2">Register</h2>
		</header>
        <form method="POST" id="registerForm">
            <div class="p-4 space-y-4">
                <label class="label">
                    <span>First name</span>
                    <input form="registerForm" name="firstname" class={(form?.errors?.firstname ? "input input-error" : "input")} type="text" placeholder="first name" value={form?.data?.firstname ?? ''} />
                    {#if form?.errors?.firstname}
                    <span class="badge variant-filled-error">{form?.errors?.firstname}</span>
                    {/if}
                </label>
                <label class="label">
                    <span>Surname</span>
                    <input form="registerForm" name="surname" class={(form?.errors?.surname ? "input input-error" : "input")} type="text" placeholder="surname" value={form?.data?.surname ?? ''} />
                    {#if form?.errors?.surname}
                    <span class="badge variant-filled-error">{form?.errors?.surname}</span>
                    {/if}
                </label>
                <label class="label">
                    <span>Email</span>
                    <input form="registerForm" name="email" class={((form?.errors?.email || form?.errors?.db) ? "input input-error" : "input")} type="text" placeholder="email" value={form?.data?.email ?? ''} />
                    {#if form?.errors?.email}
                    <span class="badge variant-filled-error">{form?.errors?.email}</span>
                    {/if}
                </label>
                <label class="label">
                    <span>Password</span>
                    <input form="registerForm" name="password" class={((form?.errors?.password || form?.errors?.not_match) ? "input input-error" : "input")} type="password" placeholder="password" />
                    {#if form?.errors?.policy && form?.errors?.policy[0]}
                    {@html passwordPolicyError}
                    {/if}
                    {#if form?.errors?.password}
                    <span class="badge variant-filled-error">{form?.errors?.password}</span>
                    {/if}
                </label>
                <label class="label">
                    <span>Confirm Password</span>
                    <input form="registerForm" name="confirmpassword" class={((form?.errors?.confirmpassword || form?.errors?.not_match) ? "input input-error" : "input")} type="password" placeholder="password" />
                    {#if form?.errors?.confirmpassword}
                    <span class="badge variant-filled-error">{form?.errors?.confirmpassword}</span>
                    {/if}
                </label>
                <div class="text-center">
                    <a href="/forgot" class="text-gray-500 text-sm underline">Forgot password?</a>
                </div>
            </div>
            <hr class="opacity-50" />
            <footer class="p-4 flex justify-around ">
                <a href="/login" type="button" class="btn variant-filled-secondary">Login</a>
                <button form="registerForm" class="btn variant-filled-primary">
                    <span>Register</span>
                </button>
            </footer>
        </form>
	</div>
</div>

