import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWithUs from "@/components/Support/ChatWithUs";
import FrequentlyAskedQuestions from "@/components/Support/FrequentlyAskedQuestions";
import AboutUsConsultation from "@/components/AboutUS/AboutUsConsultation";
import styles from "./support.module.css";

const SupportPage = () => {
    return (
        <div className={styles.container}>
            <Navbar />
            <div className={styles.header}>
                <h1 className={styles.title}>Welcome to the Support Page</h1>
                <p className={styles.subtitle}>
                    We're here to help you with any problems you may be having with our product.
                </p>
            </div>
            <ChatWithUs />
            <FrequentlyAskedQuestions />
            <AboutUsConsultation />
        </div>
    );
};

export default SupportPage;