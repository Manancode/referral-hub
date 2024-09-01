import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import cron from 'node-cron';
import { stringify } from 'csv-stringify/sync';

const prisma = new PrismaClient();

async function resetDailySearchCounts() {
  console.log('Attempting to reset daily search counts...');
  try {
    const result = await prisma.searchUsage.updateMany({
      data: {
        searchesPerformed: 0,
        lastResetDate: new Date(),
      },
    });
    console.log('Daily search counts reset successfully:', result);
  } catch (error) {
    console.error('Error resetting daily search counts:', error);
  }
}

// Email sending functionality remains the same
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to: string, subject: string, text: string, html: string, attachments?: any[]) {
  console.log('Preparing to send email to:', to);
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
      attachments,
    });
    console.log('Email sent successfully:', info);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

async function sendDailyReports() {
  console.log('Starting daily reports generation...');
  try {
    const users = await prisma.user.findMany({
      where: {
        subscriptionTier: {
          in: ['BASIC', 'PREMIUM'],
        },
      },
      include: {
        searches: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
          include: {
            results: true,
          },
        },
      },
    });

    console.log('Fetched users and their searches:', users);

    for (const user of users) {
      if (user.searches.length > 0) {
        console.log(`Generating CSV for user: ${user.email}`);
        const csvData = generateCSV(user.searches);
        console.log(`CSV data for user ${user.email}:`, csvData);

        await sendEmail(
          user.email,
          'Your Daily Search Report',
          'Please find attached your daily search report.',
          '<p>Please find attached your daily search report.</p>',
          [
            {
              filename: 'daily_report.csv',
              content: csvData,
            },
          ]
        );
      } else {
        console.log(`No searches found for user: ${user.email}`);
      }
    }
  } catch (error) {
    console.error('Error sending daily reports:', error);
  }
}

function generateCSV(searches: any[]) {
  console.log('Generating CSV from searches:', searches);
  const headers = ['username', 'postTitle', 'postContent', 'subreddit', 'relevanceScore', 'createdAt'];
  const data = searches.flatMap(search =>
    search.results.map((result: { username: any; postTitle: any; postContent: any; subreddit: any; relevanceScore: any; createdAt: any; }) => [
      result.username,
      result.postTitle,
      result.postContent,
      result.subreddit,
      result.relevanceScore,
      result.createdAt,
    ])
  );

  try {
    const csv = stringify([headers, ...data]);
    console.log('CSV generated successfully');
    return csv;
  } catch (err) {
    console.error('Error generating CSV:', err);
    return '';
  }
}

// Schedule tasks
// Reset daily search counts at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Running scheduled task: resetDailySearchCounts');
  resetDailySearchCounts();
});

// Send daily reports at 1 AM
cron.schedule('0 1 * * *', () => {
  console.log('Running scheduled task: sendDailyReports');
  sendDailyReports();
});

console.log('Cron jobs scheduled');

// Export functions for potential use in other parts of the application
export { resetDailySearchCounts, sendEmail, sendDailyReports };
