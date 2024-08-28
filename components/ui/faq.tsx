import { Container, Title, Accordion } from '@mantine/core';
import classes from './faqsimple.module.css';

export function FaqSimple() {
  return (
    <Container size="sm" className={classes.wrapper}>
      <Title ta="center" className={classes.title}>
        Frequently Asked Questions
      </Title>

      <Accordion variant="separated">
        <Accordion.Item className={classes.item} value="what-is-smart-ratings">
          <Accordion.Control>What is Smart Ratings?</Accordion.Control>
          <Accordion.Panel>
            Smart Ratings is an advanced analytics platform designed to help businesses understand their customers through comprehensive rating metrics. Our system automatically gathers data from various customer interactions and generates insightful ratings to help you make informed decisions.
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item className={classes.item} value="benefits">
          <Accordion.Control>How does Smart Ratings benefit my business?</Accordion.Control>
          <Accordion.Panel>
            Smart Ratings provides actionable insights into customer behavior, helping you identify loyal customers, understand customer needs, and improve overall engagement. By leveraging our platform, you can make data-driven decisions that enhance customer satisfaction and boost revenue.
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item className={classes.item} value="data-analyzed">
          <Accordion.Control>What kind of data does Smart Ratings analyze?</Accordion.Control>
          <Accordion.Panel>
            Our platform analyzes various data points, including purchase history, customer engagement, support interactions, and behavioral patterns. We compile this information to create a detailed profile of each customer, allowing for precise and meaningful ratings.
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item className={classes.item} value="data-security">
          <Accordion.Control>How secure is my data with Smart Ratings?</Accordion.Control>
          <Accordion.Panel>
            We prioritize data security and privacy. Our platform uses industry-standard encryption to protect your data at rest and in transit. Additionally, we adhere to strict data protection regulations to ensure your information is always secure and confidential.
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item className={classes.item} value="integration">
          <Accordion.Control>How do I integrate Smart Ratings with my existing systems?</Accordion.Control>
          <Accordion.Panel>
            Integrating Smart Ratings is simple and straightforward. Our platform offers comprehensive APIs and detailed documentation to guide you through the integration process. Our support team is also available to assist you with any challenges you may encounter.
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
}