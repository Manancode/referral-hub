'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const handleRedditAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        try {
          // Send the authorization code to your backend to exchange it for an access token
          const response = await fetch('/api/reddit-auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          const data = await response.json();

          // Handle the response from your backend (e.g., store the token, redirect the user)
          console.log('Reddit Access Token:', data);

          // Redirect or show a success message
          router.push('/dashboard');
        } catch (error) {
          console.error('Error handling Reddit auth:', error);
        }
      }
    };

    handleRedditAuth();
  }, [router]);

  return <div>Redirecting...</div>;
}
