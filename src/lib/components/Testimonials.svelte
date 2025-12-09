<script>
    import { ChevronLeft, ChevronRight, Quote } from "lucide-svelte";
    import { onMount, onDestroy } from "svelte";

    const testimonials = [
        {
            quote: "PhotoComp hat mir geholfen, meine Fotografie auf ein neues Level zu bringen. Das Feedback der Community ist unbezahlbar!",
            author: "Sarah Müller",
            role: "Landschaftsfotografin",
            avatar: "https://i.pravatar.cc/150?u=sarah",
        },
        {
            quote: "Die Wettbewerbe motivieren mich, kreativ zu bleiben und neue Techniken auszuprobieren. Eine tolle Community!",
            author: "Marco Brunner",
            role: "Portrait-Fotograf",
            avatar: "https://i.pravatar.cc/150?u=marco",
        },
        {
            quote: "Als Jury-Mitglied sehe ich täglich beeindruckende Arbeiten. Die Qualität der Einreichungen ist fantastisch.",
            author: "Max Zürcher",
            role: "Jury-Mitglied",
            avatar: "https://i.pravatar.cc/150?u=lisa",
        },
    ];

    let currentIndex = 0;
    let autoplayInterval;

    function next() {
        currentIndex = (currentIndex + 1) % testimonials.length;
    }

    function prev() {
        currentIndex =
            (currentIndex - 1 + testimonials.length) % testimonials.length;
    }

    function goTo(index) {
        currentIndex = index;
    }

    onMount(() => {
        autoplayInterval = setInterval(next, 6000);
    });

    onDestroy(() => {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
        }
    });

    $: current = testimonials[currentIndex];
</script>

<section class="testimonials">
    <div class="container">
        <div class="section-header">
            <h2>Was unsere Community sagt</h2>
            <p class="section-subtitle">
                Erfahrungen von Fotografen aus Zürich
            </p>
        </div>

        <div class="testimonials-wrapper">
            <button
                class="nav-btn prev"
                on:click={prev}
                aria-label="Vorheriges Testimonial"
            >
                <ChevronLeft size={20} />
            </button>

            <div class="testimonial-content">
                <div class="quote-mark">
                    <Quote size={24} strokeWidth={1.5} />
                </div>

                <blockquote class="quote-text">
                    {current.quote}
                </blockquote>

                <div class="author">
                    <img
                        src={current.avatar}
                        alt={current.author}
                        class="author-avatar"
                    />
                    <div class="author-info">
                        <span class="author-name">{current.author}</span>
                        <span class="author-role">{current.role}</span>
                    </div>
                </div>
            </div>

            <button
                class="nav-btn next"
                on:click={next}
                aria-label="Nächstes Testimonial"
            >
                <ChevronRight size={20} />
            </button>
        </div>

        <div class="indicators">
            {#each testimonials as _, i}
                <button
                    class="indicator"
                    class:active={i === currentIndex}
                    on:click={() => goTo(i)}
                    aria-label="Gehe zu Testimonial {i + 1}"
                >
                    <span class="indicator-bar"></span>
                </button>
            {/each}
        </div>
    </div>
</section>

<style>
    .testimonials {
        padding: var(--spacing-4xl) 0;
        background: var(--color-surface);
        border-top: 1px solid var(--color-border);
        border-bottom: 1px solid var(--color-border);
    }

    .section-header {
        text-align: center;
        margin-bottom: var(--spacing-3xl);
    }

    .section-header h2 {
        font-size: 2rem;
        font-weight: 600;
        margin-bottom: var(--spacing-sm);
        color: var(--color-text-primary);
        letter-spacing: -0.02em;
    }

    .section-subtitle {
        font-size: 1rem;
        color: var(--color-text-secondary);
        margin: 0;
    }

    .testimonials-wrapper {
        display: flex;
        align-items: center;
        gap: var(--spacing-2xl);
        max-width: 720px;
        margin: 0 auto;
    }

    .nav-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 1px solid var(--color-border);
        background: white;
        color: var(--color-text-secondary);
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;
    }

    .nav-btn:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
    }

    .nav-btn:active {
        transform: scale(0.95);
    }

    .testimonial-content {
        flex: 1;
        text-align: center;
        padding: var(--spacing-xl) 0;
    }

    .quote-mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        background: var(--color-primary);
        border-radius: var(--radius-md);
        color: white;
        margin-bottom: var(--spacing-xl);
    }

    .quote-text {
        font-size: 1.125rem;
        line-height: 1.75;
        color: var(--color-text-primary);
        margin: 0 0 var(--spacing-2xl) 0;
        font-weight: 400;
        max-width: 560px;
        margin-left: auto;
        margin-right: auto;
    }

    .author {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-md);
    }

    .author-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid white;
        box-shadow: var(--shadow-sm);
    }

    .author-info {
        display: flex;
        flex-direction: column;
        text-align: left;
    }

    .author-name {
        font-weight: 600;
        font-size: 0.9375rem;
        color: var(--color-text-primary);
    }

    .author-role {
        font-size: 0.8125rem;
        color: var(--color-text-muted);
    }

    .indicators {
        display: flex;
        justify-content: center;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-2xl);
    }

    .indicator {
        padding: var(--spacing-xs);
        background: transparent;
        border: none;
        cursor: pointer;
    }

    .indicator-bar {
        display: block;
        width: 32px;
        height: 3px;
        background: var(--color-border);
        border-radius: 2px;
        transition: all 0.3s ease;
    }

    .indicator:hover .indicator-bar {
        background: var(--color-text-muted);
    }

    .indicator.active .indicator-bar {
        background: var(--color-primary);
        width: 48px;
    }

    @media (max-width: 768px) {
        .testimonials {
            padding: var(--spacing-3xl) 0;
        }

        .section-header {
            margin-bottom: var(--spacing-2xl);
        }

        .section-header h2 {
            font-size: 1.5rem;
        }

        .testimonials-wrapper {
            gap: var(--spacing-md);
        }

        .nav-btn {
            width: 40px;
            height: 40px;
        }

        .testimonial-content {
            padding: var(--spacing-md) 0;
        }

        .quote-mark {
            width: 40px;
            height: 40px;
            margin-bottom: var(--spacing-lg);
        }

        .quote-mark :global(svg) {
            width: 20px;
            height: 20px;
        }

        .quote-text {
            font-size: 1rem;
            line-height: 1.7;
        }

        .author-avatar {
            width: 40px;
            height: 40px;
        }

        .indicators {
            margin-top: var(--spacing-xl);
        }

        .indicator-bar {
            width: 24px;
        }

        .indicator.active .indicator-bar {
            width: 36px;
        }
    }

    @media (max-width: 480px) {
        .nav-btn {
            display: none;
        }

        .testimonials-wrapper {
            padding: 0 var(--spacing-md);
        }
    }
</style>
