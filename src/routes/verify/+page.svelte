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
            background: `variant-filled-${(form?.error ? "error" : "success")}`,
        });
    }
</script>

<div class="flex flex-row min-h-screen justify-center items-center">
    <div
        class="card bg-inital card-hover overflow-hidden py-10 px-12 w-[375px] md:w-[600px] lg:w-[600px]"
    >
        <header class="mb-4 flex">
            <h2 class="h2 mx-auto">Verify your email address</h2>
        </header>
        <form method="POST">
            <footer class="p-4 flex justify-around">
                <button class="btn variant-filled-primary">
                    <span>Send mail</span>
                </button>
            </footer>
        </form>
    </div>
</div>
