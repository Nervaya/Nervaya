import styles from "./Loader.module.css";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "white" | "inherit";
  text?: string;
  className?: string;
}

export default function Loader({
  size = "md",
  color = "primary",
  text,
  className,
}: LoaderProps) {
  const loaderClasses = [styles.loader, styles[size], styles[color], className]
    .filter(Boolean)
    .join(" ");

  if (text) {
    return (
      <div className={styles.container}>
        <div className={loaderClasses} />
        <span className={styles.text}>{text}</span>
      </div>
    );
  }

  return <div className={loaderClasses} />;
}
