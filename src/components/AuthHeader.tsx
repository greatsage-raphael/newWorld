
import React from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';

const AuthHeader = () => {
  return (
    <div className="fixed top-4 left-4 z-50">
      <SignedOut>
        <SignInButton>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Sign In
          </Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
};

export default AuthHeader;
