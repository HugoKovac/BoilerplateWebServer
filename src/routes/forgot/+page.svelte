<script>
    export let form;

    import { getToastStore } from "@skeletonlabs/skeleton";

    const toastStore = getToastStore();

    $: {
        console.log(form);
    }

    $: if (form?.error || form?.success) {
        console.log(form?.error);
        toastStore.trigger({
            message: form?.error || form?.success,
            background: `variant-filled-${form?.error ? "error" : "success"}`,
        });
    }
</script>

<div class="flex flex-row min-h-screen justify-center items-center">
    <div
        class="flex flex-col justify-center card bg-inital card-hover overflow-hidden py-10 px-12 w-[375px] md:w-[600px] lg:w-[600px]"
    >
        <header class="mb-8">
            <h2 class="h2">Send an email to reset</h2>
        </header>
        <form method="POST" class="flex flex-col" id="verifyForm">
            <label class="label">
                <span>Email</span>
                <input
                    form="verifyForm"
                    name="email"
                    class={form?.errors?.email || form?.errors?.not_registered
                        ? "input input-error"
                        : "input"}
                    type="text"
                    placeholder="email"
                    value={form?.data?.email ?? ""}
                />
                {#if form?.errors?.email}
                    <span class="badge variant-filled-error"
                        >{form?.errors?.email[0]}</span
                    >
                {/if}
                {#if form?.errors?.not_registered}
                    <span class="badge variant-filled-error"
                        >{form?.errors?.not_registered}</span
                    >
                {/if}
            </label>
            <button class="btn variant-ghost-primary mx-auto mt-10"
                >Send mail</button
            >
        </form>
    </div>
</div>
