<script>
    export let form;

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

<div class="flex flex-row min-h-screen justify-center items-center">
	<div class="flex flex-col justify-center card bg-inital card-hover overflow-hidden py-10 px-12 w-[375px] md:w-[600px] lg:w-[600px]">
		<header class="mb-8">
			<h2 class="h2 ">Reset password</h2>
		</header>
        <form method="POST" class="flex flex-col" id="verifyForm">
            <label class="label">
                <span>New password</span>
                <input form="verifyForm" name="newpassword" class={(form?.errors?.newpassword ? "input input-error" : "input")} type="password" placeholder="new password" />
                {#if form?.errors?.policy[0]}
                {@html passwordPolicyError}
                {/if}
                {#if form?.errors?.newpassword}
                <span class="badge variant-filled-error">{form?.errors?.newpassword[0]}</span>
                {/if}
            </label>
            <label class="label mt-3">
                <span>Confirm new password</span>
                <input form="verifyForm" name="confirmnewpassword" class={(form?.errors?.confirmnewpassword ? "input input-error" : "input")} type="password" placeholder="new password" />
                {#if form?.errors?.confirmnewpassword}
                <span class="badge variant-filled-error">{form?.errors?.confirmnewpassword[0]}</span>
                {/if}
                {#if form?.errors?.not_match}
                <span class="badge variant-filled-error">{form?.errors?.not_match}</span>
                {/if}
            </label>
            <button class="btn variant-ghost-primary mx-auto mt-10">Send mail</button>
        </form>
	</div>
</div>

