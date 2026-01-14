export interface LandingPageCard {
    id: number;
    image: string;
    title: string;
    description: string;
    buttonText: string;
    badge?: string;
}

export const landingPageCardsData: LandingPageCard[] = [
    {
        id: 1,
        image: "/cards-img/therapy_session.png",
        title: "Therapy",
        description: "Trouble unwinding at night? Our expert therapists gently help you release anxiety & stress, restore your natural sleep rhythm, and wake up feeling lighter and more refreshed all day.",
        buttonText: "Book Now",
    },
    {
        id: 2,
        image: "/cards-img/drift_off.png",
        title: "Drift Off",
        description: "Tailor-made sessions crafted just for you by blending guided hypnosis & meditation to help you release the day's burdens and drift into a quieter, more peaceful dimension. Wake up rejuvenated every morning.",
        buttonText: "Explore Now",
    },
    {
        id: 3,
        image: "/cards-img/sleep_supplements.png",
        title: "Sleep Elixir",
        description: "Our non-habit-forming, fast-absorbing formula helps you unwind naturally and drift into deep, restorative sleep — waking refreshed, never dependent.",
        buttonText: "Shop Now",
        badge: "Coming Soon",
    },
];
