import styles from './CustomerInsight.module.css';

export default function CustomerInsight() {
  return (
    <section className={styles.customerInsight}>
      <div className={styles.content}>
        <h2 className={styles.mainHeading}>97% of customers go unnoticed</h2>
        <p className={styles.subHeading}>
          Without understanding your customers, potential revenue slips through the cracks. Our platform helps you identify and retain valuable customers effortlessly.
        </p>
        <div className={styles.icons}>
          <div className={styles.iconItem}>
            <span className={styles.icon}>🧐</span>
            <p className={styles.iconText}>Potential customer is overlooked</p>
            <p className={styles.description}>Potential customers are interested but feel neglected</p>
          </div>
          <div className={styles.iconItem}>
            <span className={styles.icon}>🤷</span>
            <p className={styles.iconText}>Doesnt feel recognized</p>
            <p className={styles.description}>Customers don’t find a reason to stay due to lack of recognition.</p>
          </div>
          <div className={styles.iconItem}>
            <span className={styles.icon}>🚪</span>
            <p className={styles.iconText}>Leaves without a trace</p>
            <p className={styles.description}>Customers leave and never come back, costing you money</p>
          </div>
        </div>
      </div>
    </section>
  );
}