<script>
    import { LightSwitch } from '@skeletonlabs/skeleton';
    export let data;
    export let form;

    import { getToastStore } from '@skeletonlabs/skeleton';

    const toastStore = getToastStore();

    $: if (form?.errors?.invalid) {
        console.log(form?.errors?.invalid);
        toastStore.trigger({
            message: form?.errors?.invalid,
            background: 'variant-filled-error',
        });
    }j

    let passwordPolicyError = '';
    $: {
        passwordPolicyError = 'Your password must contain at least:<br />'
        if (form?.errors?.policy[0]) {
            Object.keys(form?.errors?.policy[0]).forEach((key) => {
                if (!form?.errors?.policy[0][key].pass){
                    passwordPolicyError += `<span class="badge variant-filled-error">${form?.errors?.policy[0][key].message}</span><br />`
                }
            })
        }
    }
</script>


<div class="flex flex-col min-h-screen justify-center items-center">
	<div class="card bg-inital card-hover overflow-hidden py-10 px-12 w-[375px] md:w-[600px] lg:w-[600px]">
		<header class="mb-4">
			<h2 class="h2">Profile</h2>
		</header>
        <form method="POST" id="editProfileForm">
            <div class="p-4 space-y-4">
                <label class="label">
                    <span>First name</span>
                    <input form="editProfileForm" name="firstname" class={(form?.errors?.firstname ? "input input-error" : "input")} type="text" placeholder="first name" value={form?.data?.firstname ?? data.user.first_name} />
                    {#if form?.errors?.firstname}
                    <span class="badge variant-filled-error">{form?.errors?.firstname}</span>
                    {/if}
                </label>
                <label class="label">
                    <span>Surname</span>
                    <input form="editProfileForm" name="surname" class={(form?.errors?.surname ? "input input-error" : "input")} type="text" placeholder="surname" value={form?.data?.surname ?? data.user.surname} />
                    {#if form?.errors?.surname}
                    <span class="badge variant-filled-error">{form?.errors?.surname}</span>
                    {/if}
                </label>
                <label class="label">
                    <span>Email</span>
                    <input form="editProfileForm" class="input" readonly="true" type="text"  value={data.user.email} />
                </label>
                <label class="label">
                    <span>New password</span>
                    <input form="editProfileForm" name="password" class={((form?.errors?.password || form?.errors?.not_match) ? "input input-error" : "input")} type="password" placeholder="password"/>
                    {#if form?.errors?.policy[0]}
                    {@html passwordPolicyError}
                    {/if}
                    {#if form?.errors?.password}
                    <span class="badge variant-filled-error">{form?.errors?.password}</span>
                    {/if}
                </label>
                <label class="label">
                    <span>Confirm password</span>
                    <input form="editProfileForm" name="confirmpassword" class={((form?.errors?.confirmpassword || form?.errors?.not_match) ? "input input-error" : "input")} type="password" placeholder="password" />
                    {#if form?.errors?.confirmpassword}
                    <span class="badge variant-filled-error">{form?.errors?.confirmpassword}</span>
                    {/if}
                </label>
            </div>
            <hr class="opacity-50" />
            <footer class="p-4 flex justify-around ">
                <button form="editProfileForm" class="btn variant-filled-primary">
                    <span>Apply</span>
                </button>
            </footer>
        </form>
	</div>

    <LightSwitch
        class="m-4"
        on:change={e => {
            console.log(e.detail);
        }}
    />

    <div class="m-4">
        <a href="/logout" class="btn variant-filled-error">Logout</a>
    </div>
</div>




