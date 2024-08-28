import React, { useState } from 'react';
import { Container, Title, Button, Group, Text, List, ThemeIcon, rem } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import classes from './HeroBullets.module.css';
import { ConfettiButton } from '../magicui/confetti';
import Link from 'next/link';

const RatingComponent = () => {
  const [rating, setRating] = useState(0);

  const handleRating = (rate : any) => {
    setRating(rate);
  };

  return (
    <div className={classes.ratingComponent}>
      <h3>Rate a Customer</h3>
      <div className={classes.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? classes.activeStar : classes.star}
            onClick={() => handleRating(star)}
          >
            ★
          </span>
        ))}
      </div>
      <div>
      <ConfettiButton className={classes.submitButton}>Submit rating</ConfettiButton>
    </div>
    </div>
  );
};

export function HeroSection() {
  return (
    <Container size="md">
      <div className={classes.inner}>
        <div className={classes.content}>
          <Title className={classes.title}>
            Understand your <span className={classes.highlight}>customers</span> with <br /> smart ratings
          </Title>
          <Text c="dimmed" mt="md">
            Just like checking product ratings before buying, our SaaS lets you rate customers. Because who knew rating people could be this fun.
          </Text>

          <List
            mt={30}
            spacing="sm"
            size="sm"
            icon={
              <ThemeIcon size={20} radius="xl">
                <IconCheck style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
              </ThemeIcon>
            }
          >
            <List.Item>
              <b>Uncover Hidden Gems</b> – Find high-potential customers you didnt know you had.
            </List.Item>
            <List.Item>
              <b>Automated Customer Ratings</b> – Seamlessly integrate and automatically rate customers based on their behavior and transactions.
            </List.Item>
            <List.Item>
              <b>Customizable Rating Criteria</b> – Define and adjust rating criteria to suit your business needs and get precise evaluations.
            </List.Item>
          </List>

          <Group mt={30}>
            {/* <RegisterLink>
              <Button radius="xl" size="md" className={classes.control}>
                Get started
              </Button>
            </RegisterLink> */}
             <Button radius="xl" size="md" className={classes.control}>
             <Link href='https://commonwaitlist.vercel.app/'>Get started</Link>
              </Button>
            <Button variant="default" radius="xl" size="md" className={classes.control}>
              <Link href='https://commonwaitlist.vercel.app/'>Join waitlist</Link>
            </Button>
          </Group>
        </div>
        <div className={classes.image}>
          <RatingComponent />
          
        </div>
      </div>
    </Container>
  );
}